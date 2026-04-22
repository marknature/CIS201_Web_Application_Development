import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ExternalLink,
  MessageSquarePlus,
  Package,
  PencilLine,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/ffims/EmptyState";
import { LoadingPanel } from "@/components/ffims/LoadingPanel";
import { PageHeader } from "@/components/ffims/PageHeader";
import { StatusChip } from "@/components/ffims/StatusChip";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, type AuthUser, type TicketDetail } from "@/lib/api";
import { formatDateTime, formatRelativeTime, formatTicketReference } from "@/lib/formatters";

const workflowOptions: Record<string, string[]> = {
  Open: ["Assigned", "Escalated"],
  Assigned: ["In Progress", "Escalated"],
  "In Progress": ["Resolved", "Escalated"],
  Resolved: ["Closed", "Escalated"],
  Closed: [],
  Escalated: [],
};

const workflowSteps = ["Open", "Assigned", "In Progress", "Resolved", "Closed"];

const getStepIndex = (status: string) => {
  if (status === "Escalated") {
    return 2;
  }

  return Math.max(workflowSteps.indexOf(status), 0);
};

export function TicketDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [assignableUsers, setAssignableUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [nextStatus, setNextStatus] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");

  const canManage = user?.role === "admin" || user?.role === "technician";
  const canDelete = user?.role === "admin";
  const canComment = canManage;

  const loadTicket = async () => {
    const data = await api.getTicket(id, token);
    setTicket(data);
    setAssignedTo(data.assigned_to || "");
    setNextStatus("");
    setResolutionNotes(data.resolution_notes || "");
  };

  useEffect(() => {
    let active = true;
    setLoading(true);

    const usersRequest = canManage ? api.getAssignableUsers(token) : Promise.resolve(undefined);

    Promise.all([api.getTicket(id, token), usersRequest])
      .then(([ticketData, usersData]) => {
        if (!active) {
          return;
        }

        setTicket(ticketData);
        setAssignedTo(ticketData.assigned_to || "");
        setResolutionNotes(ticketData.resolution_notes || "");
        setAssignableUsers(usersData || []);
        setError("");
      })
      .catch((reason) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Unable to load ticket detail.");
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
  }, [id, token, canManage]);

  const availableStatuses = useMemo(() => (ticket ? workflowOptions[ticket.status] || [] : []), [ticket]);

  const handleAssignment = async () => {
    if (!assignedTo) {
      toast.error("Select a technician or administrator.");
      return;
    }

    setSaving(true);
    try {
      await api.assignTicket(id, assignedTo, token);
      await loadTicket();
      toast.success("Ticket assignment updated.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Unable to assign ticket.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!nextStatus) {
      toast.error("Select the next workflow status.");
      return;
    }

    setSaving(true);
    try {
      await api.updateTicketStatus(id, { status: nextStatus, resolution_notes: resolutionNotes }, token);
      await loadTicket();
      toast.success("Ticket status updated.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Unable to update status.");
    } finally {
      setSaving(false);
    }
  };

  const handleResolutionSave = async () => {
    setSaving(true);
    try {
      await api.updateTicket(id, { resolution_notes: resolutionNotes }, token);
      await loadTicket();
      toast.success("Resolution notes saved.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Unable to save notes.");
    } finally {
      setSaving(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) {
      toast.error("Comment body is required.");
      return;
    }

    setSaving(true);
    try {
      await api.addComment(id, { body: comment.trim() }, token);
      setComment("");
      await loadTicket();
      toast.success("Comment added.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Unable to add comment.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.deleteTicket(id, token);
      toast.success("Ticket deleted.");
      navigate("/fault-ticketing/tickets");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Unable to delete ticket.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingPanel label="Loading ticket detail..." />;
  }

  if (!ticket) {
    return <EmptyState description={error || "The requested ticket could not be located."} title="Ticket not found" />;
  }

  const currentStepIndex = getStepIndex(ticket.status);

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Button type="button" variant="outline" onClick={() => navigate("/fault-ticketing/tickets")}>
              Back to Register
            </Button>
            {canDelete ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="danger">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Ticket
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[24px] border border-[#e4e8ef] bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this ticket?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes the ticket and its linked fault record from the workflow. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete permanently</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </>
        }
        description={ticket.description}
        eyebrow={formatTicketReference(ticket.id)}
        title={ticket.title}
      />

      <Card className="overflow-hidden border-0 bg-[#1a1a1a] text-white shadow-[0_28px_55px_-32px_rgba(26,26,26,0.7)]">
        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <StatusChip value={ticket.status} />
                <StatusChip value={ticket.priority} />
              </div>
              <div className="grid gap-2 text-[13px] text-white/70 md:grid-cols-2 xl:grid-cols-4">
                <p>Reported by: {ticket.creator_name || ticket.created_by}</p>
                <p>Assigned to: {ticket.assignee_name || "Unassigned"}</p>
                <p>Created: {formatDateTime(ticket.created_at)}</p>
                <p>Updated: {formatRelativeTime(ticket.updated_at || ticket.created_at)}</p>
              </div>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white/75">
              {ticket.status === "Escalated"
                ? "Escalated tickets stay visible and require immediate follow-up."
                : "Workflow progress is shown below to keep the current stage clear."}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            {workflowSteps.map((step, index) => {
              const active = currentStepIndex >= index;

              return (
                <div
                  key={step}
                  className={`rounded-[20px] border px-4 py-4 ${
                    active ? "border-white/15 bg-white/8" : "border-white/8 bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] uppercase tracking-[0.18em] text-white/50">
                      Stage {index + 1}
                    </span>
                    <span
                      className={`h-3 w-3 rounded-full ${
                        active ? "bg-[#cc0000]" : "bg-white/20"
                      }`}
                    />
                  </div>
                  <p className="mt-4 text-[15px] font-semibold text-white">{step}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.72fr_0.28fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket and asset context</CardTitle>
              <CardDescription>
                Main information card with ticket metadata, linked asset details, and the originating fault record.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[20px] bg-[#f5f6f8] p-4 text-[14px]">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-foreground">Asset details</p>
                </div>
                <p className="mt-3 text-muted-foreground">{ticket.asset_name || ticket.asset_id}</p>
                <p className="mt-1 text-muted-foreground">{ticket.location || "Location not supplied"}</p>
                <p className="mt-1 text-muted-foreground">Category: {ticket.category || "General"}</p>
                {ticket.maintenance_link ? (
                  <a
                    className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-primary hover:text-primary/80"
                    href={ticket.maintenance_link}
                  >
                    Maintenance Link
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
              </div>

              <div className="rounded-[20px] bg-[#f5f6f8] p-4 text-[14px]">
                <div className="flex items-center gap-2">
                  <PencilLine className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-foreground">Fault record</p>
                </div>
                {ticket.fault ? (
                  <>
                    <p className="mt-3 leading-6 text-muted-foreground">{ticket.fault.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <StatusChip value={ticket.fault.status} />
                      <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
                        {formatDateTime(ticket.fault.created_at)}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="mt-3 leading-6 text-muted-foreground">No linked fault record is available.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comments section</CardTitle>
              <CardDescription>
                Discussion area for updates, diagnosis notes, and technician communication.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {ticket.comments.length ? (
                  ticket.comments.map((entry) => (
                    <div key={entry.id} className="rounded-[20px] border border-[#edf0f4] bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <UserRound className="h-4 w-4 text-primary" />
                          <p className="text-[14px] font-semibold text-foreground">
                            {entry.author_name || "FFIMS User"}
                          </p>
                        </div>
                        <p className="text-[12px] text-muted-foreground">{formatDateTime(entry.created_at)}</p>
                      </div>
                      <p className="mt-3 text-[14px] leading-7 text-muted-foreground">{entry.body}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[20px] border border-dashed border-[#d8dde6] bg-white p-5">
                    <p className="text-[14px] text-muted-foreground">No comments have been posted for this ticket yet.</p>
                  </div>
                )}
              </div>

              {canComment ? (
                <div className="rounded-[24px] border border-[#edf0f4] bg-[#fafafb] p-5">
                  <Label htmlFor="ticket-comment">Add Comment</Label>
                  <Textarea
                    className="mt-3"
                    id="ticket-comment"
                    placeholder="Record diagnosis, action taken, or escalation context."
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                  />
                  <Button className="mt-4" onClick={handleCommentSubmit} disabled={saving}>
                    <MessageSquarePlus className="mr-2 h-4 w-4" />
                    Post Comment
                  </Button>
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-[#d8dde6] bg-white p-5 text-[14px] text-muted-foreground">
                  Users can view comments but cannot post operational updates.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity timeline</CardTitle>
              <CardDescription>
                Clear vertical audit trail showing what changed, when it changed, and who performed the action.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.logs.length ? (
                ticket.logs.map((entry, index) => (
                  <div key={entry.id} className="flex gap-4">
                    <div className="flex w-6 flex-col items-center">
                      <span className="mt-1 h-3 w-3 rounded-full bg-primary" />
                      {index < ticket.logs.length - 1 ? <span className="mt-2 h-full w-px bg-[#e3e7ed]" /> : null}
                    </div>
                    <div className="flex-1 rounded-[20px] border border-[#edf0f4] bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-[14px] font-semibold text-foreground">{entry.action}</p>
                        <p className="text-[12px] text-muted-foreground">{formatDateTime(entry.timestamp)}</p>
                      </div>
                      <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                        Performed by: {entry.performed_by_name || entry.performed_by}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[20px] border border-dashed border-[#d8dde6] bg-white p-5">
                  <p className="text-[14px] text-muted-foreground">No workflow history is available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {canManage ? (
            <Card>
              <CardHeader>
                <CardTitle>Technician controls</CardTitle>
                <CardDescription>
                  Role-based assignment and status management remain grouped in a dedicated sidebar card.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Assign technician / admin</Label>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignableUsers.map((entry) => (
                        <SelectItem key={entry.id} value={entry.id}>
                          {entry.name} ({entry.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button className="w-full" onClick={handleAssignment} disabled={saving}>
                    Save Assignment
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Next status</Label>
                  <Select value={nextStatus} onValueChange={setNextStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder={availableStatuses.length ? "Select next status" : "No further transitions"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button className="w-full" onClick={handleStatusUpdate} disabled={saving || !availableStatuses.length}>
                    Apply Status Change
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Resolution notes</CardTitle>
              <CardDescription>Repair notes, close-out details, and handoff comments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {canManage ? (
                <>
                  <Textarea value={resolutionNotes} onChange={(event) => setResolutionNotes(event.target.value)} />
                  <Button className="w-full" onClick={handleResolutionSave} disabled={saving}>
                    Save Notes
                  </Button>
                </>
              ) : (
                <div className="rounded-[20px] bg-[#f5f6f8] p-4 text-[14px] leading-6 text-muted-foreground">
                  {resolutionNotes || "Resolution notes will appear here once a technician updates the ticket."}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
