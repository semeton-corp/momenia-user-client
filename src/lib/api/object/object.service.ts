import { http } from "../http"
import { getAuthHeader as authHeader } from "../auth-header"
import type { CreatePresignedUploadRequest, PresignedUploadResponse } from "./object.types"

export async function createPresignedUpload(data: CreatePresignedUploadRequest): Promise<PresignedUploadResponse> {
  return http("/api/v1/objects", {
    method: "POST",
    body: JSON.stringify(data),
    headers: authHeader(),
  })
}

// Upload langsung ke S3 pakai presigned URL — SENGAJA tidak lewat http():
// - ini URL pihak ketiga; header tambahan dari http() (Authorization/
//   X-Idempotency-Key) akan merusak signature AWS (403 SignatureDoesNotMatch)
//   karena presigned URL cuma menerima header yang persis ada di X-Amz-SignedHeaders
// - body-nya file mentah (biner), bukan JSON, dan response-nya kosong (bukan JSON)
export async function uploadFileToPresignedUrl(file: File, upload: PresignedUploadResponse): Promise<void> {
  const res = await fetch(upload.presignedUrl, {
    method: "PUT",
    headers: {
      "x-amz-acl": upload.acl,
      "content-disposition": upload.contentDisposition,
      "content-type": upload.contentType,
      "x-amz-meta-originalname": upload.metadata.originalName,
      "x-amz-meta-size": upload.metadata.size,
      "x-amz-meta-uploadat": upload.metadata.uploadAt,
    },
    body: file,
  })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || "Upload failed")
  }
}

const OBJECT_PUBLIC_BASE = "https://is3.cloudhost.id/momenia"

// Backend menyimpan & mengembalikan objek sebagai key mentah (mis. "avatar/ava_xxx"),
// bukan URL — untuk ditampilkan, key diubah ke URL publik bucket. Nilai yang sudah
// berupa URL penuh (mis. foto Google dari OAuth) dilewatkan apa adanya.
export function resolveObjectUrl(value: string): string {
  if (!value || value.startsWith("http://") || value.startsWith("https://")) return value
  return `${OBJECT_PUBLIC_BASE}/${value}`
}

// Kebalikan resolveObjectUrl — backend mengharapkan key mentah, jadi URL bucket
// yang sudah dinormalisasi FE dikembalikan ke bentuk key sebelum dikirim.
// URL eksternal (mis. foto Google) dilewatkan apa adanya.
export function toObjectKey(value: string): string {
  return value.startsWith(`${OBJECT_PUBLIC_BASE}/`) ? value.slice(OBJECT_PUBLIC_BASE.length + 1) : value
}
