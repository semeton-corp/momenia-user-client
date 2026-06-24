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
      <div className="flex items-center gap-2 text-xl font-normal text-foreground">
        {markerColor ? (
          <span
            className="h-5 w-5 rounded-full"
            style={{ backgroundColor: markerColor }}
          />
        ) : null}
        <span>{label}</span>
      </div>
      <p className="mt-3 text-4xl font-semibold text-zinc-950">{value}</p>
    </WorkspaceCard>
  )
}
