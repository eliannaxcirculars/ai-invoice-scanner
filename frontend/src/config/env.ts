/**
 * @fileoverview Validación y tipado de variables de entorno.
 * Falla en tiempo de arranque si falta alguna variable crítica,
 * evitando errores silenciosos en runtime.
 */

/**
 * Lee y valida una variable de entorno obligatoria.
 * @param key - Nombre de la variable de entorno
 * @throws {Error} Si la variable no está definida
 */
function requireEnv(key: string): string {
  const value = import.meta.env[key]
  if (!value) {
    throw new Error(
      `Variable de entorno requerida no encontrada: ${key}. ` +
        'Comprueba tu archivo .env'
    )
  }
  return value as string
}

/** Configuración de entorno tipada y validada */
export const env = {
  /** URL del proyecto Supabase */
  supabaseUrl: requireEnv('VITE_SUPABASE_URL'),

  /** Clave anónima pública de Supabase */
  supabaseAnonKey: requireEnv('VITE_SUPABASE_ANON_KEY'),

  /** URL del webhook de n8n para procesamiento de facturas */
  n8nWebhookUrl: requireEnv('VITE_N8N_WEBHOOK_URL'),

  /** Indica si estamos en modo desarrollo */
  isDev: import.meta.env.DEV,
} as const
