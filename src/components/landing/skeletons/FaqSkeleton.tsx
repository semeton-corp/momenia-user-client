import { Skeleton } from "@/components/ui/skeleton"

const FAQ_TITLE_WIDTHS = ["w-3/5", "w-4/5", "w-2/3", "w-3/4"] as const

export function FaqSkeleton() {
  return (
    <section className="w-full" aria-hidden="true">
      <div className="mx-auto w-full max-w-400 px-4 py-10 md:px-12 md:py-14 lg:py-16">

        {/* Section header */}
        <div className="mx-auto mb-10 flex flex-col items-center gap-3 text-center md:mb-12">
          <Skeleton className="h-9 w-45 md:h-11 md:w-65 lg:h-13 lg:w-80" />
          <Skeleton className="h-5 w-70 md:w-105" />
        </div>

        {/* Accordion items */}
        <div className="mx-auto w-full max-w-5xl space-y-3 md:space-y-4">
          {FAQ_TITLE_WIDTHS.map((width) => (
            <div
              key={width}
              className="rounded-3xl border border-zinc-200 bg-zinc-50 px-5 py-5 md:px-7 md:py-6"
            >
              <div className="flex items-center justify-between gap-4">
                <Skeleton className={`h-5 ${width} md:h-6`} />
                <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
