import { WorkspaceCard } from "./WorkspaceCard"

// Skeleton yang meniru struktur InvitationDashboardClient (foto preview,
// tombol publish, countdown, guest stats, invitation link) selagi GET
// .../user-invitations/dashboard/:id masih loading.
export function InvitationDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-8 xl:gap-20 xl:grid-cols-[336px_minmax(0,1fr)] xl:mt-6">

        {/* Left: phone preview */}
        <div className="xl:ml-6">
          <div className="mx-auto w-[264px] sm:w-80 xl:mx-0 xl:w-[312px]">
            <div
              className="relative w-full animate-pulse overflow-hidden bg-zinc-100"
              style={{ aspectRatio: "396 / 846", borderRadius: "14px" }}
            />
          </div>
          <div className="mx-auto mt-4 w-[264px] sm:w-80 xl:mx-0 xl:mt-6 xl:w-[312px]">
            <div className="h-[54px] w-full animate-pulse rounded-[10px] bg-zinc-100 xl:rounded-xl" />
          </div>
          <div className="mt-4 h-px w-full xl:mt-6" style={{ background: "var(--border)" }} />
          <div className="mt-4 space-y-2 xl:mt-6">
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
            <div className="h-3 w-40 animate-pulse rounded bg-zinc-100" />
          </div>
        </div>

        {/* Right: content */}
        <div className="flex flex-col gap-4 xl:gap-0">
          <div className="hidden items-start justify-between gap-2 xl:flex">
            <div className="flex-1 space-y-3">
              <div className="h-10 w-72 animate-pulse rounded bg-zinc-100" />
              <div className="h-6 w-56 animate-pulse rounded bg-zinc-100" />
            </div>
          </div>

          <WorkspaceCard className="border-0 shadow-none xl:border xl:shadow-sm p-4 pt-3 sm:p-5 xl:p-0 xl:mt-8">
            <div className="grid grid-cols-4 xl:h-[136px]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center justify-center gap-2 py-3 sm:py-4 xl:py-0">
                  <div className="h-8 w-12 animate-pulse rounded bg-zinc-100 sm:h-10" />
                  <div className="h-3 w-14 animate-pulse rounded bg-zinc-100" />
                </div>
              ))}
            </div>
          </WorkspaceCard>

          <div className="h-px w-full xl:hidden" style={{ background: "var(--border)" }} />

          <div className="space-y-4 xl:space-y-8 xl:mt-8">
            <div className="mx-auto h-6 w-40 animate-pulse rounded bg-zinc-100 xl:mx-0" />
            <WorkspaceCard className="border-0 shadow-none p-0 xl:border xl:shadow-sm xl:p-5 xl:h-[263px] w-full">
              <div className="flex flex-col items-center gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="h-52 w-52 shrink-0 animate-pulse rounded-full bg-zinc-100 xl:h-[215px] xl:w-[215px]" />
                <div className="w-full flex-1 space-y-4">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-14 animate-pulse rounded bg-zinc-100" />
                    ))}
                  </div>
                  <div className="h-12 w-full animate-pulse rounded-[10px] bg-zinc-100 xl:h-16 xl:rounded-xl" />
                </div>
              </div>
            </WorkspaceCard>
          </div>

          <div className="h-px w-full xl:hidden" style={{ background: "var(--border)" }} />

          <div className="space-y-4 xl:mt-8 xl:space-y-3">
            <div className="h-6 w-32 animate-pulse rounded bg-zinc-100" />
            <div className="h-[54px] w-full animate-pulse rounded-xl bg-zinc-100 xl:h-[60px]" />
          </div>

          <div className="hidden gap-4 xl:mt-8 xl:grid xl:grid-cols-2">
            <div className="h-32 animate-pulse rounded-2xl bg-zinc-100" />
            <div className="h-32 animate-pulse rounded-2xl bg-zinc-100" />
          </div>
        </div>
      </div>
    </div>
  )
}
