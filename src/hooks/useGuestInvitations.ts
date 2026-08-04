"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createGuestInvitation,
  deleteGuestInvitations,
  getGuestInvitations,
  updateGuestInvitation,
} from "@/lib/api/guest-invitation/guest-invitation.service"
import type {
  CreateGuestInvitationRequest,
  GetGuestInvitationsParams,
  UpdateGuestInvitationRequest,
} from "@/lib/api/guest-invitation/guest-invitation.types"

export const useGuestInvitations = (userInvitationId: string, params: GetGuestInvitationsParams = {}) => {
  return useQuery({
    queryKey: ["guest-invitations", userInvitationId, params],
    queryFn: () => getGuestInvitations(userInvitationId, params),
    enabled: !!userInvitationId,
  })
}

export const useCreateGuestInvitation = (userInvitationId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateGuestInvitationRequest) => createGuestInvitation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guest-invitations", userInvitationId] })
    },
  })
}

export const useUpdateGuestInvitation = (userInvitationId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGuestInvitationRequest }) =>
      updateGuestInvitation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guest-invitations", userInvitationId] })
    },
  })
}

export const useDeleteGuestInvitations = (userInvitationId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => deleteGuestInvitations(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guest-invitations", userInvitationId] })
    },
  })
}
