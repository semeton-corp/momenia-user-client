// Owner's view (dashboard): every message, including hidden ones, with the ids and
// flags needed to moderate them.
export type GuestInvitationMessage = {
  id: string
  guestInvitationId: string
  name: string
  message: string
  voiceNote: string
  isMessageHidden: boolean
  messageAt: string
}

// Guest's view (public invitation page). Deliberately narrower: no ids and no
// isMessageHidden, because moderation is applied server-side — a guest is only ever
// sent messages that are already meant to be visible.
export type PublicGuestInvitationMessage = {
  name: string
  message: string
  voiceNote: string
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
