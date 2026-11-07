"use client"

import { useMutation } from "@tanstack/react-query"
import { createTransaction } from "@/lib/api/transaction/transaction.service"
import { savePendingTransaction } from "@/lib/api/transaction/pending-transaction"

export const useCreateTransaction = () => {
    return useMutation({
        mutationFn: createTransaction,
        onSuccess: (data, request) => {
            savePendingTransaction(data, request)
        },
    })
}
