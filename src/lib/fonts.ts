// System fonts - always available, no loading needed
export const SYSTEM_FONTS = [
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
  "Comic Sans MS",
  "Impact",
] as const

// Google Fonts - curated popular & trending fonts (2024)
export const GOOGLE_FONTS = [
  // Modern, Popular
  "Poppins",
  "Inter",
  "Roboto",
  "Open Sans",
  "Raleway",

  // Serif, Elegant
  "Playfair Display",
  "Lora",
  "Merriweather",
  "Crimson Text",
  "Volkhov",

  // Bold, Display
  "Montserrat",
  "Oswald",
  "Bebas Neue",
  "Righteous",
  "Fraunces",

  // Rounded, Friendly
  "Nunito",
  "Quicksand",
  "Dosis",
  "Karla",
  "Ubuntu",

  // Modern, Minimalist
  "Outfit",
  "Manrope",
  "DM Sans",
  "Sora",
  "Jost",

  // Script, Decorative
  "Pacifico",
  "Caveat",
  "Dancing Script",
  "Fredoka",
  "Cambay",

  // Technical, Monospace
  "JetBrains Mono",
  "IBM Plex Mono",
  "Inconsolata",

  // Modern Sans
  "Rubik",
  "Grenze",
  "Cabin",
  "Work Sans",
  "Asap",

  // Extended
  "Exo",
  "Raleway Dots",
  "Barlow",
  "IBM Plex Serif",
  "IBM Plex Sans",
  "Merriweather Sans",
  "Noto Sans",
  "Noto Serif",
] as const

export const ALL_FONTS = [...SYSTEM_FONTS, ...GOOGLE_FONTS] as const
export type FontName = (typeof ALL_FONTS)[number]

/**
 * Check if a font is a system font (always available)
 */
export function isSystemFont(font: string): boolean {
  return SYSTEM_FONTS.includes(font as any)
}

/**
 * Get Google Fonts API URL for given fonts
 */
export function getGoogleFontsUrl(...fonts: string[]): string {
  const uniqueFonts = [...new Set(fonts)]
    .filter((f) => !isSystemFont(f))
    .map(encodeURIComponent)

  if (uniqueFonts.length === 0) return ""

  return `https://fonts.googleapis.com/css2?${uniqueFonts
    .map((f) => `family=${f}:wght@300;400;600`)
    .join("&")}&display=swap`
}

/**
 * Inject Google Font dynamically into iframe
 */
export function injectFontToIframe(
  iframe: HTMLIFrameElement,
  fontName: string
): Promise<void> {
  if (isSystemFont(fontName)) {
    return Promise.resolve() // System fonts are always available
  }

  return new Promise((resolve) => {
    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) {
      resolve()
      return
    }

    // Check if font is already loaded
    const existingLink = doc.querySelector(
      `link[href*="${encodeURIComponent(fontName)}"]`
    )
    if (existingLink) {
      resolve()
      return
    }

    // Create and inject font link
    const link = doc.createElement("link")
    link.href = getGoogleFontsUrl(fontName)
    link.rel = "stylesheet"
    link.onload = () => resolve()
    link.onerror = () => resolve() // Resolve anyway to not block
    doc.head.appendChild(link)
  })
}
