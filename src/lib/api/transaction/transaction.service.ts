import { http } from "../http"
import { getAuthHeader as authHeader } from "../auth-header"
import { CreateTransactionRequest, CreateTransactionResponse, TransactionStatusResponse } from "./transaction.types"

export const createTransaction = async (data: CreateTransactionRequest): Promise<CreateTransactionResponse> => {
    return http("/api/v1/orders", {
        method: "POST",
        body: JSON.stringify(data),
        headers: authHeader(),
    })
}

export const getTransactionStatus = async (transactionId: string): Promise<TransactionStatusResponse> => {
    return http(`/api/v1/transactions/${transactionId}/status`, {
        headers: authHeader(),
    })
}
