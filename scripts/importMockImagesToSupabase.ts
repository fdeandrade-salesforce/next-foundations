/**
 * One-time script to import product images into Supabase
 * 
 * Usage:
 *   npm run import:supabase:images
 * 
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local (required)
 */

import { getSupabaseClient } from './supabaseClient'
import { mockProducts } from '../src/data/mock/products'
import { Product } from '../src/types'

const supabase = getSupabaseClient()

interface ProductImageRow {
  product_id: string
  image_url: string
  image_order: number
}

/**
 * Transform product images to product_images table rows
 */
function transformProductImages(products: Product[]): ProductImageRow[] {
  const imageRows: ProductImageRow[] = []

  for (const product of products) {
    const images = product.images && product.images.length > 0 
      ? product.images 
      : [product.image]
    
    images.forEach((imageUrl, index) => {
      imageRows.push({
        product_id: product.id,
        image_url: imageUrl,
        image_order: index,
      })
    })
  }

  return imageRows
}

async function importImages() {
  console.log('🚀 Starting product images import...\n')

  const imageRows = transformProductImages(mockProducts)
  const attempted = imageRows.length
  const failures: Array<{ productId: string; error: string }> = []

  console.log(`📦 Prepared ${attempted} images from ${mockProducts.length} products\n`)

  // Delete existing images for these products (to avoid duplicates)
  console.log('🗑️  Cleaning up existing product images...')
  const productIds = Array.from(new Set(imageRows.map(img => img.product_id)))
  const { error: deleteError } = await supabase
    .from('product_images')
    .delete()
    .in('product_id', productIds)

  if (deleteError) {
    console.warn('⚠️  Warning deleting existing images:', deleteError.message)
  } else {
    console.log('✅ Cleaned up existing images')
  }

  // Insert product images in chunks
  console.log('\n📤 Inserting product images...')
  const chunkSize = 100
  let upserted = 0

  for (let i = 0; i < imageRows.length; i += chunkSize) {
    const chunk = imageRows.slice(i, i + chunkSize)
    const { data, error } = await supabase
      .from('product_images')
      .insert(chunk)
      .select('id')

    if (error) {
      console.error(`❌ Error inserting images chunk ${Math.floor(i / chunkSize) + 1}:`, error.message)
      failures.push({
        productId: `chunk-${Math.floor(i / chunkSize) + 1}`,
        error: error.message,
      })
    } else {
      upserted += data?.length || 0
    }
  }

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
      console.log(`   - ${f.productId}: ${f.error}`)
    })
  } else {
    console.log('\n✅ All images imported successfully!')
  }
  console.log('='.repeat(60))
}

importImages()
  .then(() => {
    console.log('\n✨ Import complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
