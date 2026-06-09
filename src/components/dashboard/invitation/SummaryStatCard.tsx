import { WorkspaceCard } from "./WorkspaceCard"

type SummaryStatCardProps = {
  label: string
  value: number
  markerColor?: string
}

export function SummaryStatCard({
  label,
  value,
  markerColor,
}: SummaryStatCardProps) {
  return (
    <WorkspaceCard className="p-5">
      <div className="flex items-center gap-2 text-sm text-zinc-700">
        {markerColor ? (
          <span
            className="h-3.5 w-3.5 rounded-full"
            style={{ backgroundColor: markerColor }}
          />
        ) : null}
        <span>{label}</span>
      </div>
      <p className="mt-3 text-4xl font-semibold text-zinc-950">{value}</p>
    </WorkspaceCard>
  )
}
