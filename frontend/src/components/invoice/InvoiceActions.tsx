/**
 * @fileoverview Barra de acciones sobre la factura procesada.
 * Permite ver el archivo original y escanear otra factura.
 */

import { Button } from '@/components/common/Button'
import styles from './invoice.module.css'

interface InvoiceActionsProps {
  /** URL del archivo original en Storage */
  fileUrl: string
  /** Callback para reiniciar y escanear otra factura */
  onScanAnother: () => void
}

/**
 * Acciones disponibles tras procesar una factura exitosamente.
 */
export function InvoiceActions({ fileUrl, onScanAnother }: InvoiceActionsProps) {
  return (
    <div className={styles.actionsBar} role="group" aria-label="Acciones de factura">
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.viewLink}
        aria-label="Ver archivo original de la factura en nueva pestaña"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Ver original
      </a>

      <Button
        variant="primary"
        size="md"
        onClick={onScanAnother}
        leftIcon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        }
      >
        Escanear otra factura
      </Button>
    </div>
  )
}
