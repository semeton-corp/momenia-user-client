// iPhones shoot HEIC by default and only Safari can decode it, so a HEIC that reaches
// a canvas (or an <img>) fails everywhere else. iOS Safari transcodes to JPEG
// automatically on upload, so this mainly covers desktop users with a .heic on disk.

/** Extensions the file picker should offer, including HEIC now that we can convert it. */
export const ACCEPTED_IMAGE_TYPES = ".jpg,.jpeg,.png,.webp,.heic,.heif"

const HEIC_EXTENSION = /\.hei[cf]$/i

// Chrome reports an empty `file.type` for HEIC because it doesn't know the format, so
// the MIME type alone can't be trusted — fall back to sniffing the ISO-BMFF brand.
const HEIC_BRANDS = ["heic", "heix", "heim", "heis", "hevc", "hevx", "mif1", "msf1"]

async function hasHeicSignature(file: File): Promise<boolean> {
  try {
    // Bytes 4..12 of an ISO base-media file are "ftyp" followed by the brand.
    const header = new Uint8Array(await file.slice(0, 12).arrayBuffer())
    if (header.length < 12) return false
    const tag = String.fromCharCode(...header.subarray(4, 8))
    if (tag !== "ftyp") return false
    const brand = String.fromCharCode(...header.subarray(8, 12)).toLowerCase()
    return HEIC_BRANDS.includes(brand)
  } catch {
    return false
  }
}

export async function isHeic(file: File): Promise<boolean> {
  if (file.type === "image/heic" || file.type === "image/heif") return true
  if (HEIC_EXTENSION.test(file.name)) return true
  return hasHeicSignature(file)
}

/** True when this browser can already render the file without any conversion. */
async function canBrowserDecode(file: File): Promise<boolean> {
  try {
    const bitmap = await createImageBitmap(file)
    bitmap.close()
    return true
  } catch {
    return false
  }
}

/**
 * Returns a file every browser can render, converting HEIC to JPEG when needed.
 * Anything else is passed straight through untouched.
 *
 * Throws if the file is HEIC and cannot be decoded, so callers can show a real error
 * rather than uploading something that will render broken everywhere.
 */
export async function toDisplayableImage(file: File): Promise<File> {
  if (!(await isHeic(file))) return file

  // Safari decodes HEIC natively, and some files are simply mislabelled. Checking first
  // skips a ~3MB download entirely for them.
  if (await canBrowserDecode(file)) return file

  // Imported lazily: this pulls in a libheif WASM build that would otherwise sit in the
  // main bundle for every visitor, when only HEIC uploads ever need it. The `/next`
  // entry inlines its worker, so decoding also stays off the main thread.
  const { heicTo } = await import("heic-to/next")

  const blob = await heicTo({ blob: file, type: "image/jpeg", quality: 0.92 })

  return new File([blob], file.name.replace(HEIC_EXTENSION, "") + ".jpg", {
    type: "image/jpeg",
    lastModified: file.lastModified,
  })
}
