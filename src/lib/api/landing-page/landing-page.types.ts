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
  invitationTemplateId: string
  invitationTemplateName: string
  invitationTemplateMobileThumbnail: string
  isNew: boolean
}

export type LandingPageFeature = {
  id: number
  titleIdn: string
  titleEn: string
  descriptionIdn: string
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
