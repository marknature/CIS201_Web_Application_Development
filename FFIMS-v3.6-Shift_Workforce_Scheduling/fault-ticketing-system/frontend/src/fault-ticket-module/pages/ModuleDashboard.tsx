import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ListTodo,
  Plus,
  RotateCcw,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCard } from "../components/DashboardCard";
import { TicketTable } from "../components/TicketTable";
import { useDemoData } from "../context/DemoDataContext";
import { useRole } from "../context/RoleContext";
import { buildCategoryData, buildFaultTrendData, getVisibleTicketsForRole } from "../data/demoState";

const COLORS = [
  "hsl(215, 70%, 45%)",
  "hsl(35, 92%, 50%)",
  "hsl(152, 60%, 40%)",
  "hsl(0, 72%, 51%)",
  "hsl(215, 12%, 50%)",
];

export default function ModuleDashboard() {
  const navigate = useNavigate();
  const { tickets, resetDemoData } = useDemoData();
  const { currentRole, currentUser, hasPermission } = useRole();
  const visibleTickets = getVisibleTicketsForRole(tickets, currentRole, currentUser.name);
  const totalTickets = visibleTickets.length;
  const criticalCount = visibleTickets.filter((ticket) => ticket.priority === "Critical").length;
  const active = visibleTickets.filter(
    (ticket) => ticket.status === "Assigned" || ticket.status === "In Progress",
  ).length;
  const resolved = visibleTickets.filter(
    (ticket) => ticket.status === "Resolved" || ticket.status === "Closed",
  ).length;
  const pending = visibleTickets.filter(
    (ticket) => ticket.status === "Open" || ticket.status === "Escalated",
  ).length;
  const recentTickets = [...visibleTickets]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 5);
  const faultTrendsData = buildFaultTrendData(visibleTickets);
  const categoryData = buildCategoryData(visibleTickets);

  const handleResetDemo = () => {
    resetDemoData();
    toast.success("Demo data reset", {
      description: "Tickets, notifications, and dashboard metrics were restored to the seed state.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {currentUser.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s a summary of the fault and ticketing system.
            <span className="ml-2 inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full capitalize">
              <Activity className="h-3 w-3" /> {currentRole} view
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={handleResetDemo}>
            <RotateCcw className="h-4 w-4" /> Reset Demo
          </Button>
          {hasPermission("report_fault") && (
            <Button className="gap-2" onClick={() => navigate("/report")}>
              <Plus className="h-4 w-4" /> Report Fault
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Total Tickets" value={totalTickets} icon={ListTodo} variant="primary" />
        <DashboardCard title="Critical Issues" value={criticalCount} icon={AlertTriangle} variant="destructive" />
        <DashboardCard title="Active Work" value={active} icon={Clock} variant="warning" />
        <DashboardCard title="Resolved / Closed" value={resolved} icon={CheckCircle2} variant="success" />
      </div>

      {pending > 0 && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground">
          {pending} ticket(s) still need attention across Open or Escalated states.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <main className="grid grid-cols-1 gap-6 lg:col-span-2">
          {(currentRole === "admin" || currentRole === "technician") && (
            <Card>
              <CardHeader>
                <CardTitle>Fault Analysis</CardTitle>
                <CardDescription>A trend of reported and resolved faults over the past six months.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={faultTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                      }}
                    />
                    <Bar dataKey="faults" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Reported" />
                    <Bar dataKey="resolved" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Resolved" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Tickets</CardTitle>
                <CardDescription>An overview of the most recent tickets.</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/tickets">
                  View All <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <TicketTable tickets={recentTickets} />
            </CardContent>
          </Card>
        </main>

        <aside className="space-y-6">
          {(currentRole === "admin" || currentRole === "technician") && (
            <Card>
              <CardHeader>
                <CardTitle>By Category</CardTitle>
                <CardDescription>A distribution of faults by category.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
