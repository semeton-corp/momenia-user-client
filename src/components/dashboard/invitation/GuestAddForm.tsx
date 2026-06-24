"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { WorkspaceCard } from "./WorkspaceCard"
import { cn } from "@/lib/utils"

type Option = { value: string; label: string }

type CategorySelectProps = {
  placeholder: string
  options: Option[]
  hint: string
}

function CategorySelect({ placeholder, options, hint }: CategorySelectProps) {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Option | null>(null)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const choose = (opt: Option) => {
    setSelected(opt)
    setOpen(false)
  }

  return (
    <div className="space-y-1.5">
      <div ref={ref} className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-xl border bg-white px-3 text-sm transition-colors",
            open ? "border-indigo-400 ring-2 ring-indigo-100" : "border-zinc-200",
            selected ? "text-zinc-800" : "text-zinc-400"
          )}
        >
          <span>{selected ? selected.label : placeholder}</span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          </motion.span>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg"
            >
              {/* Placeholder option */}
              <li
                onClick={() => { setSelected(null); setOpen(false) }}
                className={cn(
                  "flex cursor-pointer items-center px-3 py-2.5 text-sm",
                  !selected
                    ? "bg-indigo-500 text-white"
                    : "text-zinc-500 hover:bg-zinc-50"
                )}
              >
                {!selected && <Check className="mr-2 h-4 w-4 shrink-0" />}
                {placeholder}
              </li>

              {options.map((opt) => {
                const isActive = selected?.value === opt.value
                return (
                  <li
                    key={opt.value}
                    onClick={() => choose(opt)}
                    className={cn(
                      "flex cursor-pointer items-center px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "bg-indigo-500 text-white"
                        : "text-zinc-700 hover:bg-zinc-50"
                    )}
                  >
                    {isActive && <Check className="mr-2 h-4 w-4 shrink-0" />}
                    {opt.label}
                  </li>
                )
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      <p className="text-xs text-zinc-400">{hint}</p>
    </div>
  )
}

type GuestAddFormProps = {
  title: string
  nameLabel: string
  whatsAppLabel: string
  emailLabel: string
  categoryLabel: string
  chooseCategoryLabel: string
  categoryHint: string
  vipLabel: string
  regularLabel: string
  saveLabel: string
  cancelLabel: string
}

export function GuestAddForm({
  title,
  nameLabel,
  whatsAppLabel,
  emailLabel,
  categoryLabel,
  chooseCategoryLabel,
  categoryHint,
  vipLabel,
  regularLabel,
  saveLabel,
  cancelLabel,
}: GuestAddFormProps) {
  return (
    <WorkspaceCard className="h-fit px-4 py-4 sm:px-6 xl:p-8 border-0 shadow-none xl:border xl:shadow-sm">
      <h2 className="text-2xl font-semibold text-zinc-900">{title}</h2>

      {/* Inner container */}
      <div className="mt-4 rounded-[10px] border border-zinc-200 p-5">
        <div className="space-y-5">
          {/* Nama Lengkap */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">{nameLabel}</label>
            <Input placeholder="John Doe" className="h-11 rounded-xl border-zinc-200" />
          </div>

          {/* WhatsApp */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">{whatsAppLabel}</label>
            <div className="flex gap-2">
              <Input
                value="+62"
                readOnly
                className="h-11 w-16 shrink-0 rounded-xl border-zinc-200 text-center text-sm text-zinc-500"
              />
              <Input placeholder="1234 1234 1234" className="h-11 flex-1 rounded-xl border-zinc-200" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">{emailLabel}</label>
            <Input placeholder="johndoe@gmail.com" className="h-11 rounded-xl border-zinc-200" />
          </div>

          {/* Kategori */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">{categoryLabel}</label>
            <CategorySelect
              placeholder={chooseCategoryLabel}
              options={[
                { value: "vip", label: vipLabel },
                { value: "regular", label: regularLabel },
              ]}
              hint={categoryHint}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" className="h-12 flex-1 rounded-xl border-zinc-200 text-sm xl:h-10 xl:flex-none xl:px-6">
              {cancelLabel}
            </Button>
            <Button className="h-12 flex-1 rounded-xl text-sm xl:h-10 xl:flex-none xl:px-6">{saveLabel}</Button>
          </div>
        </div>
      </div>
    </WorkspaceCard>
  )
}
