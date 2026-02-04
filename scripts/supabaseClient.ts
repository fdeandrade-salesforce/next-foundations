/**
 * Shared Supabase client initialization for import scripts
 */

import { createClient } from '@supabase/supabase-js'

export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL is not set')
    console.error('   Please set it in .env.local')
    process.exit(1)
  }

  if (!supabaseServiceRoleKey) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is not set')
    console.error('   For bulk operations, SUPABASE_SERVICE_ROLE_KEY is required')
    console.error('   You can find it in Supabase Dashboard → Settings → API → service_role key')
    process.exit(1)
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  })
}
