/**
 * @fileoverview Constantes globales de la aplicación.
 * Centraliza valores fijos para evitar magic strings/numbers.
 */

/** Tamaño máximo de archivo permitido: 10 MB */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

/** MIME types aceptados para facturas */
export const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const

/** Extensiones de archivo visibles para el usuario */
export const ACCEPTED_EXTENSIONS = '.jpg, .jpeg, .png, .webp, .pdf'

/** Nombre del bucket de Supabase Storage */
export const STORAGE_BUCKET = 'invoices'

/** Tiempo máximo de espera para el webhook de n8n (ms) */
export const N8N_TIMEOUT_MS = 60_000

/** Mensaje de error genérico para mostrar al usuario */
export const GENERIC_ERROR_MESSAGE =
  'Algo salió mal. Por favor, inténtalo de nuevo.'

/** Mensajes de estado del proceso */
export const STATUS_MESSAGES: Record<string, string> = {
  idle: 'Listo para escanear una factura',
  uploading: 'Subiendo archivo...',
  processing: 'La IA está analizando tu factura...',
  success: 'Factura procesada correctamente',
  error: 'Error al procesar la factura',
}
