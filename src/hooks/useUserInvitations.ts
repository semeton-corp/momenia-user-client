"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getUserInvitationDashboard, getUserInvitationDetail, getUserInvitationOverview, getUserInvitations, updateUserInvitation } from "@/lib/api/user-invitation/user-invitation.service"
import { GetUserInvitationsParams, UpdateUserInvitationRequest } from "@/lib/api/user-invitation/user-invitation.types"

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

export const useUserInvitationDashboard = (id: string) => {
    return useQuery({
        queryKey: ["user-invitation-dashboard", id],
        queryFn: () => getUserInvitationDashboard(id),
        enabled: !!id,
    })
}

export const useUserInvitationDetail = (id: string) => {
    return useQuery({
        queryKey: ["user-invitation-detail", id],
        queryFn: () => getUserInvitationDetail(id),
        enabled: !!id,
    })
}

export const useUpdateUserInvitation = (id: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: UpdateUserInvitationRequest) => updateUserInvitation(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-invitation-detail", id] })
            queryClient.invalidateQueries({ queryKey: ["user-invitation-dashboard", id] })
            queryClient.invalidateQueries({ queryKey: ["user-invitations"] })
        },
    })
}
