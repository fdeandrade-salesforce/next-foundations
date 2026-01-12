'use client'

import { Product } from '../components/ProductListingPage'

const WISHLIST_KEY = 'marketstreet_wishlist'

/**
 * Get all items in the wishlist from localStorage
 */
export function getWishlist(): Product[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(WISHLIST_KEY)
    if (!stored) return []
    return JSON.parse(stored) as Product[]
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
 * Add a product to the wishlist
 */
export function addToWishlist(product: Product): void {
  if (typeof window === 'undefined') return
  
  try {
    const current = getWishlist()
    
    // Don't add duplicates
    if (current.some((p) => p.id === product.id)) return
    
    const updated = [...current, product]
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
 */
export function toggleWishlist(product: Product): boolean {
  if (isInWishlist(product.id)) {
    removeFromWishlist(product.id)
    return false // Not in wishlist anymore
  } else {
    addToWishlist(product)
    return true // Now in wishlist
  }
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
