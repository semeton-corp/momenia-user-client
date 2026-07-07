export type CreateTransactionRequest = {
    invitationTemplateId: string
    invitationDurationId: string
    paymentMethod: string
}

export type CreateTransactionResponse = {
    id: string
    invitationTemplateId: string
    invitationDurationId: string
    paymentMethod: string
    status: string
    createdAt: string
}
