/**
 * One-time script to import mock product catalog into Supabase
 * 
 * Usage:
 *   npm run import:supabase:products
 * 
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local (for bulk upsert)
 */

import { getSupabaseClient } from './supabaseClient'
import { mockProducts } from '../src/data/mock/products'
import { Product } from '../src/types'

const supabase = getSupabaseClient()

interface ProductRow {
  id: string
  name: string
  brand: string | null
  price: number
  original_price: number | null
  image: string
  category: string
  subcategory: string
  color: string | null
  in_stock: boolean
  stock_quantity: number | null
  store_available: boolean | null
  rating: number | null
  review_count: number | null
  is_new: boolean | null
  is_best_seller: boolean | null
  is_online_only: boolean | null
  is_limited_edition: boolean | null
  variants: number | null
  sku: string | null
  short_description: string | null
  discount_percentage: number | null
  percent_off: number | null
  promotional_message: string | null
  description: string | null
  key_benefits: string[] | null
  ingredients: string[] | null
  usage_instructions: string[] | null
  care_instructions: string[] | null
  technical_specs: Record<string, any> | null
  scents: string[] | null
  capacities: string[] | null
  delivery_estimate: string | null
  returns_policy: string | null
  warranty: string | null
  videos: string[] | null
}

interface ProductImageRow {
  product_id: string
  image_url: string
  image_order: number
}

/**
 * Transform a Product domain type to a Supabase products table row
 */
function transformProductToRow(product: Product): ProductRow {
  // Calculate discount percentage if originalPrice exists
  let discountPercentage: number | null = null
  let percentOff: number | null = null
  if (product.originalPrice && product.originalPrice > product.price) {
    const discount = product.originalPrice - product.price
    discountPercentage = Math.round((discount / product.originalPrice) * 100)
    percentOff = discountPercentage
  }

  return {
    id: product.id,
    name: product.name,
    brand: product.brand || null,
    price: product.price,
    original_price: product.originalPrice || null,
    image: product.image,
    category: product.category,
    subcategory: product.subcategory,
    color: product.color || null,
    in_stock: product.inStock ?? true,
    stock_quantity: product.stockQuantity ?? null,
    store_available: product.storeAvailable ?? null,
    rating: product.rating ?? null,
    review_count: product.reviewCount ?? null,
    is_new: product.isNew ?? null,
    is_best_seller: product.isBestSeller ?? null,
    is_online_only: product.isOnlineOnly ?? null,
    is_limited_edition: product.isLimitedEdition ?? null,
    variants: product.variants ?? null,
    sku: product.sku || null,
    short_description: product.shortDescription || null,
    discount_percentage: discountPercentage,
    percent_off: percentOff,
    promotional_message: product.promotionalMessage || null,
    description: product.description || null,
    key_benefits: product.keyBenefits || null,
    ingredients: product.ingredients || null,
    usage_instructions: product.usageInstructions || null,
    care_instructions: product.careInstructions || null,
    technical_specs: product.technicalSpecs || null,
    scents: product.scents || null,
    capacities: product.capacities || null,
    delivery_estimate: product.deliveryEstimate || null,
    returns_policy: product.returnsPolicy || null,
    warranty: product.warranty || null,
    videos: product.videos || null,
  }
}

/**
 * Transform product images to product_images table rows
 */
function transformProductImages(product: Product): ProductImageRow[] {
  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.image]
  
  return images.map((imageUrl, index) => ({
    product_id: product.id,
    image_url: imageUrl,
    image_order: index,
  }))
}

/**
 * Main import function
 */
async function importProducts() {
  console.log('🚀 Starting product import...\n')
  console.log(`📦 Mock catalog size: ${mockProducts.length} products\n`)

  const productRows: ProductRow[] = []
  const imageRows: ProductImageRow[] = []
  const failures: Array<{ productId: string; error: string }> = []

  // Transform all products
  for (const product of mockProducts) {
    try {
      productRows.push(transformProductToRow(product))
      imageRows.push(...transformProductImages(product))
    } catch (error) {
      failures.push({
        productId: product.id,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  console.log(`✅ Transformed ${productRows.length} products`)
  console.log(`✅ Prepared ${imageRows.length} product images\n`)

  // Upsert products (by id, no duplicates)
  console.log('📤 Upserting products...')
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .upsert(productRows, {
      onConflict: 'id',
      ignoreDuplicates: false,
    })
    .select('id')

  if (productsError) {
    console.error('❌ Error upserting products:', productsError)
    failures.push({
      productId: 'bulk',
      error: productsError.message,
    })
  } else {
    console.log(`✅ Upserted ${productsData?.length || 0} products`)
  }

  // Delete existing images for these products (to avoid duplicates)
  console.log('\n🗑️  Cleaning up existing product images...')
  const productIds = productRows.map(p => p.id)
  const { error: deleteError } = await supabase
    .from('product_images')
    .delete()
    .in('product_id', productIds)

  if (deleteError) {
    console.warn('⚠️  Warning deleting existing images:', deleteError.message)
  } else {
    console.log('✅ Cleaned up existing images')
  }

  // Insert product images
  console.log('\n📤 Inserting product images...')
  
  // Supabase has a limit on batch size, so we'll chunk the inserts
  const chunkSize = 100
  let imagesInserted = 0
  
  for (let i = 0; i < imageRows.length; i += chunkSize) {
    const chunk = imageRows.slice(i, i + chunkSize)
    const { data: imagesData, error: imagesError } = await supabase
      .from('product_images')
      .insert(chunk)
      .select('id')

    if (imagesError) {
      console.error(`❌ Error inserting images chunk ${i / chunkSize + 1}:`, imagesError)
      failures.push({
        productId: 'images',
        error: `Chunk ${i / chunkSize + 1}: ${imagesError.message}`,
      })
    } else {
      imagesInserted += imagesData?.length || 0
    }
  }

  console.log(`✅ Inserted ${imagesInserted} product images`)

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 IMPORT SUMMARY')
  console.log('='.repeat(60))
  console.log(`Mock catalog size:     ${mockProducts.length}`)
  console.log(`Products upserted:     ${productsData?.length || 0}`)
  console.log(`Product images:        ${imagesInserted}`)
  console.log(`Failures:              ${failures.length}`)
  
  if (failures.length > 0) {
    console.log('\n❌ Failures:')
    failures.forEach(f => {
      console.log(`   - ${f.productId}: ${f.error}`)
    })
  } else {
    console.log('\n✅ All products imported successfully!')
  }
  console.log('='.repeat(60))
  console.log('\n💡 Verify with: SELECT COUNT(*) FROM products;')
  console.log('💡 Expected count:', mockProducts.length)
}

// Run the import
importProducts()
  .then(() => {
    console.log('\n✨ Import complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
