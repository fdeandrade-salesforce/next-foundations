/**
 * One-time script to import product variants into Supabase
 * 
 * Usage:
 *   npm run import:supabase:variants
 * 
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local (required)
 */

import { getSupabaseClient } from './supabaseClient'
import { mockProducts } from '../src/data/mock/products'
import { Product } from '../src/types'

const supabase = getSupabaseClient()

interface ProductVariantRow {
  id: string
  product_id: string
  color: string | null
  size: string | null
  sku: string | null
  price: number | null
  original_price: number | null
  stock_quantity: number | null
  in_stock: boolean | null
  image: string | null
}

/**
 * Transform products into variants
 * Creates variants based on colors and sizes arrays
 */
function transformProductsToVariants(products: Product[]): ProductVariantRow[] {
  const variants: ProductVariantRow[] = []
  let variantCounter = 1

  for (const product of products) {
    // If product has colors array, create a variant for each color
    if (product.colors && product.colors.length > 0) {
      for (const color of product.colors) {
        // If product has sizes, create variant for each color-size combination
        if (product.size && product.size.length > 0) {
          for (const size of product.size) {
            variants.push({
              id: `${product.id}-${color.toLowerCase()}-${size.toLowerCase()}`,
              product_id: product.id,
              color,
              size,
              sku: product.sku ? `${product.sku}-${color.substring(0, 3).toUpperCase()}-${size}` : null,
              price: product.price,
              original_price: product.originalPrice || null,
              stock_quantity: product.stockQuantity || null,
              in_stock: product.inStock ?? true,
              image: product.image || null,
            })
            variantCounter++
          }
        } else {
          // No sizes, just create variant for color
          variants.push({
            id: `${product.id}-${color.toLowerCase()}`,
            product_id: product.id,
            color,
            size: null,
            sku: product.sku ? `${product.sku}-${color.substring(0, 3).toUpperCase()}` : null,
            price: product.price,
            original_price: product.originalPrice || null,
            stock_quantity: product.stockQuantity || null,
            in_stock: product.inStock ?? true,
            image: product.image || null,
          })
          variantCounter++
        }
      }
    } else if (product.size && product.size.length > 0) {
      // No colors, but has sizes - create variant for each size
      for (const size of product.size) {
        variants.push({
          id: `${product.id}-${size.toLowerCase()}`,
          product_id: product.id,
          color: product.color || null,
          size,
          sku: product.sku ? `${product.sku}-${size}` : null,
          price: product.price,
          original_price: product.originalPrice || null,
          stock_quantity: product.stockQuantity || null,
          in_stock: product.inStock ?? true,
          image: product.image || null,
        })
        variantCounter++
      }
    } else {
      // No colors or sizes - create single variant for the product itself
      variants.push({
        id: `${product.id}-default`,
        product_id: product.id,
        color: product.color || null,
        size: null,
        sku: product.sku || null,
        price: product.price,
        original_price: product.originalPrice || null,
        stock_quantity: product.stockQuantity || null,
        in_stock: product.inStock ?? true,
        image: product.image || null,
      })
      variantCounter++
    }
  }

  return variants
}

async function importVariants() {
  console.log('🚀 Starting product variants import...\n')

  const variantRows = transformProductsToVariants(mockProducts)
  const attempted = variantRows.length
  const failures: Array<{ variantId: string; error: string }> = []

  console.log(`📦 Prepared ${attempted} variants from ${mockProducts.length} products\n`)

  // Upsert variants in chunks
  console.log('📤 Upserting variants...')
  const chunkSize = 100
  let upserted = 0

  for (let i = 0; i < variantRows.length; i += chunkSize) {
    const chunk = variantRows.slice(i, i + chunkSize)
    const { data, error } = await supabase
      .from('product_variants')
      .upsert(chunk, {
        onConflict: 'id',
        ignoreDuplicates: false,
      })
      .select('id')

    if (error) {
      console.error(`❌ Error upserting variants chunk ${Math.floor(i / chunkSize) + 1}:`, error.message)
      failures.push({
        variantId: `chunk-${Math.floor(i / chunkSize) + 1}`,
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
      console.log(`   - ${f.variantId}: ${f.error}`)
    })
  } else {
    console.log('\n✅ All variants imported successfully!')
  }
  console.log('='.repeat(60))
}

importVariants()
  .then(() => {
    console.log('\n✨ Import complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
