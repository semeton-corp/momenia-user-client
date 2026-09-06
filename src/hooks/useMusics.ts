"use client"

import { useQuery } from "@tanstack/react-query"
import { getMusicById, getMusics } from "@/lib/api/music/music.service"

export const useMusics = () => {
  return useQuery({
    queryKey: ["musics"],
    queryFn: getMusics,
  })
}

export const useMusic = (id: string) => {
  return useQuery({
    queryKey: ["music", id],
    queryFn: () => getMusicById(id),
    enabled: !!id,
  })
}
