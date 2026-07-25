"use client"

import { useMutation } from "@tanstack/react-query"
import { createTransaction } from "@/lib/api/transaction/transaction.service"
import type { CreateTransactionResponse } from "@/lib/api/transaction/transaction.types"

export const useCreateTransaction = () => {
    return useMutation({
        mutationFn: createTransaction,
        onSuccess: (data: CreateTransactionResponse) => {
            // Store transaction data for the payment modal
            localStorage.setItem("pendingTransaction", JSON.stringify(data))
        },
    })
}
