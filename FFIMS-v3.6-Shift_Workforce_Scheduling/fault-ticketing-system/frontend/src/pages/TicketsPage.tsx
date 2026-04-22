import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Filter, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/ffims/EmptyState";
import { LoadingPanel } from "@/components/ffims/LoadingPanel";
import { PageHeader } from "@/components/ffims/PageHeader";
import { PaginationBar } from "@/components/ffims/PaginationBar";
import { TicketTable } from "@/components/ffims/TicketTable";
import { useAuth } from "@/context/AuthContext";
import { api, type TicketListResponse } from "@/lib/api";

const DEFAULT_RESPONSE: TicketListResponse = {
  items: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

const STATUS_OPTIONS = ["Open", "Assigned", "In Progress", "Resolved", "Closed", "Escalated"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"];

export function TicketsPage() {
  const { token, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [page, setPage] = useState(1);
  const [response, setResponse] = useState<TicketListResponse>(DEFAULT_RESPONSE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const requestTickets =
      user?.role === "user"
        ? api.getMyTickets(
            {
              search: deferredSearch,
              status: status === "all" ? undefined : status,
              priority: priority === "all" ? undefined : priority,
              page,
              limit: 10,
            },
            token,
          )
        : api.getTickets(
            {
              search: deferredSearch,
              status: status === "all" ? undefined : status,
              priority: priority === "all" ? undefined : priority,
              page,
              limit: 10,
            },
            token,
          );

    requestTickets
      .then((data) => {
        if (active) {
          setResponse(data);
          setError("");
        }
      })
      .catch((reason) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Unable to load ticket register.");
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
  }, [token, deferredSearch, status, priority, page, user?.role]);

  const resetPagination = () => {
    startTransition(() => {
      setPage(1);
    });
  };

  const activeFilters = useMemo(
    () =>
      [
        status !== "all" ? `Status: ${status}` : null,
        priority !== "all" ? `Priority: ${priority}` : null,
        search.trim() ? `Search: ${search.trim()}` : null,
      ].filter(Boolean) as string[],
    [priority, search, status],
  );

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setPriority("all");
    setPage(1);
  };

  if (loading && !response.items.length) {
    return <LoadingPanel label="Loading ticket register..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            {activeFilters.length ? (
              <Button type="button" variant="outline" onClick={clearFilters}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            ) : null}
            <Button asChild>
              <Link to="/fault-ticketing/report">Report Fault</Link>
            </Button>
          </>
        }
        description="A responsive list with clear filters, search, status chips, row hover states, and consistent table hierarchy."
        eyebrow="Ticket Register"
        title={user?.role === "user" ? "My Tickets" : "Tickets List UI"}
      />

      <Card>
        <CardHeader>
          <CardTitle>Search and filters</CardTitle>
          <CardDescription>
            {user?.role === "user"
              ? "Search and filter only the tickets you created."
              : "Refine the register by title, asset, status, or priority without leaving the page."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.4fr_0.4fr]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-11"
                placeholder="Search title, asset, category, or location"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetPagination();
                }}
              />
            </div>

            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                resetPagination();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={priority}
              onValueChange={(value) => {
                setPriority(value);
                resetPagination();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {PRIORITY_OPTIONS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {activeFilters.length ? (
                activeFilters.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-[#d8dde6] bg-white px-3 py-1.5 text-[12px] font-medium text-muted-foreground"
                  >
                    <Filter className="h-3.5 w-3.5 text-primary" />
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-[13px] text-muted-foreground">
                  {user?.role === "user"
                    ? "No filters applied. Showing only your own tickets."
                    : "No filters applied. Showing the full register view."}
                </span>
              )}
            </div>

            <div className="rounded-full bg-[#f5f6f8] px-4 py-2 text-[12px] font-semibold text-muted-foreground">
              {response.pagination.total} ticket(s) found
            </div>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <EmptyState description={error} title="Unable to load ticket data" />
      ) : (
        <>
          <TicketTable tickets={response.items} />
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <p className="text-[13px] text-muted-foreground">
              Showing {response.items.length} of {response.pagination.total} ticket(s) on this page.
            </p>
            <PaginationBar
              page={response.pagination.page}
              totalPages={response.pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
