/**
 * @fileoverview Funciones de validación para entradas del usuario y archivos.
 * Aplica el principio de defensa en profundidad validando en la capa de presentación.
 */

import { ACCEPTED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from './constants'

/** Error tipado para fallos de validación */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Valida que un archivo sea apto para ser procesado como factura.
 * @param file - Archivo seleccionado por el usuario
 * @throws {ValidationError} Si el tipo o tamaño no son válidos
 */
export function validateInvoiceFile(file: File): void {
  if (!ACCEPTED_MIME_TYPES.includes(file.type as typeof ACCEPTED_MIME_TYPES[number])) {
    throw new ValidationError(
      `Tipo de archivo no permitido: ${file.type}. Acepta: JPG, PNG, WEBP, PDF.`
    )
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1)
    throw new ValidationError(
      `El archivo pesa ${sizeMB} MB. El máximo permitido es 10 MB.`
    )
  }
}

/**
 * Sanitiza un string eliminando caracteres potencialmente peligrosos.
 * Previene XSS básico en inputs de texto libre.
 * @param value - Cadena de texto a sanitizar
 * @returns Cadena sanitizada
 */
export function sanitizeString(value: string): string {
  return value
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 500)
}

/**
 * Comprueba si una URL es válida y segura (http/https).
 * @param url - URL a validar
 * @returns true si la URL es válida
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}
