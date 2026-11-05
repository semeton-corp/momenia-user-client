// Section testimoni di landing page tampil KECUALI NEXT_PUBLIC_FEATURE_TESTIMONIALS
// di-set persis "false". Sengaja bukan opt-in ("true") seperti flag lain — section ini
// sudah live, jadi env yang belum di-set tidak boleh diam-diam menyembunyikannya.
// Dibaca lewat process.env.NEXT_PUBLIC_* langsung supaya Next meng-inline nilainya saat build.
export const isTestimonialsEnabled = process.env.NEXT_PUBLIC_FEATURE_TESTIMONIALS !== "false"
