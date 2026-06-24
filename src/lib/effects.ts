/**
 * Effect styles — single source of truth untuk shadow, backdrop-blur, dan blur.
 *
 * Mengikuti Figma "Effect styles":
 *   Box Shadow: 2xs → 2xl, inner, none
 *   Backdrop Blur: none → 3xl
 *   Blur: none → 3xl
 *
 * Pakai:
 *   import { effects } from "@/lib/effects"
 *   <div className={effects.shadow.sm}>...</div>
 *   <div className={effects.backdropBlur.lg}>...</div>
 *   <div className={effects.blur.md}>...</div>
 */

export const effects = {
  shadow: {
    "2xs":  "shadow-2xs",
    xs:     "shadow-xs",
    sm:     "shadow-sm",
    md:     "shadow-md",
    lg:     "shadow-lg",
    xl:     "shadow-xl",
    "2xl":  "shadow-2xl",
    inner:  "shadow-inner",
    none:   "shadow-none",
  },

  backdropBlur: {
    none:   "backdrop-blur-none",
    sm:     "backdrop-blur-sm",
    base:   "backdrop-blur",
    md:     "backdrop-blur-md",
    lg:     "backdrop-blur-lg",
    xl:     "backdrop-blur-xl",
    "2xl":  "backdrop-blur-2xl",
    "3xl":  "backdrop-blur-3xl",
  },

  blur: {
    none:   "blur-none",
    sm:     "blur-sm",
    base:   "blur",
    md:     "blur-md",
    lg:     "blur-lg",
    xl:     "blur-xl",
    "2xl":  "blur-2xl",
    "3xl":  "blur-3xl",
  },

  /**
   * Custom presets — kombinasi siap pakai
   */
  custom: {
    focusRing:   "ring-2 ring-ring ring-offset-2",
    destructive: "shadow-sm ring-1 ring-destructive",
  },
} as const

export type ShadowKey       = keyof typeof effects.shadow
export type BackdropBlurKey = keyof typeof effects.backdropBlur
export type BlurKey         = keyof typeof effects.blur
