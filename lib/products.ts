/**
 * Product Data Access Layer
 * 
 * This file provides async product-related functions that delegate to the repository layer.
 * All functions are async to support both mock and Supabase providers.
 */

import { Product } from '../components/ProductListingPage'
import { getProductRepo } from '../src/data'

// Re-export Product type for backward compatibility
export type { Product } from '../components/ProductListingPage'

/**
 * Get all products (deduplicated - one per product family)
 */
export async function getAllProducts(): Promise<Product[]> {
  const repo = getProductRepo()
  return repo.getAllProducts()
}

/**
 * Get all products including all color variants
 * Use this for ProductCard color picker functionality
 */
export async function getAllProductsWithVariants(): Promise<Product[]> {
  const repo = getProductRepo()
  if (repo.getAllProductsWithVariants) {
    return repo.getAllProductsWithVariants()
  }
  // Fallback to getAllProducts if not implemented
  return repo.getAllProducts()
}

/**
 * Get a product by ID
 */
export async function getProductById(id: string): Promise<Product | undefined> {
  const repo = getProductRepo()
  return repo.getProductById(id)
}

/**
 * Get products by subcategory
 */
export async function getProductsBySubcategory(
  category: string,
  subcategory?: string
): Promise<Product[]> {
  const repo = getProductRepo()
  return repo.getProductsBySubcategory(category, subcategory)
}

/**
 * Get featured products (bestsellers and new arrivals)
 */
export async function getFeaturedProducts(limit?: number): Promise<Product[]> {
  const repo = getProductRepo()
  return repo.getFeaturedProducts(limit)
}

/**
 * Get new arrivals
 */
export async function getNewArrivals(limit?: number): Promise<Product[]> {
  const repo = getProductRepo()
  return repo.getNewArrivals(limit)
}

/**
 * Get products on sale
 */
export async function getSaleProducts(): Promise<Product[]> {
  const repo = getProductRepo()
  return repo.getSaleProducts()
}

/**
 * Get new releases
 */
export async function getNewReleases(limit?: number): Promise<Product[]> {
  const repo = getProductRepo()
  return repo.getNewReleases(limit)
}

/**
 * Get new releases by category
 */
export async function getNewReleasesByCategory(
  category: string,
  limit?: number
): Promise<Product[]> {
  const repo = getProductRepo()
  return repo.getNewReleasesByCategory(category, limit)
}

/**
 * Search products by query (name, category, subcategory, description)
 */
export async function searchProducts(query: string, limit?: number): Promise<Product[]> {
  const repo = getProductRepo()
  return repo.searchProducts(query, limit ?? 20)
}

/**
 * List products with filters, sorting, and pagination
 */
export async function listProducts(
  filters?: {
    category?: string
    subcategory?: string
    inStock?: boolean
    minPrice?: number
    maxPrice?: number
    searchTerm?: string
  },
  sort?: 'relevance' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest' | 'rating',
  page?: number,
  pageSize?: number
): Promise<{
  items: Product[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}> {
  const repo = getProductRepo()
  return repo.listProducts(filters, sort, page, pageSize)
}
