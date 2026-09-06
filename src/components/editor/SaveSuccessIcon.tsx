"use client"

import { Lottie } from "lottie-react"
import successAnimation from "@/assets/lottie/success-animation.json"

// The source clip is a 1080x1080 canvas, but the checkmark circle itself is only
// ~385px (110% scale on a 350px ellipse) — the rest is empty space reserved for a
// celebratory burst effect ("Elements - 1/2" layers) that's invisible at icon size
// anyway. Shrinking the whole canvas uniformly into a 16px box is what read as "too
// much padding left and right": the circle ends up a few px wide with dead space
// around it. Scaling the Lottie up inside a clipped, fixed-size wrapper crops that
// padding away instead — 1080/385 ≈ 2.8 would fill the box exactly; 2.5 leaves a
// small margin so the circle's edge isn't cut off crisp against the clip.
const CROP_SCALE = 2.5

/**
 * The save-success tick, sized to sit in place of a button's leading icon.
 * Plays once and reports back so the caller can drop it and restore the normal icon.
 */
export function SaveSuccessIcon({ onDone }: { onDone: () => void }) {
  return (
    <div className="relative h-4.75 w-4.75 shrink-0 overflow-hidden">
      <Lottie
        src={successAnimation}
        autoplay
        loop={false}
        // The source clip runs ~2.5s, which reads as sluggish at button scale — a button
        // acknowledgement wants to be over before the next click.
        speed={2}
        subscriptions={{ complete: onDone }}
        className="absolute h-4.75 w-4.75"
        style={{ top: "50%", left: "50%", transform: `translate(-50%, -50%) scale(${CROP_SCALE})` }}
      />
    </div>
  )
}
