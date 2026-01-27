/**
 * Supabase Review Repository Implementation
 */

import { IReviewRepository } from '../types'
import {
  Review,
  ReviewSummary,
  ReviewFilters,
  ReviewSortOption,
  PaginatedResult,
} from '../../../types'
import { getSupabaseClient } from '../../../lib/supabaseClient'

export class SupabaseReviewRepository implements IReviewRepository {
  async listReviews(
    productId: string,
    filters?: Omit<ReviewFilters, 'productId'>,
    sort: ReviewSortOption = 'newest',
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResult<Review>> {
    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('reviews')
        .select(`
          *,
          review_images(image_url)
        `, { count: 'exact' })
        .eq('product_id', productId)

      // Apply filters
      if (filters) {
        if (filters.rating) {
          query = query.eq('rating', filters.rating)
        }
        if (filters.verified !== undefined) {
          query = query.eq('verified', filters.verified)
        }
      }

      // Apply sorting
      switch (sort) {
        case 'highest':
          query = query.order('rating', { ascending: false })
          break
        case 'lowest':
          query = query.order('rating', { ascending: true })
          break
        case 'helpful':
          query = query.order('helpful', { ascending: false })
          break
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false })
      }

      // Apply pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      const total = count || 0
      const totalPages = Math.ceil(total / pageSize)

      return {
        items: this.mapReviews(data || []),
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      }
    } catch (error) {
      console.error('Error listing reviews:', error)
      return {
        items: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      }
    }
  }

  async getReviewSummary(productId: string): Promise<ReviewSummary> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('reviews')
        .select('rating, helpful')
        .eq('product_id', productId)

      if (error) throw error

      if (!data || data.length === 0) {
        return {
          productId,
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        }
      }

      const totalReviews = data.length
      const sumRating = data.reduce((sum, r: any) => sum + ((r as any).rating || 0), 0)
      const averageRating = totalReviews > 0 ? sumRating / totalReviews : 0

      const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      data.forEach((r: any) => {
        const rating = r.rating || 0
        if (rating >= 1 && rating <= 5) {
          ratingDistribution[rating as keyof typeof ratingDistribution]++
        }
      })

      return {
        productId,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingDistribution,
      }
    } catch (error) {
      console.error('Error fetching review summary:', error)
      return {
        productId,
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      }
    }
  }

  async getProductReviews(productId: string, limit?: number): Promise<Review[]> {
    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('reviews')
        .select(`
          *,
          review_images(image_url)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error

      return this.mapReviews(data || [])
    } catch (error) {
      console.error('Error fetching product reviews:', error)
      return []
    }
  }

  private mapReviews(rows: any[]): Review[] {
    return rows.map(row => ({
      id: row.id,
      productId: row.product_id,
      author: row.author,
      rating: row.rating,
      date: row.date,
      title: row.title,
      content: row.content,
      verified: row.verified,
      helpful: row.helpful,
      images: row.review_images?.map((img: any) => img.image_url) || undefined,
    }))
  }
}
