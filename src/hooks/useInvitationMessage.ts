"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getInvitationMessage, updateInvitationMessage } from "@/lib/api/invitation-message/invitation-message.service"
import type { UpdateInvitationMessageRequest } from "@/lib/api/invitation-message/invitation-message.types"

export const useInvitationMessage = (userInvitationId: string) => {
  return useQuery({
    queryKey: ["invitation-message", userInvitationId],
    queryFn: () => getInvitationMessage(userInvitationId),
    enabled: !!userInvitationId,
  })
}

export const useUpdateInvitationMessage = (userInvitationId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateInvitationMessageRequest) => updateInvitationMessage(userInvitationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitation-message", userInvitationId] })
    },
  })
}
