import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Backend kadang kirim label mentah gaya enum ("WEDDING_INVITATION", "NATURE") —
// ubah jadi Title Case dengan spasi ("Wedding Invitation", "Nature") untuk tampilan.
// String yang sudah berupa kalimat normal (mis. "pernikahan dini") tidak terpengaruh.
export function formatLabel(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const GO_TIMESTAMP_PATTERN = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(?:\.\d+)?\s*([+-]\d{2}:?\d{2})?/

// Backend sering kirim timestamp gaya Go, mis. "2026-06-18 22:08:32.861282 +0700 +07".
// "0001-01-01" adalah nilai kosong/placeholder (belum pernah di-set) → dianggap tidak ada.
export function parseGoTimestamp(raw: string): Date | null {
  const match = raw.match(GO_TIMESTAMP_PATTERN)
  if (!match) return null
  const [, datePart, timePart, offsetRaw] = match
  if (datePart.startsWith("0001")) return null
  const offset = offsetRaw ? offsetRaw.replace(/^([+-]\d{2})(\d{2})$/, "$1:$2") : "Z"
  const date = new Date(`${datePart}T${timePart}${offset}`)
  return Number.isNaN(date.getTime()) ? null : date
}
