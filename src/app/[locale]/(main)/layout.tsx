import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

type Props = {
  children: React.ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16 md:pt-20">{children}</main>
      <Footer />
    </>
  )
}
