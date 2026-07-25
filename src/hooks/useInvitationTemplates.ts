"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useToast } from "@/providers/ToastProvider"
import {
  addFavouriteTemplate,
  getFavouriteTemplates,
  getInvitationTemplateCategories,
  getInvitationTemplateTags,
  getInvitationTemplateById,
  getInvitationTemplates,
  removeFavouriteTemplate,
} from "@/lib/api/invitation-template/invitation-template.service"
import type {
  GetFavouritesParams,
  GetTemplatesParams,
  TemplateDetailResponse,
  TemplatesListResponse,
} from "@/lib/api/invitation-template/invitation-template.types"

export const TEMPLATE_KEYS = {
  list: (params: GetTemplatesParams) => ["invitation-templates", "list", params] as const,
  detail: (id: string) => ["invitation-templates", "detail", id] as const,
  favourites: (params: GetFavouritesParams) => ["invitation-templates", "favourites", params] as const,
  favouriteIds: ["invitation-templates", "favourite-ids"] as const,
  tags: (keyword?: string) => ["invitation-templates", "tags", keyword ?? ""] as const,
  categories: (keyword?: string) => ["invitation-templates", "categories", keyword ?? ""] as const,
}

// Endpoint katalog utama (list & detail) tidak selalu akurat menghitung isUserFavorite
// per-user. GET /invitation-templates/favourites adalah sumber kebenaran, jadi kita
// pakai daftar ID favorit dari situ untuk "menimpa" flag isUserFavorite di list & detail.
// sortOrder WAJIB dikirim (tanpa itu backend balas 400), pageSize dijaga kecil, dan
// di-loop pakai cursor supaya tetap dapat semua favorit walau lebih dari satu halaman.
async function fetchAllFavouriteIds(): Promise<Set<string>> {
  const ids = new Set<string>()
  let cursor: string | undefined
  for (let i = 0; i < 25; i++) {
    const res = await getFavouriteTemplates({ pageSize: 20, sortOrder: "asc", cursor })
    res.data.forEach((tpl) => ids.add(tpl.id))
    if (!res.nextCursor) break
    cursor = res.nextCursor
  }
  return ids
}

function useFavouriteIds() {
  return useQuery({
    queryKey: TEMPLATE_KEYS.favouriteIds,
    queryFn: fetchAllFavouriteIds,
    staleTime: 1000 * 60 * 5,
  })
}

export function useInvitationTemplates(params: GetTemplatesParams = {}) {
  const listQuery = useQuery({
    queryKey: TEMPLATE_KEYS.list(params),
    queryFn: () => getInvitationTemplates(params),
    staleTime: 1000 * 60 * 5,
  })
  const { data: favouriteIds } = useFavouriteIds()

  const data =
    listQuery.data && favouriteIds
      ? { ...listQuery.data, data: listQuery.data.data.map((tpl) => ({ ...tpl, isUserFavorite: favouriteIds.has(tpl.id) })) }
      : listQuery.data

  return { ...listQuery, data }
}

export function useInvitationTemplateDetail(id: string | null) {
  const detailQuery = useQuery({
    queryKey: TEMPLATE_KEYS.detail(id ?? ""),
    queryFn: () => getInvitationTemplateById(id!),
    enabled: id !== null,
    staleTime: 1000 * 60 * 5,
  })
  const { data: favouriteIds } = useFavouriteIds()

  const data =
    detailQuery.data && favouriteIds && id
      ? { ...detailQuery.data, isUserFavorite: favouriteIds.has(id) }
      : detailQuery.data

  return { ...detailQuery, data }
}

export function useInvitationTemplateTags(keyword?: string) {
  return useQuery({
    queryKey: TEMPLATE_KEYS.tags(keyword),
    queryFn: () => getInvitationTemplateTags(keyword),
    staleTime: 1000 * 60 * 5,
  })
}

export function useInvitationTemplateCategories(keyword?: string) {
  return useQuery({
    queryKey: TEMPLATE_KEYS.categories(keyword),
    queryFn: () => getInvitationTemplateCategories(keyword),
    staleTime: 1000 * 60 * 5,
  })
}

