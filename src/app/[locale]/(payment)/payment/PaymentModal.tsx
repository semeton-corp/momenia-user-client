"use client"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { X } from "lucide-react"
import { getTransactionStatus } from "@/lib/api/transaction/transaction.service"
import type { CreateTransactionResponse, TransactionStatusResponse } from "@/lib/api/transaction/transaction.types"
import { useToast } from "@/providers/ToastProvider"
import { useRouter } from "@/i18n/navigation"

type PaymentModalProps = {
  transaction: CreateTransactionResponse
  onClose: () => void
}

export function PaymentModal({ transaction, onClose }: PaymentModalProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [status, setStatus] = useState<TransactionStatusResponse | null>(null)
  const [polling, setPolling] = useState(true)

  // Poll status every 5 seconds
  useEffect(() => {
    if (!polling) return

    const checkStatus = async () => {
      try {
        const result = await getTransactionStatus(transaction.transactionId)
        setStatus(result)

        if (result.status === "success") {
          setPolling(false)
          toast("Payment successful!", "success")
          localStorage.removeItem("pendingTransaction")
          await queryClient.invalidateQueries({ queryKey: ["user-invitations"] })
          await queryClient.invalidateQueries({ queryKey: ["user-invitation-overview"] })
          onClose()
          // Redirect to my-invitation after a short delay to show success
          setTimeout(() => {
            router.push("/dashboard/my-invitation")
          }, 500)
        }
      } catch (err) {
        console.error("Failed to check status:", err)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [polling, transaction.transactionId, queryClient, router, toast, onClose])

  const qrImageUrl = transaction.qris.paymentUrl[0]?.url || ""

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-2xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-zinc-900">Scan untuk Bayar</h2>
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
            <span className="font-medium text-zinc-900">
              Rp {Number(transaction.amount).toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600">Status</span>
            <span
              className={`font-medium ${status?.status === "success" ? "text-green-600" : "text-amber-600"}`}
            >
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
              const result = await getTransactionStatus(transaction.transactionId)
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
