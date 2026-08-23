"use client"

import * as React from "react"
import { ClockIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type EventTimePickerFieldProps = {
  id?: string
  /** "HH:mm" (format native <input type="time">) atau string kosong. */
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))

/**
 * Pengganti <Input type="time"> — alasan sama dengan EventDatePickerField:
 * popup jam native tidak bisa di-restyle. Dua kolom jam/menit yang bisa
 * di-scroll, kontrak value/onChange dipertahankan "HH:mm" persis.
 */
export function EventTimePickerField({ id, value, onChange, disabled, placeholder }: EventTimePickerFieldProps) {
  const [open, setOpen] = React.useState(false)
  const [hour, minute] = value ? value.split(":") : ["", ""]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-11 w-full items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-left text-sm text-zinc-700 outline-none transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-zinc-400",
          )}
        >
          <ClockIcon className="size-4 shrink-0 text-zinc-400" />
          <span className="truncate">{value || placeholder}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <div className="flex h-56 divide-x divide-zinc-100">
          <div className="w-16 overflow-y-auto py-1">
            {HOURS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => onChange(`${h}:${minute || "00"}`)}
                className={cn(
                  "flex w-full items-center justify-center py-1.5 text-sm transition-colors hover:bg-indigo-50",
                  hour === h ? "bg-primary font-semibold text-primary-foreground hover:bg-primary" : "text-zinc-700",
                )}
              >
                {h}
              </button>
            ))}
          </div>
          <div className="w-16 overflow-y-auto py-1">
            {MINUTES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onChange(`${hour || "00"}:${m}`)}
                className={cn(
                  "flex w-full items-center justify-center py-1.5 text-sm transition-colors hover:bg-indigo-50",
                  minute === m ? "bg-primary font-semibold text-primary-foreground hover:bg-primary" : "text-zinc-700",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
