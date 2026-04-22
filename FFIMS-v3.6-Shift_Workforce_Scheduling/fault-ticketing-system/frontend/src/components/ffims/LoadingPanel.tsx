export function LoadingPanel({ label = "Loading FFIMS workspace..." }: { label?: string }) {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-[24px] border border-[#e4e8ef] bg-white shadow-[0_18px_40px_-32px_rgba(26,26,26,0.35)]">
      <div className="space-y-3 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary/15 border-t-primary" />
        <p className="text-[14px] font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
