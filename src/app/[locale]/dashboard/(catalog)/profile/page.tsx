"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Headphones, Mail, Phone, User } from "lucide-react"
import { useAccount, useUpdateAccount } from "@/hooks/auth/useAccount"
import { useLogout } from "@/hooks/auth/useLogout"
import { ProfileHeaderCard } from "@/components/dashboard/profile/ProfileHeaderCard"
import { ProfileInfoRow } from "@/components/dashboard/profile/ProfileInfoRow"
import { ProfileActionRow } from "@/components/dashboard/profile/ProfileActionRow"
import { ProfileLanguageRow } from "@/components/dashboard/profile/ProfileLanguageRow"
import { ProfileLogoutCard } from "@/components/dashboard/profile/ProfileLogoutCard"
import { EditProfileDialog } from "@/components/dashboard/profile/EditProfileDialog"
import { LogoutConfirmDialog } from "@/components/dashboard/profile/LogoutConfirmDialog"
import { ProfileSkeleton } from "@/components/dashboard/profile/ProfileSkeleton"

const WHATSAPP_NUMBER = "628561114275"

export default function ProfilePage() {
  const t = useTranslations("dashboard.profile")
  const { data: account, isLoading, isError } = useAccount()
  const { mutate: saveAccount, isPending: isSaving } = useUpdateAccount()
  const { mutate: doLogout, isPending: isLoggingOut } = useLogout()
  const [editOpen, setEditOpen] = React.useState(false)
  const [logoutOpen, setLogoutOpen] = React.useState(false)

  return (
    <div className="px-5 pt-2 pb-10 md:px-8 xl:mx-auto xl:max-w-[1824px] xl:px-16 xl:pb-10 xl:pt-[72px]">
      <header className="space-y-1.5 xl:space-y-3">
        <h1 className="text-[28px] font-semibold text-[#111111] xl:text-[48px] xl:leading-[48px]">{t("title")}</h1>
        <p className="text-sm font-normal text-zinc-500 xl:text-lg xl:font-normal">{t("subtitle")}</p>
      </header>

      {isLoading ? (
        <ProfileSkeleton />
      ) : isError || !account ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-zinc-200 py-16 text-center xl:mt-8">
          <p className="text-sm text-zinc-400">{t("loadError")}</p>
        </div>
      ) : (
        <div className="mt-6 space-y-6 xl:mt-8 xl:space-y-8">
          <ProfileHeaderCard
            name={account.name}
            email={account.email}
            profilePicture={account.profilePicture}
            editLabel={t("editProfile")}
            onEditClick={() => setEditOpen(true)}
          />

          {/* ── Personal Information ── */}
          <section className="space-y-3 xl:space-y-4">
            <h2 className="text-base font-semibold text-[#111111] xl:text-lg">{t("personalInformation")}</h2>
            <div>
              <ProfileInfoRow icon={User} label={t("fullName")} value={account.name} />
              <ProfileInfoRow icon={Mail} label={t("emailAddress")} value={account.email} />
              <ProfileInfoRow icon={Phone} label={t("phoneNumber")} value={account.phoneNumber} isLast />
            </div>
          </section>

          {/* ── Preference (language switch) ── */}
          <section className="space-y-3 xl:space-y-4">
            <h2 className="text-base font-semibold text-[#111111] xl:text-lg">{t("preference")}</h2>
            <ProfileLanguageRow label={t("language")} title={t("selectLanguage")} />
          </section>

          {/* ── Support ── */}
          <section className="space-y-3 xl:space-y-4">
            <h2 className="text-base font-semibold text-[#111111] xl:text-lg">{t("support")}</h2>
            <ProfileActionRow
              icon={Headphones}
              label={t("support")}
              value={t("chatWhatsApp")}
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
            />
          </section>

          <ProfileLogoutCard title={t("logOut")} subtitle={t("logOutSubtitle")} onClick={() => setLogoutOpen(true)} />
        </div>
      )}

      {account && (
        <EditProfileDialog
          account={account}
          open={editOpen}
          onOpenChange={setEditOpen}
          isSaving={isSaving}
          onSave={(data) => saveAccount(data, { onSuccess: () => setEditOpen(false) })}
        />
      )}

      <LogoutConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        isLoggingOut={isLoggingOut}
        onConfirm={() => doLogout()}
      />
    </div>
  )
}
