/**
 * @fileoverview Operaciones CRUD sobre la tabla `invoices` de Supabase.
 * Mapea entre el modelo de dominio (Invoice) y las filas de la base de datos.
 */

import { supabase } from './client'
import { logger } from '@/utils/logger'
import type { Invoice } from '@/types/invoice.types'
import type { InvoiceRow } from '@/types/api.types'

/**
 * Transforma una fila de BD al modelo de dominio Invoice.
 * @param row - Fila cruda de la tabla invoices
 * @returns Objeto Invoice tipado
 */
function mapRowToInvoice(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    issueDate: row.issue_date,
    dueDate: row.due_date ?? undefined,
    vendor: {
      name: row.vendor_name,
      taxId: row.vendor_tax_id ?? undefined,
      address: row.vendor_address ?? undefined,
      email: row.vendor_email ?? undefined,
    },
    customer: {
      name: row.customer_name,
      taxId: row.customer_tax_id ?? undefined,
      address: row.customer_address ?? undefined,
      email: row.customer_email ?? undefined,
    },
    items: Array.isArray(row.items) ? (row.items as Invoice['items']) : [],
    subtotal: row.subtotal,
    taxRate: row.tax_rate,
    taxAmount: row.tax_amount,
    total: row.total,
    currency: row.currency,
    notes: row.notes ?? undefined,
    fileUrl: row.file_url,
    createdAt: row.created_at,
  }
}

/**
 * Guarda una factura procesada en la base de datos.
 * @param invoice - Datos de la factura a guardar (sin id ni createdAt)
 * @returns La factura guardada con su id asignado
 * @throws {Error} Si falla la inserción
 */
export async function saveInvoice(
  invoice: Omit<Invoice, 'id' | 'createdAt'>
): Promise<Invoice> {
  logger.info('Guardando factura en BD', { number: invoice.invoiceNumber }, 'database')

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      invoice_number: invoice.invoiceNumber,
      issue_date: invoice.issueDate,
      due_date: invoice.dueDate ?? null,
      vendor_name: invoice.vendor.name,
      vendor_tax_id: invoice.vendor.taxId ?? null,
      vendor_address: invoice.vendor.address ?? null,
      vendor_email: invoice.vendor.email ?? null,
      customer_name: invoice.customer.name,
      customer_tax_id: invoice.customer.taxId ?? null,
      customer_address: invoice.customer.address ?? null,
      customer_email: invoice.customer.email ?? null,
      items: invoice.items,
      subtotal: invoice.subtotal,
      tax_rate: invoice.taxRate,
      tax_amount: invoice.taxAmount,
      total: invoice.total,
      currency: invoice.currency,
      notes: invoice.notes ?? null,
      file_url: invoice.fileUrl,
    })
    .select()
    .single()

  if (error) {
    logger.error('Error al guardar factura', error, 'database')
    throw new Error(`Error de base de datos: ${error.message}`)
  }

  const savedInvoice = mapRowToInvoice(data as InvoiceRow)

  if (invoice.items.length > 0) {
    const itemRows = invoice.items.map((item) => ({
      invoice_id: savedInvoice.id,
      name: item.description,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: item.total,
    }))

    const { error: itemsError } = await supabase.from('invoice_items').insert(itemRows)

    if (itemsError) {
      logger.error('Error al guardar items de factura', itemsError, 'database')
      // No lanzamos error: la factura ya se guardó correctamente
    }
  }

  return savedInvoice
}

/**
 * Obtiene todas las facturas del usuario ordenadas por fecha descendente.
 * @returns Array de facturas
 */
export async function fetchInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Error al cargar facturas', error, 'database')
    throw new Error(`Error al cargar historial: ${error.message}`)
  }

  return (data as InvoiceRow[]).map(mapRowToInvoice)
}
