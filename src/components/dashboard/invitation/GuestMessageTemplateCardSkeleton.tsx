import { WorkspaceCard } from "./WorkspaceCard"

// Skeleton yang meniru struktur GuestMessageTemplateCard selagi GET
// .../invitation-message masih loading.
export function GuestMessageTemplateCardSkeleton() {
  return (
    <WorkspaceCard className="h-fit border-0 px-4 py-4 shadow-none sm:px-6 xl:border xl:p-8 xl:shadow-sm">
      <div className="h-7 w-56 animate-pulse rounded bg-zinc-100" />

      <div className="mt-4 rounded-lg border border-zinc-200 p-4 pb-8 sm:p-5 sm:pb-9">
        <div className="space-y-2.5">
          <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-100" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100" />
        </div>
      </div>

      <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-zinc-100" />

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="h-9 w-28 animate-pulse rounded-lg bg-zinc-100" />
        <div className="hidden h-9 w-20 animate-pulse rounded-lg bg-zinc-100 xl:block" />
      </div>
    </WorkspaceCard>
  )
}
