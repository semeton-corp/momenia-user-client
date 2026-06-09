export type TemplateListItem = {
  id: string
  name: string
  category: string
  mobileThumbnail: string
  price: string
  priceAfterDiscount: string
  isUserFavorite: boolean
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
