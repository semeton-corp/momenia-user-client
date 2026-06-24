import * as React from "react"
import { cn } from "@/lib/utils"

export function WorkspaceCard({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("rounded-[10px] border border-zinc-200 bg-white shadow-sm", className)}
      {...props}
    />
  )
}
