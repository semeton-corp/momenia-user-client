export type LandingPageTestimonial = {
  id: number
  name: string
  testimonialIdn: string
  testimonialEn: string
  rating: number
  profileImage: string
}

export type LandingPageCatalog = {
  id: number
  catalogPreview: string
  title: string
  templateId: string
}

export type LandingPageFeature = {
  id: number
  titleIdn: string
  descriptionIdn: string
  titleEn: string
  descriptionEn: string
  icon: string
}

export type LandingPageFaq = {
  id: number
  questionEn: string
  answerEn: string
  questionIdn: string
  answerIdn: string
}

export type LandingPageResponse = {
  testimonials: LandingPageTestimonial[]
  catalogs: LandingPageCatalog[]
  features: LandingPageFeature[]
  faqs: LandingPageFaq[]
}
