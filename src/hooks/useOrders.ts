"use client"

import { useQuery } from "@tanstack/react-query"
import { getOrders } from "@/lib/api/order/order.service"
import type { GetOrdersParams } from "@/lib/api/order/order.types"

export function useOrders(params: GetOrdersParams = {}) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => getOrders(params),
    staleTime: 60 * 1000,
  })
}
