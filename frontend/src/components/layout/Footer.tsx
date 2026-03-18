/**
 * @fileoverview Footer de la aplicación con información del proyecto.
 */

import styles from './layout.module.css'

/**
 * Pie de página con créditos y año.
 */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer} role="contentinfo">
      <p className={styles.footerText}>
        © {year} AI Invoice Scanner — Examen técnico React
      </p>
    </footer>
  )
}
