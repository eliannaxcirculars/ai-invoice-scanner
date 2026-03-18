/**
 * @fileoverview Tipos e interfaces para el modelo de factura.
 * Define la estructura de datos que extrae la IA desde las facturas.
 */

/** Línea de ítem dentro de una factura */
export interface InvoiceItem {
  /** Descripción del producto o servicio */
  description: string
  /** Cantidad del ítem */
  quantity: number
  /** Precio unitario */
  unitPrice: number
  /** Importe total de la línea (quantity × unitPrice) */
  total: number
}

/** Información del emisor o receptor de la factura */
export interface InvoiceParty {
  /** Nombre o razón social */
  name: string
  /** NIF / CIF / RFC / RUT u otro identificador fiscal */
  taxId?: string
  /** Dirección completa */
  address?: string
  /** Correo electrónico de contacto */
  email?: string
}

/** Datos completos de una factura procesada por IA */
export interface Invoice {
  /** Identificador único generado por Supabase */
  id: string
  /** Número de factura tal como aparece en el documento */
  invoiceNumber: string
  /** Fecha de emisión en formato ISO 8601 */
  issueDate: string
  /** Fecha de vencimiento en formato ISO 8601 (opcional) */
  dueDate?: string
  /** Datos del emisor */
  vendor: InvoiceParty
  /** Datos del receptor */
  customer: InvoiceParty
  /** Líneas de detalle */
  items: InvoiceItem[]
  /** Subtotal antes de impuestos */
  subtotal: number
  /** Porcentaje de IVA/impuesto aplicado */
  taxRate: number
  /** Monto de IVA/impuesto */
  taxAmount: number
  /** Total final a pagar */
  total: number
  /** Moneda en código ISO 4217 (ej. EUR, USD, MXN) */
  currency: string
  /** Notas o comentarios adicionales */
  notes?: string
  /** URL del archivo original en Supabase Storage */
  fileUrl: string
  /** Timestamp de creación en base de datos */
  createdAt: string
}

/** Estado del ciclo de vida del procesamiento */
export type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error'

/** Resultado del proceso completo de escaneo */
export interface InvoiceScanResult {
  status: ProcessingStatus
  invoice: Invoice | null
  error: string | null
  /** Progreso de subida de 0 a 100 */
  uploadProgress: number
}
