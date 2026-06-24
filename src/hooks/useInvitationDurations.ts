"use client"

import { useQuery } from "@tanstack/react-query"
import { getInvitationDurations } from "@/lib/api/invitation-duration/invitation-duration.service"

export const useInvitationDurations = () => {
    return useQuery({
        queryKey: ["invitation-durations"],
        queryFn: getInvitationDurations,
        staleTime: 1000 * 60 * 10,
    })
}
