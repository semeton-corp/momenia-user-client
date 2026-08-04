"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createGuestInvitationMessage,
  deleteGuestInvitationMessage,
  getGuestInvitationMessages,
  updateGuestInvitationMessage,
} from "@/lib/api/guest-message/guest-message.service"
import type {
  CreateGuestInvitationMessageRequest,
  GetGuestInvitationMessagesParams,
  UpdateGuestInvitationMessageRequest,
} from "@/lib/api/guest-message/guest-message.types"

export const useGuestInvitationMessages = (
  userInvitationId: string,
  params: GetGuestInvitationMessagesParams = {},
) => {
  return useQuery({
    queryKey: ["guest-invitation-messages", userInvitationId, params],
    queryFn: () => getGuestInvitationMessages(userInvitationId, params),
    enabled: !!userInvitationId,
  })
}

// Belum dipakai di dashboard admin — disediakan untuk form ucapan tamu publik nanti.
export const useCreateGuestInvitationMessage = () => {
  return useMutation({
    mutationFn: (data: CreateGuestInvitationMessageRequest) => createGuestInvitationMessage(data),
  })
}

export const useUpdateGuestInvitationMessage = (userInvitationId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGuestInvitationMessageRequest }) =>
      updateGuestInvitationMessage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guest-invitation-messages", userInvitationId] })
    },
  })
}

export const useDeleteGuestInvitationMessage = (userInvitationId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteGuestInvitationMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guest-invitation-messages", userInvitationId] })
    },
  })
}
