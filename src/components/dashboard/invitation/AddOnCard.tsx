import { GalleryVerticalEnd, Instagram, Languages, Lock } from "lucide-react"
import type { InvitationAddOn } from "@/lib/types/invitation-workspace"
import { WorkspaceBadge } from "./WorkspaceBadge"
import { WorkspaceCard } from "./WorkspaceCard"

type AddOnCardProps = {
  addOn: InvitationAddOn
  activeLabel: string
  lockedLabel: string
}

function resolveAccent(addOn: InvitationAddOn) {
  if (addOn.accent === "instagram") {
    return {
      Icon: Instagram,
      panelClassName: "from-violet-50 via-fuchsia-50 to-white",
      iconClassName: "text-pink-500",
    }
  }

  if (addOn.accent === "language") {
    return {
      Icon: Languages,
      panelClassName: "from-indigo-50 via-violet-50 to-white",
      iconClassName: "text-indigo-500",
    }
  }

  return {
    Icon: GalleryVerticalEnd,
    panelClassName: "from-slate-50 via-violet-50 to-white",
    iconClassName: "text-violet-500",
  }
}

export function AddOnCard({
  addOn,
  activeLabel,
  lockedLabel,
}: AddOnCardProps) {
  const { Icon, panelClassName, iconClassName } = resolveAccent(addOn)
  const isActive = addOn.status === "active"

  return (
    <WorkspaceCard className="overflow-hidden p-4">
      <div
        className={`relative h-36 overflow-hidden rounded-3xl bg-gradient-to-br ${panelClassName}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_55%)]" />
        <div className="absolute right-4 top-4">
          {isActive ? (
            <WorkspaceBadge tone="violet">{activeLabel}</WorkspaceBadge>
          ) : (
            <WorkspaceBadge tone="neutral" className="gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              {lockedLabel}
            </WorkspaceBadge>
          )}
        </div>

        <div className="relative flex h-full items-center justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-lg">
            <Icon className={`h-10 w-10 ${iconClassName}`} />
          </div>

          {addOn.accent === "language" ? (
            <>
              <span className="absolute left-18 top-7 rounded-xl bg-white px-3 py-1 text-sm font-semibold text-indigo-600 shadow-sm">
                EN
              </span>
              <span className="absolute right-18 top-12 rounded-xl bg-white px-3 py-1 text-sm font-semibold text-violet-600 shadow-sm">
                ID
              </span>
              <span className="absolute right-20 bottom-7 rounded-xl bg-white px-3 py-1 text-sm font-semibold text-indigo-600 shadow-sm">
                JP
              </span>
            </>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-2xl font-semibold text-zinc-950">{addOn.title}</h3>
        <p className="mt-2 text-sm font-medium text-violet-600">{addOn.subtitle}</p>
        <p className="mt-3 text-sm leading-7 text-zinc-600">{addOn.description}</p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button className="text-sm font-semibold text-violet-600">{addOn.ctaLabel}</button>
        <p className="text-2xl font-semibold text-violet-600">
          Rp{addOn.price.toLocaleString("id-ID")}
        </p>
      </div>
    </WorkspaceCard>
  )
}
