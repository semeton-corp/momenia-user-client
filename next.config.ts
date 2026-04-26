import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin()

type WebpackRule = {
  test?: RegExp | { test?: (value: string) => boolean }
  exclude?: unknown
  use?: unknown
}

type WebpackConfigLike = {
  module?: {
    rules?: WebpackRule[]
  }
}

const nextConfig: NextConfig = {
  images: {
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
    ],
  },
  webpack(config: WebpackConfigLike) {
    const rules = config.module?.rules ?? []
    const fileLoaderRule = rules.find((rule) => {
      const test = rule.test
      if (!test) return false
      if (test instanceof RegExp) return test.test(".svg")
      return typeof test.test === "function" && test.test(".svg")
    })

    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/
    }

    rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    })

    return config
  },
}

export default withNextIntl(nextConfig)