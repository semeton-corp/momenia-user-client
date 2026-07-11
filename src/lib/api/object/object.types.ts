export type ObjectCategory =
  | "landing-page"
  | "avatar"
  | "other"
  | "invitation-template"
  | "add-on"
  | "invitation-content"

export type ObjectMetadata = {
  originalName: string
  size: string
  uploadAt: string
}

export type CreatePresignedUploadRequest = {
  category: ObjectCategory
  contentType: string
  metadata: ObjectMetadata
}

export type PresignedUploadResponse = {
  presignedUrl: string
  key: string
  acl: string
  contentDisposition: string
  contentType: string
  metadata: ObjectMetadata
}
