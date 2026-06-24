export type GuestCategory = "vip" | "regular"

export type AttendanceStatus = "attending" | "declined" | "pending"

export type AddOnStatus = "active" | "locked"

export type InvitationCountdown = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export type InvitationStats = {
  totalGuests: number
  attending: number
  declined: number
  pending: number
  estimatedGuests: number
}

export type InvitationLink = {
  prefix: string
  slug: string
  suffix: string
}

export type InvitationWorkspaceGuest = {
  id: string
  name: string
  whatsApp: string
  email: string
  category: GuestCategory
  attendance: AttendanceStatus
  guestCount: number
  delivered: boolean
}

export type GuestMessage = {
  id: string
  senderName: string
  category: GuestCategory
  submittedAt: string
  content: string
  hidden: boolean
  voiceNoteDuration?: string
}

export type AfterPartyNote = {
  galleryUrl: string
  souvenirLabel: string
  message: string
}

export type InvitationAddOn = {
  id: string
  title: string
  subtitle: string
  description: string
  price: number
  status: AddOnStatus
  accent: "instagram" | "language" | "gallery"
  ctaLabel: string
  secondaryLabel?: string
}

export type InvitationWorkspaceData = {
  id: string
  title: string
  eventDateLabel: string
  previewImage: string
  planName: string
  activeUntilLabel: string
  countdown: InvitationCountdown
  stats: InvitationStats
  invitationLink: InvitationLink
  messageTemplate: string
  guests: InvitationWorkspaceGuest[]
  messages: GuestMessage[]
  afterPartyNote: AfterPartyNote
  addOns: InvitationAddOn[]
}
