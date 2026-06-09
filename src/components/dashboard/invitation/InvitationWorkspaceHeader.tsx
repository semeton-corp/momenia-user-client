type InvitationWorkspaceHeaderProps = {
  title: string
  subtitle?: string
}

export function InvitationWorkspaceHeader({
  title,
  subtitle,
}: InvitationWorkspaceHeaderProps) {
  return (
    <header className="space-y-1 lg:space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 lg:text-4xl">{title}</h1>
      {subtitle ? <p className="hidden text-base text-zinc-500 lg:block">{subtitle}</p> : null}
    </header>
  )
}
