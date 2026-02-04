/**
 * One-time script to import stores into Supabase
 * 
 * Usage:
 *   npm run import:supabase:stores
 * 
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local (required)
 */

import { getSupabaseClient } from './supabaseClient'
import { mockStores } from '../src/data/mock/stores'

const supabase = getSupabaseClient()

interface StoreRow {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string | null
  email: string | null
  latitude: number | null
  longitude: number | null
  hours: any
  status: string
  distance: number | null
  pickup_time: string | null
}

function transformStoresToRows() {
  return mockStores.map(store => ({
    id: store.id,
    name: store.name,
    address: store.address,
    city: store.city,
    state: store.state,
    zip: store.zipCode,
    phone: store.phone || null,
    email: null,
    latitude: store.latitude || null,
    longitude: store.longitude || null,
    hours: typeof store.hours === 'string' ? { text: store.hours } : store.hours || null,
    status: store.isOpen ? 'open' : 'closed',
    distance: store.distance || null,
    pickup_time: store.pickupTime || null,
  }))
}

async function importStores() {
  console.log('🚀 Starting stores import...\n')

  const storeRows = transformStoresToRows()
  const attempted = storeRows.length
  const failures: Array<{ storeId: string; error: string }> = []

  console.log(`📦 Prepared ${attempted} stores\n`)

  // Upsert stores
  console.log('📤 Upserting stores...')
  const { data, error } = await supabase
    .from('stores')
    .upsert(storeRows, {
      onConflict: 'id',
      ignoreDuplicates: false,
    })
    .select('id')

  if (error) {
    console.error('❌ Error upserting stores:', error.message)
    failures.push({ storeId: 'bulk', error: error.message })
  }

  const upserted = data?.length || 0
  console.log(`✅ Upserted ${upserted} store(s)`)

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 IMPORT SUMMARY')
  console.log('='.repeat(60))
  console.log(`Attempted:             ${attempted}`)
  console.log(`Upserted:              ${upserted}`)
  console.log(`Failed:                ${failures.length}`)
  
  if (failures.length > 0) {
    console.log('\n❌ Failures:')
    failures.forEach(f => {
      console.log(`   - ${f.storeId}: ${f.error}`)
    })
  } else {
    console.log('\n✅ All stores imported successfully!')
  }
  console.log('='.repeat(60))
}

importStores()
  .then(() => {
    console.log('\n✨ Import complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
