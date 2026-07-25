"use client"

import { useState, useRef, useCallback } from "react"
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { X, Check } from "lucide-react"

type AspectOption = { label: string; value: number | undefined }

const ASPECT_OPTIONS: AspectOption[] = [
  { label: "Free", value: undefined },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
  { label: "9:16", value: 9 / 16 },
]

function centeredCrop(width: number, height: number, aspect: number | undefined): Crop {
  if (!aspect) {
    return { unit: "%", x: 10, y: 10, width: 80, height: 80 }
  }
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 80 }, aspect, width, height),
    width,
    height
  )
}

// Cap the output at this on the longer side — plenty for a phone-screen invitation,
// and it keeps the canvas encode + upload + iframe download fast even for 12MP camera photos.
const MAX_OUTPUT_DIMENSION = 1600

async function getCroppedBlob(image: HTMLImageElement, crop: Crop): Promise<Blob> {
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  const cropX = (crop.unit === "%" ? (crop.x / 100) * image.width : crop.x) * scaleX
  const cropY = (crop.unit === "%" ? (crop.y / 100) * image.height : crop.y) * scaleY
  const cropWidth = (crop.unit === "%" ? (crop.width / 100) * image.width : crop.width) * scaleX
  const cropHeight = (crop.unit === "%" ? (crop.height / 100) * image.height : crop.height) * scaleY

  // Downscale during the draw itself — drawing straight from the full-res source into a
  // smaller canvas is far cheaper than encoding at full size and shrinking afterwards.
  const scale = Math.min(1, MAX_OUTPUT_DIMENSION / Math.max(cropWidth, cropHeight))
  const outputWidth = Math.round(cropWidth * scale)
  const outputHeight = Math.round(cropHeight * scale)

  const canvas = document.createElement("canvas")
  canvas.width = outputWidth
  canvas.height = outputHeight
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Failed to get canvas context")

  ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, outputWidth, outputHeight)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error("Failed to crop image"))
    }, "image/jpeg", 0.85)
  })
}

export function ImageCropModal({
  imageSrc,
  fileName,
  onCancel,
  onConfirm,
}: {
  imageSrc: string
  fileName: string
  onCancel: () => void
  onConfirm: (file: File) => void
}) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [aspect, setAspect] = useState<number | undefined>(undefined)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const [isProcessing, setIsProcessing] = useState(false)

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const initial = centeredCrop(width, height, aspect)
    setCrop(initial)
    setCompletedCrop(initial)
  }, [aspect])

  const handleAspectChange = (value: number | undefined) => {
    setAspect(value)
    if (imgRef.current) {
      const { width, height } = imgRef.current
      const next = centeredCrop(width, height, value)
      setCrop(next)
      setCompletedCrop(next)
    }
  }

  const handleConfirm = async () => {
    if (!imgRef.current || !completedCrop) return
    setIsProcessing(true)
    try {
      const blob = await getCroppedBlob(imgRef.current, completedCrop)
      const compressed = await compressImage(blob, fileName)
      onConfirm(compressed)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-900">Crop Image</h2>
          <button onClick={onCancel} aria-label="Close" className="text-zinc-400 hover:text-zinc-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3">
          {ASPECT_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => handleAspectChange(opt.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                aspect === opt.value
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto bg-zinc-900 p-4">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            className="mx-auto"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={imgRef} src={imageSrc} alt="" onLoad={onImageLoad} className="max-h-[60vh] w-auto" />
          </ReactCrop>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing || !completedCrop}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isProcessing ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

const MAX_SIZE_BYTES = 1024 * 1024 // 1MB

async function compressImage(blob: Blob, fileName: string): Promise<File> {
  const imageCompression = (await import("browser-image-compression")).default
  const file = new File([blob], fileName.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" })

  if (file.size <= MAX_SIZE_BYTES) return file

  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: MAX_OUTPUT_DIMENSION,
    useWebWorker: true,
    initialQuality: 0.85,
  })

  return new File([compressed], file.name, { type: compressed.type })
}
