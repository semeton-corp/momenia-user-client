import { http } from "../http"
import { getAuthHeader as authHeader } from "../auth-header"
import type { AfterPartyNote, UpdateAfterPartyNoteRequest } from "./after-party-note.types"

export async function getAfterPartyNote(userInvitationId: string): Promise<AfterPartyNote> {
  return http(`/api/v1/user-invitations/${userInvitationId}/after-party-note`, { headers: authHeader() })
}

export async function updateAfterPartyNote(
  userInvitationId: string,
  data: UpdateAfterPartyNoteRequest,
): Promise<AfterPartyNote> {
  return http(`/api/v1/user-invitations/${userInvitationId}/after-party-note`, {
    method: "PUT",
    headers: authHeader(),
    body: JSON.stringify(data),
  })
}
