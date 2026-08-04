import { http } from "../http"
import { getAuthHeader as authHeader } from "../auth-header"
import type { InvitationMessage, UpdateInvitationMessageRequest } from "./invitation-message.types"

export async function getInvitationMessage(userInvitationId: string): Promise<InvitationMessage> {
  return http(`/api/v1/user-invitations/${userInvitationId}/invitation-message`, { headers: authHeader() })
}

export async function updateInvitationMessage(
  userInvitationId: string,
  data: UpdateInvitationMessageRequest,
): Promise<InvitationMessage> {
  return http(`/api/v1/user-invitations/${userInvitationId}/invitation-message`, {
    method: "PUT",
    headers: authHeader(),
    body: JSON.stringify(data),
  })
}
