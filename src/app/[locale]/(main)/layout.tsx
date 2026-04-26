import { Navbar } from "@/components/Navbar"
import { PromoNavbar } from "@/components/promo/PromoNavbar"
import { Footer } from "@/components/Footer"

type Props = {
  readonly children: React.ReactNode
}

export default function MainLayout({ children }: Props) {
  const isPromo = process.env.PROMOTIONAL_PAGE === "true"
  return (
    <>
      {isPromo ? <PromoNavbar /> : <Navbar />}
      <main className="flex-1 pt-16 md:pt-20">{children}</main>
      <Footer />
    </>
  )
}
