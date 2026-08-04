export type ObjectCategory =
  | "landing-page"
  | "avatar"
  | "other"
  | "invitation-template"
  | "add-on"
  | "user-invitation-content"

export type PresignedUploadRequest = {
  category: ObjectCategory
  contentType: string
  metadata: {
    originalName: string
    size: string
    uploadAt: string
  }
}

// Mirrors POST /api/v1/objects. Note there is no `publicUrl` — the permanent url has
// to be derived from `presignedUrl` (see publicUrlFrom in object-storage.service).
export type PresignedUploadResponse = {
  presignedUrl: string
  key: string
  acl: string
  contentDisposition: string
  contentType: string
  metadata: {
    originalName: string
    size: string
    uploadAt: string
  }
}
