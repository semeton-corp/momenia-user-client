export type UserInvitationOverview = {
    totalInvitation: number
    totalPublishedInvitation: number
    totalExpiredInvitation: number
    totalDraftInvitation: number
}

export type UserInvitation = {
    id: string
    slug: string
    status: "published" | "draft" | "expired"
    name: string
    category: {
        id: number
        name: string
    }
    lastUpdatedAt: string
    expiredAt: string
    totalGuest?: number
    totalRSVP?: number
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
    // Derived from the event_date / event_time schema fields on save — the API keeps the
    // event as one top-level timestamp while the editor collects it as two fields.
    // Omitted entirely when there's no date yet, rather than sent empty.
    eventTime?: string
}

export type UserInvitationDetail = {
    id: string
    name: string
    slug: string
    status: "published" | "draft" | "expired"
    invitationDurationPackage: string
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
                // Only meaningful when type === "select" — the choices the editor
                // renders in the dropdown.
                options?: string[]
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
        }
    }
}

export type InvitationTemplate = UserInvitationDetail["template"]

// GET /api/v1/user-invitations/content/:path_url — versi publik yang dipakai
// halaman undangan (/invitation/[slug]). Endpoint ini TIDAK butuh bearer token,
// cuma x-api-key, dan hanya mengembalikan yang perlu untuk merender undangan.
export type UserInvitationContent = {
    id: string
    pathUrl: string
    fieldValues: Record<string, string>
    template: InvitationTemplate
    // Guests have no session (public endpoint, no Bearer token), so they can't resolve
    // fieldValues.background_music_id against GET /musics/:id themselves — the backend
    // needs to embed the resolved track here instead. Optional/absent until that ships;
    // buildInvitationHtml() simply plays no music when it's missing.
    music?: { id: string; title: string; artist: string; musicUrl: string } | null
}

// Endpoint-nya bernama ".../path-url", tapi backend-nya sendiri memvalidasi
// body dengan field "slug" (bukan "pathUrl" seperti di contoh dokumentasi Postman).
export type CheckPathUrlRequest = {
    slug: string
}

export type CheckPathUrlResponse = {
    isAvailable: boolean
}
