import { Skeleton } from "@/components/ui/skeleton"

export function HeroSkeleton() {
  return (
    <section
      className="relative -mt-16 w-full overflow-hidden pt-10 pb-8 md:-mt-20 md:pt-16 md:pb-14"
      style={{
        background:
          "linear-gradient(to bottom, var(--hero-bg-indigo-950) 0%, var(--hero-bg-indigo-600) 58%, var(--hero-bg-violet-600) 100%)",
      }}
      aria-hidden="true"
    >
      <div className="h-16 w-full md:h-20" />
      <div className="mx-auto flex w-full max-w-400 flex-col items-center gap-4 px-4 text-center md:px-6">
        <Skeleton className="h-10 w-85 rounded-xl bg-white/20 md:h-14 md:w-130 lg:h-16 lg:w-165" />
        <Skeleton className="h-10 w-60 rounded-xl bg-white/20 md:h-14 md:w-100 lg:h-16 lg:w-125" />
        <Skeleton className="mt-2 h-12 w-60 rounded-[25px] bg-white/25 md:h-20 md:w-115" />
        <Skeleton className="mt-4 h-55 w-full rounded-2xl bg-white/15 md:h-95 md:rounded-[34px] lg:h-110" />
      </div>
    </section>
  )
}
