import { http } from "../http"
import { getAuthHeader as authHeader } from "../auth-header"
import type { GetOrdersParams, OrdersListResponse } from "./order.types"

const BASE = "/api/v1/orders"

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val === undefined || val === "") continue
    q.set(key, String(val))
  }
  const s = q.toString()
  return s ? `?${s}` : ""
}

export async function getOrders(params: GetOrdersParams = {}): Promise<OrdersListResponse> {
  const qs = buildQuery({ pageSize: params.pageSize, cursor: params.cursor })
  return http(`${BASE}${qs}`, { headers: authHeader() })
}
