"use client"

import { useQuery } from "@tanstack/react-query"
import { getRsvpOverview, getRsvps } from "@/lib/api/rsvp/rsvp.service"
import type { GetRsvpsParams } from "@/lib/api/rsvp/rsvp.types"

export const useRsvpOverview = (userInvitationId: string) => {
  return useQuery({
    queryKey: ["rsvp-overview", userInvitationId],
    queryFn: () => getRsvpOverview(userInvitationId),
    enabled: !!userInvitationId,
  })
}

export const useRsvps = (userInvitationId: string, params: GetRsvpsParams = {}) => {
  return useQuery({
    queryKey: ["rsvps", userInvitationId, params],
    queryFn: () => getRsvps(userInvitationId, params),
    enabled: !!userInvitationId,
  })
}
