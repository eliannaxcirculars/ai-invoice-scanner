/**
 * @fileoverview Componente Loader con variantes de spinner y skeleton.
 * Provee feedback visual de carga accesible mediante aria-live y roles.
 */

import styles from './Loader.module.css'

interface SpinnerProps {
  /** Mensaje leído por lectores de pantalla */
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Spinner animado accesible.
 */
export function Spinner({ label = 'Cargando...', size = 'md' }: SpinnerProps) {
  return (
    <div
      className={`${styles.spinner} ${styles[size]}`}
      role="status"
      aria-label={label}
    >
      <div className={styles.ring} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

interface SkeletonProps {
  /** Ancho en CSS (ej. '100%', '200px') */
  width?: string
  /** Alto en CSS */
  height?: string
  /** Radio de borde redondeado */
  borderRadius?: string
}

/**
 * Placeholder animado tipo skeleton para contenido que está cargando.
 */
export function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-sm)',
}: SkeletonProps) {
  return (
    <div
      className={styles.skeleton}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  )
}

/**
 * Overlay de procesamiento a pantalla completa con mensaje contextual.
 */
export function ProcessingOverlay({ message }: { message: string }) {
  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      <div className={styles.overlayContent}>
        <Spinner size="lg" label={message} />
        <p className={styles.overlayMessage}>{message}</p>
      </div>
    </div>
  )
}
