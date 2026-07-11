export type InvitationDurationUnit = "week" | "month"

export type InvitationDuration = {
  id: string
  duration: number
  unit: InvitationDurationUnit
  price: string
  isActive: boolean
}
