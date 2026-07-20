"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { getTransactionStatus } from "@/lib/api/transaction/transaction.service"
import type { CreateTransactionResponse, TransactionStatusResponse } from "@/lib/api/transaction/transaction.types"
import { useToast } from "@/providers/ToastProvider"

export default function PaymentStatusPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const transactionId = searchParams.get("transactionId") ?? ""
  const [transaction, setTransaction] = useState<CreateTransactionResponse | null>(null)
  const [status, setStatus] = useState<TransactionStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(true)

  // Load transaction data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("pendingTransaction")
    if (stored) {
      try {
        setTransaction(JSON.parse(stored))
        setLoading(false)
      } catch {
        toast("Failed to load transaction data", "error")
        router.push("/dashboard/my-invitation")
      }
    } else {
      toast("No transaction found", "error")
      router.push("/dashboard/my-invitation")
    }
  }, [])

  // Poll status every 5 seconds
  useEffect(() => {
    if (!transactionId || !polling) return

    const checkStatus = async () => {
      try {
        const result = await getTransactionStatus(transactionId)
        setStatus(result)

        if (result.status === "success") {
          setPolling(false)
          toast("Payment successful!", "success")
          // Clear stored transaction
          localStorage.removeItem("pendingTransaction")
          // Invalidate queries and redirect
          await queryClient.invalidateQueries({ queryKey: ["user-invitations"] })
          await queryClient.invalidateQueries({ queryKey: ["user-invitation-overview"] })
          router.push("/dashboard/my-invitation")
        }
      } catch (err) {
        console.error("Failed to check status:", err)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [transactionId, polling, queryClient, router, toast])

  if (loading || !transaction) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-indigo-600 mx-auto"></div>
          <p className="text-zinc-600">Loading payment...</p>
        </div>
      </div>
    )
  }

  const qrImageUrl = transaction.qris.paymentUrl[0] || ""

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-zinc-900">Scan untuk Bayar</h1>
          <p className="mt-2 text-zinc-600">Gunakan aplikasi e-wallet untuk scan QR Code</p>
        </div>

        {/* QR Code */}
        <div className="mb-8 flex justify-center rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50 p-6">
          {qrImageUrl && (
            <img src={qrImageUrl} alt="QRIS QR Code" className="h-64 w-64 object-contain" />
          )}
        </div>

        {/* Order Details */}
        <div className="space-y-4 border-t border-b border-zinc-200 py-6">
          <div className="flex justify-between">
            <span className="text-zinc-600">Order Number</span>
            <span className="font-medium text-zinc-900">{transaction.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600">Amount</span>
            <span className="font-medium text-zinc-900">Rp {Number(transaction.amount).toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600">Status</span>
            <span className={`font-medium ${status?.status === "success" ? "text-green-600" : "text-amber-600"}`}>
              {status?.status === "success" ? "Berhasil" : "Menunggu Pembayaran"}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 rounded-xl bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            💡 Status pembayaran akan diperbarui secara otomatis. Jangan tutup halaman ini.
          </p>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={async () => {
            try {
              const result = await getTransactionStatus(transactionId)
              setStatus(result)
              toast("Status diperbarui", "info")
            } catch {
              toast("Gagal memperbarui status", "error")
            }
          }}
          className="mt-6 w-full rounded-xl bg-zinc-100 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
        >
          Perbarui Status
        </button>
      </div>
    </div>
  )
}
