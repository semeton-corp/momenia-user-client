import { http } from "../http"
import { getAuthHeader as authHeader } from "../auth-header"
import { GetUserInvitationsParams, UserInvitation, UserInvitationDashboard, UserInvitationDetail, UserInvitationOverview } from "./user-invitation.types"

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

export const getUserInvitationDashboard = async (id: string): Promise<UserInvitationDashboard> => {
    return http(`/api/v1/user-invitations/dashboard/${id}`, { headers: authHeader() })
}

export const getUserInvitationDetail = async (id: string): Promise<UserInvitationDetail> => {
    return http(`/api/v1/user-invitations/dashboard/${id}`, { headers: authHeader() })
}
