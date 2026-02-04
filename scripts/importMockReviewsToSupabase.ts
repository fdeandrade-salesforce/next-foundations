/**
 * One-time script to import reviews into Supabase
 * Imports: reviews, review_images
 * 
 * Usage:
 *   npm run import:supabase:reviews
 * 
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local (required)
 */

import { getSupabaseClient } from './supabaseClient'
import { mockReviews } from '../src/data/mock/reviews'
import { Review } from '../src/types'

const supabase = getSupabaseClient()

async function importReviews() {
  console.log('🚀 Starting reviews import...\n')

  const failures: Array<{ table: string; id: string; error: string }> = []
  let attempted = 0
  let upserted = 0

  // 1. Import reviews
  console.log('📤 Upserting reviews...')
  const reviewRows = mockReviews.map(review => ({
    id: review.id,
    product_id: review.productId,
    author: review.author,
    rating: review.rating,
    date: review.date,
    title: review.title || null,
    content: review.content,
    verified: review.verified || false,
    helpful: review.helpful || 0,
  }))

  attempted += reviewRows.length
  const { data: reviewsData, error: reviewsError } = await supabase
    .from('reviews')
    .upsert(reviewRows, {
      onConflict: 'id',
      ignoreDuplicates: false,
    })
    .select('id')

  if (reviewsError) {
    console.error('❌ Error upserting reviews:', reviewsError.message)
    failures.push({ table: 'reviews', id: 'bulk', error: reviewsError.message })
  } else {
    upserted += reviewsData?.length || 0
    console.log(`✅ Upserted ${reviewsData?.length || 0} review(s)`)
  }

  // 2. Import review_images (if any exist in the mock data)
  // Note: The mock reviews don't seem to have images, but we'll handle it if they do
  console.log('\n📤 Checking for review images...')
  const reviewImageRows: Array<{ review_id: string; image_url: string }> = []

  // If reviews have images property, extract them
  for (const review of mockReviews) {
    if ('images' in review && Array.isArray((review as any).images)) {
      for (const imageUrl of (review as any).images) {
        reviewImageRows.push({
          review_id: review.id,
          image_url: imageUrl,
        })
      }
    }
  }

  if (reviewImageRows.length > 0) {
    // Delete existing images for these reviews first
    const reviewIds = Array.from(new Set(reviewImageRows.map(img => img.review_id)))
    await supabase
      .from('review_images')
      .delete()
      .in('review_id', reviewIds)

    attempted += reviewImageRows.length
    const chunkSize = 100
    let imagesUpserted = 0

    for (let i = 0; i < reviewImageRows.length; i += chunkSize) {
      const chunk = reviewImageRows.slice(i, i + chunkSize)
      const { data, error } = await supabase
        .from('review_images')
        .insert(chunk)
        .select('id')

      if (error) {
        console.error(`❌ Error inserting review images chunk ${Math.floor(i / chunkSize) + 1}:`, error.message)
        failures.push({ table: 'review_images', id: `chunk-${Math.floor(i / chunkSize) + 1}`, error: error.message })
      } else {
        imagesUpserted += data?.length || 0
      }
    }

    upserted += imagesUpserted
    console.log(`✅ Upserted ${imagesUpserted} review image(s)`)
  } else {
    console.log('ℹ️  No review images found in mock data')
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
      console.log(`   - ${f.table} (${f.id}): ${f.error}`)
    })
  } else {
    console.log('\n✅ All reviews imported successfully!')
  }
  console.log('='.repeat(60))
}

importReviews()
  .then(() => {
    console.log('\n✨ Import complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
