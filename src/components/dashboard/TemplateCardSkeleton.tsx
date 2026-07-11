// Skeleton yang meniru TemplateCard: thumbnail (rasio 9/16) + judul, kategori, harga.
export function TemplateCardSkeleton() {
  return (
    <div className="flex w-full flex-col rounded-2xl bg-white shadow-sm xl:border xl:border-border xl:bg-card xl:shadow-none">
      <div className="p-3.5 pb-0">
        <div
          className="w-full animate-pulse overflow-hidden rounded-xl bg-zinc-100"
          style={{ aspectRatio: "9 / 16" }}
        />
      </div>
      <div className="flex flex-col gap-2 p-3.5 pt-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-100" />
        <div className="mt-1 h-4 w-2/5 animate-pulse rounded bg-zinc-100" />
      </div>
    </div>
  )
}
