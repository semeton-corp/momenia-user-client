"use client"

import { useMutation } from "@tanstack/react-query"
import { createPresignedUpload, uploadFileToPresignedUrl } from "@/lib/api/object/object.service"

export function useUploadAvatar() {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const upload = await createPresignedUpload({
        category: "avatar",
        contentType: file.type,
        metadata: {
          originalName: file.name,
          size: String(file.size),
          uploadAt: new Date().toISOString(),
        },
      })

      await uploadFileToPresignedUrl(file, upload)

      // Backend melakukan lookup objek dengan string profilePicture apa adanya
      // sebagai key — jadi yang dikembalikan adalah "key" dari POST /objects
      // (mis. "avatar/ava_xxx"), bukan URL. Backend memindahkan file dari lokasi
      // temp ke permanen saat akun disimpan.
      return upload.key
    },
  })
}
