# StructureMomenia.md — Panduan Struktur & Konvensi (Pengingat untuk Claude Agent)

> **Dokumen ini WAJIB dibaca sebelum menambah/mengubah kode di project ini.**
> Tujuannya: supaya agent **tidak ngasal** — tahu di mana harus menaruh kode, komponen mana yang sudah ada (jangan bikin ulang), dan konvensi styling yang dipakai.
> Kalau ragu, ikuti pola file yang **sudah ada** (lihat contoh di tiap bagian), jangan bikin pola baru sendiri.

---

## 0. Aturan Emas (baca ini dulu)

1. **`page.tsx` ADALAH orchestrator.** State, filter, dan komposisi layout ditulis langsung di `page.tsx`. **JANGAN** bikin wrapper perantara seperti `XxxView.tsx` lalu page cuma `return <XxxView />`. Itu tidak konsisten dengan project ini.
   - Contoh benar: [`(catalog)/page.tsx`](src/app/[locale]/dashboard/(catalog)/page.tsx), [`favourite/page.tsx`](src/app/[locale]/dashboard/(catalog)/favourite/page.tsx), [`guests/page.tsx`](src/app/[locale]/dashboard/(workspace)/my-invitation/[invitationId]/guests/page.tsx).
2. **1 file = 1 komponen reusable.** Potongan UI yang dipakai berulang (card, table, form, badge) jadi file sendiri di `src/components/...`, **bukan** function inline yang ditumpuk di satu file raksasa.
   - Contoh benar: `TemplateCard.tsx`, `SummaryStatCard.tsx`, `MyInvitationCard.tsx`.
3. **Pakai komponen yang SUDAH ADA, jangan tulis ulang dari nol.**
   - Tombol → `@/components/ui/button.tsx` (`<Button>`, variant `default`/`outline`, `asChild` untuk bungkus `<Link>`).
   - Badge → `@/components/dashboard/invitation/WorkspaceBadge.tsx`.
   - Card wrapper → `@/components/dashboard/invitation/WorkspaceCard.tsx`.
   - Input/Label/Sheet/Skeleton → `@/components/ui/*`.
   - `cn()` untuk gabung className → `@/lib/utils`.
4. **JANGAN PERNAH menyentuh layout mobile saat mengubah desktop.** Semua styling desktop-only **WAJIB** pakai prefix **`xl:`** (breakpoint 1280px). Mobile = base class tanpa prefix.
5. **Warna pakai CSS variable** kalau ada: `var(--primary)`, `var(--foreground)`, `var(--muted-foreground)`, `var(--card-foreground)`, `var(--sidebar-primary)`, `var(--border)`, `var(--accent)`, `var(--destructive)`. Hex literal (`text-[#6B7280]`) hanya kalau memang diminta spesifik oleh desain.
6. **Teks UI lewat i18n.** Tidak ada string hardcoded — pakai `useTranslations` (client) / `getTranslations` (server). Tambah key di **`messages/en.json` DAN `messages/id.json`** sekaligus.
7. Setelah perubahan kode, **jalankan `npx tsc --noEmit`** untuk pastikan tidak ada error tipe.

---

## 1. Tech Stack

- **Next.js (App Router)** + **React 19** + **TypeScript 5**
- **Tailwind CSS 4** (config via `postcss.config.mjs`, tema via CSS variables)
- **shadcn/ui** (komponen di `src/components/ui`, config di `components.json`)
- **TanStack React Query** (fetch/mutation/cache) — provider di `src/providers/QueryProvider.tsx`
- **next-intl** (i18n, locale `en`/`id`) — config di `src/i18n/*`, pesan di `messages/*.json`
- **Framer Motion** (animasi), **lucide-react** (ikon)

---

## 2. Peta Folder `src/`

