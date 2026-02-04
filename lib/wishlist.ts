'use client'

import { Product } from '../components/ProductListingPage'

const WISHLIST_KEY = 'sfdc_foundations_wishlist'

/**
 * Extended product type for wishlist items with optional selected variants
 * When added from PDP, selectedSize and selectedColor will be set
 * When added from Product Cards, they will be undefined
 */
export interface WishlistProduct extends Product {
  selectedSize?: string
  selectedColor?: string
  addedFrom?: 'pdp' | 'card' // Track where the item was added from
}

/**
 * Get all items in the wishlist from localStorage
 */
export function getWishlist(): WishlistProduct[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(WISHLIST_KEY)
    if (!stored) return []
    return JSON.parse(stored) as WishlistProduct[]
  } catch (error) {
    console.error('Error reading wishlist:', error)
    return []
  }
}

/**
 * Get all wishlist product IDs
 */
export function getWishlistIds(): string[] {
  return getWishlist().map((p) => p.id)
}

/**
 * Check if a product is in the wishlist
 */
export function isInWishlist(productId: string): boolean {
  return getWishlistIds().includes(productId)
}

/**
 * Add a product to the wishlist with optional variant information
 * @param product - The product to add
 * @param selectedSize - Optional selected size (from PDP)
 * @param selectedColor - Optional selected color (from PDP)
 * @param addedFrom - Where the product was added from ('pdp' or 'card')
 */
export function addToWishlist(
  product: Product, 
  selectedSize?: string, 
  selectedColor?: string,
  addedFrom: 'pdp' | 'card' = 'card'
): void {
  if (typeof window === 'undefined') return
  
  try {
    const current = getWishlist()
    
    // Don't add duplicates
    if (current.some((p) => p.id === product.id)) return
    
    const wishlistProduct: WishlistProduct = {
      ...product,
      selectedSize,
      selectedColor,
      addedFrom,
    }
    
    const updated = [...current, wishlistProduct]
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated))
    
    // Dispatch a custom event so other components can react
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: updated }))
  } catch (error) {
    console.error('Error adding to wishlist:', error)
  }
}

/**
 * Remove a product from the wishlist
 */
export function removeFromWishlist(productId: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const current = getWishlist()
    const updated = current.filter((p) => p.id !== productId)
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated))
    
    // Dispatch a custom event so other components can react
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: updated }))
  } catch (error) {
    console.error('Error removing from wishlist:', error)
  }
}

/**
 * Toggle a product in the wishlist (add if not present, remove if present)
 * @param product - The product to toggle
 * @param selectedSize - Optional selected size (from PDP)
 * @param selectedColor - Optional selected color (from PDP)
 * @param addedFrom - Where the product was added from ('pdp' or 'card')
 */
export function toggleWishlist(
  product: Product,
  selectedSize?: string,
  selectedColor?: string,
  addedFrom: 'pdp' | 'card' = 'card'
): boolean {
  if (isInWishlist(product.id)) {
    removeFromWishlist(product.id)
    return false // Not in wishlist anymore
  } else {
    addToWishlist(product, selectedSize, selectedColor, addedFrom)
    return true // Now in wishlist
  }
}

/**
 * Check if a wishlist item has complete variant information
 * Returns true if the item needs variant selection before adding to cart
 */
export function needsVariantSelection(item: WishlistProduct): boolean {
  const hasMultipleSizes = item.size && Array.isArray(item.size) && item.size.length > 1
  const hasMultipleColors = item.colors && Array.isArray(item.colors) && item.colors.length > 1
  
  // If product has multiple sizes but no size selected, needs selection
  if (hasMultipleSizes && !item.selectedSize) return true
  
  // If product has multiple colors but no color selected, needs selection
  if (hasMultipleColors && !item.selectedColor) return true
  
  return false
}

/**
 * Clear the entire wishlist
 */
export function clearWishlist(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(WISHLIST_KEY)
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: [] }))
  } catch (error) {
    console.error('Error clearing wishlist:', error)
  }
}

/**
 * Get the number of items in the wishlist
 */
export function getWishlistCount(): number {
  return getWishlist().length
}
