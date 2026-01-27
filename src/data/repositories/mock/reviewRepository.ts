/**
 * Mock Review Repository Implementation
 */

import { IReviewRepository } from '../types'
import {
  Review,
  ReviewSummary,
  ReviewFilters,
  ReviewSortOption,
  PaginatedResult,
} from '../../../types'
import { mockReviews, generateReviewSummary } from '../../mock'

export class MockReviewRepository implements IReviewRepository {
  async listReviews(
    productId: string,
    filters?: Omit<ReviewFilters, 'productId'>,
    sort: ReviewSortOption = 'newest',
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResult<Review>> {
    let filtered = mockReviews.filter((r) => r.productId === productId)

    // Apply filters
    if (filters) {
      if (filters.rating) {
        filtered = filtered.filter((r) => Math.round(r.rating) === filters.rating)
      }

      if (filters.verified !== undefined) {
        filtered = filtered.filter((r) => r.verified === filters.verified)
      }

      if (filters.hasImages) {
        filtered = filtered.filter((r) => r.images && r.images.length > 0)
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (r) =>
            r.title.toLowerCase().includes(query) ||
            r.content.toLowerCase().includes(query) ||
            r.author.toLowerCase().includes(query)
        )
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'highest':
          return b.rating - a.rating
        case 'lowest':
          return a.rating - b.rating
        case 'helpful':
          return b.helpful - a.helpful
        default:
          return 0
      }
    })

    // Apply pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const items = filtered.slice(startIndex, endIndex)

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    }
  }

  async getReviewSummary(productId: string): Promise<ReviewSummary> {
    return generateReviewSummary(productId)
  }

  async getProductReviews(productId: string, limit: number = 10): Promise<Review[]> {
    return mockReviews
      .filter((r) => r.productId === productId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
  }
}