```
src/
├── app/                          # App Router — routing & pages
│   ├── layout.tsx                # Root layout
│   ├── not-found.tsx
│   └── [locale]/                 # Semua route di-prefix locale (/en, /id)
│       ├── layout.tsx
│       ├── (main)/               # Landing page publik  (route group)
│       ├── (auth)/               # login, register
│       ├── (promo)/              # coming-soon
│       ├── (payment)/            # payment
│       ├── auth/callback/        # OAuth callback page
│       └── dashboard/
│           ├── (catalog)/        # Shell dashboard: sidebar + mobile header/nav
│           │   ├── layout.tsx    # DashboardSidebar + MobileHeader + MobileNav
│           │   ├── page.tsx      # Katalog template (halaman utama dashboard)
│           │   ├── favourite/
│           │   ├── transaction/
│           │   └── my-invitation/page.tsx   # ← "My Invitations" list
│           └── (workspace)/      # Workspace 1 undangan
│               └── my-invitation/[invitationId]/
│                   ├── layout.tsx            # Sidebar workspace
│                   ├── page.tsx              # Dashboard/overview undangan
│                   ├── edit/  guests/  rsvp/  notes/  messages/  gifts/  add-ons/
│
├── components/
│   ├── ui/                       # shadcn primitives (button, input, label, sheet, …)
│   ├── auth/                     # LoginForm, RegisterForm, OAuthHandler, AuthCallbackClient
│   ├── landing/                  # Section landing page (+ skeletons/)
│   ├── promo/                    # Halaman coming-soon
│   ├── dashboard/                # Komponen area dashboard
│   │   ├── DashboardSidebar.tsx          # Sidebar desktop (hidden, xl:flex)
│   │   ├── DashboardMobileHeader.tsx     # Header mobile (xl:hidden)
│   │   ├── DashboardMobileNav.tsx        # Bottom tab bar mobile (xl:hidden)
│   │   ├── DashboardBanner.tsx
│   │   ├── TemplateCard.tsx  TemplateDetailModal.tsx  StyleTag.tsx
│   │   ├── my-invitation/                # ← fitur "My Invitations"
│   │   │   ├── MyInvitationCard.tsx       # Kartu 1 undangan (reusable)
│   │   │   └── MyInvitationStatCard.tsx   # Kartu statistik (reusable)
│   │   └── invitation/                    # Komponen workspace 1 undangan
│   │       ├── WorkspaceCard.tsx  WorkspaceBadge.tsx  SummaryStatCard.tsx
│   │       ├── GuestsManagementTable.tsx  GuestAddForm.tsx  RsvpGuestTable.tsx
│   │       ├── AfterPartyRecipientsTable.tsx  WorkspaceTableFooter.tsx
│   │       ├── GuestMessageCard.tsx  AddOnCard.tsx  DonutChart.tsx
│   │       ├── InvitationWorkspaceHeader.tsx  InvitationWorkspaceSidebar.tsx
│   │       ├── InvitationPhonePreview.tsx  ZoomWrapper.tsx
│   │   └── Navbar.tsx / NavbarClient.tsx / Footer.tsx
│
├── hooks/
│   ├── useInvitationTemplates.ts         # React Query: list/detail/favourite template
│   ├── use-zoom-scale.ts
│   └── auth/                             # useGoogleOAuth, useOAuthCallback,
│                                         #   useCurrentUser, useLogout
│
├── lib/
│   ├── api/
│   │   ├── http.ts                       # fetch wrapper (lempar Error + .status)
│   │   ├── authentication/               # auth.service.ts + auth.types.ts
│   │   ├── invitation-template/          # service + types
│   │   └── landing-page/                 # service + types
│   ├── mocks/                            # invitation-workspace.ts, my-invitations.ts
│   ├── types/                            # invitation-workspace.ts (tipe domain)
│   ├── utils.ts                          # cn()
│   ├── typography.ts  effects.ts
│
├── i18n/                                 # routing.ts, navigation.ts, request.ts
├── providers/                            # QueryProvider.tsx
└── proxy.ts

messages/en.json   messages/id.json       # Semua teks UI (struktur key identik)
middleware.ts                             # next-intl; matcher EXCLUDE /api (jangan di-prefix locale)
```

---

## 3. Routing

- Semua route ada di bawah `app/[locale]/` → URL selalu `/<locale>/...` (mis. `/en/dashboard`, `/id/dashboard/my-invitation`).
- **Route group** `(...)` hanya untuk mengelompokkan + berbagi `layout.tsx`, **tidak** muncul di URL.
  - `(catalog)` = shell dashboard utama (punya sidebar + mobile nav).
  - `(workspace)` = area kerja satu undangan (`my-invitation/[invitationId]/...`).
