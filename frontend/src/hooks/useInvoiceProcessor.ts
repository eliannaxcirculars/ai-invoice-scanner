/**
 * @fileoverview Hook principal que orquesta el flujo completo de escaneo de facturas.
 * Coordina: subida a Storage → webhook n8n → guardado en BD → resultado.
 *
 * Máquina de estados:
 *   idle → uploading → processing → success | error
 */

import { useCallback, useReducer } from 'react'
import { processInvoiceWithAI } from '@/services/n8n/client'
import { saveInvoice } from '@/services/supabase/database'
import { useSupabaseStorage } from './useSupabaseStorage'
import { logger } from '@/utils/logger'
import { GENERIC_ERROR_MESSAGE } from '@/utils/constants'
import type { Invoice, InvoiceScanResult, ProcessingStatus } from '@/types/invoice.types'

// ─── Estado y Reducer ────────────────────────────────────────────────────────

type ScanAction =
  | { type: 'UPLOADING' }
  | { type: 'PROCESSING' }
  | { type: 'SUCCESS'; invoice: Invoice }
  | { type: 'ERROR'; message: string }
  | { type: 'RESET' }

function scanReducer(
  state: InvoiceScanResult,
  action: ScanAction
): InvoiceScanResult {
  switch (action.type) {
    case 'UPLOADING':
      return { ...state, status: 'uploading', error: null }
    case 'PROCESSING':
      return { ...state, status: 'processing' }
    case 'SUCCESS':
      return { status: 'success', invoice: action.invoice, error: null, uploadProgress: 100 }
    case 'ERROR':
      return { ...state, status: 'error', error: action.message }
    case 'RESET':
      return { status: 'idle', invoice: null, error: null, uploadProgress: 0 }
    default:
      return state
  }
}

const initialState: InvoiceScanResult = {
  status: 'idle' as ProcessingStatus,
  invoice: null,
  error: null,
  uploadProgress: 0,
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface UseInvoiceProcessorReturn {
  /** Estado actual del procesamiento */
  scanResult: InvoiceScanResult
  /** Progreso de subida 0–100 */
  uploadProgress: number
  /** Inicia el flujo completo de escaneo */
  processInvoice: (file: File) => Promise<void>
  /** Reinicia el estado para escanear otra factura */
  reset: () => void
}

/**
 * Orquesta el flujo completo: subida → IA → persistencia.
 * Expone el estado como una máquina de estados finitos para que la UI
 * sepa exactamente qué mostrar en cada fase.
 */
export function useInvoiceProcessor(): UseInvoiceProcessorReturn {
  const [scanResult, dispatch] = useReducer(scanReducer, initialState)
  const { uploadProgress, upload, reset: resetStorage } = useSupabaseStorage()

  const processInvoice = useCallback(
    async (file: File): Promise<void> => {
      logger.info('Iniciando procesamiento', { name: file.name }, 'useInvoiceProcessor')
      dispatch({ type: 'UPLOADING' })

      try {
        // 1. Subir archivo a Supabase Storage
        const { publicUrl } = await upload(file)

        // 2. Enviar URL al webhook de n8n para análisis con IA
        dispatch({ type: 'PROCESSING' })
        const n8nResponse = await processInvoiceWithAI({
          fileUrl: publicUrl,
          fileName: file.name,
          mimeType: file.type,
          timestamp: new Date().toISOString(),
        })

        if (!n8nResponse.invoice) {
          throw new Error('La IA no devolvió datos de la factura.')
        }

        // 3. Persistir en Supabase Database
        const invoiceData = {
          ...n8nResponse.invoice,
          fileUrl: publicUrl,
        } as Omit<Invoice, 'id' | 'createdAt'>

        const saved = await saveInvoice(invoiceData)

        dispatch({ type: 'SUCCESS', invoice: saved })
        logger.info('Factura procesada y guardada', { id: saved.id }, 'useInvoiceProcessor')
      } catch (err) {
        const message =
          err instanceof Error ? err.message : GENERIC_ERROR_MESSAGE
        logger.error('Error en procesamiento', err, 'useInvoiceProcessor')
        dispatch({ type: 'ERROR', message })
      }
    },
    [upload]
  )

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
    resetStorage()
  }, [resetStorage])

  return { scanResult, uploadProgress, processInvoice, reset }
}
