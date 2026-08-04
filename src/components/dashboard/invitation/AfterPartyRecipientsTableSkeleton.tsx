import { WorkspaceCard } from "./WorkspaceCard"

// Skeleton yang meniru struktur AfterPartyRecipientsTable selagi GET
// .../guest-invitations masih loading.
export function AfterPartyRecipientsTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <WorkspaceCard className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:p-8 border-0 shadow-none lg:border lg:shadow-sm">
      <div className="space-y-2">
        <div className="h-7 w-56 animate-pulse rounded bg-zinc-100" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-zinc-100" />
      </div>

      <div className="h-9 w-full animate-pulse rounded-lg bg-zinc-100" />

      <div className="overflow-hidden rounded-[10px] border border-zinc-200">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="bg-indigo-50">
                {Array.from({ length: 4 }).map((_, i) => (
                  <th key={i} className="px-4 py-3">
                    <div className="h-4 w-16 animate-pulse rounded bg-zinc-200" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, i) => (
                <tr key={i}>
                  <td className="border-b border-zinc-100 px-4 py-3"><div className="h-4 w-32 animate-pulse rounded bg-zinc-100" /></td>
                  <td className="border-b border-zinc-100 px-4 py-3"><div className="h-5 w-14 animate-pulse rounded-md bg-zinc-100" /></td>
                  <td className="border-b border-zinc-100 px-4 py-3"><div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-100" /></td>
                  <td className="border-b border-zinc-100 px-4 py-3 text-center"><div className="mx-auto h-5 w-5 animate-pulse rounded-md bg-zinc-100" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="hidden items-center justify-between border-t border-zinc-100 px-6 py-4 lg:flex">
          <div className="h-4 w-32 animate-pulse rounded bg-zinc-100" />
          <div className="h-4 w-48 animate-pulse rounded bg-zinc-100" />
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-zinc-100 px-1 py-2 lg:hidden">
        <div className="h-4 w-28 animate-pulse rounded bg-zinc-100" />
        <div className="h-8 w-full animate-pulse rounded bg-zinc-100" />
      </div>
    </WorkspaceCard>
  )
}
