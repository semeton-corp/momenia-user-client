// Mirrors EditorLoaded's shell (fixed layer, top bar, lg 3-column body, mobile tab/action
// bars) with the same classes, so nothing jumps when the invitation detail arrives.
export function InvitationEditorSkeleton() {
  return (
    <div
      aria-busy="true"
      className="fixed inset-x-0 top-15 bottom-[90px] z-30 flex flex-col gap-4 overflow-y-auto bg-zinc-50 p-4 sm:p-6 lg:left-[108px] lg:top-0 lg:bottom-0 lg:overflow-hidden"
    >
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="skeleton-shimmer h-7 w-56 rounded-lg" />
          <div className="skeleton-shimmer h-3.5 w-40 rounded" />
        </div>
        <div className="skeleton-shimmer hidden h-11 w-52 rounded-xl lg:block" />
        <div className="hidden items-center gap-2 lg:flex">
          <div className="skeleton-shimmer h-10 w-10 rounded-lg" />
          <div className="skeleton-shimmer h-10 w-10 rounded-lg" />
          <div className="skeleton-shimmer h-12 w-32 rounded-lg" />
          <div className="skeleton-shimmer h-12 w-28 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[420px_minmax(0,1fr)_420px]">
        {/* Mobile tab switch */}
        <div className="order-2 flex shrink-0 gap-1 rounded-2xl border border-zinc-200 bg-white p-1 lg:hidden">
          <div className="skeleton-shimmer h-10 flex-1 rounded-xl" />
          <div className="h-10 flex-1" />
        </div>

        {/* Left: Design */}
        <div className="order-3 flex min-h-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white lg:order-none">
          <div className="hidden space-y-2 border-b border-zinc-100 px-5 py-4 lg:block">
            <div className="skeleton-shimmer h-5 w-20 rounded" />
            <div className="skeleton-shimmer h-3.5 w-44 rounded" />
          </div>
          <div className="space-y-3 p-4 lg:flex-1 lg:overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-zinc-200 bg-white">
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="skeleton-shimmer h-4 w-4 rounded" />
                    <div className="skeleton-shimmer h-4 w-24 rounded" />
                  </div>
                  <div className="skeleton-shimmer h-4 w-4 rounded" />
                </div>
                <div className="space-y-4 px-4 pb-4">
                  <div className="space-y-2">
                    <div className="skeleton-shimmer h-3.5 w-20 rounded" />
                    <div className="skeleton-shimmer h-10 w-full rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <div className="skeleton-shimmer h-3.5 w-24 rounded" />
                    <div className="skeleton-shimmer h-10 w-full rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Preview (first on mobile) */}
        <div className="order-1 flex shrink-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 lg:order-none lg:min-h-0 lg:flex-1 lg:shrink">
          <div className="flex shrink-0 items-center justify-center gap-2 border-b border-zinc-100 bg-white py-3">
            <div className="skeleton-shimmer h-4 w-20 rounded" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-7 w-7 rounded-lg" />
            ))}
            <div className="skeleton-shimmer h-4 w-14 rounded" />
          </div>

          <div className="flex items-center justify-center p-3 lg:min-h-0 lg:flex-1 lg:p-6">
            <div className="skeleton-shimmer aspect-[375/812] h-[340px] rounded-[28px] lg:h-full lg:max-h-[812px]" />
          </div>

          <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-3 lg:hidden">
            <div className="skeleton-shimmer h-11 w-20 rounded-xl" />
            <div className="flex items-center gap-2">
              <div className="skeleton-shimmer h-10 w-10 rounded-lg" />
              <div className="skeleton-shimmer h-10 w-10 rounded-lg" />
              <div className="skeleton-shimmer h-10 w-10 rounded-lg" />
            </div>
          </div>

          <div className="hidden shrink-0 items-center justify-center py-3 lg:flex">
            <div className="skeleton-shimmer h-9 w-36 rounded-full" />
          </div>
        </div>

        {/* Right: Content (desktop only — mobile defaults to the Design tab) */}
        <div className="hidden min-h-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white lg:flex">
          <div className="space-y-2 border-b border-zinc-100 px-5 py-4">
            <div className="skeleton-shimmer h-5 w-24 rounded" />
            <div className="skeleton-shimmer h-3.5 w-48 rounded" />
          </div>
          <div className="flex-1 space-y-3 overflow-hidden p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="skeleton-shimmer h-7 w-7 rounded-lg" />
                  <div className="skeleton-shimmer h-4 w-32 rounded" />
                </div>
                <div className="skeleton-shimmer h-4 w-4 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile action bar */}
        <div className="order-4 flex shrink-0 items-center gap-3 lg:hidden">
          <div className="skeleton-shimmer h-12 flex-1 rounded-xl" />
          <div className="skeleton-shimmer h-12 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
