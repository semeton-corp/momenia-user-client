"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart } from "lucide-react"
import LogoMemoria from "@/assets/logo/logo-memoria.png"
import { cn } from "@/lib/utils"
import { useZoomScale } from "@/hooks/use-zoom-scale"
import enMessages from "../../messages/en.json"
import idMessages from "../../messages/id.json"

// Catatan: file ini di luar segment [locale], jadi TIDAK punya akses ke
// NextIntlClientProvider. Untuk tetap dapat teks en/id, locale dideteksi dari
// prefix URL (usePathname) lalu string diambil langsung dari messages/*.json.
// Navigasi tetap pakai next/link ke "/dashboard" (middleware yang otomatis
// menambahkan prefix locale-nya).
const NOT_FOUND_MESSAGES = { en: enMessages.notFound, id: idMessages.notFound } as const

function useNotFoundMessages() {
  const pathname = usePathname()
  const seg = pathname.split("/")[1]
  const locale: keyof typeof NOT_FOUND_MESSAGES = seg === "id" ? "id" : "en"
  return NOT_FOUND_MESSAGES[locale]
}

// Path amplop dari src/assets/404/*.svg
const ENVELOPE_BACK_PATH =
  "M0.40735 585.073L-0.000154302 168.752C-0.00595225 162.845 3.17038 157.282 8.21286 154.205C353.518 -56.4843 545.398 -46.2605 873.412 154.221C878.439 157.294 881.6 162.833 881.606 168.725L882.015 585.04C882.024 594.435 874.41 602.056 865.015 602.056L17.4073 602.057C8.02496 602.057 0.416504 594.456 0.40735 585.073Z"
// Path asli dari envelope-front.svg titik "bahu" V-nya tidak simetris
// (bahu kiri ~15.6px dari tengah, bahu kanan ~31.6px dari tengah) — bikin
// amplop kelihatan menceng. Di-mirror dari sisi kanan (dianggap acuan)
// supaya kedua sisinya jadi cermin sempurna, sudut/lengkungan tetap sama.
const ENVELOPE_FRONT_PATH =
  "M0,16.366C0,4.85499 11.79,-2.88975 22.355,1.68199L409.725,169.32C424.675,175.79 457.901,175.79 472.851,169.32L860.221,1.68199C870.786,-2.88975 882.576,4.85499 882.576,16.366L882.576,284.09C882.576,292.926 875.413,300.09 866.576,300.09H16C7.16344,300.09 0,292.926 0,284.09Z"

// Bikin CSS-mask dari path SVG supaya efek (backdrop-blur) cuma muncul di dalam
// siluet amplop. mask-size 100% 100% membuat siluet ikut ukuran elemen di tiap
// breakpoint (tidak butuh koordinat presisi seperti clipPath userSpaceOnUse).
function maskFromPath(path: string, width: number, height: number): React.CSSProperties {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}' preserveAspectRatio='none'><path d='${path}' fill='black'/></svg>`
  const mask = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  return {
    WebkitMaskImage: mask,
    maskImage: mask,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  }
}

/**
 * Amplop dengan efek Liquid Glass mendekati setting Figma "Glass":
 *   Frost      → backdrop-blur (keburaman kaca) — makin besar makin buram
 *   Light 175° → gradien rim: sisi atas terang, meredup, lalu semburat violet
 *   Dispersion → didekati dgn semburat violet (#c4b5fd) di tepi bawah
 *   Refraction → TIDAK bisa 1:1 di CSS (butuh SVG displacement), didekati saja.
 *
 * Catatan: backdrop-blur HARUS di <div> biasa (bukan di dalam <foreignObject>
 * SVG — di situ backdrop-filter tidak mengambil backdrop dgn benar, frost-nya
 * hilang jadi cuma panel putih datar). Frost pakai CSS-mask; rim pakai SATU
 * garis stroke saja (dulu ada 2 garis depth+rim yang di ukuran kecil terlihat
 * "dobel"/overlap — sekarang 1 garis, tidak ada dobel lagi).
 */
