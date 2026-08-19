// Invitation content is deliberately absent here: it has its own endpoint
// (POST /api/v1/objects/user-invitation-contents) that scopes the object to an
// invitation via userInvitationId instead of a free-form category.
export type ObjectCategory =
  | "landing-page"
  | "avatar"
  | "other"
  | "invitation-template"
  | "add-on"

export type ObjectMetadata = {
  originalName: string
  size: string
  uploadAt: string
}

export type PresignedUploadRequest = {
  category: ObjectCategory
  contentType: string
  metadata: ObjectMetadata
}

// Mirrors POST /api/v1/objects/user-invitation-contents. Takes the owning invitation
// instead of a category, so the backend files the object under that invitation's prefix
// (.../user-invitation-content/<userInvitationId>/uicc_<uuid>).
export type PresignedUserInvitationContentUploadRequest = {
  userInvitationId: string
  contentType: string
  metadata: ObjectMetadata
}

export type PresignedUploadResponse = {
  presignedUrl: string
  key: string
  // Only the user-invitation-contents endpoint returns this; the generic /api/v1/objects
  // one omits it, so the permanent url falls back to being derived from `presignedUrl`
  // (see publicUrlFrom in object-storage.service).
  publicUrl?: string
  acl: string
  contentDisposition: string
  contentType: string
  metadata: ObjectMetadata
}
