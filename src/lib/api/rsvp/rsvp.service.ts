import { http } from "../http"
import { getAuthHeader as authHeader } from "../auth-header"
import type { GetRsvpsParams, RsvpListResponse, RsvpOverview } from "./rsvp.types"

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val === undefined || val === "") continue
    q.set(key, String(val))
  }
  const s = q.toString()
  return s ? `?${s}` : ""
}

export async function getRsvpOverview(userInvitationId: string): Promise<RsvpOverview> {
  return http(`/api/v1/user-invitations/${userInvitationId}/rsvps/overview`, { headers: authHeader() })
}

export async function getRsvps(userInvitationId: string, params: GetRsvpsParams = {}): Promise<RsvpListResponse> {
  const qs = buildQuery({
    pageSize: params.pageSize,
    cursor: params.cursor,
    keyword: params.keyword,
    guestInvitationCategoryId: params.guestInvitationCategoryId,
    status: params.status,
    sortOrder: params.sortOrder,
    sortField: params.sortField,
  })
  return http(`/api/v1/user-invitations/${userInvitationId}/rsvps${qs}`, { headers: authHeader() })
}
