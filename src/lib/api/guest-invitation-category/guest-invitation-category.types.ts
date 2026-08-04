export type GuestInvitationCategory = {
  id: string
  name: string
}

export type CreateGuestInvitationCategoryRequest = {
  name: string
  userInvitationId: string
}

export type UpdateGuestInvitationCategoryRequest = {
  name: string
}
