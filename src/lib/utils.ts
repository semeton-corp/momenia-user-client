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
