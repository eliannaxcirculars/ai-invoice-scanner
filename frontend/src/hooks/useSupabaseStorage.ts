/**
 * @fileoverview Hook para subir archivos a Supabase Storage con seguimiento de progreso.
 * Dado que el SDK de Supabase no expone progreso real de XHR,
 * simulamos un progreso indeterminado para mejorar la UX.
 */

import { useCallback, useRef, useState } from 'react'
import { uploadInvoiceFile } from '@/services'
import { logger } from '@/utils/logger'
import type { StorageUploadResult } from '@/types/api.types'

export interface UseSupabaseStorageReturn {
  /** Progreso simulado de 0 a 100 */
  uploadProgress: number
  /** Sube el archivo y devuelve el resultado */
  upload: (file: File) => Promise<StorageUploadResult>
  /** Reinicia el estado de progreso */
  reset: () => void
}

/**
 * Gestiona la subida de archivos a Supabase con animación de progreso.
 * La barra progresa hasta 90% durante la subida y salta a 100% al completar.
 */
export function useSupabaseStorage(): UseSupabaseStorageReturn {
  const [uploadProgress, setUploadProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startProgressAnimation = useCallback(() => {
    let progress = 0
    intervalRef.current = setInterval(() => {
      progress = Math.min(progress + 5, 90)
      setUploadProgress(progress)
    }, 200)
  }, [])

  const stopProgressAnimation = useCallback((final: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setUploadProgress(final)
  }, [])

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setUploadProgress(0)
  }, [])

  const upload = useCallback(
    async (file: File): Promise<StorageUploadResult> => {
      startProgressAnimation()
      try {
        const result = await uploadInvoiceFile(file)
        stopProgressAnimation(100)
        logger.info('Storage: subida completada', { path: result.path }, 'useSupabaseStorage')
        return result
      } catch (err) {
        stopProgressAnimation(0)
        throw err
      }
    },
    [startProgressAnimation, stopProgressAnimation]
  )

  return { uploadProgress, upload, reset }
}
