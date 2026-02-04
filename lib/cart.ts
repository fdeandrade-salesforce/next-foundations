'use client'

import { Product } from '../components/ProductListingPage'
import { CartItem } from '../components/MiniCart'

const CART_KEY = 'sfdc_foundations_cart'

/**
 * Get all items in the cart from localStorage
 */
export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(CART_KEY)
    if (!stored) return []
    return JSON.parse(stored) as CartItem[]
  } catch (error) {
    console.error('Error reading cart:', error)
    return []
  }
}

/**
 * Get the number of items in the cart
 */
export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0)
}

/**
 * BOPIS options for cart items
 */
interface BOPISOptions {
  storeId: string
  storeName: string
  storeAddress: string
}

/**
 * Add a product to the cart
 */
export function addToCart(
  product: Product,
  quantity: number = 1,
  size?: string,
  color?: string,
  bopis?: BOPISOptions,
  isSurpriseGift?: boolean
): void {
  if (typeof window === 'undefined') return
  
  try {
    const current = getCart()
    // Include fulfillment method and store in ID for BOPIS items
    const fulfillmentSuffix = bopis ? `-bopis-${bopis.storeId}` : ''
    const surpriseGiftSuffix = isSurpriseGift ? '-surprise-gift' : ''
    const itemId = `${product.id}-${size || 'default'}-${color || 'default'}${fulfillmentSuffix}${surpriseGiftSuffix}`
    
    // Check if item already exists with same size/color/fulfillment
    const existingIndex = current.findIndex((item) => item.id === itemId)
    
    if (existingIndex >= 0) {
      // Update quantity of existing item
      current[existingIndex].quantity += quantity
    } else {
      // Add new item
      const newItem: CartItem = {
        id: itemId,
        product,
        quantity,
        size,
        color,
        price: isSurpriseGift ? 0 : product.price, // Surprise gifts are free
        originalPrice: product.originalPrice,
        fulfillmentMethod: bopis ? 'pickup' : 'delivery',
        storeId: bopis?.storeId,
        storeName: bopis?.storeName,
        storeAddress: bopis?.storeAddress,
        isSurpriseGift: isSurpriseGift || false,
      }
      current.push(newItem)
    }
    
    localStorage.setItem(CART_KEY, JSON.stringify(current))
    
    // Dispatch a custom event so other components can react
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: current }))
    
    // Dispatch event for add animation with product info
    const addedItem = existingIndex >= 0 ? current[existingIndex] : current[current.length - 1]
    window.dispatchEvent(new CustomEvent('itemAddedToCart', { 
      detail: { 
        product: product,
        item: addedItem,
        isNewItem: existingIndex < 0
      } 
    }))
  } catch (error) {
    console.error('Error adding to cart:', error)
  }
}

/**
 * Remove a product from the cart
 */
export function removeFromCart(itemId: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const current = getCart()
    const updated = current.filter((item) => item.id !== itemId)
    localStorage.setItem(CART_KEY, JSON.stringify(updated))
    
    // Dispatch a custom event so other components can react
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updated }))
  } catch (error) {
    console.error('Error removing from cart:', error)
  }
}

/**
 * Update the quantity of a cart item
 */
export function updateCartQuantity(itemId: string, quantity: number): void {
  if (typeof window === 'undefined') return
  
  try {
    const current = getCart()
    const itemIndex = current.findIndex((item) => item.id === itemId)
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        removeFromCart(itemId)
        return
      }
      
      current[itemIndex].quantity = quantity
      localStorage.setItem(CART_KEY, JSON.stringify(current))
      
      // Dispatch a custom event so other components can react
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: current }))
    }
  } catch (error) {
    console.error('Error updating cart quantity:', error)
  }
}

/**
 * Clear the entire cart
 */
export function clearCart(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(CART_KEY)
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: [] }))
  } catch (error) {
    console.error('Error clearing cart:', error)
  }
}

/**
 * Get cart subtotal (excluding surprise gifts)
 */
export function getCartSubtotal(): number {
  return getCart().reduce((sum, item) => {
    // Don't count surprise gifts in subtotal
    if (item.isSurpriseGift) return sum
    return sum + item.price * item.quantity
  }, 0)
}

/**
 * Update cart item fulfillment method (for BOPIS)
 */
export function updateCartItemFulfillment(
  itemId: string,
  fulfillmentMethod: 'pickup' | 'delivery',
  storeId?: string,
  storeName?: string,
  storeAddress?: string
): void {
  if (typeof window === 'undefined') return
  
  try {
    const current = getCart()
    const itemIndex = current.findIndex((item) => item.id === itemId)
    
    if (itemIndex >= 0) {
      current[itemIndex].fulfillmentMethod = fulfillmentMethod
      
      if (fulfillmentMethod === 'pickup') {
        // Set store info for pickup
        current[itemIndex].storeId = storeId
        current[itemIndex].storeName = storeName
        current[itemIndex].storeAddress = storeAddress
        // Clear shipping address
        current[itemIndex].shippingAddress = undefined
      } else {
        // Clear store info for delivery
        current[itemIndex].storeId = undefined
        current[itemIndex].storeName = undefined
        current[itemIndex].storeAddress = undefined
        // Set default shipping address if not already set
        if (!current[itemIndex].shippingAddress) {
          current[itemIndex].shippingAddress = '478 Artisan Way, Somerville, MA 02145'
        }
      }
      
      localStorage.setItem(CART_KEY, JSON.stringify(current))
      
      // Dispatch a custom event so other components can react
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: current }))
    }
  } catch (error) {
    console.error('Error updating cart item fulfillment:', error)
  }
}

/**
 * Update fulfillment for all cart items at once
 */
export function updateAllCartItemsFulfillment(
  fulfillmentMethod: 'pickup' | 'delivery',
  storeId?: string,
  storeName?: string,
  storeAddress?: string
): void {
  if (typeof window === 'undefined') return
  
  try {
    const current = getCart()
    
    const updated = current.map(item => ({
      ...item,
      fulfillmentMethod,
      storeId: fulfillmentMethod === 'pickup' ? storeId : undefined,
      storeName: fulfillmentMethod === 'pickup' ? storeName : undefined,
      storeAddress: fulfillmentMethod === 'pickup' ? storeAddress : undefined,
    }))
    
    localStorage.setItem(CART_KEY, JSON.stringify(updated))
    
    // Dispatch a custom event so other components can react
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updated }))
  } catch (error) {
    console.error('Error updating all cart items fulfillment:', error)
  }
}
