import { http } from "../http"
import { getAuthHeader as authHeader } from "../auth-header"
import type { Music } from "./music.types"

// Both endpoints require a Bearer token (confirmed: 401 "authorization header empty"
// with only the api-key) — usable from the authenticated editor, but never from the
// public guest-facing invitation page.
export async function getMusics(): Promise<Music[]> {
  return http("/api/v1/musics", { headers: authHeader() })
}

export async function getMusicById(id: string): Promise<Music> {
  return http(`/api/v1/musics/${id}`, { headers: authHeader() })
}
