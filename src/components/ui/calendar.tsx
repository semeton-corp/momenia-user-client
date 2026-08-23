"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0", className)}
      classNames={{
        root: cn(defaultClassNames.root, "w-fit"),
        months: cn(defaultClassNames.months, "flex flex-col gap-4"),
        month: cn(defaultClassNames.month, "flex flex-col gap-3"),
        nav: cn(defaultClassNames.nav, "flex items-center justify-between"),
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 rounded-lg border-zinc-200 p-0 text-zinc-500 hover:bg-zinc-50",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 rounded-lg border-zinc-200 p-0 text-zinc-500 hover:bg-zinc-50",
          defaultClassNames.button_next,
        ),
        month_caption: cn(defaultClassNames.month_caption, "flex h-7 items-center justify-center text-sm font-semibold text-zinc-900"),
        weekdays: cn(defaultClassNames.weekdays, "flex"),
        weekday: cn(defaultClassNames.weekday, "w-8 text-center text-xs font-medium text-zinc-400"),
        week: cn(defaultClassNames.week, "mt-1 flex w-full"),
        day: cn(defaultClassNames.day, "relative size-8 p-0 text-center text-sm"),
        day_button: cn(
          defaultClassNames.day_button,
          "flex size-8 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-indigo-50",
        ),
        today: cn(defaultClassNames.today, "[&>button]:font-semibold [&>button]:text-primary"),
        selected: cn(
          defaultClassNames.selected,
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary/90",
        ),
        outside: cn(defaultClassNames.outside, "[&>button]:text-zinc-300"),
        disabled: cn(defaultClassNames.disabled, "[&>button]:cursor-not-allowed [&>button]:text-zinc-300 [&>button]:hover:bg-transparent"),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...chevronProps }) =>
          orientation === "left" ? (
            <ChevronLeftIcon className="size-4" {...chevronProps} />
          ) : (
            <ChevronRightIcon className="size-4" {...chevronProps} />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
