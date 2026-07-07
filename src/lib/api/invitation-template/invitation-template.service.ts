import { http } from "../http"
import { getAuthHeader as authHeader } from "../auth-header"
import type {
  GetFavouritesParams,
  GetTemplatesParams,
  InvitationTemplateCategory,
  InvitationTemplateTag,
  TemplateDetailResponse,
  TemplatesListResponse,
} from "./invitation-template.types"

const BASE = "/api/v1/main-app/invitation-templates"
const BASE_FAV = "/api/v1/invitation-templates"

function buildQuery(params: Record<string, string | number | string[] | undefined>): string {
  const q = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val === undefined || val === "") continue
    if (Array.isArray(val)) val.forEach((v) => q.append(key, v))
    else q.set(key, String(val))
  }
  const s = q.toString()
  return s ? `?${s}` : ""
}

export async function getInvitationTemplates(params: GetTemplatesParams = {}): Promise<TemplatesListResponse> {
  const qs = buildQuery({
    sortOrder: params.sortOrder ?? "asc",
    sortField: params.sortField ?? "createdAt",
    keyword: params.keyword,
    pageSize: params.pageSize,
    categoryId: params.categoryId,
    tagsIds: params.tagsIds?.map(String),
    cursor: params.cursor,
  })
  return http(`${BASE}${qs}`, { headers: authHeader() })
}

export async function getInvitationTemplateById(id: string): Promise<TemplateDetailResponse> {
  return http(`${BASE}/${id}`, { headers: authHeader() })
}

export async function getInvitationTemplateTags(keyword?: string): Promise<InvitationTemplateTag[]> {
  const qs = buildQuery({ keyword })
  return http(`${BASE_FAV}/tags${qs}`, { headers: authHeader() })
}

export async function getInvitationTemplateCategories(keyword?: string): Promise<InvitationTemplateCategory[]> {
  const qs = buildQuery({ keyword })
  return http(`${BASE_FAV}/categories${qs}`, { headers: authHeader() })
}

export async function addFavouriteTemplate(id: string): Promise<void> {
  return http(`${BASE_FAV}/favourite/${id}`, { method: "PATCH", headers: authHeader() })
}

export async function removeFavouriteTemplate(id: string): Promise<void> {
  return http(`${BASE_FAV}/unfavourite/${id}`, { method: "DELETE", headers: authHeader() })
}

export async function getFavouriteTemplates(params: GetFavouritesParams = {}): Promise<TemplatesListResponse> {
  const qs = buildQuery({
    pageSize: params.pageSize,
    sortOrder: params.sortOrder,
    cursor: params.cursor,
    keyword: params.keyword,
  })
  return http(`${BASE_FAV}/favourites${qs}`, { headers: authHeader() })
}
