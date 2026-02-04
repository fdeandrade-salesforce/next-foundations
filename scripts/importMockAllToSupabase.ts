/**
 * Master script to import ALL mock data into Supabase in correct dependency order
 * 
 * Usage:
 *   npm run import:supabase:all
 * 
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local (required)
 * 
 * Import order:
 *   1. Products (must exist first)
 *   2. Variants (depends on products)
 *   3. Images (depends on products)
 *   4. Accounts (account_profiles)
 *   5. Addresses (depends on account_profiles)
 *   6. Payment methods (depends on account_profiles)
 *   7. Wishlists (depends on account_profiles)
 *   8. Wishlist items (depends on wishlists and products)
 *   9. Stores
 *   10. Orders (depends on account_profiles)
 *   11. Shipping groups (depends on orders)
 *   12. Order items (depends on orders and products)
 *   13. Reviews (depends on products)
 *   14. Review images (depends on reviews)
 */

import { execSync } from 'child_process'
import { getSupabaseClient } from './supabaseClient'

const supabase = getSupabaseClient()

const importSteps = [
  { name: 'Products', script: 'import:supabase:products' },
  { name: 'Variants', script: 'import:supabase:variants' },
  { name: 'Images', script: 'import:supabase:images' },
  { name: 'Accounts', script: 'import:supabase:accounts' },
  { name: 'Stores', script: 'import:supabase:stores' },
  { name: 'Orders', script: 'import:supabase:orders' },
  { name: 'Reviews', script: 'import:supabase:reviews' },
]

async function importAll() {
  console.log('🚀 Starting full mock data import...\n')
  console.log('='.repeat(60))
  console.log('This will import all mock data in the correct dependency order')
  console.log('='.repeat(60))
  console.log()

  const results: Array<{ name: string; success: boolean; error?: string }> = []

  for (const step of importSteps) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📦 Step: ${step.name}`)
    console.log('='.repeat(60))
    
    try {
      execSync(`npm run ${step.script}`, {
        stdio: 'inherit',
        cwd: process.cwd(),
      })
      results.push({ name: step.name, success: true })
      console.log(`\n✅ ${step.name} imported successfully`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      results.push({ name: step.name, success: false, error: errorMessage })
      console.error(`\n❌ ${step.name} failed: ${errorMessage}`)
      // Continue with next step even if one fails
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 FINAL IMPORT SUMMARY')
  console.log('='.repeat(60))
  
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length

  console.log(`\n✅ Successful: ${successful}/${results.length}`)
  console.log(`❌ Failed: ${failed}/${results.length}`)
  
  if (failed > 0) {
    console.log('\n❌ Failed steps:')
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`   - ${r.name}: ${r.error}`)
      })
  }

  console.log('\n' + '='.repeat(60))
  console.log('✨ Full import process complete!')
  console.log('='.repeat(60))
}

importAll()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
