"use client"

import { Chrome } from "lucide-react"
import Image from "next/image"
import LogoMemoria from "@/assets/logo/logo-memoria.png"
import LogoGoogle from "@/assets/logo/logo-google.png"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { useGoogleOAuth } from "@/hooks/auth/useGoogleOAuth"
import LoadingScreen from "@/components/ui/loadingScreen"

export default function LoginPage() {
  const { mutate, isPending } = useGoogleOAuth()
  const t = useTranslations("register")

  return (
    <main className="h-screen flex justify-center bg-[linear-gradient(to_bottom,#1e1b4b_45%,#4f46e5_70%,#7c3aed_100%)] relative overflow-hidden">
      {isPending && <LoadingScreen />}

      <div className="absolute  bg-purple-500 opacity-40 blur-[120px] rounded-full bottom-0 right-0"></div>

      <div className="relative w-full max-w-4xl flex items-end justify-center px-8">


        <div className="absolute w-[700px] h-[300px] bg-purple-500/40 blur-[120px] rounded-full top-[10%] left-1/2 -translate-x-1/2 z-0" />

        {/* back envelope */}
        <div className="absolute bottom-0 left-0 w-full h-[95vh] px-3">
          <svg
            viewBox="0 0 1440 400"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,120 C360,0 1080,0 1440,120 L1440,400 L0,400 Z"
              fill="rgba(255,255,255,0.1)"
            />
          </svg>
        </div>

        {/* main card */}
        <div className="relative w-full">
          <div className="absolute inset-0 bg-violet-300 rounded-3xl blur-sm"></div>
          <div className="
            h-[80vh] overflow-y-auto w-full 
            bg-white
            rounded-3xl md:px-36 px-8 py-12 text-center z-10
            shadow-[0_8px_30px_rgba(0,0,0,0.15)]
            border border-white/40
            relative
            ">
            <Image
              src={LogoMemoria}
              alt="Memoria Logo"
              width={256}
              height={256}
              className="mx-auto pb-8 w-20 sm:w-32 md:w-48 lg:w-64 h-auto object-contain"
            />
            <h1 className="text-xl font-semibold mb-2">{t("title")}</h1>
            <p className="text-sm text-gray-500 mb-6">
              {t("description")}
            </p>

            <button
              onClick={() => {
                localStorage.setItem("auth_type", "register")
                mutate()
              }}
              className="w-full flex cursor-pointer justify-center gap-2 bg-primary hover:bg-chart-2 text-white py-3 rounded-lg font-medium transition"
            >
              <Image
                src={LogoGoogle}
                alt="Google Logo"
                width={20}
                height={20}
                className="object-contain"
              />
              {isPending ? "Redirecting..." : t("googleButton")}
            </button>

            <p className="text-xs text-gray-400 py-8">
              {t("hasAccount")}{" "}
              <Link
                href="/login"
                className="text-primary font-black cursor-pointer
                transition-all duration-300 ease-out hover:text-chart-2 underline"
              >
                {t("login")}
              </Link>
            </p>

            <p className="text-xs text-gray-400 ">
              {t("termsText")}{" "}
              <span className="underline">{t("termsOfService")}</span>{" "}
              and{" "}
              <span className="underline">{t("privacyPolicy")}</span>
            </p>
          </div>
        </div>


        {/* front envelope */}
        <div className="
        absolute bottom-0 left-0 w-full h-[40vh]
        translate-y-10
        z-20 pointer-events-none overflow-hidden px-3
        ">
          <div
            className="w-full h-full bg-white/10 backdrop-blur-[20px]"
            style={{
              clipPath:
                "polygon(0 0, 40% 30%, 50% 20%, 60% 30%, 100% 0, 100% 100%, 0 100%)",
            }}
          />
        </div>

      </div>
    </main>
  )
}