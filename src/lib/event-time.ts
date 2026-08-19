// The event moment lives in two places at once: as `event_date` / `event_time` schema
// fields the couple edits, and as one top-level `eventTime` timestamp the API stores.
// Both the editor and the invitation dashboard write it, so the conversion lives here
// rather than in either screen — otherwise the two can drift and disagree about what
// "the event" is.

const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

/** "2026-08-20" → "Kamis, 20 Agustus 2026". Mirrored into the `event_date_display` field. */
export function formatDateId(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return ""
  return `${DAYS_ID[d.getDay()]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`
}

// RFC3339 carrying the browser's own UTC offset. Deliberately not toISOString(): that
// converts to UTC, so a 15:30 ceremony in WITA would be stored as 07:30Z and read back as
// the wrong wall-clock time. The couple types the time they mean locally, so the offset
// travels with it.
function toRfc3339Local(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  const offsetMinutes = -d.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? "+" : "-"
  const abs = Math.abs(offsetMinutes)
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  )
}

/**
 * fieldValues → the API's single `eventTime`.
 *   • event_date + event_time → that exact moment
 *   • event_date only         → midnight on that date
 *   • no / unparseable date   → "" (callers omit the field rather than send a blank,
 *                                which a Go time.Time would refuse to parse)
 */
export function buildEventTime(userData: Record<string, string>): string {
  const date = userData.event_date?.trim()
  if (!date) return ""
  const time = userData.event_time?.trim() || "00:00"
  // `YYYY-MM-DDTHH:mm` with no zone parses as local time.
  const parsed = new Date(`${date}T${time}`)
  if (Number.isNaN(parsed.getTime())) return ""
  return toRfc3339Local(parsed)
}

/**
 * The reverse: take a date+time the user picked and produce the field updates that keep
 * `fieldValues` and `eventTime` in agreement. Returns the fields to merge, so callers
 * can't forget `event_date_display` and leave the rendered invitation showing a stale date.
 */
export function applyEventDateTime(
  fieldValues: Record<string, string>,
  date: string,
  time: string,
): { fieldValues: Record<string, string>; eventTime: string } {
  const next: Record<string, string> = { ...fieldValues, event_date: date, event_time: time }
  if (date) next.event_date_display = formatDateId(date)
  else delete next.event_date_display
  return { fieldValues: next, eventTime: buildEventTime(next) }
}
