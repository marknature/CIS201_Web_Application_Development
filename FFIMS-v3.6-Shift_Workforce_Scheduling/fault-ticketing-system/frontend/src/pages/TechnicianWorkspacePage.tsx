import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ClipboardList, Siren, UserRoundPlus, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ffims/EmptyState";
import { LoadingPanel } from "@/components/ffims/LoadingPanel";
import { MetricCard } from "@/components/ffims/MetricCard";
import { PageHeader } from "@/components/ffims/PageHeader";
import { StatusChip } from "@/components/ffims/StatusChip";
import { TicketTable } from "@/components/ffims/TicketTable";
import { useAuth } from "@/context/AuthContext";
import { api, type TicketListResponse, type TicketRecord } from "@/lib/api";
import { formatRelativeTime, formatTicketReference } from "@/lib/formatters";

const DEFAULT_RESPONSE: TicketListResponse = {
  items: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

function QueueCard({ title, description, tickets }: { title: string; description: string; tickets: TicketRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {tickets.length ? (
          tickets.map((ticket) => (
            <div key={ticket.id} className="rounded-[20px] border border-[#edf0f4] bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-primary">
                    {formatTicketReference(ticket.id)}
                  </p>
                  <h3 className="mt-2 text-[15px] font-semibold text-foreground">{ticket.title}</h3>
                </div>
                <StatusChip value={ticket.status} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <StatusChip value={ticket.priority} />
                <span className="rounded-full bg-[#f5f6f8] px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
                  {ticket.asset_name || ticket.asset_id}
                </span>
              </div>

              <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
                {ticket.assignee_name ? `Assigned to ${ticket.assignee_name}` : "Awaiting assignment"}.
                Updated {formatRelativeTime(ticket.updated_at || ticket.created_at)}.
              </p>

              <Link
                className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:text-primary/80"
                to={`/fault-ticketing/${ticket.id}`}
              >
                Open details
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))
        ) : (
          <div className="rounded-[20px] border border-dashed border-[#d8dde6] bg-white p-5 text-[14px] text-muted-foreground">
            No tickets in this queue.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TechnicianWorkspacePage() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [response, setResponse] = useState<TicketListResponse>(DEFAULT_RESPONSE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isAllowed = user?.role === "admin" || user?.role === "technician";

  useEffect(() => {
    if (!isAllowed) {
      setLoading(false);
      setResponse(DEFAULT_RESPONSE);
      setError("");
      return;
    }

    let active = true;
    setLoading(true);

    api
      .getTickets({ limit: 20 }, token)
      .then((data) => {
        if (active) {
          setResponse(data);
          setError("");
        }
      })
      .catch((reason) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Unable to load technician workspace.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isAllowed, token]);

  const myQueue = useMemo(
    () =>
      response.items.filter(
        (ticket) => ticket.assigned_to === user?.id || ticket.assignee_name === user?.name,
      ),
    [response.items, user?.id, user?.name],
  );
  const unassignedUrgent = useMemo(
    () =>
      response.items.filter(
        (ticket) => !ticket.assigned_to && ["High", "Critical"].includes(ticket.priority),
      ),
    [response.items],
  );
  const escalatedTickets = useMemo(
    () => response.items.filter((ticket) => ticket.status === "Escalated"),
    [response.items],
  );
  const recentlyUpdated = useMemo(
    () =>
      [...response.items]
        .sort(
          (left, right) =>
            new Date(right.updated_at || right.created_at || 0).getTime() -
            new Date(left.updated_at || left.created_at || 0).getTime(),
        )
        .slice(0, 5),
    [response.items],
  );

  if (!isAllowed) {
    return (
      <EmptyState
        actionLabel="Open ticket register"
        description="This workspace is reserved for technicians and administrators managing assignments and ticket progress."
        icon={Wrench}
        onAction={() => navigate("/fault-ticketing/tickets")}
        title="Technician workspace restricted"
      />
    );
  }

  if (loading) {
    return <LoadingPanel label="Loading technician workspace..." />;
  }

  if (error) {
    return <EmptyState description={error} icon={Wrench} title="Unable to load workspace" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/fault-ticketing/tickets">
                <ClipboardList className="mr-2 h-4 w-4" />
                Ticket Register
              </Link>
            </Button>
            <Button asChild>
              <Link to="/fault-ticketing/report">Report Fault</Link>
            </Button>
          </>
        }
        description="Focused technician-facing UI for reviewing assigned work, urgent unassigned faults, and recent ticket movement."
        eyebrow="Operations Workspace"
        title="Technician Workspace UI"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          hint="Tickets specifically assigned to the current technician."
          icon={Wrench}
          title="My Queue"
          tone="info"
          value={myQueue.length}
        />
        <MetricCard
          hint="High and critical tickets with no current assignee."
          icon={UserRoundPlus}
          title="Unassigned Urgent"
          tone="critical"
          value={unassignedUrgent.length}
        />
        <MetricCard
          hint="Escalated records needing immediate visibility."
          icon={Siren}
          title="Escalated"
          tone="warning"
          value={escalatedTickets.length}
        />
        <MetricCard
          hint="Total tickets surfaced in the current workspace query."
          icon={ClipboardList}
          title="Visible Tickets"
          tone="neutral"
          value={response.pagination.total}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <QueueCard
          description="Active work already assigned to you or currently under your visibility."
          title="Assigned Queue"
          tickets={myQueue}
        />
        <QueueCard
          description="Priority jobs waiting for ownership and quick triage."
          title="Urgent Unassigned"
          tickets={unassignedUrgent}
        />
        <QueueCard
          description="Escalated items that should remain at the top of the operational agenda."
          title="Escalations"
          tickets={escalatedTickets}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recently updated tickets</CardTitle>
          <CardDescription>
            Supporting table view for technicians who prefer a chronological scan of latest activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <TicketTable
            emptyMessage="Recently updated tickets will appear here once the workflow is active."
            tickets={recentlyUpdated}
          />
        </CardContent>
      </Card>
    </div>
  );
}
