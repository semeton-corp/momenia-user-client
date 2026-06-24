import { http } from "../http"
import { InvitationDuration } from "./invitation-duration.types"

function authHeader(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    return token ? { Authorization: `Bearer ${token}` } : {}
}

export const getInvitationDurations = async (): Promise<InvitationDuration[]> => {
    return http("/api/v1/invitation-template-durations?isActive=true", {
        headers: authHeader(),
    })
}
