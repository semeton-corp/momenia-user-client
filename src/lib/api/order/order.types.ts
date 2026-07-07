export type OrderItem = {
  id: string
  itemType: string
  price: string
  productName: string
}

export type Order = {
  id: string
  orderNumber: string
  totalPrice: string
  orderStatus: string
  paymentStatus: string
  paymentMethod: string
  createdAt: string
  paidAt: string
  orderItems: OrderItem[]
}

export type OrdersListResponse = {
  data: Order[]
  nextCursor: string
  totalData: number
  totalPage: number
}

export type GetOrdersParams = {
  pageSize?: number
  cursor?: string
}
