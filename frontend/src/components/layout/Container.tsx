/**
 * @fileoverview Contenedor de ancho máximo centrado para el layout de la app.
 */

import type { ReactNode } from 'react'
import styles from './layout.module.css'

interface ContainerProps {
  children: ReactNode
  /** Ancho máximo aplicado; defecto 'md' (768px) */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Wrapper responsive que centra el contenido con padding lateral.
 */
export function Container({ children, size = 'md' }: ContainerProps) {
  return (
    <div className={`${styles.container} ${styles[`container--${size}`]}`}>
      {children}
    </div>
  )
}
