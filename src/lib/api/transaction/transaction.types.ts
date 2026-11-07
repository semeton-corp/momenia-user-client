export type CreateTransactionRequest = {
    invitationTemplateId: string
    invitationDurationId: string
    paymentMethod: string
}

export type CreateTransactionResponse = {
    orderId: string
    transactionId: string
    orderNumber: string
    paymentType: string
    currency?: string
    status: string
    amount: string
    payment?: {
        type: string
        provider: string
        qrString?: string | null
        metadata?: {
            midtransTransactionId?: string
            qrUrl?: string | null
        } | null
    } | null
    // Legacy response shape kept for transactions saved before the payment
    // response was changed to `payment.metadata.qrUrl`.
    qris?: {
        paymentUrl?: Array<{ method: string; url: string }> | null
        qrString?: string | null
    } | null
    paymentDuration?: {
        unit: string
        expiryDuration: number
        orderTime: string
        expireAt: string
    } | null
}

export type TransactionStatusResponse = {
    id: string
    status: string
    amount: string
    paymentMethod: string
    orderNumber: string
}
