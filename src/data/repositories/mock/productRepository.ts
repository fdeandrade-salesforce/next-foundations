/**
 * Mock Product Repository Implementation
 */

import { IProductRepository } from '../types'
import {
  Product,
  ProductFilters,
  ProductSortOption,
  PaginatedResult,
  PriceRange,
  Inventory,
} from '../../../types'
import { mockProducts, categoryMappings } from '../../mock'

export class MockProductRepository implements IProductRepository {
  async getAllProducts(): Promise<Product[]> {
    return mockProducts
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return mockProducts.find((p) => p.id === id)
  }

  async listProducts(
    filters?: ProductFilters,
    sort: ProductSortOption = 'relevance',
    page: number = 1,
    pageSize: number = 24
  ): Promise<PaginatedResult<Product>> {
    let filtered = [...mockProducts]

    // Apply filters
    if (filters) {
      if (filters.category) {
        const allowedCategories = categoryMappings[filters.category] || []
        if (allowedCategories.length > 0) {
          filtered = filtered.filter((p) => allowedCategories.includes(p.category))
        }
      }

      if (filters.subcategory) {
        filtered = filtered.filter(
          (p) => p.subcategory.toLowerCase() === filters.subcategory!.toLowerCase()
        )
      }

      if (filters.priceRange) {
        filtered = filtered.filter(
          (p) => p.price >= filters.priceRange![0] && p.price <= filters.priceRange![1]
        )
      }

      if (filters.sizes && filters.sizes.length > 0) {
        filtered = filtered.filter((p) => p.size?.some((s) => filters.sizes!.includes(s)))
      }

      if (filters.colors && filters.colors.length > 0) {
        filtered = filtered.filter((p) => p.color && filters.colors!.includes(p.color))
      }

      if (filters.inStockOnly) {
        filtered = filtered.filter((p) => p.inStock)
      }

      if (filters.isNew) {
        filtered = filtered.filter((p) => p.isNew)
      }

      if (filters.onSale) {
        filtered = filtered.filter((p) => p.originalPrice && p.originalPrice > p.price)
      }

      if (filters.brand) {
        filtered = filtered.filter((p) => p.brand === filters.brand)
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'newest':
        case 'relevance':
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

  async getProductsBySubcategory(category: string, subcategory?: string): Promise<Product[]> {
    const allowedCategories = categoryMappings[category] || []

    if (!subcategory) {
      if (allowedCategories.length === 0) {
        return mockProducts
      }
      return mockProducts.filter((p) => allowedCategories.includes(p.category))
    }

    return mockProducts.filter(
      (p) => p.subcategory.toLowerCase() === subcategory.toLowerCase()
    )
  }

  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    return mockProducts.filter((p) => p.isBestSeller || p.isNew).slice(0, limit)
  }

  async getNewArrivals(limit: number = 4): Promise<Product[]> {
    return mockProducts.filter((p) => p.isNew).slice(0, limit)
  }

  async getNewReleases(limit?: number): Promise<Product[]> {
    const newProducts = mockProducts.filter((p) => p.isNew)
    const fallback =
      newProducts.length === 0
        ? [...mockProducts].sort((a, b) => a.id.localeCompare(b.id)).slice(0, 12)
        : newProducts
    return limit ? fallback.slice(0, limit) : fallback
  }

  async getNewReleasesByCategory(category: string, limit?: number): Promise<Product[]> {
    const allowedCategories = categoryMappings[category] || []
    const categoryProducts =
      allowedCategories.length > 0
        ? mockProducts.filter((p) => allowedCategories.includes(p.category))
        : mockProducts

    const newProducts = categoryProducts.filter((p) => p.isNew)
    const fallback =
      newProducts.length === 0
        ? [...categoryProducts].sort((a, b) => a.id.localeCompare(b.id)).slice(0, limit || 12)
        : newProducts

    return limit ? fallback.slice(0, limit) : fallback
  }

  async getSaleProducts(): Promise<Product[]> {
    return mockProducts.filter((p) => p.originalPrice && p.originalPrice > p.price)
  }

  async getPriceRange(productIds?: string[]): Promise<PriceRange> {
    const products = productIds
      ? mockProducts.filter((p) => productIds.includes(p.id))
      : mockProducts

    if (products.length === 0) {
      return { min: 0, max: 1000 }
    }

    const prices = products.map((p) => p.price)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    }
  }

  async getInventory(productId: string, _variantId?: string): Promise<Inventory> {
    const product = mockProducts.find((p) => p.id === productId)
    if (!product) {
      return {
        productId,
        quantity: 0,
        inStock: false,
      }
    }

    return {
      productId,
      quantity: product.stockQuantity || 0,
      lowStockThreshold: 10,
      inStock: product.inStock,
    }
  }

  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    const lowerQuery = query.toLowerCase()
    return mockProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.category.toLowerCase().includes(lowerQuery) ||
          p.subcategory.toLowerCase().includes(lowerQuery) ||
          p.shortDescription?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, limit)
  }
}
