export type ObjectCategory =
  | "landing-page"
  | "avatar"
  | "other"
  | "invitation-template"
  | "add-on"
  | "invitation-content"

export type PresignedUploadRequest = {
  category: ObjectCategory
  contentType: string
  metadata: {
    originalName: string
    size: string
    uploadAt: string
  }
}

export type PresignedUploadResponse = {
  presignedUrl: string
  key: string
  publicUrl: string
  acl: string
  contentDisposition: string
  contentType: string
  metadata: {
    originalName: string
    size: string
    uploadAt: string
  }
}
