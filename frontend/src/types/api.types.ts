/**
 * @fileoverview Tipos para las respuestas y peticiones de las APIs externas.
 * Incluye contratos para n8n webhook y Supabase.
 */

import type { Invoice } from './invoice.types'

/** Respuesta estándar envuelta en un wrapper de resultado */
export interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
}

/** Error normalizado de API */
export interface ApiError {
  message: string
  code?: string
  /** HTTP status code */
  status?: number
}

/** Payload enviado al webhook de n8n */
export interface N8nWebhookPayload {
  /** URL pública del archivo en Supabase Storage */
  fileUrl: string
  /** Nombre original del archivo */
  fileName: string
  /** MIME type del archivo */
  mimeType: string
  /** Timestamp de la petición */
  timestamp: string
}

/** Respuesta del webhook de n8n tras procesar la factura */
export interface N8nWebhookResponse {
  /** Si el procesamiento fue exitoso */
  success: boolean
  /** Datos de la factura extraídos por la IA */
  invoice?: Partial<Invoice>
  /** Mensaje de error si success = false */
  error?: string
}

/** Fila en la tabla `invoices` de Supabase */
export interface InvoiceRow {
  id: string
  invoice_number: string
  issue_date: string
  due_date: string | null
  vendor_name: string
  vendor_tax_id: string | null
  vendor_address: string | null
  vendor_email: string | null
  customer_name: string
  customer_tax_id: string | null
  customer_address: string | null
  customer_email: string | null
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  currency: string
  notes: string | null
  file_url: string
  items: unknown
  created_at: string
}

/** Resultado de subida de un archivo a Supabase Storage */
export interface StorageUploadResult {
  /** URL pública del archivo subido */
  publicUrl: string
  /** Ruta relativa dentro del bucket */
  path: string
}
