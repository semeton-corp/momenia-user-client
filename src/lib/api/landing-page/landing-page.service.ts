import { http } from "../http"
import { LandingPageResponse } from "./landing-page.types"

export const getLandingPage = async (): Promise<LandingPageResponse> => {
  return http<LandingPageResponse>("/api/v1/landing-pages")
}
