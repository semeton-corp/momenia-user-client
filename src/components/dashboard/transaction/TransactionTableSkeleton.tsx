// Skeleton yang meniru struktur TransactionTable: header + beberapa baris.
export function TransactionTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="bg-indigo-50">
              <th className="px-6 py-3"><div className="h-4 w-8 animate-pulse rounded bg-zinc-200" /></th>
              <th className="w-1/2 px-4 py-3"><div className="h-4 w-16 animate-pulse rounded bg-zinc-200" /></th>
              <th className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-zinc-200" /></th>
              <th className="px-4 py-3"><div className="h-4 w-16 animate-pulse rounded bg-zinc-200" /></th>
              <th className="px-4 py-3"><div className="h-4 w-16 animate-pulse rounded bg-zinc-200" /></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                <td className="border-b border-zinc-100 px-6 py-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
                </td>
                <td className="border-b border-zinc-100 px-4 py-4">
                  <div className="h-4 w-40 animate-pulse rounded bg-zinc-100" />
                  <div className="mt-1.5 h-3 w-24 animate-pulse rounded bg-zinc-100" />
                </td>
                <td className="border-b border-zinc-100 px-4 py-4">
                  <div className="h-4 w-20 animate-pulse rounded bg-zinc-100" />
                </td>
                <td className="border-b border-zinc-100 px-4 py-4">
                  <div className="h-6 w-24 animate-pulse rounded-full bg-zinc-100" />
                </td>
                <td className="border-b border-zinc-100 px-4 py-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-zinc-100" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