export function useFavouriteTemplates(params: GetFavouritesParams = {}) {
  return useQuery({
    queryKey: TEMPLATE_KEYS.favourites(params),
    queryFn: () => getFavouriteTemplates(params),
    staleTime: 1000 * 60 * 5,
  })
}

export function useToggleFavourite() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const t = useTranslations("dashboard.favourite")

  return useMutation({
    mutationFn: ({ id, isFavourite }: { id: string; isFavourite: boolean }) =>
      isFavourite ? removeFavouriteTemplate(id) : addFavouriteTemplate(id),
    // Update cache langsung supaya hati berubah seketika tanpa nunggu roundtrip API.
    // Tidak ada refetch aktif sama sekali setelah ini — refetch yang race dengan
    // backend adalah penyebab glitch (terisi → kosong → terisi lagi).
    onMutate: async ({ id, isFavourite }) => {
      await queryClient.cancelQueries({ queryKey: ["invitation-templates"] })
      const previous = queryClient.getQueriesData({ queryKey: ["invitation-templates"] })
      const nextValue = !isFavourite

      // List dashboard: item tetap tampil, cuma flag hati-nya yang berubah.
      queryClient.setQueriesData<TemplatesListResponse>(
        { queryKey: ["invitation-templates"], predicate: (q) => q.queryKey[1] === "list" },
        (old) =>
          old
            ? { ...old, data: old.data.map((tpl) => (tpl.id === id ? { ...tpl, isUserFavorite: nextValue } : tpl)) }
            : old,
      )
      // Data mentah item (dipakai untuk menambahkan ke daftar favorit secara
      // optimistic) diambil dari cache list dashboard yang sudah ada.
      const listCaches = queryClient.getQueriesData<TemplatesListResponse>({
        queryKey: ["invitation-templates"],
        predicate: (q) => q.queryKey[1] === "list",
      })
      const sourceItem = listCaches
        .flatMap(([, data]) => data?.data ?? [])
        .find((tpl) => tpl.id === id)

      // Page favorit: kalau di-favorite, item langsung DITAMBAHKAN ke daftar; kalau
      // di-unfavorite, item langsung DIHAPUS. Jadi kalau halaman favorit sedang
      // terbuka, perubahannya tampak seketika tanpa perlu refresh.
      queryClient.setQueriesData<TemplatesListResponse>(
        { queryKey: ["invitation-templates"], predicate: (q) => q.queryKey[1] === "favourites" },
        (old) => {
          if (!old) return old
          if (nextValue) {
            if (old.data.some((tpl) => tpl.id === id) || !sourceItem) return old
            return { ...old, data: [{ ...sourceItem, isUserFavorite: true }, ...old.data] }
          }
          return { ...old, data: old.data.filter((tpl) => tpl.id !== id) }
        },
      )
      queryClient.setQueriesData<TemplateDetailResponse>(
        { queryKey: ["invitation-templates"], predicate: (q) => q.queryKey[1] === "detail" && q.queryKey[2] === id },
        (old) => (old ? { ...old, isUserFavorite: nextValue } : old),
      )
      // Daftar ID favorit (dipakai untuk "menimpa" list & detail di atas) harus ikut
      // di-update juga, kalau tidak nilai optimistic di atas bisa ketimpa balik.
      queryClient.setQueryData<Set<string>>(TEMPLATE_KEYS.favouriteIds, (old) => {
        const next = new Set(old ?? [])
        if (nextValue) next.add(id)
        else next.delete(id)
        return next
      })

      return { previous }
    },
    onError: (_err, _vars, context) => {
      context?.previous.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    // Tandai daftar favorit sebagai stale (TANPA refetch aktif) supaya saat halaman
    // favorit dibuka berikutnya ia otomatis ambil data terbaru dari server. refetch
    // aktif sengaja dihindari karena bisa balapan dengan backend dan memicu glitch.
    onSuccess: (_data, { isFavourite }) => {
      queryClient.invalidateQueries({
        queryKey: ["invitation-templates"],
        refetchType: "none",
        predicate: (q) => q.queryKey[1] === "favourites",
      })
      // isFavourite = status SEBELUM toggle: true berarti baru saja dihapus,
      // false berarti baru saja ditambahkan.
      toast(isFavourite ? t("removedToast") : t("addedToast"), "success")
    },
  })
}
