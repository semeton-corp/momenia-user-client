"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  addFavouriteTemplate,
  getFavouriteTemplates,
  getInvitationTemplateById,
  getInvitationTemplates,
  removeFavouriteTemplate,
} from "@/lib/api/invitation-template/invitation-template.service"
import type { GetFavouritesParams, GetTemplatesParams } from "@/lib/api/invitation-template/invitation-template.types"

export const TEMPLATE_KEYS = {
  list: (params: GetTemplatesParams) => ["invitation-templates", "list", params] as const,
  detail: (id: string) => ["invitation-templates", "detail", id] as const,
  favourites: (params: GetFavouritesParams) => ["invitation-templates", "favourites", params] as const,
}

export function useInvitationTemplates(params: GetTemplatesParams = {}) {
  return useQuery({
    queryKey: TEMPLATE_KEYS.list(params),
    queryFn: () => getInvitationTemplates(params),
    staleTime: 1000 * 60 * 5,
  })
}

export function useInvitationTemplateDetail(id: string | null) {
  return useQuery({
    queryKey: TEMPLATE_KEYS.detail(id ?? ""),
    queryFn: () => getInvitationTemplateById(id!),
    enabled: id !== null,
    staleTime: 1000 * 60 * 5,
  })
}

export function useFavouriteTemplates(params: GetFavouritesParams = {}) {
  return useQuery({
    queryKey: TEMPLATE_KEYS.favourites(params),
    queryFn: () => getFavouriteTemplates(params),
    staleTime: 1000 * 60 * 5,
  })
}

export function useToggleFavourite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isFavourite }: { id: string; isFavourite: boolean }) =>
      isFavourite ? removeFavouriteTemplate(id) : addFavouriteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitation-templates"] })
    },
  })
}
