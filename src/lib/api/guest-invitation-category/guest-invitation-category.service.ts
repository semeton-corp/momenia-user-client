import { http } from "../http"
import { getAuthHeader as authHeader } from "../auth-header"
import type {
  CreateGuestInvitationCategoryRequest,
  GuestInvitationCategory,
  UpdateGuestInvitationCategoryRequest,
} from "./guest-invitation-category.types"

export async function getGuestInvitationCategories(userInvitationId: string): Promise<GuestInvitationCategory[]> {
  return http(`/api/v1/user-invitations/${userInvitationId}/guest-invitation-categories`, { headers: authHeader() })
}

export async function createGuestInvitationCategory(
  data: CreateGuestInvitationCategoryRequest,
): Promise<GuestInvitationCategory> {
  return http("/api/v1/guest-invitation-categories", {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  })
}

export async function updateGuestInvitationCategory(
  id: string,
  data: UpdateGuestInvitationCategoryRequest,
): Promise<GuestInvitationCategory> {
  return http(`/api/v1/guest-invitation-categories/${id}`, {
    method: "PUT",
    headers: authHeader(),
    body: JSON.stringify(data),
  })
}

export async function deleteGuestInvitationCategory(id: string): Promise<void> {
  return http(`/api/v1/guest-invitation-categories/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  })
}
