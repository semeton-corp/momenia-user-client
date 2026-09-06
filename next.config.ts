import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*`,
      },
    ]
  },
  images: {
    // Next.js default-nya "attachment" (buat jaga-jaga karena /_next/image bisa
    // proxy dari domain manapun yang di-allow) — bikin download manager (mis. IDM)
    // salah kira gambar biasa sebagai file yang harus di-download. Domain di
    // remotePatterns sudah kita percaya, jadi aman diset "inline".
    contentDispositionType: "inline",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "is3.cloudhost.id",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },
}

export default withNextIntl(nextConfig)