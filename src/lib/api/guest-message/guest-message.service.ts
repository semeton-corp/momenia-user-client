import { http } from "../http"
import { getAuthHeader as authHeader } from "../auth-header"
import type {
  CreateGuestInvitationMessageRequest,
  GetGuestInvitationMessagesParams,
  GuestInvitationMessage,
  UpdateGuestInvitationMessageRequest,
} from "./guest-message.types"

function buildQuery(params: Record<string, string | boolean | undefined>): string {
  const q = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val === undefined || val === "") continue
    q.set(key, String(val))
  }
  const s = q.toString()
  return s ? `?${s}` : ""
}

export async function getGuestInvitationMessages(
  userInvitationId: string,
  params: GetGuestInvitationMessagesParams = {},
): Promise<GuestInvitationMessage[]> {
  const qs = buildQuery({ keyword: params.keyword, isMessageHidden: params.isMessageHidden })
  return http(`/api/v1/user-invitations/${userInvitationId}/guest-invitation-messages${qs}`, {
    headers: authHeader(),
  })
}

// Dipakai tamu (belum login) buat kirim ucapan lewat halaman undangan publik —
// belum dipasang di dashboard admin ini, disediakan untuk dipakai nanti.
export async function createGuestInvitationMessage(
  data: CreateGuestInvitationMessageRequest,
): Promise<GuestInvitationMessage> {
  return http("/api/v1/guest-invitation-messages", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateGuestInvitationMessage(
  id: string,
  data: UpdateGuestInvitationMessageRequest,
): Promise<GuestInvitationMessage> {
  return http(`/api/v1/guest-invitation-messages/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: authHeader(),
  })
}

export async function deleteGuestInvitationMessage(id: string): Promise<void> {
  return http(`/api/v1/guest-invitation-messages/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  })
}
