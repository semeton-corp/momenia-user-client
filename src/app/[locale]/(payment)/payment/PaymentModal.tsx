"use client"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { X, Clock } from "lucide-react"
import { getTransactionStatus } from "@/lib/api/transaction/transaction.service"
import type { CreateTransactionResponse, TransactionStatusResponse } from "@/lib/api/transaction/transaction.types"
import { useToast } from "@/providers/ToastProvider"
import { useRouter } from "@/i18n/navigation"
import { PaymentSuccessOverlay } from "@/components/payment/PaymentSuccessOverlay"

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
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [showConfirmClose, setShowConfirmClose] = useState(false)
  const [showExpiredModal, setShowExpiredModal] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

  // Initialize time left based on expireAt
  useEffect(() => {
    const expireAt = new Date(transaction.paymentDuration.expireAt).getTime()
    const now = Date.now()
    const remaining = Math.max(0, Math.floor((expireAt - now) / 1000))
    setTimeLeft(remaining)
  }, [transaction.paymentDuration.expireAt])

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null) return

    if (timeLeft <= 0) {
      setPolling(false)
      setShowExpiredModal(true)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null
        if (prev <= 1) {
          setPolling(false)
          setShowExpiredModal(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

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
          // Modal stays mounted (no onClose() here) so PaymentSuccessOverlay below has
          // something to render on top of — the actual close + redirect happen from its
          // onDone, once the animation has actually played through.
          setShowSuccessAnimation(true)
        }
      } catch (err) {
        console.error("Failed to check status:", err)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [polling, transaction.transactionId, queryClient, router, toast, onClose])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleClose = () => {
    setShowConfirmClose(true)
  }

  const handleConfirmClose = () => {
    localStorage.removeItem("pendingTransaction")
    setShowConfirmClose(false)
    onClose()
    toast("Pembayaran dibatalkan", "info")
  }

  const qrImageUrl = transaction.qris.paymentUrl[0]?.url || ""
  const isExpired = timeLeft === 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-2xl">
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isExpired}
          className="absolute right-4 top-4 rounded-lg bg-white p-2 text-zinc-600 shadow-md transition-colors hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with Countdown */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Clock className={`h-5 w-5 ${!isExpired && timeLeft !== null && timeLeft <= 60 ? "text-red-500" : "text-indigo-600"}`} />
            <span className={`text-sm font-semibold ${!isExpired && timeLeft !== null && timeLeft <= 60 ? "text-red-500" : "text-indigo-600"}`}>
              {timeLeft === null ? "Loading..." : formatTime(timeLeft)}
            </span>
          </div>
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

      {/* Expired Modal */}
      {showExpiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">Pembayaran Kadaluarsa</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Waktu pembayaran Anda telah berakhir. Silakan buat pesanan baru untuk melanjutkan.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("pendingTransaction")
                  onClose()
                  toast("Pesanan dibatalkan", "info")
                }}
                className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white transition-colors hover:bg-indigo-700"
              >
                Buat Pesanan Baru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmClose && !showExpiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-zinc-900">Batalkan Pembayaran?</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Jika Anda membatalkan, pesanan ini akan dihapus dan Anda dapat membeli paket lain.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmClose(false)}
                className="flex-1 rounded-lg border border-zinc-300 bg-white py-2 font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
              >
                Lanjut Bayar
              </button>
              <button
                type="button"
                onClick={handleConfirmClose}
                className="flex-1 rounded-lg bg-red-500 py-2 font-medium text-white transition-colors hover:bg-red-600"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessAnimation && (
        <PaymentSuccessOverlay
          onDone={() => {
            onClose()
            router.push("/dashboard/my-invitation")
          }}
        />
      )}
    </div>
  )
}
