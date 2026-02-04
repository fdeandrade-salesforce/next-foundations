'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import AnnouncementBar from '../../components/AnnouncementBar'
import StoreLocatorModal from '../../components/StoreLocatorModal'
import EditCartItemModal from '../../components/EditCartItemModal'
import RemoveConfirmationModal from '../../components/RemoveConfirmationModal'
import QuickViewModal from '../../components/QuickViewModal'
import NotifyMeModal from '../../components/NotifyMeModal'
import Toast from '../../components/Toast'
import { getCart, updateCartQuantity, removeFromCart, addToCart, updateCartItemFulfillment } from '../../lib/cart'
import { CartItem } from '../../components/MiniCart'
import { toggleWishlist, getWishlistIds } from '../../lib/wishlist'
import { getAllProductsWithVariants, getNewArrivals } from '../../lib/products'
import { Product } from '../../components/ProductListingPage'
import ProductCard from '../../components/ProductCard'
import Link from 'next/link'

// Extended CartItem with fulfillment options
interface ExtendedCartItem extends CartItem {
  fulfillmentMethod?: 'pickup' | 'delivery'
  storeId?: string
  storeName?: string
  storeAddress?: string
  shippingAddress?: string
  isGift?: boolean
  isBOGO?: boolean
  bogoPromotionId?: string
  isAvailableAtStore?: boolean // Whether item is available at selected store
  isSurpriseGift?: boolean
}

// Store availability mapping - which items are available at which stores
// When Somerville Square (id: '2') is selected, first 2 pickup items become unavailable
const getItemAvailability = (itemId: string, storeId: string, allPickupItems: CartItem[]): boolean => {
  // If store is Somerville Square (id: '2'), make first 2 items unavailable
  if (storeId === '2') {
    // Find the index of this item in the pickup items array
    const itemIndex = allPickupItems.findIndex(item => item.id === itemId)
    // First 2 items (index 0 and 1) are unavailable at Somerville Square
    return itemIndex >= 2
  }
  // All items available at Dorchester and other stores
  return true
}

// Store information
interface Store {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
}

// Store data is now loaded from repository when needed
// See /src/data/mock/stores.ts for the store data
// This interface is kept for backward compatibility with cart logic

