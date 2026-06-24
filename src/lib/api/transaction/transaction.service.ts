import { http } from "../http"
import { CreateTransactionRequest, CreateTransactionResponse } from "./transaction.types"

function authHeader(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
    return token ? { Authorization: `Bearer ${token}` } : {}
}

export const createTransaction = async (data: CreateTransactionRequest): Promise<CreateTransactionResponse> => {
    return http("/api/v1/orders", {
        method: "POST",
        body: JSON.stringify(data),
        headers: authHeader(),
    })
}
