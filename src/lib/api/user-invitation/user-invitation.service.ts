import { http } from "../http"
import { GetUserInvitationsParams, UserInvitation, UserInvitationOverview } from "./user-invitation.types"

function authHeader(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    return token ? { Authorization: `Bearer ${token}` } : {}
}

export const getUserInvitationOverview = async (): Promise<UserInvitationOverview> => {
    return http("/api/v1/user-invitations/overview", { headers: authHeader() })
}

export const getUserInvitations = async (params?: GetUserInvitationsParams): Promise<UserInvitation[]> => {
    const q = new URLSearchParams()
    if (params?.statuses?.length) {
        params.statuses.forEach((s) => q.append("statuses", s))
    }
    if (params?.keyword) q.set("keyword", params.keyword)
    const qs = q.toString()
    return http(`/api/v1/user-invitations${qs ? `?${qs}` : ""}`, { headers: authHeader() })
}
