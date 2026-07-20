import { Suspense } from "react"
import { PaymentStatusContent } from "./PaymentStatusContent"

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-indigo-600 mx-auto"></div>
            <p className="text-zinc-600">Loading payment...</p>
          </div>
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  )
}