- **Navigasi pakai helper next-intl**, bukan `next/link` mentah:
  ```ts
  import { Link, useRouter, redirect } from "@/i18n/navigation"
  ```
  `href` ditulis tanpa locale (mis. `/dashboard/my-invitation/${id}`); locale ditambah otomatis.
- `middleware.ts` matcher meng-EXCLUDE `/api` → panggilan API tidak ikut di-prefix locale (kalau tidak, API 404).

---

## 4. Pola Page (WAJIB diikuti)

**Server page** (default, untuk data via mock/server): `async function`, pakai `getTranslations`, `await params`.
```tsx
// contoh: guests/page.tsx
export default async function GuestsPage({ params }: Props) {
  const { locale, invitationId } = await params
  const t = await getTranslations("dashboard.workspace")
  const data = getInvitationWorkspaceData(invitationId, locale)
  return ( /* layout + komponen reusable */ )
}
```

**Client page** (butuh state/interaksi: tab, search, modal): `"use client"`, pakai `useTranslations`, `React.useState`.
```tsx
// contoh: (catalog)/page.tsx, my-invitation/page.tsx
"use client"
export default function MyInvitationPage() {
  const t = useTranslations("dashboard.workspace.myInvitations")
  const [tab, setTab] = React.useState<Tab>("all")
  // ...filter di sini, render <MyInvitationStatCard/> & <MyInvitationCard/>
}
```

➡️ **Logika orchestration tetap di `page.tsx`. Potongan UI berulang → komponen di `src/components`.**

---

## 5. Konvensi Styling (Tailwind)

- **Mobile-first.** Base class = mobile. Tambahan desktop pakai breakpoint:
  - `md:` (≥768), `lg:` (≥1024), **`xl:` (≥1280) = breakpoint "desktop" utama project ini.**
- **Mengubah desktop = HANYA tambah `xl:`. Jangan ubah base class (itu mobile).**
- Sidebar desktop: `hidden xl:flex`. Chrome mobile (header/bottom-nav): `xl:hidden`.
- Warna prioritas CSS variable (lihat Aturan Emas #5). Nilai pixel spesifik dari desain boleh pakai arbitrary value (`h-[188px]`, `text-[13px]`, `gap-40`).
- Tombol: pakai `<Button>` dari `ui/button.tsx`. Untuk link, `<Button asChild><Link href=...>…</Link></Button>`. Override ukuran/warna lewat `className` (tailwind-merge: class terakhir menang).
- Untuk menetralkan style bawaan variant `outline` (shadow + hover text), tambahkan `shadow-none hover:text-...` — lihat `MyInvitationCard.tsx` (`OUTLINE_NEUTRAL` / `OUTLINE_PRIMARY`).

---

## 6. i18n

- Namespace bersarang di `messages/en.json` & `messages/id.json` — **struktur key harus identik di kedua file.**
- Akses: `useTranslations("dashboard.workspace.myInvitations")` lalu `t("title")`, `t(\`status.${status}\`)`.
- Tambah teks baru = tambah di **kedua** file sekaligus, jangan salah satu saja.

---

## 7. Data / API

- HTTP lewat `src/lib/api/http.ts` (melempar `Error` dengan properti `.status`; cek `error.status === 401` untuk logout).
- Service per domain: `lib/api/<domain>/<domain>.service.ts` + `.types.ts`.
- Fetch di komponen via hook React Query (`src/hooks/...`), bukan `fetch` langsung di page.
- Selama backend belum siap, data dari `src/lib/mocks/*`. Tipe domain di `src/lib/types/*`.

---

## 8. Checklist sebelum menambah fitur baru

- [ ] Sudah baca dokumen ini & lihat 1–2 file sejenis sebagai contoh pola?
- [ ] Logika utama di `page.tsx` (orchestrator), bukan di wrapper `View` perantara?
- [ ] Potongan UI berulang dipecah jadi komponen `src/components/...` (1 file = 1 komponen)?
- [ ] Sudah cek komponen reusable yang ADA (Button, WorkspaceBadge, WorkspaceCard, dst.) sebelum bikin baru?
- [ ] Styling desktop pakai `xl:`; layout mobile tidak tersentuh?
- [ ] Teks lewat i18n & ditambahkan di `en.json` + `id.json`?
- [ ] `npx tsc --noEmit` lolos?

---

_Update dokumen ini bila menambah folder/komponen penting atau mengubah konvensi._
