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
    currency: string
    status: string
    amount: string
    qris: {
        paymentUrl: string[]
        qrString: string
    }
    paymentDuration: {
        unit: string
        expiryDuration: number
        orderTime: string
        expireAt: string
    }
}

export type TransactionStatusResponse = {
    id: string
    status: string
    amount: string
    paymentMethod: string
    orderNumber: string
}