function GlassEnvelope({
  path,
  width,
  height,
  gradientId,
  blurClassName,
  rimWidth,
  className,
}: {
  path: string
  width: number
  height: number
  gradientId: string
  /** Class Tailwind backdrop-blur-*, boleh beda per breakpoint. */
  blurClassName: string
  rimWidth: number
  className?: string
}) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none", className)}>
      {/* Frost — backdrop-blur di dalam siluet amplop (di div, bukan SVG) */}
      <div
        className={cn("absolute inset-0 bg-white/12", blurClassName)}
        style={maskFromPath(path, width, height)}
      />
      {/* Rim tunggal (Light + Dispersion). non-scaling-stroke supaya tebal garis
          konsisten walau di-stretch. */}
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={gradientId} x1="0.1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="1" stopColor="#c4b5fd" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <path d={path} fill="none" stroke={`url(#${gradientId})`} strokeWidth={rimWidth} vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}

/**
 * Amplop solid biasa, TANPA backdrop-blur — dipakai sebagai layer paling
 * belakang di bawah GlassEnvelope, supaya siluetnya kelihatan lebih gelap/
 * tegas (glass di atasnya jadi terlihat "mengambang" di atas lapisan solid ini).
 */
function SolidEnvelope({
  path,
  width,
  height,
  fill,
  className,
}: {
  path: string
  width: number
  height: number
  fill: string
  className?: string
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("pointer-events-none", className)}
    >
      <path d={path} fill={fill} />
    </svg>
  )
}

