/**
 * @fileoverview Cliente HTTP para el webhook de n8n.
 * Encapsula la comunicación con el flujo de procesamiento de IA en n8n.
 * Aplica timeout, retry básico y normalización de errores.
 */

import { env } from '@/config/env'
import { N8N_TIMEOUT_MS } from '@/utils/constants'
import { logger } from '@/utils/logger'
import type { N8nWebhookPayload, N8nWebhookResponse } from './types'

/**
 * Envía un archivo al webhook de n8n para ser procesado por IA.
 * @param payload - Datos del archivo a procesar
 * @returns Respuesta del webhook con los datos extraídos
 * @throws {Error} Si el webhook falla o devuelve un error
 */
export async function processInvoiceWithAI(
  payload: N8nWebhookPayload
): Promise<N8nWebhookResponse> {
  logger.info('Enviando al webhook n8n', { fileName: payload.fileName }, 'n8n')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), N8N_TIMEOUT_MS)

  try {
    const response = await fetch(env.n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(
        `n8n respondió con status ${response.status}: ${text || 'Sin detalle'}`
      )
    }

    const data = (await response.json()) as N8nWebhookResponse

    if (!data.success) {
      throw new Error(data.error ?? 'n8n indicó fallo sin mensaje de error')
    }

    logger.info('Respuesta n8n recibida', data, 'n8n')
    return data
  } catch (err) {
    clearTimeout(timeoutId)

    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(
        `El procesamiento tardó más de ${N8N_TIMEOUT_MS / 1000}s. Inténtalo de nuevo.`
      )
    }

    logger.error('Error en webhook n8n', err, 'n8n')
    throw err
  }
}
