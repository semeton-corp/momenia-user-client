import { MessageCircle } from "lucide-react"

const WHATSAPP_NUMBER = "628561114275"

type ProfileContactSupportCardProps = {
  title: string
  subtitle: string
}

export function ProfileContactSupportCard({ title, subtitle }: ProfileContactSupportCardProps) {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-[80px] w-full items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-4 py-5 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50 xl:w-fit xl:min-w-[281px]"
    >
      <div className="flex h-[35px] w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transition-colors group-hover:bg-white">
        <MessageCircle className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="whitespace-nowrap text-sm font-semibold text-indigo-600">{title}</p>
        <p className="whitespace-nowrap text-xs font-normal text-muted-foreground">{subtitle}</p>
      </div>
    </a>
  )
}
