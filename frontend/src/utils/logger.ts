/**
 * @fileoverview Logger profesional con niveles de log.
 * En producción silencia los logs de debug para no exponer información sensible.
 * En desarrollo muestra todos los niveles con contexto.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const isDev = import.meta.env.DEV

/**
 * Formatea el prefijo del log con timestamp y nivel.
 */
function buildPrefix(level: LogLevel, context?: string): string {
  const time = new Date().toISOString().slice(11, 23)
  const ctx = context ? ` [${context}]` : ''
  return `[${time}] ${level.toUpperCase()}${ctx}`
}

/** Interfaz pública del logger */
export const logger = {
  /**
   * Log de depuración — solo en desarrollo.
   * @param message - Mensaje principal
   * @param data - Datos adicionales opcionales
   * @param context - Nombre del módulo/hook emisor
   */
  debug(message: string, data?: unknown, context?: string): void {
    if (!isDev) return
    console.debug(buildPrefix('debug', context), message, data ?? '')
  },

  /**
   * Log informativo — solo en desarrollo.
   */
  info(message: string, data?: unknown, context?: string): void {
    if (!isDev) return
    console.info(buildPrefix('info', context), message, data ?? '')
  },

  /**
   * Advertencia — visible siempre.
   */
  warn(message: string, data?: unknown, context?: string): void {
    console.warn(buildPrefix('warn', context), message, data ?? '')
  },

  /**
   * Error crítico — visible siempre.
   */
  error(message: string, error?: unknown, context?: string): void {
    console.error(buildPrefix('error', context), message, error ?? '')
  },
}
