/**
 * @fileoverview Funciones de formateo para presentación de datos.
 * Separa la lógica de display de los componentes React.
 */

/**
 * Formatea un número como moneda localizada.
 * @param amount - Valor numérico a formatear
 * @param currency - Código ISO 4217 (ej. EUR, USD)
 * @param locale - Locale de Intl (ej. 'es-ES', 'en-US')
 * @returns Cadena formateada (ej. "1.234,56 €")
 */
export function formatCurrency(
  amount: number,
  currency = 'EUR',
  locale = 'es-ES'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formatea una fecha ISO 8601 a formato largo localizado.
 * @param isoDate - Fecha en formato ISO 8601
 * @param locale - Locale de Intl
 * @returns Cadena legible (ej. "15 de enero de 2024")
 */
export function formatDate(isoDate: string, locale = 'es-ES'): string {
  const date = new Date(isoDate)
  if (isNaN(date.getTime())) return isoDate
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Formatea el tamaño de un archivo a unidades legibles.
 * @param bytes - Tamaño en bytes
 * @returns Cadena con unidad (ej. "2.4 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/**
 * Formatea un porcentaje para mostrar en UI.
 * @param rate - Valor decimal (ej. 0.21 para 21%)
 * @returns Cadena "21%"
 */
export function formatPercent(rate: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rate)
}

/**
 * Trunca un nombre de archivo largo para mostrarlo en UI.
 * @param name - Nombre completo del archivo
 * @param maxLength - Longitud máxima (defecto 30)
 * @returns Nombre truncado con ellipsis si es necesario
 */
export function truncateFileName(name: string, maxLength = 30): string {
  if (name.length <= maxLength) return name
  const ext = name.slice(name.lastIndexOf('.'))
  const base = name.slice(0, maxLength - ext.length - 3)
  return `${base}...${ext}`
}
