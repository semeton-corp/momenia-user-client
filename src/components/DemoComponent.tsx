"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"

export function DemoComponent() {
  const [clicked, setClicked] = React.useState(false)
  const t = useTranslations("home")

  return (
    <div className="bg-background flex h-[300px] w-full items-center justify-center rounded-lg border p-8 shadow-sm">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={cn("flex flex-col items-center gap-4 text-center")}
      >
        <div className="bg-primary/10 rounded-full p-4">
          <Sparkles className="text-primary h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold">{t("demoTitle")}</h3>
        <p className="text-muted-foreground max-w-[300px]">{t("demoDescription")}</p>
        <Button onClick={() => setClicked(true)}>{t("demoButton")}</Button>
        {clicked && <p className="text-muted-foreground text-xs">{t("demoClicked")}</p>}
      </motion.div>
    </div>
  )
}
