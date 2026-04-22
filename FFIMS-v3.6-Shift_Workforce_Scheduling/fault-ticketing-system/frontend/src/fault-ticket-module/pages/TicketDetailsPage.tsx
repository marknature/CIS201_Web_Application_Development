import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Eye,
  MessageSquare,
  Package,
  RefreshCw,
  Send,
  ShoppingCart,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AssetDetailModal } from "../components/AssetDetailModal";
import { EmptyState } from "../components/EmptyState";
import { PriorityBadge, StatusBadge } from "../components/StatusBadge";
import { TechnicianDropdown } from "../components/TechnicianDropdown";
import { useDemoData } from "../context/DemoDataContext";
import { useRole } from "../context/RoleContext";
import { type TicketStatus } from "../data/mockData";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tickets, assignTicket, updateTicketStatus, addTicketNote } = useDemoData();
  const { hasPermission, currentUser, currentRole } = useRole();
  const ticket = tickets.find((item) => item.id === id);
  const isReporter = currentRole === "user";
  const [showAsset, setShowAsset] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [newStatus, setNewStatus] = useState<TicketStatus | "">("");
  const [statusNote, setStatusNote] = useState("");
  const [newNote, setNewNote] = useState("");

  const canViewTicket = hasPermission("view_all_tickets") || hasPermission("view_own_tickets");
  if (!canViewTicket) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Access denied"
        description="You don't have permission to view this ticket."
        actionLabel="Back to Tickets"
        onAction={() => navigate("/tickets")}
      />
    );
  }

  if (ticket && isReporter && ticket.reportedBy !== currentUser.name) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Access denied"
        description="You don't have permission to view this ticket."
        actionLabel="Back to Tickets"
        onAction={() => navigate("/tickets")}
      />
    );
  }

  if (!ticket) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Ticket not found"
        description="The ticket you're looking for doesn't exist or has been removed."
        actionLabel="Back to Tickets"
        onAction={() => navigate("/tickets")}
      />
    );
  }

  const handleAssign = () => {
    if (!selectedTechnician) {
      toast.error("Please select a technician");
      return;
    }

    const updatedTicket = assignTicket({
      ticketId: ticket.id,
      technicianName: selectedTechnician,
      performedBy: currentUser.name,
    });
    if (!updatedTicket) {
      toast.error("Ticket assignment failed");
      return;
    }

    toast.success(`Ticket assigned to ${selectedTechnician}`);
    setAssignModal(false);
    setSelectedTechnician("");
  };

  const handleStatusUpdate = () => {
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }

    const updatedTicket = updateTicketStatus({
      ticketId: ticket.id,
      status: newStatus,
      performedBy: currentUser.name,
      note: statusNote,
    });
    if (!updatedTicket) {
      toast.error("Status update failed");
      return;
    }

    toast.success(`Status updated to ${newStatus}`);
    setStatusModal(false);
    setNewStatus("");
    setStatusNote("");
  };

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error("Please enter a note");
      return;
    }

    const updatedTicket = addTicketNote({
      ticketId: ticket.id,
      author: currentUser.name,
      text: newNote,
    });
    if (!updatedTicket) {
      toast.error("Note update failed");
      return;
    }

    toast.success("Note added successfully");
    setNewNote("");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="ghost" className="gap-2 -ml-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-sm text-primary font-medium">{ticket.id}</span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{ticket.title}</h1>
          {ticket.reportedBy && (
            <p className="text-sm text-muted-foreground mt-1">Reported by {ticket.reportedBy}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowAsset(true)}>
            <Eye className="h-4 w-4" /> View Asset
          </Button>
          {hasPermission("assign_ticket") && (
            <Dialog open={assignModal} onOpenChange={setAssignModal}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <UserPlus className="h-4 w-4" /> Assign
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Technician</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Select Technician</Label>
                    <TechnicianDropdown value={selectedTechnician} onChange={setSelectedTechnician} />
                  </div>
                  <Button className="w-full" onClick={handleAssign}>
                    Assign Ticket
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {hasPermission("update_ticket") && (
            <Dialog open={statusModal} onOpenChange={setStatusModal}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" /> Update Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Status</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>New Status</Label>
                    <Select value={newStatus} onValueChange={(value) => setNewStatus(value as TicketStatus)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Assigned">Assigned</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                        <SelectItem value="Escalated">Escalated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Update Note</Label>
                    <Textarea
                      placeholder="Add context for this status change..."
                      value={statusNote}
                      onChange={(event) => setStatusNote(event.target.value)}
                      maxLength={500}
                    />
                  </div>
                  <Button className="w-full" onClick={handleStatusUpdate}>
                    Update Status
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => toast.info("Replacement request handoff is still a placeholder action.")}
          >
            <ShoppingCart className="h-4 w-4" /> Request Replacement
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{ticket.description}</p>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" /> Status Timeline
            </h3>
            <div className="space-y-4">
              {ticket.timeline?.map((entry, index) => (
                <div key={`${entry.date}-${index}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5" />
                    {index < (ticket.timeline?.length || 0) - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={entry.status} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.date).toLocaleString()}
                      </span>
                    </div>
                    {entry.note && <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" /> Notes
            </h3>
            {ticket.notes && ticket.notes.length > 0 ? (
              <div className="space-y-3 mb-4">
                {ticket.notes.map((note, index) => (
                  <div key={`${note.date}-${index}`} className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{note.author}</span>
                      <span className="text-xs text-muted-foreground">{new Date(note.date).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{note.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">No notes yet</p>
            )}

            {hasPermission("add_notes") && (
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(event) => setNewNote(event.target.value)}
                  className="min-h-[60px]"
                  maxLength={500}
                />
                <Button size="icon" className="shrink-0 self-end" onClick={handleAddNote} aria-label="Submit note">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" /> Linked Asset
            </h3>
            {ticket.linkedAsset ? (
              <div className="space-y-2 text-sm">
                <Row label="Asset ID" value={ticket.linkedAsset.id} mono />
                <Row label="Name" value={ticket.linkedAsset.name} />
                <Row label="Category" value={ticket.linkedAsset.category} />
                <Row label="Value" value={`R${ticket.linkedAsset.value.toLocaleString()}`} />
                <Row label="Lifecycle" value={ticket.linkedAsset.status} />
                <Row label="Location" value={ticket.linkedAsset.location} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No asset linked</p>
            )}
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              <Row label="Category" value={ticket.category} />
              <Row label="Reported By" value={ticket.reportedBy || "Unknown"} />
              <Row label="Assigned To" value={ticket.assignedTo || "Unassigned"} />
              <Row label="Date Reported" value={ticket.date} />
            </div>
          </div>
        </div>
      </div>

      <AssetDetailModal asset={ticket.linkedAsset || null} open={showAsset} onClose={() => setShowAsset(false)} />
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between py-1 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
