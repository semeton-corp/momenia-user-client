export type GuestInvitationMessage = {
  id: string
  guestInvitationId: string
  name: string
  message: string
  voiceNote: string
  isMessageHidden: boolean
  messageAt: string
}

export type CreateGuestInvitationMessageRequest = {
  guestInvitationId: string
  message: string
}

export type UpdateGuestInvitationMessageRequest = {
  isMessageHidden: boolean
}

export type GetGuestInvitationMessagesParams = {
  keyword?: string
  isMessageHidden?: boolean
}
