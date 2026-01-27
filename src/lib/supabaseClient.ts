/**
 * Supabase Client
 * 
 * Creates and exports a singleton Supabase client instance.
 * Uses environment variables for configuration.
 * 
 * Note: This will throw an error if env vars are missing and DATA_PROVIDER=supabase.
 * The error is caught in src/data/index.ts to provide a clear message.
 */

import { createClient } from '@supabase/supabase-js'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only validate if we're actually using Supabase provider
// This allows the module to load even if env vars are missing (when using mock)
let supabase: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set:\n' +
      '  - NEXT_PUBLIC_SUPABASE_URL\n' +
      '  - NEXT_PUBLIC_SUPABASE_ANON_KEY\n\n' +
      'You can find these in your Supabase project settings under API.\n' +
      'Or set DATA_PROVIDER=mock to use mock data instead.'
    )
  }

  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // We're using our own auth system
      },
    })
  }

  return supabase
}

// Export for backward compatibility (will throw if env vars missing)
export { getSupabaseClient as supabase }
