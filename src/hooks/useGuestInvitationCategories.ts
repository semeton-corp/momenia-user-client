"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createGuestInvitationCategory,
  deleteGuestInvitationCategory,
  getGuestInvitationCategories,
  updateGuestInvitationCategory,
} from "@/lib/api/guest-invitation-category/guest-invitation-category.service"
import type {
  CreateGuestInvitationCategoryRequest,
  UpdateGuestInvitationCategoryRequest,
} from "@/lib/api/guest-invitation-category/guest-invitation-category.types"

export const useGuestInvitationCategories = (userInvitationId: string) => {
  return useQuery({
    queryKey: ["guest-invitation-categories", userInvitationId],
    queryFn: () => getGuestInvitationCategories(userInvitationId),
    enabled: !!userInvitationId,
  })
}

export const useCreateGuestInvitationCategory = (userInvitationId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateGuestInvitationCategoryRequest) => createGuestInvitationCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guest-invitation-categories", userInvitationId] })
    },
  })
}

export const useUpdateGuestInvitationCategory = (userInvitationId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGuestInvitationCategoryRequest }) =>
      updateGuestInvitationCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guest-invitation-categories", userInvitationId] })
      queryClient.invalidateQueries({ queryKey: ["guest-invitations", userInvitationId] })
    },
  })
}

export const useDeleteGuestInvitationCategory = (userInvitationId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteGuestInvitationCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guest-invitation-categories", userInvitationId] })
      queryClient.invalidateQueries({ queryKey: ["guest-invitations", userInvitationId] })
    },
  })
}
