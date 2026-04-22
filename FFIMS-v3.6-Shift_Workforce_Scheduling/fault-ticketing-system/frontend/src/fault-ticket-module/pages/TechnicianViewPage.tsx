import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Package,
  RefreshCw,
  UserPlus,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "../components/EmptyState";
import { PriorityBadge, StatusBadge } from "../components/StatusBadge";
import { TechnicianDropdown } from "../components/TechnicianDropdown";
import { useDemoData } from "../context/DemoDataContext";
import { useRole } from "../context/RoleContext";
import { type TicketStatus } from "../data/mockData";

export default function TechnicianViewPage() {
  const navigate = useNavigate();
  const { tickets, assignTicket, updateTicketStatus } = useDemoData();
  const { hasPermission, currentRole, currentUser } = useRole();
  const isAllowed = hasPermission("view_technician");
  const [statusDialogTicketId, setStatusDialogTicketId] = useState<string | null>(null);
  const [assignmentDialogTicketId, setAssignmentDialogTicketId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<TicketStatus | "">("");
  const [note, setNote] = useState("");
  const [selectedTechnician, setSelectedTechnician] = useState("");

  const assignedTickets = tickets.filter((ticket) => {
    if (!ticket.assignedTo) {
      return false;
    }

    return currentRole === "technician" ? ticket.assignedTo === currentUser.name : true;
  });
  const unassignedTickets = tickets.filter((ticket) => !ticket.assignedTo);

  const handleUpdate = () => {
    if (!statusDialogTicketId) {
      toast.error("No ticket selected");
      return;
    }

    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }

    const updatedTicket = updateTicketStatus({
      ticketId: statusDialogTicketId,
      status: newStatus,
      performedBy: currentUser.name,
      note,
    });
    if (!updatedTicket) {
      toast.error("Ticket update failed");
      return;
    }

    toast.success("Ticket updated successfully");
    setStatusDialogTicketId(null);
    setNewStatus("");
    setNote("");
  };

  const handleAssign = () => {
    if (!assignmentDialogTicketId) {
      toast.error("No ticket selected");
      return;
    }

    if (!selectedTechnician) {
      toast.error("Please select a technician");
      return;
    }

    const updatedTicket = assignTicket({
      ticketId: assignmentDialogTicketId,
      technicianName: selectedTechnician,
      performedBy: currentUser.name,
    });
    if (!updatedTicket) {
      toast.error("Ticket assignment failed");
      return;
    }

    toast.success(`Ticket assigned to ${selectedTechnician}`);
    setAssignmentDialogTicketId(null);
    setSelectedTechnician("");
  };

  if (!isAllowed) {
    return (
      <EmptyState
        icon={Wrench}
        title="Access denied"
        description="You don't have permission to view the technician workspace."
        actionLabel="Back to Dashboard"
        onAction={() => navigate("/")}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" /> Technician Workspace
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Manage assignments and progress updates from one queue.</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-muted-foreground" /> Unassigned Tickets
          <span className="text-sm font-normal text-muted-foreground">({unassignedTickets.length})</span>
        </h2>
        {unassignedTickets.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="No unassigned tickets"
            description="All tickets have been assigned to technicians."
          />
        ) : (
          <div className="grid gap-3">
            {unassignedTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow border-dashed border-warning/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-primary font-medium">{ticket.id}</span>
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                    <h3 className="font-semibold">{ticket.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" /> {ticket.assetName}
                      </span>
                      <span>{ticket.date}</span>
                    </div>
                  </div>
                  <Dialog
                    open={assignmentDialogTicketId === ticket.id}
                    onOpenChange={(open) => setAssignmentDialogTicketId(open ? ticket.id : null)}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-1">
                        <UserPlus className="h-3.5 w-3.5" /> Assign
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign {ticket.id}</DialogTitle>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-muted-foreground" /> Assigned Tickets
          <span className="text-sm font-normal text-muted-foreground">({assignedTickets.length})</span>
        </h2>
        {assignedTickets.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No assigned tickets"
            description="There are no tickets assigned to any technician yet."
          />
        ) : (
          <div className="grid gap-4">
            {assignedTickets.map((ticket) => (
              <div key={ticket.id} className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-primary font-medium">{ticket.id}</span>
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                    <h3 className="font-semibold">{ticket.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ticket.description}</p>

                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" /> {ticket.assetName}
                      </span>
                      <span>{ticket.category}</span>
                      <span>
                        Assigned: <span className="font-medium text-foreground">{ticket.assignedTo}</span>
                      </span>
                      <span>{ticket.date}</span>
                    </div>

                    {ticket.linkedAsset && (
                      <div className="mt-3 bg-muted/50 rounded-lg p-3 text-sm">
                        <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-1">Asset Info</p>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground">
                          <span>
                            ID: <span className="font-mono font-medium text-foreground">{ticket.linkedAsset.id}</span>
                          </span>
                          <span>
                            Location: <span className="font-medium text-foreground">{ticket.linkedAsset.location}</span>
                          </span>
                          <span>
                            Lifecycle: <span className="font-medium text-foreground">{ticket.linkedAsset.status}</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Dialog
                      open={statusDialogTicketId === ticket.id}
                      onOpenChange={(open) => setStatusDialogTicketId(open ? ticket.id : null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">Update Status</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update {ticket.id}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                          <div className="space-y-2">
                            <Label>New Status</Label>
                            <Select value={newStatus} onValueChange={(value) => setNewStatus(value as TicketStatus)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Resolved">Resolved</SelectItem>
                                <SelectItem value="Closed">Closed</SelectItem>
                                <SelectItem value="Escalated">Escalated</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Resolution Notes</Label>
                            <Textarea
                              placeholder="Add notes..."
                              value={note}
                              onChange={(event) => setNote(event.target.value)}
                              maxLength={500}
                            />
                          </div>
                          <Button className="w-full" onClick={handleUpdate}>
                            Save Update
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
