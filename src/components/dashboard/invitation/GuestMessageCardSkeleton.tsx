import { WorkspaceCard } from "./WorkspaceCard"

// Skeleton yang meniru GuestMessageCard selagi daftar ucapan masih loading.
export function GuestMessageCardSkeleton() {
  return (
    <WorkspaceCard className="p-5">
      <div className="space-y-2">
        <div className="h-4 w-28 animate-pulse rounded bg-zinc-200" />
        <div className="h-3 w-20 animate-pulse rounded bg-zinc-100" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-zinc-100" />
        <div className="h-3 w-full animate-pulse rounded bg-zinc-100" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-100" />
      </div>
      <div className="mt-6 flex items-center justify-end gap-2">
        <div className="h-8 w-20 animate-pulse rounded-xl bg-zinc-100" />
        <div className="h-8 w-20 animate-pulse rounded-xl bg-zinc-100" />
      </div>
    </WorkspaceCard>
  )
}
