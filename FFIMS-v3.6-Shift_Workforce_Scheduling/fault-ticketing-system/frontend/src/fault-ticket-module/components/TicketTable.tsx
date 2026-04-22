import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, PriorityBadge } from "./StatusBadge";
import { EmptyState } from "./EmptyState";
import { type Ticket } from "../data/mockData";
import { useNavigate } from "react-router-dom";
import { ListTodo } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TicketTableProps {
  tickets: Ticket[];
  showAssignee?: boolean;
}

const getInitials = (name: string) => {
  if (!name) return "U";
  const names = name.split(" ");
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`;
  }
  return names[0].substring(0, 2);
};

export function TicketTable({ tickets, showAssignee = true }: TicketTableProps) {
  const navigate = useNavigate();

  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={ListTodo}
        title="No tickets yet"
        description="No tickets match your current filters. Try adjusting your search or filters."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-transparent hover:bg-transparent">
          <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Ticket</TableHead>
          <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Asset</TableHead>
          <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Priority</TableHead>
          <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Status</TableHead>
          {showAssignee && <TableHead className="text-muted-foreground text-xs uppercase tracking-wider">Assigned To</TableHead>}
          <TableHead className="text-right text-muted-foreground text-xs uppercase tracking-wider">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket, idx) => (
          <TableRow
            key={ticket.id}
            className={`cursor-pointer transition-colors ${idx % 2 === 0 ? "" : "bg-muted/10"} hover:bg-muted/20`}
            onClick={() => navigate(`/tickets/${ticket.id}`)}
          >
            <TableCell>
              <div className="font-medium max-w-[200px] truncate">{ticket.title}</div>
              <div className="font-mono text-xs text-primary mt-0.5">{ticket.id}</div>
            </TableCell>
            <TableCell className="text-muted-foreground">{ticket.assetName}</TableCell>
            <TableCell>
              <PriorityBadge priority={ticket.priority} />
            </TableCell>
            <TableCell>
              <StatusBadge status={ticket.status} />
            </TableCell>
            {showAssignee && (
              <TableCell>
                {ticket.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(ticket.assignedTo)}</AvatarFallback>
                    </Avatar>
                    <span className="text-muted-foreground font-medium">{ticket.assignedTo}</span>
                  </div>
                ) : (
                  <span className="italic text-muted-foreground/60">Unassigned</span>
                )}
              </TableCell>
            )}
            <TableCell className="text-right text-muted-foreground text-sm">{ticket.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
