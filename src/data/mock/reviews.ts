/**
 * Mock Review Data
 * 
 * This file contains all review data used in the application.
 * In production, this would be fetched from Supabase.
 */

import { Review, ReviewSummary } from '../../types'

// ============================================================================
// MOCK REVIEWS
// ============================================================================

export const mockReviews: Review[] = [
  {
    id: '1',
    productId: 'pure-cube-white',
    author: 'Name A.',
    rating: 5,
    date: 'June 2022',
    title: 'Excellent quality',
    content: 'Absolutely love this product! The quality is outstanding and it looks even better in person. Highly recommend to anyone looking for premium design.',
    verified: true,
    helpful: 24,
  },
  {
    id: '2',
    productId: 'pure-cube-white',
    author: 'Sarah M.',
    rating: 4,
    date: 'May 2022',
    title: 'Great design',
    content: 'Beautiful geometric form that fits perfectly in my living space. The craftsmanship is impeccable. Only giving 4 stars because shipping took a bit longer than expected.',
    verified: true,
    helpful: 18,
  },
  {
    id: '3',
    productId: 'pure-cube-white',
    author: 'John D.',
    rating: 5,
    date: 'April 2022',
    title: 'Perfect addition',
    content: 'Exactly what I was looking for. The minimalist design adds elegance to any room. Worth every penny!',
    verified: false,
    helpful: 12,
  },
  {
    id: '4',
    productId: 'pure-cube-white',
    author: 'Emily R.',
    rating: 5,
    date: 'March 2022',
    title: 'Stunning piece',
    content: 'This exceeded my expectations. The attention to detail is remarkable and it photographs beautifully. Already planning to buy more from this collection.',
    verified: true,
    helpful: 31,
  },
  {
    id: '5',
    productId: 'pure-cube-white',
    author: 'Michael T.',
    rating: 3,
    date: 'February 2022',
    title: 'Good but pricey',
    content: 'Nice quality overall but I expected more for the price. The finish could be smoother in some areas.',
    verified: true,
    helpful: 8,
  },
  {
    id: '6',
    productId: 'pure-cube-white',
    author: 'Lisa K.',
    rating: 5,
    date: 'January 2022',
    title: 'Love it!',
    content: 'Perfect for my modern apartment. Gets compliments from everyone who visits. The size is just right.',
    verified: true,
    helpful: 15,
  },
  {
    id: '7',
    productId: 'pure-cube-white',
    author: 'David W.',
    rating: 4,
    date: 'December 2021',
    title: 'Solid purchase',
    content: 'Well made and looks great. Packaging was excellent and it arrived without any damage.',
    verified: false,
    helpful: 6,
  },
  {
    id: '8',
    productId: 'pure-cube-white',
    author: 'Anna P.',
    rating: 2,
    date: 'November 2021',
    title: 'Not as expected',
    content: 'The color was slightly different from the photos. Otherwise the quality is decent.',
    verified: true,
    helpful: 4,
  },
  // Reviews for other products
  {
    id: '9',
    productId: 'steady-prism',
    author: 'Chris L.',
    rating: 5,
    date: 'September 2024',
    title: 'Absolutely stunning',
    content: 'The Steady Prism is a masterpiece. It catches light beautifully and adds dimension to any space.',
    verified: true,
    helpful: 20,
  },
  {
    id: '10',
    productId: 'vertical-set',
    author: 'Michelle B.',
    rating: 5,
    date: 'August 2024',
    title: 'Best purchase this year',
    content: 'The Vertical Set exceeded all my expectations. The pieces stack perfectly and the quality is museum-grade.',
    verified: true,
    helpful: 45,
  },
  {
    id: '11',
    productId: 'fusion-block',
    author: 'Robert H.',
    rating: 4,
    date: 'July 2024',
    title: 'Great modular system',
    content: 'Love the versatility of the Fusion Block. Can rearrange it different ways. Took a star off for the instruction clarity.',
    verified: true,
    helpful: 22,
  },
  {
    id: '12',
    productId: 'signature-form-white',
    author: 'Jennifer S.',
    rating: 5,
    date: 'September 2024',
    title: 'Premium quality',
    content: 'Worth every penny. The Signature Form is the centerpiece of my living room now. Impeccable craftsmanship.',
    verified: true,
    helpful: 38,
  },
]

// ============================================================================
// HELPER: Generate Review Summary for a Product
// ============================================================================

export function generateReviewSummary(productId: string): ReviewSummary {
  const productReviews = mockReviews.filter((r) => r.productId === productId)
  
  if (productReviews.length === 0) {
    return {
      productId,
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      aiSummary: undefined,
    }
  }

  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let totalRating = 0

  productReviews.forEach((review) => {
    const rounded = Math.round(review.rating) as 1 | 2 | 3 | 4 | 5
    if (rounded >= 1 && rounded <= 5) {
      ratingDistribution[rounded]++
    }
    totalRating += review.rating
  })

  const averageRating = totalRating / productReviews.length

  return {
    productId,
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: productReviews.length,
    ratingDistribution,
    aiSummary: undefined, // Placeholder for AI-generated summary
  }
}

// Pre-computed review summaries for common products
export const mockReviewSummaries: Record<string, ReviewSummary> = {
  'pure-cube-white': generateReviewSummary('pure-cube-white'),
  'steady-prism': generateReviewSummary('steady-prism'),
  'vertical-set': generateReviewSummary('vertical-set'),
  'fusion-block': generateReviewSummary('fusion-block'),
  'signature-form-white': generateReviewSummary('signature-form-white'),
}
