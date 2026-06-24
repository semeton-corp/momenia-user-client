"use client"

import { useQuery } from "@tanstack/react-query"
import { getUserInvitationOverview, getUserInvitations } from "@/lib/api/user-invitation/user-invitation.service"
import { GetUserInvitationsParams } from "@/lib/api/user-invitation/user-invitation.types"

export const useUserInvitationOverview = () => {
    return useQuery({
        queryKey: ["user-invitation-overview"],
        queryFn: getUserInvitationOverview,
    })
}

export const useUserInvitations = (params?: GetUserInvitationsParams) => {
    return useQuery({
        queryKey: ["user-invitations", params],
        queryFn: () => getUserInvitations(params),
    })
}
