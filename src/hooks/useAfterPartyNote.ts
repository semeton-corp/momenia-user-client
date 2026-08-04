"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getAfterPartyNote, updateAfterPartyNote } from "@/lib/api/after-party-note/after-party-note.service"
import type { UpdateAfterPartyNoteRequest } from "@/lib/api/after-party-note/after-party-note.types"

export const useAfterPartyNote = (userInvitationId: string) => {
  return useQuery({
    queryKey: ["after-party-note", userInvitationId],
    queryFn: () => getAfterPartyNote(userInvitationId),
    enabled: !!userInvitationId,
  })
}

export const useUpdateAfterPartyNote = (userInvitationId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateAfterPartyNoteRequest) => updateAfterPartyNote(userInvitationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["after-party-note", userInvitationId] })
    },
  })
}
