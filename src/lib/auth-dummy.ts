/**
 * Dummy auth for development. Remove when connecting to real API.
 */
export const DUMMY_CREDENTIALS = {
  email: "semeton@gmail.com",
  password: "semeton",
} as const

export const AUTH_STORAGE_KEY = "memoria_dummy_auth"

export function setDummyAuth() {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(AUTH_STORAGE_KEY, "1")
  }
}

export function clearDummyAuth() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

export function isDummyAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem(AUTH_STORAGE_KEY) === "1"
}
