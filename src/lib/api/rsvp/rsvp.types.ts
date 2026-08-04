export type RsvpStatus = "present" | "absent" | "not-confirmed"

export type RsvpOverview = {
  totalGuest: number
  estimatedTotalGuest: number
  totalGuestPresent: number
  totalGuestAbsent: number
  totalGuestNotConfirmed: number
}

export type RsvpListItem = {
  id: string
  name: string
  whatsAppNumber: string
  email: string
  guestInvitationCategoryId: string
  guestInvitationCategory: string
  status: RsvpStatus
  totalAttendee: number
}

export type RsvpListResponse = {
  nextCursor: string
  totalData: number
  totalPage: number
  data: RsvpListItem[]
}

export type GetRsvpsParams = {
  pageSize?: number
  cursor?: string
  keyword?: string
  guestInvitationCategoryId?: string
  status?: RsvpStatus
  sortOrder?: "asc" | "desc"
  sortField?: "name"
}
