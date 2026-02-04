/**
 * One-time script to import account data into Supabase
 * Imports: account_profiles, addresses, payment_methods, wishlists, wishlist_items
 * 
 * Usage:
 *   npm run import:supabase:accounts
 * 
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local (required)
 */

import { getSupabaseClient } from './supabaseClient'
import {
  mockCustomer,
  mockAddresses,
  mockPaymentMethods,
  mockWishlists,
} from '../src/data/mock/account'

const supabase = getSupabaseClient()

async function importAccounts() {
  console.log('🚀 Starting account data import...\n')

  const failures: Array<{ table: string; id: string; error: string }> = []
  let attempted = 0
  let upserted = 0

  // 1. Import account_profiles
  console.log('📤 Upserting account profiles...')
  attempted++
  const { data: profilesData, error: profilesError } = await supabase
    .from('account_profiles')
    .upsert({
      id: mockCustomer.id,
      email: mockCustomer.email,
      first_name: mockCustomer.firstName,
      last_name: mockCustomer.lastName,
      phone: mockCustomer.phone || null,
      date_of_birth: mockCustomer.dateOfBirth || null,
      gender: mockCustomer.gender || null,
    }, {
      onConflict: 'id',
      ignoreDuplicates: false,
    })
    .select('id')

  if (profilesError) {
    console.error('❌ Error upserting account profiles:', profilesError.message)
    failures.push({ table: 'account_profiles', id: mockCustomer.id, error: profilesError.message })
  } else {
    upserted += profilesData?.length || 0
    console.log(`✅ Upserted ${profilesData?.length || 0} account profile(s)`)
  }

  // 2. Import addresses
  console.log('\n📤 Upserting addresses...')
  const addressRows = mockAddresses.map(addr => ({
    id: addr.id,
    customer_id: addr.customerId,
    type: 'shipping', // Default type
    first_name: addr.firstName,
    last_name: addr.lastName,
    address_line1: addr.addressLine1,
    address_line2: addr.addressLine2 || null,
    city: addr.city,
    state: addr.state,
    zip: addr.zipCode,
    country: addr.country || 'US',
    phone: null,
    is_default: addr.isDefault || false,
  }))

  attempted += addressRows.length
  const { data: addressesData, error: addressesError } = await supabase
    .from('addresses')
    .upsert(addressRows, {
      onConflict: 'id',
      ignoreDuplicates: false,
    })
    .select('id')

  if (addressesError) {
    console.error('❌ Error upserting addresses:', addressesError.message)
    failures.push({ table: 'addresses', id: 'bulk', error: addressesError.message })
  } else {
    upserted += addressesData?.length || 0
    console.log(`✅ Upserted ${addressesData?.length || 0} address(es)`)
  }

  // 3. Import payment methods
  console.log('\n📤 Upserting payment methods...')
  const paymentRows = mockPaymentMethods.map(pm => ({
    id: pm.id,
    customer_id: pm.customerId,
    type: pm.type,
    last_four: pm.last4,
    brand: pm.type === 'visa' || pm.type === 'mastercard' ? pm.type : null,
    expiry_month: pm.expiryMonth || null,
    expiry_year: pm.expiryYear || null,
    is_default: pm.isDefault || false,
    billing_address_id: null, // Can be linked later if needed
  }))

  attempted += paymentRows.length
  const { data: paymentsData, error: paymentsError } = await supabase
    .from('payment_methods')
    .upsert(paymentRows, {
      onConflict: 'id',
      ignoreDuplicates: false,
    })
    .select('id')

  if (paymentsError) {
    console.error('❌ Error upserting payment methods:', paymentsError.message)
    failures.push({ table: 'payment_methods', id: 'bulk', error: paymentsError.message })
  } else {
    upserted += paymentsData?.length || 0
    console.log(`✅ Upserted ${paymentsData?.length || 0} payment method(s)`)
  }

  // 4. Import wishlists
  console.log('\n📤 Upserting wishlists...')
  const wishlistRows = mockWishlists.map(wl => ({
    id: wl.id,
    customer_id: wl.customerId,
    name: wl.name,
    is_default: wl.isDefault || false,
  }))

  attempted += wishlistRows.length
  const { data: wishlistsData, error: wishlistsError } = await supabase
    .from('wishlists')
    .upsert(wishlistRows, {
      onConflict: 'id',
      ignoreDuplicates: false,
    })
    .select('id')

  if (wishlistsError) {
    console.error('❌ Error upserting wishlists:', wishlistsError.message)
    failures.push({ table: 'wishlists', id: 'bulk', error: wishlistsError.message })
  } else {
    upserted += wishlistsData?.length || 0
    console.log(`✅ Upserted ${wishlistsData?.length || 0} wishlist(s)`)
  }

  // 5. Import wishlist_items
  console.log('\n📤 Upserting wishlist items...')
  const wishlistItemRows: Array<{ wishlist_id: string; product_id: string }> = []
  
  for (const wishlist of mockWishlists) {
    for (const item of wishlist.items || []) {
      wishlistItemRows.push({
        wishlist_id: wishlist.id,
        product_id: item.productId,
      })
    }
  }

  // Delete existing items for these wishlists first
  const wishlistIds = Array.from(new Set(wishlistItemRows.map(item => item.wishlist_id)))
  await supabase
    .from('wishlist_items')
    .delete()
    .in('wishlist_id', wishlistIds)

  attempted += wishlistItemRows.length
  const chunkSize = 100
  let itemsUpserted = 0

  for (let i = 0; i < wishlistItemRows.length; i += chunkSize) {
    const chunk = wishlistItemRows.slice(i, i + chunkSize)
    const { data, error } = await supabase
      .from('wishlist_items')
      .insert(chunk)
      .select('id')

    if (error) {
      console.error(`❌ Error inserting wishlist items chunk ${Math.floor(i / chunkSize) + 1}:`, error.message)
      failures.push({ table: 'wishlist_items', id: `chunk-${Math.floor(i / chunkSize) + 1}`, error: error.message })
    } else {
      itemsUpserted += data?.length || 0
    }
  }

  upserted += itemsUpserted
  console.log(`✅ Upserted ${itemsUpserted} wishlist item(s)`)

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
      console.log(`   - ${f.table} (${f.id}): ${f.error}`)
    })
  } else {
    console.log('\n✅ All account data imported successfully!')
  }
  console.log('='.repeat(60))
}

importAccounts()
  .then(() => {
    console.log('\n✨ Import complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
