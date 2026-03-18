/**
 * @fileoverview Barra de progreso accesible para seguimiento de subida.
 */

import styles from './upload.module.css'

interface ProgressBarProps {
  /** Valor de 0 a 100 */
  value: number
  /** Etiqueta para lectores de pantalla */
  label?: string
}

/**
 * Barra de progreso con animación suave y soporte ARIA completo.
 */
export function ProgressBar({
  value,
  label = 'Progreso de subida',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={styles.progressWrapper}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={styles.progressTrack}
      >
        <div
          className={styles.progressFill}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className={styles.progressLabel} aria-hidden="true">
        {clamped}%
      </span>
    </div>
  )
}