export default function CartPage() {
  const [cartItems, setCartItems] = useState<ExtendedCartItem[]>([])
  const [promoCode, setPromoCode] = useState('')
  const [showPromoInput, setShowPromoInput] = useState(false)
  const [appliedPromotions, setAppliedPromotions] = useState<Array<{ name: string; discount: number }>>([])
  const [showStoreLocator, setShowStoreLocator] = useState(false)
  const [announcement, setAnnouncement] = useState<string>('')
  const [isCheckingInventory, setIsCheckingInventory] = useState(false)
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set())
  const [editingItem, setEditingItem] = useState<ExtendedCartItem | null>(null)
  const [removingItem, setRemovingItem] = useState<ExtendedCartItem | null>(null)
  const [toastMessage, setToastMessage] = useState<string>('')
  const [showToast, setShowToast] = useState(false)
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [notifyMeProduct, setNotifyMeProduct] = useState<Product | null>(null)
  const announcementRef = useRef<HTMLDivElement>(null)
  const currentStoreIdRef = useRef<string>('1') // Track current store ID
  const checkoutSectionRef = useRef<HTMLDivElement>(null)
  const [showMobileStickySummary, setShowMobileStickySummary] = useState(false)

  // Load cart on mount
  useEffect(() => {
    const loadCart = () => {
      const items = getCart()
      // Default store is Dorchester (id: '1')
      const defaultStoreId = '1'
      currentStoreIdRef.current = defaultStoreId
      const defaultStoreName = 'Dorchester'
      const defaultStoreAddress = '26 District Avenue, Dorchester, MA 02125'
      
      // Extend items with fulfillment methods and availability based on stored fulfillmentMethod
      const extendedItems: ExtendedCartItem[] = items.map((item) => {
        // Use stored fulfillmentMethod, default to 'delivery' if not set
        const fulfillmentMethod = item.fulfillmentMethod || 'delivery'
        const isPickup = fulfillmentMethod === 'pickup'
        
        // Get pickup items for availability check (only for pickup items)
        const pickupItems = items.filter(i => (i.fulfillmentMethod || 'delivery') === 'pickup')
        const isAvailable = isPickup ? getItemAvailability(item.id, item.storeId || defaultStoreId, pickupItems) : true
        
        return {
          ...item,
          fulfillmentMethod: fulfillmentMethod as 'pickup' | 'delivery',
          // Only set store info if it's pickup and not already set
          storeId: isPickup ? (item.storeId || defaultStoreId) : undefined,
          storeName: isPickup ? (item.storeName || defaultStoreName) : undefined,
          storeAddress: isPickup ? (item.storeAddress || defaultStoreAddress) : undefined,
          shippingAddress: !isPickup ? (item.shippingAddress || '478 Artisan Way, Somerville, MA 02145') : undefined,
          isGift: item.isGift || false,
          isBOGO: item.isBOGO || false,
          isSurpriseGift: item.isSurpriseGift || false,
          isAvailableAtStore: isPickup ? isAvailable : undefined,
        }
      })
      setCartItems(extendedItems)
    }

    loadCart()

    const handleCartUpdate = (e: CustomEvent<CartItem[]>) => {
      const items = e.detail
      const currentStoreId = currentStoreIdRef.current
      
      const storeName = currentStoreId === '1' ? 'Dorchester' : currentStoreId === '2' ? 'Somerville Square' : 'Dorchester'
      const storeAddress = currentStoreId === '1' ? '26 District Avenue, Dorchester, MA 02125' : '478 Artisan Way, Somerville, MA 02145'
      
      const extendedItems: ExtendedCartItem[] = items.map((item) => {
        // Use stored fulfillmentMethod, default to 'delivery' if not set
        const fulfillmentMethod = item.fulfillmentMethod || 'delivery'
        const isPickup = fulfillmentMethod === 'pickup'
        
        // Get pickup items for availability check (only for pickup items)
        const pickupItems = items.filter(i => (i.fulfillmentMethod || 'delivery') === 'pickup')
        const isAvailable = isPickup ? getItemAvailability(item.id, item.storeId || currentStoreId, pickupItems) : true
        
        return {
          ...item,
          fulfillmentMethod: fulfillmentMethod as 'pickup' | 'delivery',
          // Only set store info if it's pickup and not already set
          storeId: isPickup ? (item.storeId || currentStoreId) : undefined,
          storeName: isPickup ? (item.storeName || storeName) : undefined,
          storeAddress: isPickup ? (item.storeAddress || storeAddress) : undefined,
          shippingAddress: !isPickup ? (item.shippingAddress || '478 Artisan Way, Somerville, MA 02145') : undefined,
          isGift: item.isGift || false,
          isBOGO: item.isBOGO || false,
          isSurpriseGift: item.isSurpriseGift || false,
          isAvailableAtStore: isPickup ? isAvailable : undefined,
        }
      })
      setCartItems(extendedItems)
    }

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate as EventListener)
  }, [])

  // Load recommended products, new arrivals, and wishlist
  useEffect(() => {
    const loadRecommendations = async () => {
      const [products, arrivals] = await Promise.all([
        getAllProductsWithVariants(),
        getNewArrivals(),
      ])
      setAllProducts(products)
      setNewArrivals(arrivals)
      // Get cart product IDs to exclude from recommendations
      const cartProductIds = cartItems.map(item => item.product.id)
      // Filter out products already in cart and get random recommendations
      const available = products.filter(p => !cartProductIds.includes(p.id))
      // Shuffle and take first 4
      const shuffled = available.sort(() => Math.random() - 0.5)
      setRecommendedProducts(shuffled.slice(0, 4))
    }
    
    loadRecommendations()
    setWishlistIds(getWishlistIds())
    
    // Listen for wishlist updates
    const handleWishlistUpdate = () => {
      setWishlistIds(getWishlistIds())
    }
    window.addEventListener('wishlistUpdated', handleWishlistUpdate)
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate)
  }, [cartItems])

  // Detect when checkout section is out of viewport (mobile only)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkVisibility = () => {
      // Only check on mobile screens
      if (window.innerWidth >= 768) {
        setShowMobileStickySummary(false)
        return
      }

      if (!checkoutSectionRef.current) {
        setShowMobileStickySummary(false)
        return
      }

      const rect = checkoutSectionRef.current.getBoundingClientRect()
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0
      
      // Show mobile sticky summary when checkout section is not visible
      setShowMobileStickySummary(!isVisible && cartItems.length > 0)
    }

    // Check on mount and scroll
    checkVisibility()
    window.addEventListener('scroll', checkVisibility, { passive: true })
    window.addEventListener('resize', checkVisibility)

    return () => {
      window.removeEventListener('scroll', checkVisibility)
      window.removeEventListener('resize', checkVisibility)
    }
  }, [cartItems])

  // Calculate totals
  const calculations = useMemo(() => {
    // Calculate subtotal excluding surprise gifts
    const subtotal = cartItems.reduce((sum, item) => {
      if (item.isSurpriseGift) return sum
      return sum + item.price * item.quantity
    }, 0)
    const totalSavings = cartItems.reduce((sum, item) => {
      if (item.isSurpriseGift) return sum
      if (item.originalPrice) {
        return sum + (item.originalPrice - item.price) * item.quantity
      }
      return sum
    }, 0)
    const promotionDiscount = appliedPromotions.reduce((sum, promo) => sum + promo.discount, 0)
    const shipping = subtotal >= 60 ? 0 : 5.99 // Free shipping over $60
    const tax = subtotal * 0.08 // 8% tax
    const total = subtotal - promotionDiscount + shipping + tax
    const freeShippingRemaining = Math.max(0, 60 - subtotal)
    const progressPercentage = Math.min(100, (subtotal / 60) * 100)

    // Surprise Gift calculation
    // Show surprise gift offer when subtotal is between $25-$60 (surprise gift at $60)
    const surpriseGiftThreshold = 60
    const surpriseGiftStartThreshold = 25 // Start showing the message at $25
    const approachingSurpriseGiftRemaining = Math.max(0, surpriseGiftThreshold - subtotal)
    const approachingSurpriseGiftProgress = Math.min(100, Math.max(0, ((subtotal - surpriseGiftStartThreshold) / (surpriseGiftThreshold - surpriseGiftStartThreshold)) * 100))
    const hasSurpriseGift = subtotal >= surpriseGiftThreshold
    const showApproachingSurpriseGift = subtotal >= surpriseGiftStartThreshold

    return {
      subtotal,
      totalSavings,
      promotionDiscount,
      shipping,
      tax,
      total,
      freeShippingRemaining,
      progressPercentage,
      approachingSurpriseGiftRemaining,
      approachingSurpriseGiftProgress,
      showApproachingSurpriseGift,
      hasSurpriseGift,
      surpriseGiftThreshold,
      surpriseGiftStartThreshold,
    }
  }, [cartItems, appliedPromotions])

  // Auto-add surprise gift when threshold is reached
  useEffect(() => {
    if (!allProducts.length) return
    
    const hasSurpriseGiftInCart = cartItems.some(item => item.isSurpriseGift)
    
    if (calculations.hasSurpriseGift && !hasSurpriseGiftInCart) {
      // Find a suitable product for surprise gift
      // Filter out products already in cart (excluding surprise gifts)
      const cartProductIds = cartItems.filter(item => !item.isSurpriseGift).map(item => item.product.id)
      const availableProducts = allProducts.filter(p => !cartProductIds.includes(p.id))
      
      if (availableProducts.length > 0) {
        // Pick a random product as surprise gift
        const surpriseGiftProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)]
        addToCart(surpriseGiftProduct, 1, undefined, undefined, undefined, true)
        setToastMessage('Surprise gift added to your cart!')
        setShowToast(true)
      }
    } else if (!calculations.hasSurpriseGift && hasSurpriseGiftInCart) {
      // Remove surprise gift if threshold is no longer met
      const surpriseGiftItems = cartItems.filter(item => item.isSurpriseGift)
      surpriseGiftItems.forEach(item => {
        removeFromCart(item.id)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculations.hasSurpriseGift, calculations.subtotal])

  // Group items by fulfillment method
  const groupedItems = useMemo(() => {
    const pickup = cartItems.filter(item => item.fulfillmentMethod === 'pickup')
    const delivery = cartItems.filter(item => item.fulfillmentMethod === 'delivery')
    const bogo = cartItems.filter(item => item.isBOGO)
    // Only filter by availability if it's explicitly set (not undefined)
    const unavailablePickup = pickup.filter(item => item.isAvailableAtStore === false)
    const availablePickup = pickup.filter(item => item.isAvailableAtStore === true)
    return { pickup, delivery, bogo, unavailablePickup, availablePickup }
  }, [cartItems])

  const handleQuantityChange = async (itemId: string, quantity: number) => {
    // Find the current item to check its quantity
    const currentItem = cartItems.find(item => item.id === itemId)
    if (!currentItem) return
    
    // Count total items excluding surprise gifts
    const totalCartItems = cartItems
      .filter(item => !item.isSurpriseGift)
      .reduce((sum, item) => sum + item.quantity, 0)
    
    // If there's only 1 item total in cart and current quantity is 1,
    // and user clicks minus (which results in quantity staying at 1 due to Math.max),
    // show confirmation modal to remove (same as Remove action)
    // Note: When quantity is 1, Math.max(1, 1-1) = 1, so quantity stays 1
    // We detect this by checking: current quantity is 1, new quantity is 1, and total items is 1
    if (currentItem.quantity === 1 && totalCartItems === 1 && quantity === 1) {
      // User clicked minus on the only item with quantity 1 - treat as removal
      handleRemove(currentItem)
      return
    }
    
    // Add item to loading set
    setLoadingItems(prev => new Set(prev).add(itemId))
    
    // Update quantity immediately (optimistic update)
    updateCartQuantity(itemId, quantity)
    
    // Simulate API call to update quantity (1-2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Remove from loading set
    setLoadingItems(prev => {
      const newSet = new Set(prev)
      newSet.delete(itemId)
      return newSet
    })
  }

  const handleRemove = (item: ExtendedCartItem) => {
    setRemovingItem(item)
  }

  const confirmRemove = () => {
    if (removingItem) {
      removeFromCart(removingItem.id)
      setToastMessage('Item removed from cart')
      setShowToast(true)
      setRemovingItem(null)
    }
  }

  const handleFulfillmentChange = async (itemId: string, newMethod: 'pickup' | 'delivery') => {
    // Add item to loading set
    setLoadingItems(prev => new Set(prev).add(itemId))
    
    const defaultStoreId = '1'
    const defaultStoreName = 'Dorchester'
    const defaultStoreAddress = '26 District Avenue, Dorchester, MA 02125'
    
    // Update fulfillment method immediately (optimistic update)
    setCartItems(prev => prev.map((item): ExtendedCartItem => {
      if (item.id === itemId) {
        if (newMethod === 'pickup') {
          const pickupItems = prev.filter(i => i.fulfillmentMethod === 'pickup' || i.id === itemId)
          const isAvailable = getItemAvailability(itemId, defaultStoreId, pickupItems.map(i => ({
            id: i.id,
            product: i.product,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
            price: i.price,
            originalPrice: i.originalPrice,
          })))
          
          return {
            ...item,
            fulfillmentMethod: 'pickup' as const,
            storeId: defaultStoreId,
            storeName: defaultStoreName,
            storeAddress: defaultStoreAddress,
            shippingAddress: undefined,
            isAvailableAtStore: isAvailable,
          }
        } else {
          return {
            ...item,
            fulfillmentMethod: 'delivery' as const,
            storeId: undefined,
            storeName: undefined,
            storeAddress: undefined,
            shippingAddress: '478 Artisan Way, Somerville, MA 02145',
            isAvailableAtStore: undefined,
          }
        }
      }
      return item
    }))
    
    // Persist to localStorage
    if (newMethod === 'pickup') {
      updateCartItemFulfillment(itemId, 'pickup', defaultStoreId, defaultStoreName, defaultStoreAddress)
    } else {
      updateCartItemFulfillment(itemId, 'delivery')
    }
    
    // Simulate API call to update fulfillment (1-2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Remove from loading set
    setLoadingItems(prev => {
      const newSet = new Set(prev)
      newSet.delete(itemId)
      return newSet
    })
  }

  const handleEditItem = (item: ExtendedCartItem) => {
    setEditingItem(item)
  }

  const handleUpdateItem = (product: any, size?: string, color?: string, quantity?: number) => {
    if (!editingItem) return
    
    // Remove old item
    removeFromCart(editingItem.id)
    
    // Add updated item
    if (quantity && quantity > 0) {
      addToCart(product, quantity, size, color)
      setToastMessage('Item updated successfully')
      setShowToast(true)
    }
    
    setEditingItem(null)
  }

  const handleAddToWishlist = (item: ExtendedCartItem) => {
    // Pass the selected size/color from the cart item (user already made these selections)
    // Only pass if the item actually has that variant set
    toggleWishlist(item.product, item.size, item.color, 'pdp')
  }

  // Helper function to check if product has variants
  const hasVariants = (product: Product): boolean => {
    if (product.size && product.size.length > 1) return true
    if (product.colors && product.colors.length > 1) return true
    if (product.variants && product.variants > 0) return true
    return false
  }

  // Unified handler for Quick View/Quick Add
  const handleRecommendedUnifiedAction = (product: Product) => {
    if (!product.inStock) {
      setNotifyMeProduct(product)
      return
    }

    if (hasVariants(product)) {
      setQuickViewProduct(product)
    } else {
      addToCart(product, 1)
      setToastMessage(`${product.name} added to cart`)
      setShowToast(true)
    }
  }

  const handleRecommendedAddToCart = (product: Product, quantity: number = 1, size?: string, color?: string) => {
    addToCart(product, quantity, size, color)
    setToastMessage(`${product.name} added to cart`)
    setShowToast(true)
  }

  const handleRecommendedAddToWishlist = (product: Product, size?: string, color?: string) => {
    // Only pass size/color if they were explicitly selected (from QuickViewModal)
    toggleWishlist(product, size, color, size || color ? 'pdp' : 'card')
  }

  const handleRecommendedNotifyMe = (email: string) => {
    console.log(`Notify ${email} when ${notifyMeProduct?.name} is available`)
  }

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      const code = promoCode.trim().toUpperCase()
      
      // Check if promo code is already applied
      const isAlreadyApplied = appliedPromotions.some(promo => 
        promo.name.toLowerCase().includes(code.toLowerCase())
      )
      
      if (isAlreadyApplied) {
        // Don't add duplicate
        setPromoCode('')
        return
      }
      
      // Calculate current subtotal
      const currentSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      
      // Calculate current total discounts
      const currentDiscounts = appliedPromotions.reduce((sum, promo) => sum + promo.discount, 0)
      
      // Calculate discounted subtotal (after existing discounts)
      const discountedSubtotal = currentSubtotal - currentDiscounts
      
      // Calculate a mock discount (10% of discounted subtotal, minimum $5, maximum $20)
      const discountAmount = Math.min(Math.max(discountedSubtotal * 0.1, 5), 20)
      
      // Add to existing promotions instead of replacing
      setAppliedPromotions(prev => [...prev, { 
        name: `Promo Code: ${code}`, 
        discount: discountAmount 
      }])
      setPromoCode('')
    }
  }

  const handleRemovePromo = (index: number) => {
    setAppliedPromotions(prev => prev.filter((_, i) => i !== index))
  }

  const handleToggleGift = (itemId: string) => {
    setCartItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, isGift: !item.isGift } : item
    ))
  }

  const handleSelectStore = async (store: { 
    id: string
    name: string
    address: string
    distance: number
    hours: string
    status: 'open' | 'closed' | 'closing-soon'
    hasProduct: boolean
    pickupTime: string | null
  }) => {
    // Close modal first
    setShowStoreLocator(false)
    
    // Update store info immediately (optimistic update)
    currentStoreIdRef.current = store.id
    const pickupItems = cartItems.filter(item => item.fulfillmentMethod === 'pickup').map(item => ({
      id: item.id,
      product: item.product,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      price: item.price,
      originalPrice: item.originalPrice,
    }))
    
    // Update store info but mark availability as checking
    const itemsWithNewStore: ExtendedCartItem[] = cartItems.map(item => {
      if (item.fulfillmentMethod === 'pickup') {
        return {
          ...item,
          storeId: store.id,
          storeName: store.name,
          storeAddress: store.address,
          isAvailableAtStore: undefined, // Will be set after inventory check
        }
      }
      return item
    })
    setCartItems(itemsWithNewStore)
    
    // Show loading state
    setIsCheckingInventory(true)
    setAnnouncement(`Checking inventory at ${store.name}. Please wait...`)
    
    // Simulate inventory check API call (2-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    // Now update availability based on inventory check
    const updatedItems: ExtendedCartItem[] = itemsWithNewStore.map(item => {
      if (item.fulfillmentMethod === 'pickup') {
        const isAvailable = getItemAvailability(item.id, store.id, pickupItems)
        return {
          ...item,
          isAvailableAtStore: isAvailable,
        }
      }
      return item
    })
    
    setCartItems(updatedItems)
    setIsCheckingInventory(false)
    
    // Persist store change to localStorage for all pickup items
    updatedItems.forEach(item => {
      if (item.fulfillmentMethod === 'pickup') {
        updateCartItemFulfillment(item.id, 'pickup', store.id, store.name, store.address)
      }
    })
    
    // Count unavailable items for announcement
    const unavailableCount = updatedItems.filter(
      item => item.fulfillmentMethod === 'pickup' && !item.isAvailableAtStore
    ).length
    
    // Announce store change and availability
    if (unavailableCount > 0) {
      setAnnouncement(
        `Inventory check complete. Store changed to ${store.name}. ${unavailableCount} ${unavailableCount === 1 ? 'item is' : 'items are'} not available at this location.`
      )
    } else {
      setAnnouncement(`Inventory check complete. Store changed to ${store.name}. All items are available for pickup.`)
    }
    
    // Clear announcement after screen reader has time to read it
    setTimeout(() => setAnnouncement(''), 5000)
  }

  // Get the current selected store for pickup items
  const selectedStoreId = groupedItems.pickup.length > 0 ? groupedItems.pickup[0]?.storeId : '1'

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Navigation />

      <main className={`flex-1 ${showMobileStickySummary ? 'md:pb-0 pb-24' : ''}`}>
        {/* Screen Reader Announcements */}
        <div
          ref={announcementRef}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announcement}
        </div>

        {/* Free Shipping Progress */}
        <div className="bg-brand-gray-50 border-b border-brand-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {calculations.freeShippingRemaining > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-brand-black text-center">
                  You are <span className="font-bold">${calculations.freeShippingRemaining.toFixed(2)}</span> away from{' '}
                  <span className="font-bold text-brand-blue-500">Free Shipping</span>
                </p>
                <div className="relative w-full h-2 bg-brand-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-brand-blue-500 transition-all duration-300 rounded-full"
                    style={{ width: `${calculations.progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-brand-gray-600">
                  <span>${calculations.subtotal.toFixed(2)}</span>
                  <span>$60.00</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm font-medium text-green-700">You&apos;ve unlocked Free Shipping!</p>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-brand-gray-500 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-blue-500 transition-colors">
              Home
            </Link>
            <span>&gt;</span>
            <span className="text-brand-black">Cart</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-11">
            {/* Main Content */}
            <div className="flex-1 space-y-4 md:space-y-6">
              {/* Pickup Section */}
              {groupedItems.pickup.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 md:mb-6">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-brand-black mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        {isCheckingInventory ? (
                          <h2 className="text-xl font-medium text-brand-black">
                            Checking inventory at {groupedItems.pickup[0]?.storeName}...
                          </h2>
                        ) : (
                          <>
                            <h2 className="text-lg md:text-xl font-medium text-brand-black">
                              Pickup in <span className="font-bold">{groupedItems.pickup[0]?.storeName}</span> - {groupedItems.availablePickup.length} out of {groupedItems.pickup.length} items available
                            </h2>
                            <p className="text-xs md:text-sm text-brand-gray-600 mt-1">
                              {groupedItems.pickup[0]?.storeAddress}
                            </p>
                            {groupedItems.unavailablePickup.length > 0 && (
                              <p className="text-sm text-red-600 font-medium mt-2" role="alert">
                                {groupedItems.unavailablePickup.length} {groupedItems.unavailablePickup.length === 1 ? 'item is' : 'items are'} not available at this location
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowStoreLocator(true)}
                      disabled={isCheckingInventory}
                      className="btn btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                      aria-label={`Change pickup store. Current store: ${groupedItems.pickup[0]?.storeName}`}
                      aria-disabled={isCheckingInventory}
                    >
                      Change Store
                    </button>
                  </div>

                  {/* Loading State */}
                  {isCheckingInventory ? (
                    <div className="py-12 flex flex-col items-center justify-center" role="status" aria-live="polite">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-blue-500 border-t-transparent mb-4" aria-hidden="true"></div>
                      <p className="text-sm text-brand-gray-600 font-medium">
                        Checking inventory availability...
                      </p>
                      <p className="text-xs text-brand-gray-500 mt-1">
                        Please wait while we verify item availability at this location
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Available Items */}
                      {groupedItems.availablePickup.length > 0 && (
                        <div className="space-y-8 md:space-y-12" role="list" aria-label="Available items for pickup">
                          {groupedItems.availablePickup.map((item, index) => (
                            <div key={item.id} role="listitem">
                              <CartItemRow
                                item={item}
                                onQuantityChange={handleQuantityChange}
                                onRemove={handleRemove}
                                onAddToWishlist={handleAddToWishlist}
                                onToggleGift={handleToggleGift}
                                onEdit={handleEditItem}
                                onFulfillmentChange={handleFulfillmentChange}
                                isLast={index === groupedItems.availablePickup.length - 1 && groupedItems.unavailablePickup.length === 0}
                                isLoading={loadingItems.has(item.id)}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Unavailable Items */}
                      {groupedItems.unavailablePickup.length > 0 && (
                        <div className="mt-4 md:mt-8 pt-4 md:pt-8 border-t border-brand-gray-200" role="region" aria-labelledby="unavailable-items-heading">
                          <h3 id="unavailable-items-heading" className="text-base md:text-lg font-semibold text-brand-black mb-3 md:mb-4">
                            Not Available at {groupedItems.pickup[0]?.storeName}
                          </h3>
                          <div className="space-y-8 md:space-y-12" role="list" aria-label="Items not available at selected store">
                            {groupedItems.unavailablePickup.map((item, index) => (
                              <div key={item.id} role="listitem">
                                <CartItemRow
                                  item={item}
                                  onQuantityChange={handleQuantityChange}
                                  onRemove={handleRemove}
                                  onAddToWishlist={handleAddToWishlist}
                                  onToggleGift={handleToggleGift}
                                  onEdit={handleEditItem}
                                  onFulfillmentChange={handleFulfillmentChange}
                                  isUnavailable
                                  isLast={index === groupedItems.unavailablePickup.length - 1}
                                  isLoading={loadingItems.has(item.id)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}


              {/* BOGO Section */}
              {groupedItems.bogo.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
                  <h2 className="text-base font-medium text-brand-black mb-6">
                    <span className="font-bold">Buy one Classic Fit Shirt and get a free sock</span>
                    <span className="font-normal"> (1 of 1 selected)</span>
                  </h2>
                  <div className="space-y-4 md:space-y-8">
                    {groupedItems.bogo.map((item) => (
                      <CartItemRow
                        key={item.id}
                        item={item}
                        onQuantityChange={handleQuantityChange}
                        onRemove={handleRemove}
                        onAddToWishlist={handleAddToWishlist}
                        onToggleGift={handleToggleGift}
                        onEdit={handleEditItem}
                        onFulfillmentChange={handleFulfillmentChange}
                        isSmall
                        isLoading={loadingItems.has(item.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Section */}
              {groupedItems.delivery.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
                  <div className="flex items-start gap-2 mb-6">
                    <svg className="w-5 h-5 text-brand-black mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h2 className="text-lg md:text-xl font-medium text-brand-black">
                        Delivery - {groupedItems.delivery.length} out of {cartItems.length} items
                      </h2>
                      <p className="text-xs md:text-sm text-brand-gray-600 mt-1">
                        {groupedItems.delivery[0]?.shippingAddress}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8 md:space-y-12">
                    {groupedItems.delivery.map((item, index) => (
                      <CartItemRow
                        key={item.id}
                        item={item}
                        onQuantityChange={handleQuantityChange}
                        onRemove={handleRemove}
                        onAddToWishlist={handleAddToWishlist}
                        onToggleGift={handleToggleGift}
                        onEdit={handleEditItem}
                        onFulfillmentChange={handleFulfillmentChange}
                        isLast={index === groupedItems.delivery.length - 1}
                        isLoading={loadingItems.has(item.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {cartItems.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-8 md:p-16 text-center">
                  <svg className="w-24 h-24 text-brand-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-brand-black mb-2">Your cart is empty</h3>
                  <p className="text-sm text-brand-gray-600 mb-8">Start shopping to add items to your cart</p>
                  <Link href="/shop" className="btn btn-primary">
                    Start Shopping
                  </Link>
                </div>
              )}

              {/* Cross-sell Recommendations */}
              {recommendedProducts.length > 0 && (
                <div className="mt-8 md:mt-12">
                  <div className="mb-6">
                    <h2 className="text-xl md:text-2xl font-semibold text-brand-black">You may also like</h2>
                    <p className="text-sm text-brand-gray-600 mt-1">Complete your order with these recommendations</p>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {recommendedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onUnifiedAction={handleRecommendedUnifiedAction}
                        onAddToWishlist={handleRecommendedAddToWishlist}
                        isInWishlist={wishlistIds.includes(product.id)}
                        allProducts={allProducts}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Summary Sidebar */}
            {cartItems.length > 0 && (
              <div className="w-full lg:w-[343px] flex-shrink-0 order-first lg:order-last" ref={checkoutSectionRef}>
                <CartSummary
                  subtotal={calculations.subtotal}
                  promotions={calculations.promotionDiscount}
                  shipping={calculations.shipping}
                  tax={calculations.tax}
                  total={calculations.total}
                  appliedPromotions={appliedPromotions}
                  promoCode={promoCode}
                  onPromoCodeChange={setPromoCode}
                  showPromoInput={showPromoInput}
                  onTogglePromoInput={() => setShowPromoInput(!showPromoInput)}
                  onApplyPromo={handleApplyPromo}
                  onRemovePromo={handleRemovePromo}
                  isCheckingInventory={isCheckingInventory}
                  hasLoadingItems={loadingItems.size > 0}
                  showApproachingSurpriseGift={calculations.showApproachingSurpriseGift}
                  approachingSurpriseGiftRemaining={calculations.approachingSurpriseGiftRemaining}
                  approachingSurpriseGiftProgress={calculations.approachingSurpriseGiftProgress}
                  hasSurpriseGift={calculations.hasSurpriseGift}
                  surpriseGiftThreshold={calculations.surpriseGiftThreshold}
                  surpriseGiftStartThreshold={calculations.surpriseGiftStartThreshold}
                />
              </div>
            )}
          </div>
        </div>

        {/* New Arrivals Section - Full Width */}
        {newArrivals.length > 0 && (
          <div className="bg-brand-gray-50 mt-12 md:mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
              <div className="mb-8 md:mb-10 text-center">
                <h2 className="text-2xl md:text-3xl font-semibold text-brand-black tracking-tight mb-2">
                  New Arrivals
                </h2>
                <p className="text-sm text-brand-gray-600">Discover our latest collection</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {newArrivals.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onUnifiedAction={handleRecommendedUnifiedAction}
                    onAddToWishlist={handleRecommendedAddToWishlist}
                    isInWishlist={wishlistIds.includes(product.id)}
                    allProducts={allProducts}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Mobile Order Summary */}
      {showMobileStickySummary && cartItems.length > 0 && (
        <div 
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-brand-gray-200 shadow-lg"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-brand-black">Estimated Total</span>
              <span className="text-lg font-semibold text-brand-black">${calculations.total.toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              className={`w-full btn btn-primary text-center block flex items-center justify-center gap-2 ${
                isCheckingInventory || loadingItems.size > 0 
                  ? 'opacity-50 cursor-not-allowed pointer-events-none' 
                  : ''
              }`}
              aria-disabled={isCheckingInventory || loadingItems.size > 0}
              tabIndex={isCheckingInventory || loadingItems.size > 0 ? -1 : 0}
            >
              <span>Proceed to Checkout</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      <Footer />

      {/* Store Locator Modal */}
      <StoreLocatorModal
        isOpen={showStoreLocator}
        onClose={() => setShowStoreLocator(false)}
        onSelectStore={handleSelectStore}
        selectedStoreId={selectedStoreId || '1'}
      />

      {/* Edit Cart Item Modal */}
      {editingItem && (
        <EditCartItemModal
          product={editingItem.product}
          currentSize={editingItem.size}
          currentColor={editingItem.color}
          currentQuantity={editingItem.quantity}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onUpdate={handleUpdateItem}
        />
      )}

      {/* Remove Confirmation Modal */}
      <RemoveConfirmationModal
        isOpen={!!removingItem}
        productName={removingItem?.product.name || ''}
        onConfirm={confirmRemove}
        onCancel={() => setRemovingItem(null)}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type="success"
      />

      {/* Quick View Modal for Recommended Products */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          productVariants={[]}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleRecommendedAddToCart}
          onAddToWishlist={handleRecommendedAddToWishlist}
          onNotify={(product) => setNotifyMeProduct(product)}
        />
      )}

      {/* Notify Me Modal */}
      {notifyMeProduct && (
        <NotifyMeModal
          product={notifyMeProduct}
          isOpen={!!notifyMeProduct}
          onClose={() => setNotifyMeProduct(null)}
          onNotify={handleRecommendedNotifyMe}
        />
      )}
    </div>
  )
}

// Cart Item Row Component
interface CartItemRowProps {
  item: ExtendedCartItem
  onQuantityChange: (itemId: string, quantity: number) => void
  onRemove: (item: ExtendedCartItem) => void
  onAddToWishlist: (item: ExtendedCartItem) => void
  onToggleGift: (itemId: string) => void
  onEdit: (item: ExtendedCartItem) => void
  onFulfillmentChange: (itemId: string, method: 'pickup' | 'delivery') => void
  isSmall?: boolean
  isUnavailable?: boolean
  isLast?: boolean
  isLoading?: boolean
}

function CartItemRow({
  item,
  onQuantityChange,
  onRemove,
  onAddToWishlist,
  onToggleGift,
  onEdit,
  onFulfillmentChange,
  isSmall = false,
  isUnavailable = false,
  isLast = false,
  isLoading = false,
}: CartItemRowProps) {
  const [showFulfillmentDropdown, setShowFulfillmentDropdown] = useState(false)
  const fulfillmentDropdownRef = useRef<HTMLDivElement>(null)
  const fulfillmentDropdownMobileRef = useRef<HTMLDivElement>(null)
  const imageSize = isSmall ? 'w-20 h-20 md:w-24 md:h-24' : 'w-20 h-20 md:w-28 md:h-28'

  // Handle click outside to close dropdown (works for both mobile and desktop)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isInsideDesktop = fulfillmentDropdownRef.current?.contains(target)
      const isInsideMobile = fulfillmentDropdownMobileRef.current?.contains(target)
      
      // Close if click is outside both dropdown containers
      if (!isInsideDesktop && !isInsideMobile) {
        setShowFulfillmentDropdown(false)
      }
    }

    if (showFulfillmentDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFulfillmentDropdown])

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 bg-white bg-opacity-90 z-10 flex items-center justify-center py-3 rounded-t-lg" role="status" aria-live="polite">
          <div className="flex items-center gap-2 text-sm text-brand-gray-600">
            <svg className="animate-spin h-4 w-4 text-brand-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Updating...</span>
          </div>
        </div>
      )}
      
      <div 
        className={`flex gap-4 md:gap-6 py-4 px-4 md:px-6 ${isLast ? '' : 'border-b border-brand-gray-200'} ${isUnavailable ? 'opacity-60' : ''} ${isLoading ? 'opacity-50' : ''}`}
        role={isUnavailable ? 'alert' : undefined}
        aria-label={isUnavailable ? `${item.product.name} is not available at the selected store` : undefined}
        aria-busy={isLoading}
      >
        {/* Product Image */}
        <Link 
          href={`/product/${item.product.id}`}
          className={`flex-shrink-0 ${imageSize} bg-brand-gray-100 rounded-lg overflow-hidden block hover:opacity-90 transition-opacity`}
        >
          <img
            src={item.product.image}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
        </Link>

        {/* Product Details - Middle Column */}
        <div className="flex-1 min-w-0">
          {/* Product Name with Fulfillment Badge (Mobile) */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <Link 
              href={`/product/${item.product.id}`}
              className="text-sm md:text-base font-medium line-clamp-2 text-brand-black hover:underline flex-1"
            >
              {item.product.name}
            </Link>
            {/* Fulfillment Badge - Mobile (right-aligned) */}
            {item.fulfillmentMethod && (
              <div className="md:hidden relative flex-shrink-0" ref={fulfillmentDropdownMobileRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowFulfillmentDropdown(!showFulfillmentDropdown)
                  }}
                  disabled={isLoading}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${
                    item.fulfillmentMethod === 'pickup' 
                      ? 'bg-brand-blue-100 text-brand-blue-700' 
                      : 'bg-brand-gray-100 text-brand-gray-700'
                  }`}
                  aria-label={`${item.fulfillmentMethod === 'pickup' ? 'Store pickup' : 'Delivery'}. Click to change.`}
                  aria-expanded={showFulfillmentDropdown}
                  aria-disabled={isLoading}
                >
                  {item.fulfillmentMethod === 'pickup' ? (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Pickup
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Delivery
                    </>
                  )}
                </button>
                
                {showFulfillmentDropdown && (
                  <>
                    {/* Dropdown Menu - Mobile */}
                    <div 
                      className="absolute top-full right-0 mt-1 min-w-[180px] z-50 bg-white border border-brand-gray-200 rounded-lg shadow-lg"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onFulfillmentChange(item.id, 'pickup')
                          setShowFulfillmentDropdown(false)
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          item.fulfillmentMethod === 'pickup'
                            ? 'bg-brand-blue-50 text-brand-blue-700'
                            : 'text-brand-black hover:bg-brand-gray-50'
                        }`}
                      >
                        {item.fulfillmentMethod === 'pickup' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span>Pick Up in Store</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onFulfillmentChange(item.id, 'delivery')
                          setShowFulfillmentDropdown(false)
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          item.fulfillmentMethod === 'delivery'
                            ? 'bg-brand-blue-50 text-brand-blue-700'
                            : 'text-brand-black hover:bg-brand-gray-50'
                        }`}
                      >
                        {item.fulfillmentMethod === 'delivery' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span>Ship to Address</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            {/* Availability Badge */}
            {item.fulfillmentMethod === 'pickup' && item.isAvailableAtStore === false && (
              <span 
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-red-100 text-red-700 flex-shrink-0"
                role="status"
                aria-label="Not available at selected store"
              >
                Not Available
              </span>
            )}
          </div>
          
          {/* Size/Color Info */}
          <div className="text-xs md:text-sm text-brand-gray-600 mb-2">
            {item.size && <span>Size: {item.size}</span>}
          </div>

          {/* Short Description (Desktop only) */}
          {item.product.shortDescription && (
            <p className="hidden md:block text-sm text-brand-gray-600 mb-3">
              {item.product.shortDescription}
            </p>
          )}

          {/* Unavailable Message */}
          {item.fulfillmentMethod === 'pickup' && item.isAvailableAtStore === false && (
            <p className="text-xs text-red-600 font-medium mb-2" role="alert">
              Not available at this store
            </p>
          )}

          {/* Mobile: Price and Quantity */}
          <div className="md:hidden">
            {/* Price */}
            <div className="flex flex-col gap-1 mb-2">
              <div className="flex items-center gap-2">
                {item.isSurpriseGift ? (
                  <span className="text-sm font-semibold text-green-600">
                    Free
                  </span>
                ) : (
                  <>
                    <span className="text-sm font-semibold text-brand-black">
                      ${item.price.toFixed(2)}
                    </span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-xs text-brand-gray-500 line-through">
                        ${item.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </>
                )}
              </div>
              {item.isSurpriseGift && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-medium w-fit">
                  Surprise Gift
                </span>
              )}
              {!item.isSurpriseGift && item.originalPrice && item.originalPrice > item.price && (
                <span className="text-xs bg-brand-blue-100 text-brand-blue-700 px-2 py-0.5 rounded-md font-medium w-fit">
                  Saved ${((item.originalPrice - item.price) * item.quantity).toFixed(2)}
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 mb-2">
              <label htmlFor={`quantity-mobile-${item.id}`} className="text-xs text-brand-gray-600">
                Quantity:
              </label>
              <div className={`flex items-center border border-brand-gray-300 rounded-lg ${isUnavailable || isLoading ? 'opacity-50' : ''}`}>
                <button
                  onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                  disabled={isUnavailable || isLoading}
                  className="p-1.5 text-brand-black hover:bg-brand-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Decrease quantity for ${item.product.name}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <input
                  id={`quantity-mobile-${item.id}`}
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10)
                    if (!isNaN(value) && value > 0) {
                      onQuantityChange(item.id, value)
                    }
                  }}
                  disabled={isUnavailable || isLoading}
                  className="w-12 text-center text-sm text-brand-black border-0 focus:outline-none focus:ring-0 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    MozAppearance: 'textfield',
                    WebkitAppearance: 'none',
                  }}
                  aria-label={`Quantity for ${item.product.name}`}
                />
                <button
                  onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                  disabled={isUnavailable || isLoading}
                  className="p-1.5 text-brand-black hover:bg-brand-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Increase quantity for ${item.product.name}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-2 md:gap-3">
            {/* This is a gift - first line on mobile */}
            <label className="flex items-center gap-2 text-xs md:text-sm text-brand-black cursor-pointer">
              <input
                type="checkbox"
                checked={item.isGift || false}
                onChange={() => onToggleGift(item.id)}
                className="w-4 h-4 border-brand-gray-300 rounded text-brand-blue-500 focus:ring-brand-blue-500"
              />
              <span>This is a gift.</span>
            </label>
            
            {/* Edit, Remove, Add to Wishlist - second line on mobile */}
            <div className="flex gap-3 items-center">
              <button
                onClick={() => onEdit(item)}
                className="text-xs md:text-sm text-brand-blue-500 hover:text-brand-blue-600 font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue-500 rounded"
                aria-label={`Edit ${item.product.name}`}
              >
                Edit
              </button>
              <button
                onClick={() => onRemove(item)}
                className="text-xs md:text-sm text-brand-blue-500 hover:text-brand-blue-600 font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue-500 rounded"
                aria-label={`Remove ${item.product.name} from cart`}
              >
                Remove
              </button>
              <button
                onClick={() => onAddToWishlist(item)}
                className="text-xs md:text-sm text-brand-blue-500 hover:text-brand-blue-600 font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue-500 rounded"
                aria-label={`Add ${item.product.name} to wishlist`}
              >
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Fulfillment, Price & Quantity (Desktop only) */}
        <div className="hidden md:flex flex-col items-end flex-shrink-0 min-w-[140px]">
          {/* Fulfillment Badge - Clickable */}
          {!isSmall && item.fulfillmentMethod && (
            <div className="relative mb-2" ref={fulfillmentDropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowFulfillmentDropdown(!showFulfillmentDropdown)
                }}
                disabled={isLoading}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${
                  item.fulfillmentMethod === 'pickup' 
                    ? 'bg-brand-blue-100 text-brand-blue-700' 
                    : 'bg-brand-gray-100 text-brand-gray-700'
                }`}
                aria-label={`${item.fulfillmentMethod === 'pickup' ? 'Store pickup' : 'Delivery'}. Click to change.`}
                aria-expanded={showFulfillmentDropdown}
                aria-disabled={isLoading}
              >
                {item.fulfillmentMethod === 'pickup' ? (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Pickup
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Delivery
                  </>
                )}
              </button>
              
              {showFulfillmentDropdown && (
                <>
                  {/* Dropdown Menu */}
                  <div 
                    className="absolute top-full right-0 mt-1 min-w-[180px] z-50 bg-white border border-brand-gray-200 rounded-lg shadow-lg"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onFulfillmentChange(item.id, 'pickup')
                        setShowFulfillmentDropdown(false)
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        item.fulfillmentMethod === 'pickup'
                          ? 'bg-brand-blue-50 text-brand-blue-700'
                          : 'text-brand-black hover:bg-brand-gray-50'
                      }`}
                    >
                      {item.fulfillmentMethod === 'pickup' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      <span>Pick Up in Store</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onFulfillmentChange(item.id, 'delivery')
                        setShowFulfillmentDropdown(false)
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        item.fulfillmentMethod === 'delivery'
                          ? 'bg-brand-blue-50 text-brand-blue-700'
                          : 'text-brand-black hover:bg-brand-gray-50'
                      }`}
                    >
                      {item.fulfillmentMethod === 'delivery' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      <span>Ship to Address</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Price */}
          <div className="text-right mb-4">
            {item.isSurpriseGift ? (
              <>
                <span className="text-lg font-semibold text-green-600">Free</span>
                <div className="mt-1">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-medium">
                    Surprise Gift
                  </span>
                </div>
              </>
            ) : (
              <>
                <span className="text-lg font-semibold text-brand-black">
                  ${item.price.toFixed(2)}
                </span>
                {item.originalPrice && item.originalPrice > item.price && (
                  <>
                    <span className="block text-sm text-brand-gray-500 line-through">
                      ${item.originalPrice.toFixed(2)}
                    </span>
                    <span className="inline-block mt-1 text-xs bg-brand-blue-100 text-brand-blue-700 px-2 py-0.5 rounded-md font-medium">
                      Saved ${((item.originalPrice - item.price) * item.quantity).toFixed(2)}
                    </span>
                  </>
                )}
              </>
            )}
          </div>

          {/* Quantity Selector */}
          <div>
            <label htmlFor={`quantity-desktop-${item.id}`} className="block text-sm text-brand-gray-600 mb-2 text-right">
              Quantity:
            </label>
            <div className={`flex items-center border border-brand-gray-300 rounded-lg ${isUnavailable || isLoading ? 'opacity-50' : ''}`}>
              <button
                onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                disabled={isUnavailable || isLoading}
                className="px-3 py-2 text-brand-black hover:bg-brand-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Decrease quantity for ${item.product.name}`}
              >
                −
              </button>
              <input
                id={`quantity-desktop-${item.id}`}
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10)
                  if (!isNaN(value) && value > 0) {
                    onQuantityChange(item.id, value)
                  }
                }}
                disabled={isUnavailable || isLoading}
                className="w-10 text-center text-sm text-brand-black border-0 focus:outline-none focus:ring-0 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  MozAppearance: 'textfield',
                  WebkitAppearance: 'none',
                }}
                aria-label={`Quantity for ${item.product.name}`}
              />
              <button
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                disabled={isUnavailable || isLoading}
                className="px-3 py-2 text-brand-black hover:bg-brand-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Increase quantity for ${item.product.name}`}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Cart Summary Component
