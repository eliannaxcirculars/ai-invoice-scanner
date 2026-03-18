/**
 * @fileoverview Hook para gestionar la selección y validación de archivos.
 * Separa la lógica de manejo de archivos del componente de UI.
 */

import { useCallback, useState } from 'react'
import { validateInvoiceFile, ValidationError } from '@/utils/validators'
import { logger } from '@/utils/logger'

export interface FileUploadState {
  /** Archivo actualmente seleccionado, null si no hay ninguno */
  file: File | null
  /** URL de previsualización generada con URL.createObjectURL */
  previewUrl: string | null
  /** Error de validación, null si no hay */
  validationError: string | null
}

export interface UseFileUploadReturn extends FileUploadState {
  /** Procesa un FileList del input o drag-and-drop */
  handleFileSelect: (files: FileList | null) => void
  /** Limpia el archivo seleccionado y libera la URL de preview */
  clearFile: () => void
}

/**
 * Gestiona selección, validación y previsualización de archivos de factura.
 * Revoca automáticamente la URL de previsualización al limpiar.
 */
export function useFileUpload(): UseFileUploadReturn {
  const [state, setState] = useState<FileUploadState>({
    file: null,
    previewUrl: null,
    validationError: null,
  })

  const clearFile = useCallback(() => {
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl)
    }
    setState({ file: null, previewUrl: null, validationError: null })
  }, [state.previewUrl])

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const selected = files[0]

      try {
        validateInvoiceFile(selected)
      } catch (err) {
        if (err instanceof ValidationError) {
          setState((prev) => ({ ...prev, validationError: err.message }))
          return
        }
        logger.error('Error inesperado validando archivo', err, 'useFileUpload')
        return
      }

      // Liberar URL anterior para evitar memory leaks
      if (state.previewUrl) {
        URL.revokeObjectURL(state.previewUrl)
      }

      const previewUrl = selected.type.startsWith('image/')
        ? URL.createObjectURL(selected)
        : null

      logger.debug('Archivo seleccionado', { name: selected.name }, 'useFileUpload')

      setState({
        file: selected,
        previewUrl,
        validationError: null,
      })
    },
    [state.previewUrl]
  )

  return { ...state, handleFileSelect, clearFile }
}
