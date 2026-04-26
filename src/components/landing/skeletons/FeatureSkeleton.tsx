import { Skeleton } from "@/components/ui/skeleton"

const FEATURE_WIDTHS = [
  { id: "f1", w: "w-3/4" },
  { id: "f2", w: "w-2/3" },
  { id: "f3", w: "w-4/5" },
  { id: "f4", w: "w-3/4" },
  { id: "f5", w: "w-2/3" },
  { id: "f6", w: "w-3/5" },
]

export function FeatureSkeleton() {
  return (
    <section className="mx-auto w-full max-w-400 px-4 pt-2 pb-10 md:px-12 md:pt-4 md:pb-12 lg:pt-6">
      <div className="mb-12 flex flex-col items-center gap-3 text-center md:mb-16">
        <Skeleton className="h-9 w-65 md:h-11 md:w-85 lg:w-105" />
        <Skeleton className="h-5 w-70 md:h-6 md:w-105" />
      </div>

      <div className="mx-auto grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {FEATURE_WIDTHS.map(({ id, w }) => (
          <div key={id} className="rounded-[22px] border border-zinc-100 bg-zinc-50 p-7">
            <Skeleton className="mb-5 h-15 w-15 rounded-full" />
            <Skeleton className={`mb-3 h-6 ${w}`} />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
