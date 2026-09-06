"use client"

import { Lottie } from "lottie-react"
import successAnimation from "@/assets/lottie/success-animation.json"

/**
 * Full-screen payment success moment — same clip as the editor's Save button
 * (SaveSuccessIcon), but shown at natural scale instead of cropped tight to the
 * checkmark: at this size there's room for the animation's own celebratory burst
 * around it, which the button-sized version deliberately crops away.
 * Plays once and reports back so the caller can redirect once it's done.
 */
export function PaymentSuccessOverlay({ onDone }: { onDone: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="h-72 w-72 sm:h-96 sm:w-96">
        <Lottie
          src={successAnimation}
          autoplay
          loop={false}
          subscriptions={{ complete: onDone }}
          className="h-full w-full"
        />
      </div>
    </div>
  )
}
