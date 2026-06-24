/**
 * Typography scale — single source of truth untuk semua text styles.
 *
 * Skala mengikuti Tailwind:
 *   xs=12/16  sm=14/20  base=16/24  lg=18/28  xl=20/28  2xl=24/32
 *   3xl=30/36  4xl=36/40  5xl=48/48  6xl=60/60  7xl=72/72  8xl=96/96  9xl=120/120
 *
 * Weights: black(900) extrabold(800) bold(700) semibold(600)
 *          medium(500) regular(400) light(300) extralight(200) thin(100)
 *
 * Pakai:
 *   import { typography } from "@/lib/typography"
 *   <h1 className={typography.lg.bold}>Judul</h1>
 *   <p className={typography.base.regular}>Body text</p>
 */

const SIZES = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "5xl": "text-5xl",
  "6xl": "text-6xl",
  "7xl": "text-7xl",
  "8xl": "text-8xl",
  "9xl": "text-9xl",
} as const

const WEIGHTS = {
  black: "font-black",
  extrabold: "font-extrabold",
  bold: "font-bold",
  semibold: "font-semibold",
  medium: "font-medium",
  regular: "font-normal",
  light: "font-light",
  extralight: "font-extralight",
  thin: "font-thin",
} as const

type SizeKey = keyof typeof SIZES
type WeightKey = keyof typeof WEIGHTS

type Typography = {
  readonly [S in SizeKey]: { readonly [W in WeightKey]: string }
}

function buildTypography(): Typography {
  const result = {} as Record<SizeKey, Record<WeightKey, string>>
  for (const size of Object.keys(SIZES) as SizeKey[]) {
    result[size] = {} as Record<WeightKey, string>
    for (const weight of Object.keys(WEIGHTS) as WeightKey[]) {
      result[size][weight] = `${SIZES[size]} ${WEIGHTS[weight]}`
    }
  }
  return result as Typography
}

export const typography = buildTypography()

export type { SizeKey as TypographySize, WeightKey as TypographyWeight }
