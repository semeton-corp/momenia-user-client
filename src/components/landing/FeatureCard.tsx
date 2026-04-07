"use client"

import * as React from "react"
import { Feather } from "lucide-react"
import { cn } from "@/lib/utils"

type FeatureCardProps = {
  title: string
  description: string
  className?: string
  icon?: React.ReactNode
  isExpanded?: boolean
  onToggle?: () => void
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const update = () => setIsMobile(mediaQuery.matches)

    update()
    mediaQuery.addEventListener("change", update)
    return () => mediaQuery.removeEventListener("change", update)
  }, [breakpoint])

  return isMobile
}

export function FeatureCard({
  title,
  description,
  className,
  icon = <Feather className="h-6 w-6 text-indigo-600 transition-colors duration-300 group-hover:text-indigo-500" />,
  isExpanded = false,
  onToggle,
}: FeatureCardProps) {
  const isMobile = useIsMobile()

  return (
    <article
      data-expanded={isMobile ? isExpanded : undefined}
      onClick={() => isMobile && onToggle?.()}
      className={cn(
        "group relative w-full overflow-hidden rounded-[12px] border border-zinc-200 bg-white transition-all duration-300 cursor-pointer md:cursor-default",
        "shadow-[0_1px_3px_rgba(0,0,0,0.10)]",
        "md:hover:border-indigo-700 md:hover:bg-indigo-700 md:hover:shadow-[-2px_-2px_10px_0px_#6468f0,2px_2px_10px_0px_#6468f0]",
        "data-[expanded=true]:border-indigo-700 data-[expanded=true]:bg-indigo-700 data-[expanded=true]:shadow-[-2px_-2px_10px_0px_#6468f0,2px_2px_10px_0px_#6468f0]",
        "md:h-full md:min-h-[260px] md:rounded-[22px] md:p-7",
        "p-4",
        className,
      )}
    >
      {isMobile ? (
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <div className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-[#EDF1FF] transition-colors duration-300 group-data-[expanded=true]:bg-white">
              {icon}
            </div>
            <h3 className="text-base font-semibold leading-6 text-zinc-900 transition-colors duration-300 group-hover:font-bold group-hover:text-zinc-50 group-data-[expanded=true]:font-bold group-data-[expanded=true]:text-zinc-50">
              {title}
            </h3>
          </div>
          <div
            className={cn(
              "grid transition-all duration-300 ease-in-out",
              isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <p className="pt-3 text-xs font-light leading-5 text-zinc-800 transition-colors duration-300 group-hover:text-zinc-50 group-data-[expanded=true]:text-white/90">
                {description}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col items-start gap-4 lg:gap-5">
          <div className="flex size-[60px] shrink-0 items-center justify-center rounded-full bg-[#EDF1FF] transition-colors duration-300 group-hover:bg-white group-data-[expanded=true]:bg-white">
            {icon}
          </div>
          <div className="flex flex-col gap-2 lg:gap-3">
            <h3 className="text-xl font-semibold leading-snug text-zinc-900 transition-colors duration-300 group-hover:font-bold group-hover:text-zinc-50 group-data-[expanded=true]:font-bold group-data-[expanded=true]:text-zinc-50 md:text-2xl lg:text-[26px]">
              {title}
            </h3>
            <p className="text-sm font-light leading-relaxed text-zinc-800 transition-colors duration-300 group-hover:text-white/90 group-data-[expanded=true]:text-white/90 lg:text-base">
              {description}
            </p>
          </div>
        </div>
      )}
    </article>
  )
}
