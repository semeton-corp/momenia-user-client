import { Skeleton } from "@/components/ui/skeleton"

const SIDE_CARDS = ["left-side-1", "left-side-2", "right-side-1", "right-side-2"]

export function TestimonialSkeleton() {
  return (
    <section className="relative w-full overflow-x-hidden bg-zinc-800/20" aria-hidden="true">
      <div className="relative z-10 w-full px-3 py-10 md:px-6 md:py-14 lg:py-16">
        <div className="mx-auto flex w-full max-w-375 items-center justify-center gap-4">

          {/* Prev button */}
          <Skeleton className="h-9 w-9 shrink-0 rounded-full bg-white/30 md:h-11 md:w-11" />

          {/* Card stack */}
          <div className="relative flex flex-1 items-center justify-center" style={{ height: 420 }}>
            {/* Pill cards (sides) */}
            {SIDE_CARDS.map((id) => (
              <Skeleton
                key={id}
                className="absolute hidden h-75 w-18 rounded-3xl bg-white/30 lg:block"
              />
            ))}

            {/* Center expanded card */}
            <div className="relative z-10 flex h-85 w-65 flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl md:w-80 lg:w-85">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-4 w-1/3" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/6" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </div>

          {/* Next button */}
          <Skeleton className="h-9 w-9 shrink-0 rounded-full bg-white/30 md:h-11 md:w-11" />

        </div>
      </div>
    </section>
  )
}
