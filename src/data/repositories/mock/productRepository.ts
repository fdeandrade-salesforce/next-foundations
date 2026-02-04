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
    // Deduplicate products by name for PLP views
    return this.deduplicateProducts(mockProducts)
  }
  
  // Get all products including color variants (for PDP variant selection)
  async getAllProductsWithVariants(): Promise<Product[]> {
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

    // Deduplicate products by name for PLP views
    const deduplicated = this.deduplicateProducts(items)
    
    return {
      items: deduplicated,
      total: deduplicated.length,
      page,
      pageSize,
      totalPages: Math.ceil(deduplicated.length / pageSize),
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

    const filtered = mockProducts.filter(
      (p) => p.subcategory.toLowerCase() === subcategory.toLowerCase()
    )
    return this.deduplicateProducts(filtered)
  }

  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    const featured = mockProducts.filter((p) => p.isBestSeller || p.isNew)
    return this.deduplicateProducts(featured).slice(0, limit)
  }

  async getNewArrivals(limit: number = 4): Promise<Product[]> {
    const newProducts = mockProducts.filter((p) => p.isNew)
    return this.deduplicateProducts(newProducts).slice(0, limit)
  }

  async getNewReleases(limit?: number): Promise<Product[]> {
    const newProducts = mockProducts.filter((p) => p.isNew)
    const fallback =
      newProducts.length === 0
        ? [...mockProducts].sort((a, b) => a.id.localeCompare(b.id)).slice(0, 12)
        : newProducts
    const deduplicated = this.deduplicateProducts(fallback)
    return limit ? deduplicated.slice(0, limit) : deduplicated
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

    const deduplicated = this.deduplicateProducts(fallback)
    return limit ? deduplicated.slice(0, limit) : deduplicated
  }

  async getSaleProducts(): Promise<Product[]> {
    const saleProducts = mockProducts.filter((p) => p.originalPrice && p.originalPrice > p.price)
    return this.deduplicateProducts(saleProducts)
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
    const results = mockProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.category.toLowerCase().includes(lowerQuery) ||
          p.subcategory.toLowerCase().includes(lowerQuery) ||
          p.shortDescription?.toLowerCase().includes(lowerQuery)
      )
    return this.deduplicateProducts(results).slice(0, limit)
  }

  async getProductVariants(baseProductId: string): Promise<Product[]> {
    const baseProduct = await this.getProductById(baseProductId)
    if (!baseProduct) return []

    // Find all products with the same name (variants)
    return mockProducts.filter((p) => p.name === baseProduct.name)
  }

  async getBaseProductId(productId: string): Promise<string | undefined> {
    const product = await this.getProductById(productId)
    if (!product) return undefined

    // Find the first product with the same name (alphabetically by ID) as the base
    const variants = mockProducts.filter((p) => p.name === product.name)
    if (variants.length === 0) return undefined

    // Sort by ID and return the first one (base product)
    return variants.sort((a, b) => a.id.localeCompare(b.id))[0].id
  }

  /**
   * Deduplicate products by name for PLP views
   * This ensures only one product card appears per product family
   * (e.g., Pure Cube appears once, not once per color variant)
   */
  private deduplicateProducts(products: Product[]): Product[] {
    const productsByName = new Map<string, Product[]>()
    
    // Group products by name
    for (const product of products) {
      const existing = productsByName.get(product.name) || []
      existing.push(product)
      productsByName.set(product.name, existing)
    }
    
    // For each product name, return the first one but with consolidated colors
    const deduplicated: Product[] = []
    
    // Convert Map entries to array for iteration
    const entries = Array.from(productsByName.entries())
    for (const [_name, variants] of entries) {
      // Use the first variant as the base product
      const baseProduct = variants[0]
      
      // Collect all unique colors from all variants
      const allColors = new Set<string>()
      
      for (const variant of variants) {
        if (variant.color) {
          allColors.add(variant.color)
        }
        if (variant.colors) {
          variant.colors.forEach(c => allColors.add(c))
        }
      }
      
      // Create the consolidated product
      const consolidated: Product = {
        ...baseProduct,
        colors: allColors.size > 0 ? Array.from(allColors) : baseProduct.colors,
        variants: variants.length > 1 ? variants.length - 1 : baseProduct.variants,
      }
      
      deduplicated.push(consolidated)
    }
    
    return deduplicated
  }
}
