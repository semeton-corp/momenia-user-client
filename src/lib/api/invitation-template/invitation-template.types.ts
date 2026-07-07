export type TemplateListItem = {
  id: string
  name: string
  category: string
  mobileThumbnail: string
  price: string
  priceAfterDiscount: string
  isUserFavorite: boolean
}

export type InvitationTemplateTag = {
  id: number
  name: string
}

export type InvitationTemplateCategory = {
  id: number
  name: string
}

export type TemplateSchemaField = {
  key: string
  type: "text" | "image" | "date" | "time"
  label: string
  section: string
  required: boolean
  placeholder?: string
}

export type TemplateSectionType = {
  id: string
  js: string
  css: string
  html: string
  schema: {
    slots: string[]
    styles: unknown[]
  }
}

export type TemplatePage = {
  id: string
  label: string
  sections: { id: string; section_type_id: string }[]
}

export type TemplateThemeDefaults = {
  font_body: string
  font_title: string
  color_accent: string
  color_primary: string
  color_background: string
}

export type InvitationTemplate = {
  pages: TemplatePage[]
  schema: { fields: TemplateSchemaField[] }
  sectionTypes: Record<string, TemplateSectionType>
  theme_defaults: TemplateThemeDefaults
}

export type TemplateDetailResponse = {
  id: string
  name: string
  category: { id: number; name: string }
  tags: { id: number; name: string }[]
  addOns: TemplateAddOn[]
  mobileThumbnail: string
  desktopThumbnail: string
  descriptionIdn: string
  descriptionEn: string
  price: string
  priceAfterDiscount: string
  template: InvitationTemplate
  isUserFavorite: boolean
  version: number
}

export type TemplateAddOn = {
  id: string
  name: string
  price: string
  thumbnail: string
  type: "duration" | "feature"
  descriptionIdn: string
  descriptionEn: string
}

export type TemplatesListResponse = {
  data: TemplateListItem[]
  nextCursor: string | null
}

export type GetTemplatesParams = {
  sortOrder?: "asc" | "desc"
  sortField?: "createdAt" | "rating" | "price"
  keyword?: string
  pageSize?: number
  categoryId?: number
  tagsIds?: number[]
  cursor?: string
}

export type GetFavouritesParams = {
  pageSize?: number
  sortOrder?: "asc" | "desc"
  cursor?: string
  keyword?: string
}