interface CartSummaryProps {
  subtotal: number
  promotions: number
  shipping: number
  tax: number
  total: number
  appliedPromotions: Array<{ name: string; discount: number }>
  promoCode: string
  onPromoCodeChange: (code: string) => void
  showPromoInput: boolean
  onTogglePromoInput: () => void
  onApplyPromo: () => void
  onRemovePromo: (index: number) => void
  isCheckingInventory?: boolean
  hasLoadingItems?: boolean
  showApproachingSurpriseGift?: boolean
  approachingSurpriseGiftRemaining?: number
  approachingSurpriseGiftProgress?: number
  hasSurpriseGift?: boolean
  surpriseGiftThreshold?: number
  surpriseGiftStartThreshold?: number
}

function CartSummary({
  subtotal,
  promotions,
  shipping,
  tax,
  total,
  appliedPromotions,
  promoCode,
  onPromoCodeChange,
  showPromoInput,
  onTogglePromoInput,
  onApplyPromo,
  onRemovePromo,
  isCheckingInventory = false,
  hasLoadingItems = false,
  showApproachingSurpriseGift = false,
  approachingSurpriseGiftRemaining = 0,
  approachingSurpriseGiftProgress = 0,
  hasSurpriseGift = false,
  surpriseGiftThreshold = 60,
  surpriseGiftStartThreshold = 25,
}: CartSummaryProps) {
  const isDisabled = isCheckingInventory || hasLoadingItems
  return (
    <div className="bg-white border border-brand-gray-200 rounded-lg shadow-sm lg:sticky lg:top-20">
      {/* Header */}
      <div className="px-4 md:px-6 py-3.5 border-b border-brand-gray-200">
        <h2 className="text-base font-semibold text-brand-black">Order Summary</h2>
      </div>

      {/* Approaching Surprise Gift Component */}
      {showApproachingSurpriseGift && (
        <div className="px-4 md:px-6 py-3 border-b border-brand-gray-200">
          {hasSurpriseGift ? (
            // Success State
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-xs text-brand-gray-600 text-center">
                  Success! Your order qualifies for a <span className="font-semibold text-brand-blue-600 underline">Surprise Item!</span>
                </p>
              </div>
              {/* Progress Bar - Fully Filled */}
              <div className="relative w-full h-1.5 bg-brand-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-brand-blue-500 transition-all duration-300 rounded-full"
                  style={{ width: '100%' }}
                  role="progressbar"
                  aria-valuenow={100}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Surprise gift progress: 100%"
                />
              </div>
              <div className="flex justify-between text-xs text-brand-gray-600">
                <span>${subtotal.toFixed(2)}</span>
                <span>${surpriseGiftThreshold.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            // Approaching State
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-brand-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <p className="text-xs text-brand-gray-600">
                  Spend <span className="font-semibold text-brand-black">${approachingSurpriseGiftRemaining.toFixed(2)}</span> more to unlock a <span className="font-semibold text-brand-blue-600">Surprise Item!</span>
                </p>
              </div>
              {/* Progress Bar */}
              <div className="relative w-full h-1.5 bg-brand-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-brand-blue-500 transition-all duration-300 rounded-full"
                  style={{ width: `${approachingSurpriseGiftProgress}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round(approachingSurpriseGiftProgress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Surprise gift progress: ${Math.round(approachingSurpriseGiftProgress)}%`}
                />
              </div>
              <div className="flex justify-between text-xs text-brand-gray-600">
                <span>${subtotal.toFixed(2)}</span>
                <span>${surpriseGiftThreshold.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Line Items */}
      <div className="px-4 md:px-6 py-4 space-y-1">
        <div className="flex justify-between text-sm text-brand-gray-600">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {promotions > 0 && (
          <div className="flex justify-between text-sm text-brand-gray-600">
            <span>Promotions</span>
            <span>-${promotions.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-brand-gray-600">
          <span>Shipping</span>
          <span>${shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-brand-gray-600">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
      </div>

      {/* Promotion Code */}
      <div className="px-4 md:px-6 py-2 border-t border-brand-gray-200">
        <button
          onClick={onTogglePromoInput}
          className="flex items-center gap-2 text-sm text-brand-blue-500 hover:text-brand-blue-600 font-medium w-full"
        >
          <span>Do you have a promo code?</span>
          <svg
            className={`w-4 h-4 transition-transform ${showPromoInput ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showPromoInput && (
          <div className="mt-3 space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-brand-gray-600 mb-1">Promo Code</label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => onPromoCodeChange(e.target.value)}
                  placeholder=""
                  className="w-full px-3 py-2 bg-white border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={onApplyPromo}
                  className="px-4 py-2 bg-brand-blue-500 text-white rounded-lg text-sm font-medium hover:bg-brand-blue-600 transition-colors h-[42px]"
                >
                  Apply
                </button>
              </div>
            </div>
            {appliedPromotions.map((promo, idx) => (
              <div key={idx} className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs bg-brand-gray-100 text-brand-gray-700 px-2 py-0.5 rounded-md font-semibold">
                    {promo.name}
                  </span>
                  <button
                    onClick={() => onRemovePromo(idx)}
                    className="text-brand-gray-500 hover:text-brand-red-500 transition-colors p-1"
                    aria-label={`Remove ${promo.name}`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <span className="text-sm text-brand-gray-600">-${promo.discount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estimated Total */}
      <div className="px-4 md:px-6 py-4 border-t border-brand-gray-200">
        <div className="flex justify-between text-sm font-semibold text-brand-black">
          <span>Estimated Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 md:px-6 py-4 md:py-6 border-t border-brand-gray-200 space-y-4">
        <Link
          href="/checkout"
          className={`w-full btn btn-primary text-center block flex items-center justify-center gap-2 ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
          aria-disabled={isDisabled}
          tabIndex={isDisabled ? -1 : 0}
        >
          <span>Proceed to Checkout</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </Link>

        {/* Payment Method Logos */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="flex items-center">
            <span className="text-xs text-brand-gray-500 font-semibold">VISA</span>
          </div>
          <div className="flex items-center">
            <svg className="w-8 h-5" viewBox="0 0 40 24" fill="none">
              <circle cx="12" cy="12" r="8" fill="#EB001B" />
              <circle cx="28" cy="12" r="8" fill="#F79E1B" />
            </svg>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-brand-gray-500 font-semibold">AMEX</span>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-brand-gray-500 font-semibold">DISCOVER</span>
          </div>
        </div>
      </div>
    </div>
  )
}
