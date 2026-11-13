// Nomor WhatsApp resmi Momenia (format internasional tanpa "+"). Dipakai footer,
// form "Custom Template" di landing, dan pop-up Custom Template di dashboard —
// ganti di sini saja kalau nomornya berubah.
export const WHATSAPP_NUMBER = "628561114275"

/** Link wa.me ke nomor Momenia dengan pesan yang sudah terisi (belum terkirim sampai user menekan kirim). */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
