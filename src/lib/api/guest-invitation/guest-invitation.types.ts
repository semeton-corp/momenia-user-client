export type GuestInvitation = {
  id: string
  name: string
  whatsAppNumber: string
  email: string
  guestInvitationCategoryId: string
  guestInvitationCategory: string
  isInvitationSent: boolean
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
