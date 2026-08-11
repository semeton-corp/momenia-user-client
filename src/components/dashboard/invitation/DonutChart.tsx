type DonutSegment = {
  value: number
  color: string
}

type DonutChartProps = {
  segments: DonutSegment[]
  sizeClassName?: string
  // Controls the inner white hole. Larger inset = smaller hole (thicker ring),
  // smaller inset = bigger hole (thinner ring). Accepts responsive classes so the
  // hole can differ per breakpoint. Defaults to the original look.
  holeClassName?: string
}

export function DonutChart({
  segments,
  sizeClassName = "h-32 w-32",
  holeClassName = "inset-[20%]",
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
      <div className={`absolute rounded-full bg-white ${holeClassName}`} />
    </div>
  )
}
