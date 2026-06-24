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
