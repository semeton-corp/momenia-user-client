// Skeleton yang meniru MyInvitationStatCard supaya transisi ke data asli
// (jumlah invitation) mulus tanpa layout shift / kedipan angka "0" dulu.
export function MyInvitationStatCardSkeleton() {
  return (
    <div className="rounded-[8px] border border-zinc-200 bg-white p-[10px] xl:px-6 xl:py-[22px]">
      <div className="flex items-center gap-1 xl:gap-3">
        <span className="h-[5px] w-[5px] shrink-0 animate-pulse rounded-full bg-zinc-200 xl:h-2.5 xl:w-2.5" />
        <span className="h-[22px] w-8 animate-pulse rounded bg-zinc-200 xl:h-8 xl:w-12" />
      </div>
      <div className="mt-1 h-3 w-16 animate-pulse rounded bg-zinc-100 xl:mt-2 xl:h-4 xl:w-24" />
      <div className="mt-0.5 hidden h-3 w-28 animate-pulse rounded bg-zinc-100 xl:mt-2 xl:block xl:h-4 xl:w-36" />
    </div>
  )
}
