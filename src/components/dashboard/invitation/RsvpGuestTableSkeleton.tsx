import { WorkspaceCard } from "./WorkspaceCard"

// Skeleton yang meniru struktur RsvpGuestTable (judul, toolbar, tabel,
// footer) selagi GET .../rsvps masih loading.
export function RsvpGuestTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <WorkspaceCard className="flex flex-col gap-4 px-4 py-4 sm:px-6 xl:p-5 border-0 shadow-none xl:border xl:shadow-sm">
      <div className="h-7 w-40 animate-pulse rounded bg-zinc-100 xl:mb-2" />

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="h-9 min-w-0 flex-1 animate-pulse rounded-lg bg-zinc-100 xl:max-w-80" />
        <div className="h-9 w-24 shrink-0 animate-pulse rounded-lg bg-zinc-100" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[10px] border border-zinc-200">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="bg-indigo-50">
                {Array.from({ length: 6 }).map((_, i) => (
                  <th key={i} className="px-4 py-3">
                    <div className="h-4 w-16 animate-pulse rounded bg-zinc-200" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, i) => (
                <tr key={i}>
                  <td className="border-b border-zinc-100 px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-zinc-100" /></td>
                  <td className="border-b border-zinc-100 px-4 py-3"><div className="h-4 w-28 animate-pulse rounded bg-zinc-100" /></td>
                  <td className="border-b border-zinc-100 px-4 py-3"><div className="h-4 w-32 animate-pulse rounded bg-zinc-100" /></td>
                  <td className="border-b border-zinc-100 px-4 py-3"><div className="h-5 w-14 animate-pulse rounded-md bg-zinc-100" /></td>
                  <td className="border-b border-zinc-100 px-4 py-3"><div className="h-5 w-20 animate-pulse rounded-full bg-zinc-100" /></td>
                  <td className="border-b border-zinc-100 px-4 py-3"><div className="h-4 w-14 animate-pulse rounded bg-zinc-100" /></td>
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
