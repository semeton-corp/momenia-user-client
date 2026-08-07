import { http } from "../http"
import { getAuthHeader as authHeader } from "../auth-header"
import type {
  ConfirmGuestInvitationRequest,
  ConfirmGuestInvitationResponse,
  CreateGuestInvitationRequest,
  CreateGuestInvitationResponse,
  GetGuestInvitationsParams,
  GuestInvitationInfo,
  GuestInvitationListResponse,
  UpdateGuestInvitationRequest,
  UpdateGuestInvitationResponse,
} from "./guest-invitation.types"

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val === undefined || val === "") continue
    q.set(key, String(val))
  }
  const s = q.toString()
  return s ? `?${s}` : ""
}

export async function getGuestInvitations(
  userInvitationId: string,
  params: GetGuestInvitationsParams = {},
): Promise<GuestInvitationListResponse> {
  const qs = buildQuery({
    guestInvitationCategoryId: params.guestInvitationCategoryId,
    keyword: params.keyword,
    pageSize: params.pageSize,
    cursor: params.cursor,
    sortField: params.sortField,
    sortOrder: params.sortOrder,
  })
  return http(`/api/v1/user-invitations/${userInvitationId}/guest-invitations${qs}`, { headers: authHeader() })
}

// Dua fungsi berikut dipakai tamu di halaman undangan publik — TANPA authHeader(),
// karena tamu tidak punya akun. Backend hanya butuh x-api-key dari http().
export async function getGuestInvitationById(id: string): Promise<GuestInvitationInfo> {
  return http(`/api/v1/guest-invitations/${id}`)
}

export async function confirmGuestInvitation(
  id: string,
  data: ConfirmGuestInvitationRequest,
): Promise<ConfirmGuestInvitationResponse> {
  return http(`/api/v1/guest-invitations/${id}/confirmation`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function createGuestInvitation(
  data: CreateGuestInvitationRequest,
): Promise<CreateGuestInvitationResponse> {
  return http("/api/v1/guest-invitations", {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  })
}

export async function updateGuestInvitation(
  id: string,
  data: UpdateGuestInvitationRequest,
): Promise<UpdateGuestInvitationResponse> {
  return http(`/api/v1/guest-invitations/${id}`, {
    method: "PUT",
    headers: authHeader(),
    body: JSON.stringify(data),
  })
}

export async function deleteGuestInvitations(ids: string[]): Promise<void> {
  return http("/api/v1/guest-invitations", {
    method: "DELETE",
    headers: authHeader(),
    body: JSON.stringify({ ids }),
  })
}
