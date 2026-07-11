// Skeleton yang meniru MyInvitationCard (mobile & desktop) supaya transisi ke
// data asli mulus tanpa layout shift.
export function MyInvitationCardSkeleton() {
  return (
    <div className="rounded-[8px] border border-zinc-200 bg-white p-[10px] xl:h-[188px] xl:p-5">
      {/* ── Mobile ── */}
      <div className="xl:hidden">
        <div className="flex gap-3">
          <div className="h-[60px] w-[50px] shrink-0 animate-pulse rounded-lg bg-zinc-100" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="h-4 w-32 animate-pulse rounded bg-zinc-100" />
              <div className="h-4 w-16 shrink-0 animate-pulse rounded-full bg-zinc-100" />
            </div>
            <div className="h-3 w-40 animate-pulse rounded bg-zinc-100" />
            <div className="h-3 w-28 animate-pulse rounded bg-zinc-100" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="h-3 w-32 animate-pulse rounded bg-zinc-100" />
          <div className="h-7 w-24 shrink-0 animate-pulse rounded-[6px] bg-zinc-100" />
        </div>
      </div>

      {/* ── Desktop ── */}
      <div className="hidden h-full items-center gap-6 xl:flex">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-7 w-64 animate-pulse rounded bg-zinc-100" />
          <div className="h-4 w-48 animate-pulse rounded bg-zinc-100" />
          <div className="h-4 w-56 animate-pulse rounded bg-zinc-100" />
          <div className="h-4 w-40 animate-pulse rounded bg-zinc-100" />
        </div>
        <div className="flex shrink-0 gap-6">
          <div className="h-20 w-[154px] animate-pulse rounded-lg bg-zinc-100" />
          <div className="h-20 w-[154px] animate-pulse rounded-lg bg-zinc-100" />
        </div>
        <div className="w-[364px] shrink-0 space-y-2">
          <div className="flex gap-3">
            <div className="h-11 w-[174px] animate-pulse rounded-lg bg-zinc-100" />
            <div className="h-11 w-[174px] animate-pulse rounded-lg bg-zinc-100" />
          </div>
          <div className="h-3 w-48 animate-pulse rounded bg-zinc-100" />
        </div>
      </div>
    </div>
  )
}
