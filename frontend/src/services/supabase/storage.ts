/**
 * @fileoverview Operaciones de Supabase Storage para facturas.
 * Abstrae los detalles del SDK de Supabase de la lógica de negocio.
 */

import { supabase } from './client'
import { STORAGE_BUCKET } from '@/utils/constants'
import { logger } from '@/utils/logger'
import type { StorageUploadResult } from '@/types/api.types'

/**
 * Sube un archivo a Supabase Storage y retorna la URL pública.
 * @param file - Archivo a subir (imagen o PDF)
 * @param bucket - Nombre del bucket (por defecto 'invoices')
 * @returns Promise con la URL pública y la ruta
 * @throws {Error} Si falla la subida o la obtención de la URL pública
 */
export async function uploadInvoiceFile(
  file: File,
  bucket = STORAGE_BUCKET
): Promise<StorageUploadResult> {
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${timestamp}_${safeName}`

  logger.info(`Subiendo archivo: ${path}`, { size: file.size }, 'storage')

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    logger.error('Error al subir archivo', uploadError, 'storage')
    throw new Error(`Error de almacenamiento: ${uploadError.message}`)
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  if (!urlData?.publicUrl) {
    throw new Error('No se pudo obtener la URL pública del archivo.')
  }

  logger.info('Archivo subido correctamente', { url: urlData.publicUrl }, 'storage')
  return { publicUrl: urlData.publicUrl, path }
}

/**
 * Elimina un archivo de Supabase Storage.
 * @param path - Ruta del archivo dentro del bucket
 * @param bucket - Nombre del bucket
 */
export async function deleteInvoiceFile(
  path: string,
  bucket = STORAGE_BUCKET
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) {
    logger.warn('No se pudo eliminar el archivo', { path, error }, 'storage')
  }
}
