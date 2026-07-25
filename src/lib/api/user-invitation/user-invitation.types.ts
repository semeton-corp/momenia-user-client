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

export type UpdateUserInvitationRequest = {
    name: string
    slug: string
    fieldValues: Record<string, string>
    status: string
    template: UserInvitationDetail["template"]
}

export type UserInvitationDetail = {
    id: string
    name: string
    eventDate: string
    pathUrl: string
    status: "published" | "draft" | "expired"
    invitationDurationPackage: string
    address: string
    googleMapsUrl: string
    expiredAt: string
    lastUpdatedAt: string
    fieldValues: Record<string, string>
    guestStatistic: {
        totalAttending: number
        totalNotAttending: number
        totalNotResponded: number
    }
    template: {
        pages: Array<{
            id: string
            label: string
            sections: Array<{ id: string; section_type_id: string }>
        }>
        schema: {
            fields: Array<{
                key: string
                type: string
                label: string
                section: string
                required: boolean
                placeholder?: string
            }>
        }
        sectionTypes: Record<string, {
            id: string
            js: string
            css: string
            html: string
            schema: { slots: string[]; styles: unknown[] }
        }>
        theme_defaults: {
            font_body: string
            font_title: string
            color_accent: string
            color_primary: string
            color_background: string
            backgroundImage?: string
        }
    }
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
