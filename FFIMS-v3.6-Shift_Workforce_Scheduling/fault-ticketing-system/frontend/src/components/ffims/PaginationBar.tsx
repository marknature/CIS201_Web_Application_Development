import { Button } from "@/components/ui/button";

export function PaginationBar({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (value: number) => void;
}) {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-[#e4e8ef] bg-white px-5 py-4 md:flex-row md:items-center md:justify-between">
      <p className="text-[13px] text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Previous
        </Button>
        <div className="rounded-full bg-[#f5f6f8] px-3 py-2 text-[12px] font-semibold text-muted-foreground">
          {page}
        </div>
        <Button variant="outline" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
}
