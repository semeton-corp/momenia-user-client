import { http } from "../http"
import { getAuthHeader as authHeader } from "../auth-header"
import { InvitationDuration } from "./invitation-duration.types"

export const getInvitationDurations = async (): Promise<InvitationDuration[]> => {
    return http("/api/v1/invitation-template-durations?isActive=true", {
        headers: authHeader(),
    })
}
