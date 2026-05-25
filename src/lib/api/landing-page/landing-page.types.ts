export type LandingPageTestimonial = {
  id: number
  name: string
  testimonial: string
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
  title: string
  description: string
  icon: string
}

export type LandingPageFaq = {
  id: number
  question_en: string
  answer_en: string
  question_idn: string
  answer_idn: string
}

export type LandingPageResponse = {
  testimonials: LandingPageTestimonial[]
  catalogs: LandingPageCatalog[]
  features: LandingPageFeature[]
  faqs: LandingPageFaq[]
}

// test
