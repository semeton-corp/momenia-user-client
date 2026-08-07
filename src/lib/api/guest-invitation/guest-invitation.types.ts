import type { RsvpStatus } from "../rsvp/rsvp.types"

export type GuestInvitation = {
  id: string
  name: string
  whatsAppNumber: string
  email: string
  guestInvitationCategoryId: string
  guestInvitationCategory: string
  isInvitationSent: boolean
}

// GET /api/v1/guest-invitations/:id — publik, dipakai halaman undangan buat
// menyapa tamu dengan namanya. Sengaja cuma {id, name}: endpoint ini terbuka
// tanpa login, jadi backend tidak mengembalikan kontak tamu.
export type GuestInvitationInfo = {
  id: string
  name: string
}

// PATCH /api/v1/guest-invitations/:id/confirmation — publik juga (tamu tidak punya akun).
export type ConfirmGuestInvitationRequest = {
  totalAttendee: number
  status: Extract<RsvpStatus, "present" | "absent">
}

export type ConfirmGuestInvitationResponse = {
  id: string
  name: string
  status: RsvpStatus
  totalAttendee: number
}

export type GuestInvitationListResponse = {
  nextCursor: string
  totalData: number
  totalPage: number
  data: GuestInvitation[]
}

export type GetGuestInvitationsParams = {
  guestInvitationCategoryId?: string
  keyword?: string
  pageSize?: number
  cursor?: string
  sortField?: "name"
  sortOrder?: "asc" | "desc"
}

export type CreateGuestInvitationRequest = {
  name: string
  whatsAppNumber: string
  email: string
  guestInvitationCategoryId: string
  userInvitationId: string
}

export type CreateGuestInvitationResponse = {
  id: string
  name: string
  whatsAppNumber: string
  email: string
  guestInvitationCategoryId: string
  isInvitationSent: boolean
}

export type UpdateGuestInvitationRequest = {
  name: string
  whatsAppNumber: string
  email: string
  guestInvitationCategoryId: string
  isInvitationSent: boolean
}

export type UpdateGuestInvitationResponse = {
  id: string
  name: string
  whatsAppNumber: string
  email: string
  guestInvitationCategoryId: string
  isInvitationSent: boolean
}
