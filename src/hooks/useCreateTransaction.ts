"use client"

import { useMutation } from "@tanstack/react-query"
import { createTransaction } from "@/lib/api/transaction/transaction.service"
import { useRouter } from "@/i18n/navigation"

export const useCreateTransaction = () => {
    const router = useRouter()

    return useMutation({
        mutationFn: createTransaction,
        onSuccess: () => {
            router.push("/dashboard/my-invitation")
        },
    })
}
