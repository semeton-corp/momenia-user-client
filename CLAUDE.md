# CLAUDE.md

> **WAJIB: Baca [`StructureMomenia.md`](StructureMomenia.md) sebelum menambah/mengubah kode apa pun di project ini.**
> Dokumen itu berisi struktur folder, konvensi, dan aturan yang harus diikuti supaya tidak ngasal.

## Aturan inti (ringkas — detail di StructureMomenia.md)

1. **`page.tsx` adalah orchestrator.** State + komposisi layout langsung di `page.tsx`. JANGAN bikin wrapper perantara `XxxView.tsx`.
2. **1 file = 1 komponen reusable.** Potongan UI berulang → file sendiri di `src/components/...`, bukan function inline yang ditumpuk.
3. **Pakai komponen yang sudah ada** sebelum bikin baru: `@/components/ui/button.tsx`, `WorkspaceBadge`, `WorkspaceCard`, `@/components/ui/*`, dan `cn()` dari `@/lib/utils`.
4. **Styling desktop HANYA pakai prefix `xl:` (≥1280px). JANGAN sentuh layout mobile** saat mengubah desktop.
5. **Warna pakai CSS variable** (`var(--primary)`, `var(--foreground)`, dst.); hex literal hanya bila desain memintanya spesifik.
6. **Teks lewat i18n.** Tidak ada string hardcoded — tambah key di **`messages/en.json` DAN `messages/id.json`** sekaligus (struktur key identik).
7. **Navigasi pakai helper next-intl** (`import { Link, useRouter } from "@/i18n/navigation"`), bukan `next/link` mentah.
8. Setelah perubahan kode, jalankan **`npx tsc --noEmit`**.
