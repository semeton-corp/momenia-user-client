// Skeleton yang meniru struktur nyata halaman profil per-section: kartu header,
// tiga baris info, dan kartu logout — supaya transisi ke konten asli mulus.
export function ProfileSkeleton() {
  return (
    <div className="mt-6 space-y-4 xl:mt-8 xl:space-y-8">
      {/* Header card */}
      <div
        className="flex items-center justify-between gap-2 rounded-2xl p-4 xl:gap-4 xl:p-8"
        style={{
          background: "linear-gradient(135deg, rgba(237, 233, 254, 0.5) 0%, rgba(79, 70, 229, 0.09) 100%)",
        }}
      >
        <div className="flex min-w-0 items-center gap-3 xl:gap-5">
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-zinc-200 xl:h-20 xl:w-20" />
          <div className="min-w-0 space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-zinc-200 xl:h-5 xl:w-64" />
            <div className="h-3 w-28 animate-pulse rounded bg-zinc-200 xl:h-4 xl:w-44" />
          </div>
        </div>
        <div className="h-8 w-24 shrink-0 animate-pulse rounded-lg bg-zinc-200 xl:h-9 xl:w-32" />
      </div>

      {/* Info rows */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-3 xl:px-6 xl:py-5 ${i < 2 ? "border-b border-zinc-100" : ""}`}
          >
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-zinc-200 xl:h-[42px] xl:w-[42px]" />
            <div className="min-w-0 space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-zinc-200 xl:h-4 xl:w-28" />
              <div className="h-4 w-44 animate-pulse rounded bg-zinc-200 xl:h-5 xl:w-64" />
            </div>
          </div>
        ))}
      </div>

      {/* Logout card */}
      <div className="flex h-[80px] w-full items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-4 py-5 xl:w-fit xl:min-w-[281px]">
        <div className="h-[35px] w-9 shrink-0 animate-pulse rounded-lg bg-zinc-200" />
        <div className="space-y-2">
          <div className="h-4 w-20 animate-pulse rounded bg-zinc-200" />
          <div className="h-3 w-40 animate-pulse rounded bg-zinc-200" />
        </div>
      </div>
    </div>
  )
}
