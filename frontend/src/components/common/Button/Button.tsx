/**
 * @fileoverview Componente Button reutilizable con variantes y estados.
 * Implementa accesibilidad completa: roles ARIA, indicador de carga, focus visible.
 */

import React from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual del botón */
  variant?: ButtonVariant
  /** Tamaño del botón */
  size?: ButtonSize
  /** Muestra un spinner y deshabilita el botón */
  isLoading?: boolean
  /** Icono a mostrar a la izquierda del texto */
  leftIcon?: React.ReactNode
  /** Texto descriptivo para el spinner (accesibilidad) */
  loadingText?: string
}

/**
 * Botón accesible con variantes visuales y estado de carga.
 * Acepta todas las props nativas de HTMLButtonElement.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      loadingText = 'Cargando...',
      disabled,
      className = '',
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        className={[
          styles.button,
          styles[variant],
          styles[size],
          isLoading ? styles.loading : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        {...rest}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            <span className="sr-only">{loadingText}</span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span className={styles.icon} aria-hidden="true">
                {leftIcon}
              </span>
            )}
            {children}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
