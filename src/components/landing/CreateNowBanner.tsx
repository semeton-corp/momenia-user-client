"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import Ambient from "@/assets/llandingpage/banner-create-now.svg"

type Props = {
  onClick?: () => void
}

export function CreateNowBanner({ onClick }: Props) {
  const t = useTranslations("landing.createNow")

  return (
    <section className="w-full pt-10 pb-14 md:pt-14 md:pb-20 lg:pt-16 lg:pb-24" aria-label="Create Now">
      <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6">
        <div
          // Tinggi diubah: mobile (h-32), tablet (md:h-40). Desktop tetap (lg:h-64)
          className="relative mx-auto flex w-full items-center justify-center overflow-hidden rounded-[24px] h-32 md:h-40 md:rounded-[32px] lg:h-64 lg:rounded-[40px]"
          style={{
            background:
              "linear-gradient(to top, #312E81 0%, #4F46E5 27%, #6366F1 44%, #A5B4FC 74%, #DDD6FE 100%)",
          }}
        >
          {/* Bagian Kiri */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[40%] opacity-70 md:w-[30%] lg:w-[25%]">
            <Image 
              src={Ambient} 
              alt="ambient" 
              fill 
              className="object-contain object-right-bottom scale-x-[-1]" 
              priority 
            />
          </div>

          {/* Bagian Kanan */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[40%] opacity-70 md:w-[30%] lg:w-[25%]">
            <Image 
              src={Ambient} 
              alt="ambient" 
              fill 
              className="object-contain object-right-bottom" 
              priority 
            />
          </div>

          {/* Konten Text */}
          <div
            className="relative z-10 mx-auto w-full max-w-3xl px-4 text-center text-white"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            {/* Ukuran h3 disesuaikan: text-2xl (mobile), text-4xl (tablet). Desktop tetap text-6xl */}
            <h3 className="font-semibold text-2xl md:text-4xl lg:text-6xl">{t("title")}</h3>
            
            {/* Ukuran p disesuaikan: text-xs (mobile), text-sm (tablet). Desktop tetap text-lg */}
            <p className="mt-1 text-xs font-normal md:mt-2 md:text-sm lg:text-lg">
              {t("subtitle1")}
            </p>
            <p className="text-xs font-normal md:text-sm lg:text-lg">{t("subtitle2")}</p>
            
            {onClick && (
              <button
                onClick={onClick}
                // Tombol dikecilkan di mobile agar proporsional dengan tinggi box yang baru
                className="mt-2 md:mt-4 inline-flex items-center justify-center rounded-md bg-white/90 shadow hover:bg-white text-[#4F46E5] font-medium h-8 px-4 text-xs md:h-10 md:px-6 md:text-sm"
                type="button"
              >
                {t("cta")}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
