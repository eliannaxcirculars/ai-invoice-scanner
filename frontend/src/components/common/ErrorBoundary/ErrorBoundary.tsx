/**
 * @fileoverview Error Boundary de clase para capturar errores de render de React.
 * Muestra un UI de fallback en lugar de romper toda la aplicación.
 * Los Error Boundaries deben ser componentes de clase (limitación de React).
 */

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { logger } from '@/utils/logger'
import styles from './ErrorBoundary.module.css'

interface Props {
  children: ReactNode
  /** Componente alternativo personalizado a mostrar en error */
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Captura cualquier error durante el render y muestra un fallback amigable.
 * Loggea el error para diagnóstico.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('ErrorBoundary capturó un error', { error, info }, 'ErrorBoundary')
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className={styles.container} role="alert">
          <div className={styles.icon} aria-hidden="true">⚠️</div>
          <h2 className={styles.title}>Algo salió mal</h2>
          <p className={styles.message}>
            {this.state.error?.message ?? 'Error desconocido'}
          </p>
          <button className={styles.retry} onClick={this.handleReset}>
            Intentar de nuevo
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
