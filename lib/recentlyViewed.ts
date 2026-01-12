'use client'

import { Product } from '../components/ProductListingPage'

const RECENTLY_VIEWED_KEY = 'marketstreet_recently_viewed'
const MAX_ITEMS = 10

/**
 * Get recently viewed products from localStorage
 */
export function getRecentlyViewed(): Product[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY)
    if (!stored) return []
    return JSON.parse(stored) as Product[]
  } catch (error) {
    console.error('Error reading recently viewed products:', error)
    return []
  }
}

/**
 * Add a product to the recently viewed list
 */
export function addToRecentlyViewed(product: Product): void {
  if (typeof window === 'undefined') return
  
  try {
    const current = getRecentlyViewed()
    
    // Remove the product if it already exists (to move it to the front)
    const filtered = current.filter((p) => p.id !== product.id)
    
    // Add the product to the beginning
    const updated = [product, ...filtered].slice(0, MAX_ITEMS)
    
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Error saving recently viewed product:', error)
  }
}

/**
 * Clear all recently viewed products
 */
export function clearRecentlyViewed(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY)
  } catch (error) {
    console.error('Error clearing recently viewed products:', error)
  }
}

/**
 * Get recently viewed products excluding a specific product ID
 */
export function getRecentlyViewedExcluding(productId: string): Product[] {
  return getRecentlyViewed().filter((p) => p.id !== productId)
}
