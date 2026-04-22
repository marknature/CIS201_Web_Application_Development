import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  ClipboardList,
  PlusCircle,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ffims/EmptyState";
import { LoadingPanel } from "@/components/ffims/LoadingPanel";
import { MetricCard } from "@/components/ffims/MetricCard";
import { TicketTable } from "@/components/ffims/TicketTable";
import { useAuth } from "@/context/AuthContext";
import { api, type TicketRecord } from "@/lib/api";
import { buildTicketHighlightsFromTickets } from "@/lib/ticketMetrics";

export function HomePage() {
  const { token, user } = useAuth();
  const [visibleTickets, setVisibleTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isUser = user?.role === "user";
  const isOperational = user?.role === "technician" || user?.role === "admin";

  useEffect(() => {
    let active = true;

    const ticketRequest =
      user?.role === "user"
        ? api.getMyTickets({ limit: 200 }, token)
        : api.getTickets({ limit: 200 }, token);

    ticketRequest
      .then((ticketData) => {
        if (!active) {
          return;
        }

        setVisibleTickets(ticketData.items);
        setError("");
      })
      .catch((reason) => {
        if (!active) {
          return;
        }

        setError(reason instanceof Error ? reason.message : "Unable to load dashboard data.");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token, user?.role]);

  if (loading) {
    return <LoadingPanel label="Loading FFIMS command center..." />;
  }

  if (error) {
    return (
      <EmptyState
        description={error || "FFIMS could not retrieve the current ticket data."}
        title="Dashboard data is unavailable"
      />
    );
  }

  const highlights = buildTicketHighlightsFromTickets(visibleTickets);
  const recentTickets = visibleTickets.slice(0, 5);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-[#1a1a1a] text-white shadow-[0_28px_55px_-32px_rgba(26,26,26,0.7)]">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[1.15fr_0.85fr] md:p-8">
          <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(204,0,0,0.38),transparent_32%),linear-gradient(160deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">
              {isUser ? "User Dashboard" : "Operations Overview"}
            </p>
            <h1 className="mt-4 max-w-2xl text-[28px] font-semibold leading-tight">
              Welcome, {user?.name?.split(" ")[0] || "User"}.
            </h1>
            <p className="mt-4 max-w-2xl text-[14px] leading-7 text-white/78">
              {isUser
                ? "Use this dashboard to report faults, review your own ticket history, and track progress without seeing other users' records."
                : "Use this overview to move from high-level queue awareness into the ticket register or technician workspace without exposing admin-only analytics."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/fault-ticketing/report">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Report Fault
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/fault-ticketing/tickets">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  {isUser ? "My Tickets" : "Open Register"}
                </Link>
              </Button>
              {(user?.role === "technician" || user?.role === "admin") && (
                <Button asChild variant="secondary">
                  <Link to="/fault-ticketing/workspace">
                    <Wrench className="mr-2 h-4 w-4" />
                    Technician Workspace
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-[12px] uppercase tracking-[0.22em] text-white/60">
                {isUser ? "Visible Tickets" : "Operational Queue"}
              </p>
              <p className="mt-3 text-[30px] font-semibold">{visibleTickets.length}</p>
              <p className="mt-2 text-[13px] leading-6 text-white/65">
                {isUser
                  ? "This count is scoped to your own submitted tickets only."
                  : "This count reflects the tickets visible to your operational role."}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-[12px] uppercase tracking-[0.22em] text-white/60">Current Focus</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/6 p-4">
                  <p className="text-[13px] text-white/65">Pending Tickets</p>
                  <p className="mt-2 text-[24px] font-semibold">{highlights.pending}</p>
                </div>
                <div className="rounded-2xl bg-white/6 p-4">
                  <p className="text-[13px] text-white/65">{isUser ? "Resolved / Closed" : "Critical Priority"}</p>
                  <p className="mt-2 text-[24px] font-semibold">
                    {isUser ? highlights.resolved + highlights.closed : highlights.critical}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          hint="Issues waiting for action or active handling."
          icon={Bell}
          title="Pending Tickets"
          tone="critical"
          value={highlights.pending}
        />
        <MetricCard
          hint="Tickets already assigned and underway."
          icon={Wrench}
          title="In Progress"
          tone="info"
          value={highlights.inProgress}
        />
        <MetricCard
          hint="Resolved and formally closed fault records."
          icon={ShieldCheck}
          title="Resolved / Closed"
          tone="success"
          value={highlights.resolved + highlights.closed}
        />
        {isOperational ? (
          <MetricCard
            hint="High-visibility workload requiring operational attention."
            icon={Bell}
            title="Open Tickets"
            tone="warning"
            value={highlights.open}
          />
        ) : (
          <MetricCard
            hint="Critical issues among your own submitted tickets."
            icon={ShieldCheck}
            title="Critical Priority"
            tone="warning"
            value={highlights.critical}
          />
        )}
      </div>

      <div>
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Latest Ticket Activity</CardTitle>
              <CardDescription>
                {isUser
                  ? "Only your own tickets appear here."
                  : "Recent records entering or moving through the visible ticket pipeline."}
              </CardDescription>
            </div>
            {user?.role === "admin" ? (
              <Button asChild variant="outline">
                <Link to="/fault-ticketing">
                  Admin Analytics
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="pt-0">
            <TicketTable
              emptyMessage="Once faults are submitted, the most recent items will appear here."
              tickets={recentTickets}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
