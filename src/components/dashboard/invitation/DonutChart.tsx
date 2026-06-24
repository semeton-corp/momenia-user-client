type DonutSegment = {
  value: number
  color: string
}

type DonutChartProps = {
  segments: DonutSegment[]
  sizeClassName?: string
}

export function DonutChart({
  segments,
  sizeClassName = "h-32 w-32",
}: DonutChartProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1
  const gradient = segments
    .reduce<{ stops: string[]; cursor: number }>(
      (accumulator, segment) => {
        const start = accumulator.cursor
        const end = start + (segment.value / total) * 100

        return {
          stops: [...accumulator.stops, `${segment.color} ${start}% ${end}%`],
          cursor: end,
        }
      },
      { stops: [], cursor: 0 },
    )
    .stops.join(", ")

  return (
    <div
      className={`relative rounded-full ${sizeClassName}`}
      style={{ background: `conic-gradient(${gradient})` }}
    >
      <div className="absolute inset-[20%] rounded-full bg-white" />
    </div>
  )
}
