export type UserInvitationOverview = {
    totalInvitation: number
    totalPublishedInvitation: number
    totalExpiredInvitation: number
    totalDraftInvitation: number
}

export type UserInvitation = {
    id: string
    pathUrl: string
    status: "published" | "draft" | "expired"
    name: string
    invitationTemplateThumbnail: string
    invitationTemplateCategory: string
    lastUpdatedAt: string
    eventDate: string
    totalGuest?: number
    totalRsvp?: number
}

export type GetUserInvitationsParams = {
    statuses?: string[]
    keyword?: string
}

export type UserInvitationDashboard = {
    id: string
    name: string
    pathUrl: string
    status: "published" | "draft" | "expired"
    eventDate: string
    invitationTemplateThumbnail: string
    invitationTemplateCategory: string
    planName: string
    activeUntil: string
    totalGuest: number
    totalRsvp: number
    attendingCount: number
    declinedCount: number
    pendingCount: number
    messageTemplate: string
}
