/**
 * @fileoverview Tabla de líneas de ítem de la factura.
 * Usa <table> semántico con roles ARIA para accesibilidad.
 */

import { formatCurrency } from '@/utils/formatters'
import type { Invoice } from '@/types/invoice.types'
import styles from './invoice.module.css'

interface ItemsTableProps {
  items: Invoice['items']
  currency: string
}

/**
 * Tabla accesible con las líneas de detalle de la factura.
 */
export function ItemsTable({ items, currency }: ItemsTableProps) {
  if (items.length === 0) {
    return (
      <p className={styles.emptyItems}>No se encontraron líneas de detalle.</p>
    )
  }

  return (
    <div className={styles.tableWrapper} role="region" aria-label="Líneas de factura">
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col" className={styles.thDescription}>Descripción</th>
            <th scope="col" className={styles.thNumber}>Cant.</th>
            <th scope="col" className={styles.thNumber}>Precio unit.</th>
            <th scope="col" className={styles.thNumber}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className={styles.tableRow}>
              <td className={styles.tdDescription}>{item.description}</td>
              <td className={styles.tdNumber}>{item.quantity}</td>
              <td className={styles.tdNumber}>
                {formatCurrency(item.unitPrice, currency)}
              </td>
              <td className={styles.tdNumber}>
                {formatCurrency(item.total, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
