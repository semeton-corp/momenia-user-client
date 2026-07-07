/**
 * Buang karakter di luar ASCII cetak (0x21–0x7E). Token JWT/opaque kita selalu
 * berupa base64url + titik, jadi apa pun di luar rentang itu artinya rusak
 * akibat copy-paste lewat aplikasi rich-text (mis. WhatsApp/Notion menukar
 * tanda kutip/hubung biasa dengan versi "smart"-nya). Tanpa ini, fetch()
 * melempar "String contains non ISO-8859-1 code point" dan request gagal
 * total sebelum sempat sampai ke server.
 */
export function sanitizeToken(raw: string): string {
  return raw.replace(/[^\x21-\x7E]/g, "")
}

export function getAuthHeader(): Record<string, string> {
  const raw = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
  if (!raw) return {}
  const token = sanitizeToken(raw)
  return token ? { Authorization: `Bearer ${token}` } : {}
}
