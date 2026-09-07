type MyInvitationStatCardProps = {
  color: string
  value: number
  label: string
  short: string
  desc: string
}

export function MyInvitationStatCard({
  color,
  value,
  label,
  short,
  desc,
}: MyInvitationStatCardProps) {
  return (
    <div className="rounded-[8px] border border-zinc-200 bg-white p-[10px] text-center xl:px-6 xl:py-[22px] xl:text-left">
      <div className="flex flex-col items-center gap-1 xl:flex-row xl:gap-3">
        <span
          className="h-[5px] w-[5px] shrink-0 rounded-full xl:h-2.5 xl:w-2.5"
          style={{ background: color }}
        />
        <span className="text-[22px] font-semibold text-card-foreground xl:text-[32px] xl:leading-10">
          {value}
        </span>
      </div>
      <p className="mt-1 truncate text-[12px] font-normal text-[#6B7280] xl:mt-2 xl:text-base xl:font-normal xl:text-zinc-700">
        <span className="xl:hidden">{short}</span>
        <span className="hidden xl:inline">{label}</span>
      </p>
      <p className="mt-0.5 hidden text-xs text-zinc-400 xl:mt-2 xl:block xl:text-sm xl:font-normal">
        {desc}
      </p>
    </div>
  )
}
