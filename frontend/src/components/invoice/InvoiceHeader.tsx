/**
 * @fileoverview Cabecera de la factura con datos principales del documento.
 * Muestra número, fecha, emisor y receptor en un layout de dos columnas.
 */

import { formatDate } from '@/utils/formatters'
import type { Invoice } from '@/types/invoice.types'
import styles from './invoice.module.css'

interface InvoiceHeaderProps {
  invoice: Pick<Invoice, 'invoiceNumber' | 'issueDate' | 'dueDate' | 'vendor' | 'customer'>
}

/**
 * Sección de cabecera de factura con datos de emisor, receptor y fechas.
 */
export function InvoiceHeader({ invoice }: InvoiceHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <div>
          <p className={styles.label}>Factura Nº</p>
          <p className={styles.invoiceNumber}>{invoice.invoiceNumber}</p>
        </div>
        <div className={styles.dates}>
          <div>
            <p className={styles.label}>Fecha de emisión</p>
            <p className={styles.value}>{formatDate(invoice.issueDate)}</p>
          </div>
          {invoice.dueDate && (
            <div>
              <p className={styles.label}>Fecha de vencimiento</p>
              <p className={styles.value}>{formatDate(invoice.dueDate)}</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.parties}>
        <PartyBlock title="Emisor" party={invoice.vendor} />
        <PartyBlock title="Receptor" party={invoice.customer} />
      </div>
    </header>
  )
}

/** Sub-componente para bloque de datos de una parte (emisor/receptor) */
function PartyBlock({
  title,
  party,
}: {
  title: string
  party: Invoice['vendor']
}) {
  return (
    <div className={styles.partyBlock}>
      <p className={styles.partyTitle}>{title}</p>
      <p className={styles.partyName}>{party.name}</p>
      {party.taxId && <p className={styles.partyDetail}>NIF/CIF: {party.taxId}</p>}
      {party.address && <p className={styles.partyDetail}>{party.address}</p>}
      {party.email && (
        <a href={`mailto:${party.email}`} className={styles.partyEmail}>
          {party.email}
        </a>
      )}
    </div>
  )
}
