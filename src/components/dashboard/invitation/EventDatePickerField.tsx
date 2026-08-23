"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { enUS, id as idLocale } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type EventDatePickerFieldProps = {
  id?: string
  /** "YYYY-MM-DD" (format native <input type="date">) atau string kosong. */
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  locale: string
  placeholder?: string
}

/**
 * Pengganti <Input type="date">: popup kalender native browser tidak bisa
 * di-restyle sama sekali lewat CSS (keterbatasan browser), jadi ini kalender
 * custom (react-day-picker) yang bisa dibrand sesuai desain app. Kontrak
 * value/onChange-nya sengaja dipertahankan sama persis ("YYYY-MM-DD") supaya
 * applyEventDateTime() di lib/event-time.ts tidak perlu berubah sama sekali.
 */
export function EventDatePickerField({ id, value, onChange, disabled, locale, placeholder }: EventDatePickerFieldProps) {
  const [open, setOpen] = React.useState(false)
  const dateLocale = locale === "id" ? idLocale : enUS
  const selected = value ? parseISO(value) : undefined
  const isValidSelected = !!selected && !Number.isNaN(selected.getTime())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-11 w-full items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-left text-sm text-zinc-700 outline-none transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-50",
            !isValidSelected && "text-zinc-400",
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-zinc-400" />
          <span className="truncate">
            {isValidSelected ? format(selected, "d MMMM yyyy", { locale: dateLocale }) : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Calendar
          mode="single"
          locale={dateLocale}
          selected={isValidSelected ? selected : undefined}
          onSelect={(date) => {
            if (!date) return
            onChange(format(date, "yyyy-MM-dd"))
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
