"use client"

import { useMutation } from "@tanstack/react-query"
import { createTransaction } from "@/lib/api/transaction/transaction.service"
import { useRouter } from "@/i18n/navigation"
import type { CreateTransactionResponse } from "@/lib/api/transaction/transaction.types"

export const useCreateTransaction = () => {
    const router = useRouter()

    return useMutation({
        mutationFn: createTransaction,
        onSuccess: (data: CreateTransactionResponse) => {
            // Store transaction data for the payment page
            localStorage.setItem("pendingTransaction", JSON.stringify(data))
            // Redirect to payment QR page
            router.push(`/dashboard/payment-status?transactionId=${data.transactionId}`)
        },
    })
}
