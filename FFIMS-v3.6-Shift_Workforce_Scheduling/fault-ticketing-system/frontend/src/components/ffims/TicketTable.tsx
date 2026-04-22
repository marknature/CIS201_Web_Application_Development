import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, Package2, UserRound } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusChip } from "@/components/ffims/StatusChip";
import { formatShortDate, formatTicketReference } from "@/lib/formatters";
import type { TicketRecord } from "@/lib/api";

export function TicketTable({
  tickets,
  emptyMessage = "No tickets matched the current filter set.",
}: {
  tickets: TicketRecord[];
  emptyMessage?: string;
}) {
  if (!tickets.length) {
    return (
      <div className="rounded-[24px] border border-[#e4e8ef] bg-white px-6 py-12 text-center shadow-[0_18px_40px_-32px_rgba(26,26,26,0.35)]">
        <p className="text-[16px] font-semibold text-foreground">No tickets available</p>
        <p className="mt-2 text-[14px] text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:hidden">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="rounded-[24px] border border-[#e4e8ef] bg-white p-5 shadow-[0_18px_40px_-32px_rgba(26,26,26,0.35)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-primary">
                  {formatTicketReference(ticket.id)}
                </p>
                <h3 className="text-[16px] font-semibold text-foreground">{ticket.title}</h3>
              </div>
              <StatusChip value={ticket.status} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatusChip value={ticket.priority} />
              <span className="rounded-full bg-[#f5f6f8] px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
                {ticket.category || "General"}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-[13px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <Package2 className="h-4 w-4 text-primary" />
                <span>{ticket.asset_name || ticket.asset_id}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-primary" />
                <span>{ticket.assignee_name || "Unassigned technician"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span>{formatShortDate(ticket.updated_at || ticket.created_at)}</span>
              </div>
            </div>

            <Link
              className="mt-5 inline-flex items-center gap-1 text-[13px] font-semibold text-primary transition hover:text-primary/80"
              to={`/fault-ticketing/${ticket.id}`}
            >
              Open details
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-[24px] border border-[#e4e8ef] bg-white shadow-[0_18px_40px_-32px_rgba(26,26,26,0.35)] md:block">
        <Table className="min-w-[920px]">
          <TableHeader>
            <TableRow className="border-b border-[#edf0f4] bg-[#f8f9fb] hover:bg-[#f8f9fb]">
              <TableHead className="h-14 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Ticket ID
              </TableHead>
              <TableHead className="h-14 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Title
              </TableHead>
              <TableHead className="h-14 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Asset
              </TableHead>
              <TableHead className="h-14 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="h-14 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Assigned Technician
              </TableHead>
              <TableHead className="h-14 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Updated
              </TableHead>
              <TableHead className="h-14 text-right text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id} className="group border-b border-[#edf0f4] hover:bg-[#fff7f7]">
                <TableCell className="py-4 text-[13px] font-semibold text-primary">
                  {formatTicketReference(ticket.id)}
                </TableCell>
                <TableCell className="py-4 text-[13px]">
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">{ticket.title}</p>
                    <div className="flex flex-wrap gap-2">
                      <StatusChip value={ticket.priority} />
                      <span className="rounded-full bg-[#f5f6f8] px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
                        {ticket.category || "General"}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-[13px]">
                  <div>
                    <p className="font-medium text-foreground">{ticket.asset_name || ticket.asset_id}</p>
                    <p className="mt-1 text-muted-foreground">{ticket.location || "Location pending"}</p>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-[13px]">
                  <StatusChip value={ticket.status} />
                </TableCell>
                <TableCell className="py-4 text-[13px] text-muted-foreground">
                  {ticket.assignee_name || "Unassigned"}
                </TableCell>
                <TableCell className="py-4 text-[13px] text-muted-foreground">
                  {formatShortDate(ticket.updated_at || ticket.created_at)}
                </TableCell>
                <TableCell className="py-4 text-right text-[13px]">
                  <Link
                    className="inline-flex items-center gap-1 font-semibold text-primary transition hover:text-primary/80"
                    to={`/fault-ticketing/${ticket.id}`}
                  >
                    View
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
