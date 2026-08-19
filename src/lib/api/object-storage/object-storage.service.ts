import { http } from "../http"
import {
  ObjectCategory,
  PresignedUploadRequest,
  PresignedUploadResponse,
  PresignedUserInvitationContentUploadRequest,
} from "./object-storage.types"

function authHeader(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Step 1 — ask the API for a presigned PUT url.
// (http() auto-injects a valid X-Idempotency-Key for POST requests.)
export const getPresignedUploadUrl = async (
  data: PresignedUploadRequest
): Promise<PresignedUploadResponse> => {
  return http("/api/v1/objects", {
    method: "POST",
    body: JSON.stringify(data),
    headers: authHeader(),
  })
}

// Same handshake, but the dedicated endpoint for photos belonging to one invitation.
export const getPresignedUserInvitationContentUploadUrl = async (
  data: PresignedUserInvitationContentUploadRequest
): Promise<PresignedUploadResponse> => {
  return http("/api/v1/objects/user-invitation-contents", {
    method: "POST",
    body: JSON.stringify(data),
    headers: authHeader(),
  })
}

// Step 2 — PUT the raw file bytes to the presigned url (direct to storage, no api-key).
// The presigned url signs a specific set of headers (X-Amz-SignedHeaders); every
// one of them must be present with the exact same value or S3 rejects the signature.
async function putToPresignedUrl(presigned: PresignedUploadResponse, file: File): Promise<void> {
  const res = await fetch(presigned.presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": presigned.contentType,
      "Content-Disposition": presigned.contentDisposition,
      "x-amz-acl": presigned.acl,
      "x-amz-meta-originalname": presigned.metadata.originalName,
      "x-amz-meta-size": presigned.metadata.size,
      "x-amz-meta-uploadat": presigned.metadata.uploadAt,
    },
  })
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status})`)
  }
}

// Prefer the url the API states outright. Where it doesn't return one, objects are
// uploaded `public-read`, so the permanent url is the presigned url minus its signature
// query string. Deriving it that way keeps the bucket right across environments (staging
// uploads to `.../temp/...`, production to `.../momenia/...`) instead of hardcoding one.
function publicUrlFrom(presigned: PresignedUploadResponse): string {
  return presigned.publicUrl || presigned.presignedUrl.split("?")[0]
}

function metadataFor(file: File) {
  return {
    originalName: file.name,
    size: String(file.size),
    uploadAt: new Date().toISOString(),
  }
}

// Orchestrator — returns the permanent object URL to store in fieldValues.
export const uploadImage = async (file: File, category: ObjectCategory): Promise<string> => {
  const presigned = await getPresignedUploadUrl({
    category,
    contentType: file.type || "image/jpeg",
    metadata: metadataFor(file),
  })

  // Only reached if the PUT succeeded — putToPresignedUrl throws on a non-2xx, so a
  // failed upload never returns a url that would get saved onto the invitation.
  await putToPresignedUrl(presigned, file)

  return publicUrlFrom(presigned)
}

// Photos edited into one invitation (cover, couple portraits, desktop wallpaper, …).
export const uploadUserInvitationContent = async (
  file: File,
  userInvitationId: string
): Promise<string> => {
  const presigned = await getPresignedUserInvitationContentUploadUrl({
    userInvitationId,
    contentType: file.type || "image/jpeg",
    metadata: metadataFor(file),
  })

  await putToPresignedUrl(presigned, file)

  return publicUrlFrom(presigned)
}