export default function NotFound() {
  const t = useNotFoundMessages()
  // Kompensasi zoom browser (Ctrl +/-) seperti dashboard/landing: saat user
  // zoom in, devicePixelRatio naik → skala di-counter supaya ukuran visual
  // tetap stabil, tidak ikut membesar/berantakan. Hanya aktif di desktop.
  const scale = useZoomScale()

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 xl:h-screen xl:py-6"
      style={{ background: "linear-gradient(180deg, #1E1B4B 15.44%, #4F46E5 59.99%, #7C3AED 76.01%)" }}
    >
      {/* Ambient glow — radial-gradient yang sudah fade ke transparan sebelum
          di-blur (teknik sama seperti HeroSection di landing page), supaya
          tepinya lembut dan tidak belepotan menabrak konten. */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[620px] -translate-x-1/2 -translate-y-[58%] rounded-full opacity-80 blur-[70px] sm:h-[520px] sm:w-[820px] sm:blur-[100px]"
        style={{
          background: "radial-gradient(closest-side, rgba(196,181,253,0.55) 0%, rgba(196,181,253,0.25) 45%, rgba(196,181,253,0) 75%)",
        }}
      />

      {/* Wrapper skala zoom — pakai `zoom` (bukan `transform: scale`), karena
          `transform` di elemen leluhur MERUSAK backdrop-filter (frost amplop
          jadi luntur). `zoom` scale-nya di level layout, tidak membuat
          containing-block/stacking-context yang mematahkan backdrop-blur.
          (Pola yang sama dipakai TemplateDetailModal.) */}
      <div className="flex w-full justify-center" style={{ zoom: scale } as React.CSSProperties}>
      <div className="relative flex w-full max-w-[372px] flex-col items-center sm:max-w-[512px] xl:max-w-[797.96px] xl:-translate-y-14">
        {/* Angka 404 raksasa — sebagian nongol di atas kertas, dengan sedikit
            jarak visual (bukan langsung nempel) sebelum tertutup kartu. */}
        <h1
          className="relative z-0 -mb-3 select-none font-sans text-[128px] font-semibold leading-none tracking-[0.05em] opacity-90 sm:-mb-14 sm:-translate-y-10 sm:text-[150px] xl:-mb-24 xl:-translate-y-1 xl:text-[379.52px]"
          style={{ color: "var(--popover)", textShadow: "0 12px 30px rgba(0,0,0,0.25)" }}
        >
          404
        </h1>

        <div className="relative w-full xl:translate-y-1">
          {/* Amplop belakang — 2 layer bertumpuk supaya lebih gelap/tegas:
              1) solid polos tanpa blur (paling belakang)
              2) glass blur di atasnya (yang bikin efek kaca)
              Urutan render: 404 → solid → glass → kartu. */}
          <SolidEnvelope
            path={ENVELOPE_BACK_PATH}
            width={883}
            height={603}
            fill="rgba(78,75,153,0.55)"
            className="absolute inset-x-0 top-[-24px] z-0 h-[380px] w-full sm:top-[-34px] sm:h-[540px] xl:inset-x-auto xl:left-1/2 xl:top-[-41px] xl:h-[602.06px] xl:w-[882.04px] xl:-translate-x-1/2"
          />
          <GlassEnvelope
            path={ENVELOPE_BACK_PATH}
            width={883}
            height={603}
            gradientId="glassBackRim"
            blurClassName="backdrop-blur-[6px] xl:backdrop-blur-[18px]"
            rimWidth={2}
            className="absolute inset-x-0 top-[-24px] z-0 h-[380px] w-full sm:top-[-34px] sm:h-[540px] xl:inset-x-auto xl:left-1/2 xl:top-[-41px] xl:h-[602.06px] xl:w-[882.04px] xl:-translate-x-1/2"
          />

          {/* Kertas — kartu putih tempat pesan 404. Radius besar + glow ungu
              (bukan shadow hitam) sesuai spec. Padding bawah dibikin lega
              supaya kantong amplop depan cuma menutup ruang kosong dekoratif,
              tidak pernah menabrak tombol/teks. */}
          <div
            className="relative z-10 mx-auto w-full max-w-[290px] rounded-[28px] bg-[#FFFFFF] px-4 pb-16 pt-6 text-center sm:max-w-[410px] sm:rounded-[62px] sm:px-12 sm:pb-28 sm:pt-10 xl:h-[501px] xl:w-[797.96px] xl:max-w-none xl:rounded-[62px]"
            style={{ boxShadow: "7px 0px 36.3px #A78BFA, 7px 0px 21.7px #A78BFA, 0px -7px 12.9px #A78BFA" }}
          >
            <Image src={LogoMemoria} alt="Momenia" className="mx-auto h-6 w-auto sm:h-7 xl:h-[50.55px] xl:w-[159px]" />

            {/* Text-7xl/Medium */}
            <h2 className="mt-4 text-3xl font-medium text-primary sm:mt-6 sm:text-5xl xl:text-7xl">{t.title}</h2>

            <div className="mt-3 flex items-center justify-center gap-3 sm:mt-4 sm:gap-4">
              <span className="h-px w-12 border-t border-indigo-300 sm:w-16 xl:w-[149.94px]" />
              <Heart className="h-4 w-4 shrink-0 fill-primary text-primary sm:h-5 sm:w-5 xl:w-[21px]" />
              <span className="h-px w-12 border-t border-indigo-300 sm:w-16 xl:w-[149.94px]" />
            </div>

            {/* Mobile/tablet: satu paragraf gabungan */}
            <p className="mx-auto mt-3 max-w-[340px] text-sm font-medium leading-normal text-primary sm:mt-4 sm:text-xl xl:hidden">
              {t.heading} {t.description}
            </p>
            {/* Desktop: dipisah 2 baris sesuai style Figma */}
            <p className="mt-4 hidden text-2xl font-medium leading-normal text-primary xl:block">
              {t.heading}
            </p>
            <p className="mx-auto mt-1 hidden max-w-[380px] text-sm font-normal leading-normal text-primary xl:block">
              {t.description}
            </p>

            <Link
              href="/dashboard"
              className="mt-5 inline-flex h-9 items-center justify-center rounded-[10px] bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 sm:mt-6 sm:h-10 sm:px-4 sm:text-sm xl:w-[159px]"
            >
              {t.backToDashboard}
            </Link>
          </div>

          {/* Amplop depan — Liquid Glass (Frost 52, Depth 28), di DEPAN kartu
              jadi mem-blur bagian bawah kartu. Ukuran/posisi xl persis spec
              Figma (882.58×308.08). */}
          <GlassEnvelope
            path={ENVELOPE_FRONT_PATH}
            width={883}
            height={301}
            gradientId="glassFrontRim"
            blurClassName="backdrop-blur-[5px] xl:backdrop-blur-[14px]"
            rimWidth={1.5}
            className="absolute inset-x-0 top-[236px] z-20 h-[120px] w-full sm:top-[334px] sm:h-[172px] xl:inset-x-auto xl:left-1/2 xl:top-[253px] xl:h-[308.08px] xl:w-[882.58px] xl:-translate-x-1/2"
          />
        </div>
      </div>
      </div>
    </main>
  )
}
