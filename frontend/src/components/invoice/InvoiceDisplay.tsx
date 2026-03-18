/**
 * @fileoverview Componente contenedor que muestra la factura completa procesada.
 * Compone InvoiceHeader + ItemsTable + totales + InvoiceActions.
 */

import { formatCurrency, formatPercent } from '@/utils/formatters'
import { InvoiceHeader } from './InvoiceHeader'
import { ItemsTable } from './ItemsTable'
import { InvoiceActions } from './InvoiceActions'
import type { Invoice } from '@/types/invoice.types'
import styles from './invoice.module.css'

interface InvoiceDisplayProps {
  invoice: Invoice
  onScanAnother: () => void
}

/**
 * Vista completa de una factura procesada.
 * Compone todas las secciones usando componentes especializados.
 */
export function InvoiceDisplay({ invoice, onScanAnother }: InvoiceDisplayProps) {
  return (
    <article className={styles.invoiceCard} aria-label={`Factura ${invoice.invoiceNumber}`}>
      {/* Badge de éxito */}
      <div className={styles.successBadge} role="status">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        Factura procesada correctamente
      </div>

      <InvoiceHeader invoice={invoice} />

      <section aria-label="Líneas de detalle">
        <h3 className={styles.sectionTitle}>Detalles</h3>
        <ItemsTable items={invoice.items} currency={invoice.currency} />
      </section>

      <section className={styles.totalsSection} aria-label="Resumen de totales">
        <TotalRow label="Subtotal" value={formatCurrency(invoice.subtotal, invoice.currency)} />
        <TotalRow
          label={`IVA (${formatPercent(invoice.taxRate)})`}
          value={formatCurrency(invoice.taxAmount, invoice.currency)}
        />
        <TotalRow
          label="Total"
          value={formatCurrency(invoice.total, invoice.currency)}
          isTotal
        />
      </section>

      {invoice.notes && (
        <section className={styles.notesSection} aria-label="Notas">
          <p className={styles.label}>Notas</p>
          <p className={styles.notesText}>{invoice.notes}</p>
        </section>
      )}

      <InvoiceActions fileUrl={invoice.fileUrl} onScanAnother={onScanAnother} />
    </article>
  )
}

/** Fila de total en el resumen */
function TotalRow({
  label,
  value,
  isTotal = false,
}: {
  label: string
  value: string
  isTotal?: boolean
}) {
  return (
    <div className={`${styles.totalRow} ${isTotal ? styles.grandTotal : ''}`}>
      <span className={styles.totalLabel}>{label}</span>
      <span className={styles.totalValue}>{value}</span>
    </div>
  )
}
