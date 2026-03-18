/**
 * @fileoverview Singleton del cliente Supabase.
 * Se instancia una sola vez para toda la aplicación (patrón Singleton),
 * evitando múltiples conexiones innecesarias.
 */

import { createClient } from '@supabase/supabase-js'
import { env } from '@/config/env'

/**
 * Cliente Supabase compartido en toda la app.
 * Importa este objeto en lugar de llamar a createClient() en cada módulo.
 */
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey)
