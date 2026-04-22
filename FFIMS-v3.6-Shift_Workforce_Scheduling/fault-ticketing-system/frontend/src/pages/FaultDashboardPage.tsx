import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Siren,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ffims/EmptyState";
import { LoadingPanel } from "@/components/ffims/LoadingPanel";
import { MetricCard } from "@/components/ffims/MetricCard";
import { PageHeader } from "@/components/ffims/PageHeader";
import { StatusChip } from "@/components/ffims/StatusChip";
import { TicketTable } from "@/components/ffims/TicketTable";
import { useAuth } from "@/context/AuthContext";
import { api, type AnalyticsResponse, type TicketRecord } from "@/lib/api";
import { buildTicketHighlights } from "@/lib/ticketMetrics";

export function FaultDashboardPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [recentTickets, setRecentTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAdmin) {
      setAnalytics(null);
      setRecentTickets([]);
      setError("Analytics are restricted to administrators.");
      setLoading(false);
      return;
    }

    let active = true;

    Promise.all([api.getAnalytics(token), api.getTickets({ limit: 6 }, token)])
      .then(([analyticsData, ticketData]) => {
        if (!active) {
          return;
        }

        setAnalytics(analyticsData);
        setRecentTickets(ticketData.items);
        setError("");
      })
      .catch((reason) => {
        if (!active) {
          return;
        }

        setError(reason instanceof Error ? reason.message : "Unable to load the fault dashboard.");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token, isAdmin]);

  if (!isAdmin) {
    return (
      <EmptyState
        actionLabel="Return to dashboard"
        description="System analytics are reserved for administrators. Use your role-specific dashboard or the technician workspace instead."
        onAction={() => navigate("/")}
        title="Admin analytics only"
      />
    );
  }

  const totalTickets = analytics ? analytics.byStatus.reduce((sum, item) => sum + item.total, 0) : 0;

  if (loading) {
    return <LoadingPanel label="Loading fault dashboard..." />;
  }

  if (!analytics) {
    return (
      <EmptyState
        description={error || "FFIMS could not load the module metrics."}
        title="Fault dashboard unavailable"
      />
    );
  }

  const highlights = buildTicketHighlights(analytics);

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/fault-ticketing/tickets">
                Ticket Register
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/fault-ticketing/workspace">
                <Wrench className="mr-2 h-4 w-4" />
                Technician Workspace
              </Link>
            </Button>
            <Button asChild>
              <Link to="/fault-ticketing/report">Report New Fault</Link>
            </Button>
          </>
        }
        description="Analytics for ticket counts, status distribution, priority exposure, and recent activity."
        eyebrow="Fault Analytics"
        title="Fault Dashboard"
      />

      <Card className="overflow-hidden border-0 bg-[#1a1a1a] text-white shadow-[0_28px_55px_-32px_rgba(26,26,26,0.7)]">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[1.15fr_0.85fr] md:p-8">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-white/60">
              Live Snapshot
            </p>
            <h2 className="mt-4 text-[28px] font-semibold leading-tight">
              Total tickets, pending work, and resolution progress in one operational view.
            </h2>
            <p className="mt-4 max-w-2xl text-[14px] leading-7 text-white/78">
              Use this dashboard to monitor workload, spot critical issues, and move quickly into the register or technician workspace.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-[13px] text-white/65">Total Tickets</p>
              <p className="mt-3 text-[32px] font-semibold">{totalTickets}</p>
              <p className="mt-2 text-[13px] leading-6 text-white/65">
                Complete count of visible fault tickets in the current module view.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-[13px] text-white/65">Pending Work</p>
              <p className="mt-3 text-[32px] font-semibold">{highlights.pending}</p>
              <p className="mt-2 text-[13px] leading-6 text-white/65">
                Open, in progress, and escalated records requiring action.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-[13px] text-white/65">Resolved</p>
              <p className="mt-3 text-[32px] font-semibold">{highlights.resolved + highlights.closed}</p>
              <p className="mt-2 text-[13px] leading-6 text-white/65">
                Completed tickets demonstrating service closure and audit readiness.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-[13px] text-white/65">Critical</p>
              <p className="mt-3 text-[32px] font-semibold">{highlights.critical}</p>
              <p className="mt-2 text-[13px] leading-6 text-white/65">
                High-risk issues highlighted with FFIMS red attention styling.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          hint="New or triaged faults waiting for assignment."
          icon={TriangleAlert}
          title="Open Tickets"
          tone="critical"
          value={highlights.open}
        />
        <MetricCard
          hint="Operational work currently underway."
          icon={Clock3}
          title="In Progress"
          tone="info"
          value={highlights.inProgress}
        />
        <MetricCard
          hint="Tickets moved successfully to resolution."
          icon={CheckCircle2}
          title="Resolved"
          tone="success"
          value={highlights.resolved + highlights.closed}
        />
        <MetricCard
          hint="Escalations and high-severity faults needing visibility."
          icon={Siren}
          title="Escalated"
          tone="warning"
          value={highlights.escalated}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.72fr_0.28fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>
                Clean progress bars keep the pipeline readable without visual clutter.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.byStatus.length ? (
                analytics.byStatus.map((item) => {
                  const width = totalTickets ? Math.max(8, Math.round((item.total / totalTickets) * 100)) : 0;

                  return (
                    <div key={item.status} className="rounded-[20px] border border-[#edf0f4] bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <StatusChip value={item.status} />
                          <span className="text-[13px] text-muted-foreground">{item.total} ticket(s)</span>
                        </div>
                        <span className="text-[13px] font-semibold text-foreground">{width}%</span>
                      </div>
                      <div className="mt-3 h-2.5 rounded-full bg-[#f1f3f7]">
                        <div className="h-2.5 rounded-full bg-primary" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[14px] text-muted-foreground">No status data is available yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Recent Tickets</CardTitle>
                <CardDescription>
                  Most recent records in a searchable format consistent with the register page.
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link to="/fault-ticketing/tickets">
                  Full Register
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <TicketTable tickets={recentTickets} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Priority Mix</CardTitle>
              <CardDescription>
                Colour-coded priority counts use FFIMS support colours for quick scanning.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics.byPriority.length ? (
                analytics.byPriority.map((item) => (
                  <div
                    key={item.priority}
                    className="flex items-center justify-between rounded-[20px] bg-[#f5f6f8] px-4 py-3"
                  >
                    <StatusChip value={item.priority} />
                    <span className="text-[14px] font-semibold text-foreground">{item.total}</span>
                  </div>
                ))
              ) : (
                <p className="text-[14px] text-muted-foreground">No priority data is available yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
