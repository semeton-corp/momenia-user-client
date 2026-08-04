import { WorkspaceCard } from "./WorkspaceCard"

// Skeleton yang meniru struktur statistik RSVP (mobile & desktop) selagi
// GET .../rsvps/overview masih loading, supaya tidak ada layout shift.
export function RsvpStatsSkeleton() {
  return (
    <>
      {/* ── Mobile ── */}
      <div className="flex flex-col gap-5 xl:hidden">
        <WorkspaceCard className="p-4 text-center">
          <div className="mx-auto h-4 w-20 animate-pulse rounded bg-zinc-100" />
          <div className="mx-auto mt-2 h-9 w-16 animate-pulse rounded bg-zinc-200" />
        </WorkspaceCard>

        <div className="flex flex-col items-center gap-4">
          <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
          <div className="h-52 w-52 animate-pulse rounded-full bg-zinc-100" />
          <div className="grid w-full grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="h-7 w-10 animate-pulse rounded bg-zinc-200" />
                <div className="h-0.5 w-8 animate-pulse rounded-full bg-zinc-100" />
                <div className="h-3 w-14 animate-pulse rounded bg-zinc-100" />
              </div>
            ))}
          </div>

          {/* Estimasi row */}
          <div className="flex w-full items-center gap-3 rounded-2xl border border-zinc-100 bg-white px-4 py-3 shadow-sm">
            <div className="h-4 w-4 shrink-0 animate-pulse rounded-full bg-zinc-100" />
            <div className="h-4 flex-1 animate-pulse rounded bg-zinc-100" />
            <div className="h-7 w-10 shrink-0 animate-pulse rounded bg-zinc-200" />
          </div>
        </div>
      </div>

      {/* ── Desktop ── */}
      <WorkspaceCard className="hidden p-6 xl:block">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:gap-8">
          <div className="flex shrink-0 justify-center xl:justify-start">
            <div className="h-52 w-52 animate-pulse rounded-full bg-zinc-100" />
          </div>
          <div className="flex flex-1 flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <WorkspaceCard key={i} className="p-5">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 animate-pulse rounded-full bg-zinc-100" />
                    <div className="h-4 w-16 animate-pulse rounded bg-zinc-100" />
                  </div>
                  <div className="mt-3 h-9 w-14 animate-pulse rounded bg-zinc-200" />
                </WorkspaceCard>
              ))}
            </div>

            {/* Estimasi bar */}
            <div className="flex h-[58px] items-center justify-between rounded-2xl bg-zinc-100 px-8 py-3">
              <div className="flex items-center gap-4">
                <div className="h-[34px] w-[34px] shrink-0 animate-pulse rounded-full bg-zinc-200" />
                <div className="h-5 w-56 animate-pulse rounded bg-zinc-200" />
              </div>
              <div className="h-7 w-10 shrink-0 animate-pulse rounded bg-zinc-200" />
            </div>
          </div>
        </div>
      </WorkspaceCard>
    </>
  )
}
