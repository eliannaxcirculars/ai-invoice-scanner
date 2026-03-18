/**
 * @fileoverview Hook de utilidad para debounce de valores reactivos.
 * Útil para retrasar búsquedas o validaciones mientras el usuario escribe.
 */

import { useEffect, useState } from 'react'

/**
 * Retorna la versión "debounceda" de un valor.
 * El valor solo se actualiza cuando han pasado `delay` ms sin nuevos cambios.
 * @param value - Valor a debouncer
 * @param delay - Milisegundos de espera (defecto 300)
 * @returns El valor estabilizado tras el delay
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
