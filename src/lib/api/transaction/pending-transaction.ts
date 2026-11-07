import type { CreateTransactionRequest, CreateTransactionResponse } from "./transaction.types"

export type PendingTransaction = CreateTransactionResponse & {
    invitationTemplateId: string
    invitationDurationId: string
}

const CACHE_KEY = "pendingTransactions"
const selectionKey = (templateId: string, durationId: string) => JSON.stringify([templateId, durationId])

function readCache(): Record<string, PendingTransaction> {
    try {
        const value = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}")
        return value && typeof value === "object" && !Array.isArray(value) ? value : {}
    } catch {
        return {}
    }
}

export function savePendingTransaction(data: CreateTransactionResponse, request: CreateTransactionRequest): PendingTransaction {
    const transaction = {
        ...data,
        invitationTemplateId: request.invitationTemplateId,
        invitationDurationId: request.invitationDurationId,
    }
    if (data.status !== "pending") {
        clearPendingTransaction(data.transactionId)
        return transaction
    }
    const cache = readCache()
    cache[selectionKey(request.invitationTemplateId, request.invitationDurationId)] = transaction
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    localStorage.setItem("pendingTransaction", JSON.stringify(transaction))
    return transaction
}

export function getPendingTransaction(templateId: string, durationId: string): PendingTransaction | null {
    const transaction = readCache()[selectionKey(templateId, durationId)]
    if (!transaction || transaction.invitationTemplateId !== templateId || transaction.invitationDurationId !== durationId) return null
    const expiresAt = Date.parse(transaction.paymentDuration?.expireAt ?? "")
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now() || transaction.status !== "pending") {
        clearPendingTransaction(transaction.transactionId)
        return null
    }
    // Keep the existing payment-status page pointed at the payment being resumed.
    localStorage.setItem("pendingTransaction", JSON.stringify(transaction))
    return transaction
}

export function clearPendingTransaction(transactionId: string): void {
    const cache = readCache()
    for (const [key, transaction] of Object.entries(cache)) {
        if (transaction.transactionId === transactionId) delete cache[key]
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    try {
        if (JSON.parse(localStorage.getItem("pendingTransaction") ?? "null")?.transactionId === transactionId) {
            localStorage.removeItem("pendingTransaction")
        }
    } catch {
        localStorage.removeItem("pendingTransaction")
    }
}
