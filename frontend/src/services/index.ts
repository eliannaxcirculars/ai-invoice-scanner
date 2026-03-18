/**
 * @fileoverview Barrel de servicios — punto de entrada unificado para la capa de servicios.
 * Permite importar desde '@/services' en lugar de rutas largas.
 */

export { uploadInvoiceFile, deleteInvoiceFile } from './supabase/storage'
export { saveInvoice, fetchInvoices } from './supabase/database'
export { processInvoiceWithAI } from './n8n/client'
