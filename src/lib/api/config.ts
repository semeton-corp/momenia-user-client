function getBackendUrl(): string {
  const url = process.env.BACKEND_URL
  if (!url) {
    throw new Error("BACKEND_URL is not set. Add it to .env.local")
  }
  return url.replace(/\/$/, "") // buang trailing slash
}

export const apiConfig = {
  get baseUrl() {
    return getBackendUrl()
  },
}
