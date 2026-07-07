import { http } from "../http"
import { getAuthHeader as authHeader } from "../auth-header"
import { CreateTransactionRequest, CreateTransactionResponse } from "./transaction.types"

export const createTransaction = async (data: CreateTransactionRequest): Promise<CreateTransactionResponse> => {
    return http("/api/v1/orders", {
        method: "POST",
        body: JSON.stringify(data),
        headers: authHeader(),
    })
}
