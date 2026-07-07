export type TransactionStatus = "completed" | "pending" | "failed"

export type TransactionLineItem = {
  name: string
  kind: "template" | "duration" | "addon"
  price: number
}

export type TransactionRecord = {
  id: string
  title: string
  totalPrice: number
  status: TransactionStatus
  timeLabel: string
  // Kosong = pembelian template tunggal (baris tidak bisa di-expand).
  // Terisi = bundle (template + add-ons), baris bisa di-expand.
  items: TransactionLineItem[]
}
