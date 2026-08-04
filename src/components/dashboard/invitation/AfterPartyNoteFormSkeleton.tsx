import { WorkspaceCard } from "./WorkspaceCard"

// Skeleton yang meniru struktur form "Create Notes" selagi GET
// .../after-party-note masih loading.
export function AfterPartyNoteFormSkeleton() {
  return (
    <WorkspaceCard className="h-fit px-4 py-4 sm:px-6 lg:p-8 border-0 shadow-none lg:border lg:shadow-sm">
      <div className="h-7 w-40 animate-pulse rounded bg-zinc-100" />
      <div className="mt-1 h-4 w-72 max-w-full animate-pulse rounded bg-zinc-100" />

      <div className="mt-4 rounded-[10px] border border-zinc-200 p-5 lg:mt-8 lg:p-6">
        <div className="space-y-4 lg:space-y-7">
          <div className="space-y-1.5 lg:space-y-3">
            <div className="h-4 w-28 animate-pulse rounded bg-zinc-100" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-zinc-100" />
          </div>
          <div className="space-y-1.5 lg:space-y-3">
            <div className="h-4 w-20 animate-pulse rounded bg-zinc-100" />
            <div className="h-28 w-full animate-pulse rounded-xl bg-zinc-100" />
          </div>
          <div className="flex justify-end pt-1">
            <div className="h-10 w-24 animate-pulse rounded-xl bg-zinc-100" />
          </div>
        </div>
      </div>
    </WorkspaceCard>
  )
}
