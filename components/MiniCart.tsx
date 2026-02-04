'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Product } from './ProductListingPage'
import StoreLocatorModal from './StoreLocatorModal'
import { getAllProducts } from '../lib/products'

export interface CartItem {
  id: string
  product: Product
  quantity: number
  size?: string
  color?: string
  price: number
  originalPrice?: number
  fulfillmentMethod?: 'pickup' | 'delivery'
  storeId?: string
  storeName?: string
  storeAddress?: string
  shippingAddress?: string
  isAvailableAtStore?: boolean
  isSurpriseGift?: boolean
  isGift?: boolean
  isBOGO?: boolean
  bogoPromotionId?: string
}

interface MiniCartProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
  onCheckout: () => void
  onContinueShopping: () => void
  onViewCart: () => void
  onAddUpsellToCart?: (product: Product) => void
  upsellProduct?: Product
  freeShippingThreshold?: number
  onStoreChange?: (store: { id: string; name: string; address: string; distance: number; hours: string; status: 'open' | 'closed' | 'closing-soon'; hasProduct: boolean; pickupTime: string | null }) => void
  onFulfillmentChange?: (itemId: string, method: 'pickup' | 'delivery') => void
}

export default function MiniCart({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onContinueShopping,
  onViewCart,
  onAddUpsellToCart,
  upsellProduct,
  freeShippingThreshold = 60,
  onStoreChange,
  onFulfillmentChange,
}: MiniCartProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)
  const lastFocusableRef = useRef<HTMLButtonElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollableContentRef = useRef<HTMLDivElement>(null)
  const highlightedItemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [showStoreLocator, setShowStoreLocator] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [fulfillmentDropdowns, setFulfillmentDropdowns] = useState<Record<string, boolean>>({})
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null)
  const [pendingScrollProductId, setPendingScrollProductId] = useState<string | null>(null)
  
  // Track hover state and notify parent to prevent auto-close
  useEffect(() => {
    if (!isOpen) return
    
    const handleMouseEnter = () => {
      window.dispatchEvent(new CustomEvent('minicartHover', { detail: { isHovering: true } }))
    }
    const handleMouseLeave = () => {
      window.dispatchEvent(new CustomEvent('minicartHover', { detail: { isHovering: false } }))
    }
    
    const drawer = drawerRef.current
    if (drawer) {
      drawer.addEventListener('mouseenter', handleMouseEnter)
      drawer.addEventListener('mouseleave', handleMouseLeave)
      return () => {
        drawer.removeEventListener('mouseenter', handleMouseEnter)
        drawer.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [isOpen])
  
  // Group items by fulfillment method
  const pickupItems = items.filter(item => item.fulfillmentMethod === 'pickup')
  const deliveryItems = items.filter(item => item.fulfillmentMethod === 'delivery' || !item.fulfillmentMethod)
  const selectedStoreId = pickupItems.length > 0 ? pickupItems[0]?.storeId : '1'

  const [allProducts, setAllProducts] = useState<Product[]>([])
  
  // Load products for upsell
  useEffect(() => {
    const loadProducts = async () => {
      const products = await getAllProducts()
      setAllProducts(products)
    }
    loadProducts()
  }, [])

  // Get upsell products (exclude items already in cart)
  const cartProductIds = items.map(item => item.product.id)
  const upsellProducts = upsellProduct && allProducts.length > 0
    ? allProducts
        .filter(p => !cartProductIds.includes(p.id))
        .slice(0, 5)
    : []

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    if (upsellProducts.length > 0) {
      checkScrollability()
      const container = scrollContainerRef.current
      if (container) {
        container.addEventListener('scroll', checkScrollability)
        return () => container.removeEventListener('scroll', checkScrollability)
      }
    }
  }, [upsellProducts.length])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  // Calculate cart totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalSavings = items.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + (item.originalPrice - item.price) * item.quantity
    }
    return sum
  }, 0)
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal)
  const progressPercentage = Math.min(100, (subtotal / freeShippingThreshold) * 100)

  // Focus trap and ESC key handling
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key === 'Tab') {
        if (!drawerRef.current) return

        const focusableElements = drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    // Focus first element when drawer opens
    setTimeout(() => {
      firstFocusableRef.current?.focus()
    }, 100)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Listen for item added event to highlight it and scroll into view
  useEffect(() => {
    const handleItemAdded = (e: CustomEvent<{ itemId: string }>) => {
      const { itemId } = e.detail
      setHighlightedItemId(itemId)
      
      // Scroll the highlighted item into view after a short delay to allow minicart to open
      setTimeout(() => {
        const itemElement = highlightedItemRefs.current[itemId]
        if (itemElement && scrollableContentRef.current) {
          // Scroll the item into view with smooth behavior
          itemElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest',
            inline: 'nearest'
          })
        }
      }, 100)
      
      // Remove highlight after animation completes
      setTimeout(() => {
        setHighlightedItemId(null)
      }, 2000)
    }

    window.addEventListener('itemAddedToMiniCart', handleItemAdded as EventListener)
    return () => {
      window.removeEventListener('itemAddedToMiniCart', handleItemAdded as EventListener)
    }
  }, [])

  // Watch for pending scroll product to appear in items array
  useEffect(() => {
    if (pendingScrollProductId) {
      const newItem = items.find(item => item.product.id === pendingScrollProductId)
      if (newItem) {
        setHighlightedItemId(newItem.id)
        // Wait for element to be rendered and ref to be set
        const scrollToItem = () => {
          const itemElement = highlightedItemRefs.current[newItem.id]
          if (itemElement && scrollableContentRef.current) {
            // Scroll the item into view with smooth behavior (same as regular item added)
            itemElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'nearest',
              inline: 'nearest'
            })
          } else {
            // Element not ready yet, try again after a short delay
            setTimeout(scrollToItem, 50)
          }
        }
        // Start checking after a brief delay to allow DOM update
        setTimeout(scrollToItem, 150)
        // Remove highlight after animation completes
        setTimeout(() => {
          setHighlightedItemId(null)
        }, 2000)
        setPendingScrollProductId(null)
      }
    }
  }, [items, pendingScrollProductId])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-xl"
        style={{ animation: 'slideInRight 0.3s ease-out' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mini-cart-title"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 md:p-6 border-b border-brand-gray-200">
          <h2 id="mini-cart-title" className="text-lg md:text-xl font-semibold text-brand-black">
            My Cart ({items.length})
          </h2>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="p-2 text-brand-black hover:text-brand-gray-600 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500"
            aria-label="Close cart"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="flex-shrink-0 bg-brand-gray-50 border-b border-brand-gray-200">
          <div className="px-4 md:px-6 py-8">
            {freeShippingRemaining > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-brand-black text-center">
                  You are <span className="font-bold">${freeShippingRemaining.toFixed(2)}</span> away from{' '}
                  <span className="font-bold text-brand-blue-500">Free Shipping</span>
                </p>
                <div className="relative w-full h-2 bg-brand-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-brand-blue-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                    role="progressbar"
                    aria-valuenow={Math.round(progressPercentage)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Free shipping progress: ${Math.round(progressPercentage)}%`}
                  />
                </div>
                <div className="flex justify-between text-xs text-brand-gray-600">
                  <span>${subtotal.toFixed(2)}</span>
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

        {/* Scrollable Content */}
        <div ref={scrollableContentRef} className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="pt-4 md:pt-6 pb-4 md:pb-6 space-y-4">
            {/* Cart Items */}
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                {/* Shopping Cart Icon */}
                <div className="mb-6 relative">
                  <svg 
                    className="w-24 h-24 text-brand-gray-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                    />
                  </svg>
                </div>
                
                {/* Friendly Message */}
                <h3 className="text-xl font-semibold text-brand-black mb-2">
                  Your cart is empty
                </h3>
                <p className="text-sm text-brand-gray-600 mb-8 max-w-sm">
                  Looks like you haven&apos;t added anything to your cart yet. Start shopping to fill it up with amazing products!
                </p>
                
                {/* CTA Button */}
                <button
                  onClick={onContinueShopping}
                  className="btn btn-primary"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Pickup Store Info Section - At Top of Pickup Items */}
                {pickupItems.length > 0 && (
                  <div className="px-4 md:px-6 pb-4 border-b border-brand-gray-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1">
                        <svg className="w-5 h-5 text-brand-black flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-brand-black">
                              Pickup Store
                            </h3>
                            {onStoreChange && (
                              <button
                                onClick={() => setShowStoreLocator(true)}
                                className="text-sm text-brand-blue-500 hover:text-brand-blue-600 font-medium underline underline-offset-2 transition-colors"
                                aria-label={`Change pickup store. Current store: ${pickupItems[0]?.storeName}`}
                              >
                                Change
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-brand-gray-600">
                            {pickupItems[0]?.storeName}
                          </p>
                          <p className="text-sm text-brand-gray-600">
                            {pickupItems[0]?.storeAddress}
                          </p>
                          {pickupItems.some(item => item.isAvailableAtStore === false) && (
                            <p className="text-xs text-red-600 font-medium mt-1">
                              {pickupItems.filter(item => item.isAvailableAtStore === false).length} {pickupItems.filter(item => item.isAvailableAtStore === false).length === 1 ? 'item' : 'items'} not available
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pickup Items */}
                {pickupItems.length > 0 && (
                  <div className="py-4 md:py-6 divide-y divide-brand-gray-200">
                    {pickupItems.map((item, index) => {
                      const isHighlighted = highlightedItemId === item.id
                      return (
                      <div
                        key={item.id}
                        ref={(el) => {
                          if (el) highlightedItemRefs.current[item.id] = el
                        }}
                        className={`flex gap-4 py-4 px-4 md:px-6 transition-colors duration-500 ${
                          isHighlighted 
                            ? 'bg-brand-blue-50 rounded-lg' 
                            : ''
                        }`}
                      >
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 bg-brand-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1">
                            <h3 className={`text-sm font-medium line-clamp-2 flex-1 transition-colors duration-500 ${
                              isHighlighted ? 'text-brand-blue-700 font-semibold' : 'text-brand-black'
                            }`}>
                              {item.product.name}
                            </h3>
                            {/* Fulfillment Badge - Clickable */}
                            {item.fulfillmentMethod && (
                              <div className="relative flex-shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setFulfillmentDropdowns(prev => ({
                                      ...prev,
                                      [item.id]: !prev[item.id]
                                    }))
                                  }}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                                    item.fulfillmentMethod === 'pickup' 
                                      ? 'bg-brand-blue-100 text-brand-blue-700' 
                                      : 'bg-brand-gray-100 text-brand-gray-700'
                                  }`}
                                  aria-label={`${item.fulfillmentMethod === 'pickup' ? 'Store pickup' : 'Delivery'}. Click to change.`}
                                  aria-expanded={fulfillmentDropdowns[item.id]}
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
                                
                                {fulfillmentDropdowns[item.id] && (
                                  <>
                                    {/* Backdrop to close dropdown */}
                                    <div
                                      className="fixed inset-0 z-10"
                                      onClick={() => setFulfillmentDropdowns(prev => ({ ...prev, [item.id]: false }))}
                                    />
                                    {/* Dropdown Menu */}
                                    <div className="absolute top-full right-0 mt-1 min-w-[180px] z-20 bg-white border border-brand-gray-200 rounded-lg shadow-lg">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          onFulfillmentChange?.(item.id, 'pickup')
                                          setFulfillmentDropdowns(prev => ({ ...prev, [item.id]: false }))
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
                                          onFulfillmentChange?.(item.id, 'delivery')
                                          setFulfillmentDropdowns(prev => ({ ...prev, [item.id]: false }))
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
                          <div className="text-xs text-brand-gray-600 space-y-0.5 mb-2">
                            {item.color && <p>Color: {item.color}</p>}
                            {item.size && <p>Size: {item.size}</p>}
                            {/* Unavailable Message */}
                            {item.fulfillmentMethod === 'pickup' && item.isAvailableAtStore === false && (
                              <p className="text-xs text-red-600 font-medium mt-1" role="alert">
                                Not available at this store
                              </p>
                            )}
                          </div>

                          {/* Price */}
                          <div className="flex flex-col gap-1 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-brand-black">
                                ${item.price.toFixed(2)}
                              </span>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <span className="text-xs text-brand-gray-500 line-through">
                                  ${item.originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="text-xs bg-brand-blue-100 text-brand-blue-700 px-2 py-0.5 rounded-md font-medium w-fit">
                                Saved ${((item.originalPrice - item.price) * item.quantity).toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Quantity Selector */}
                          <div className="flex items-center gap-3 mb-2">
                            <label htmlFor={`quantity-${item.id}`} className="text-xs text-brand-gray-600">
                              Quantity:
                            </label>
                            <div className="flex items-center border border-brand-gray-300 rounded-lg">
                              <button
                                onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="p-1.5 text-brand-black hover:bg-brand-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500 rounded-l-lg"
                                aria-label={`Decrease quantity for ${item.product.name}`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <input
                                id={`quantity-${item.id}`}
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value, 10)
                                  if (!isNaN(value) && value > 0) {
                                    onUpdateQuantity(item.id, value)
                                  }
                                }}
                                className="w-12 text-center text-sm text-brand-black border-0 focus:outline-none focus:ring-0"
                                aria-label={`Quantity for ${item.product.name}`}
                              />
                              <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="p-1.5 text-brand-black hover:bg-brand-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500 rounded-r-lg"
                                aria-label={`Increase quantity for ${item.product.name}`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Remove Link */}
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-xs text-brand-blue-500 hover:text-brand-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500 rounded"
                            aria-label={`Remove ${item.product.name} from cart`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      )
                    })}
                  </div>
                )}

                {/* Delivery Items */}
                {deliveryItems.length > 0 && (
                  <div className="pt-4 border-t border-brand-gray-200 py-4 md:py-6 divide-y divide-brand-gray-200">
                    {deliveryItems.map((item, index) => {
                      const isHighlighted = highlightedItemId === item.id
                      return (
                      <div
                        key={item.id}
                        ref={(el) => {
                          if (el) highlightedItemRefs.current[item.id] = el
                        }}
                        className={`flex gap-4 py-4 px-4 md:px-6 transition-colors duration-500 ${
                          isHighlighted 
                            ? 'bg-brand-blue-50 rounded-lg' 
                            : ''
                        }`}
                      >
                        {/* Product Image */}
                        <div className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 bg-brand-gray-100 rounded-lg overflow-hidden transition-all duration-500 ${
                          isHighlighted ? 'ring-2 ring-brand-blue-500 ring-offset-2' : ''
                        }`}>
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1">
                            <h3 className={`text-sm font-medium line-clamp-2 flex-1 transition-colors duration-500 ${
                              isHighlighted ? 'text-brand-blue-700 font-semibold' : 'text-brand-black'
                            }`}>
                              {item.product.name}
                            </h3>
                            {/* Fulfillment Badge - Clickable */}
                            {item.fulfillmentMethod && (
                              <div className="relative flex-shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setFulfillmentDropdowns(prev => ({
                                      ...prev,
                                      [item.id]: !prev[item.id]
                                    }))
                                  }}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                                    item.fulfillmentMethod === 'pickup' 
                                      ? 'bg-brand-blue-100 text-brand-blue-700' 
                                      : 'bg-brand-gray-100 text-brand-gray-700'
                                  }`}
                                  aria-label={`${item.fulfillmentMethod === 'pickup' ? 'Store pickup' : 'Delivery'}. Click to change.`}
                                  aria-expanded={fulfillmentDropdowns[item.id]}
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
                                
                                {fulfillmentDropdowns[item.id] && (
                                  <>
                                    {/* Backdrop to close dropdown */}
                                    <div
                                      className="fixed inset-0 z-10"
                                      onClick={() => setFulfillmentDropdowns(prev => ({ ...prev, [item.id]: false }))}
                                    />
                                    {/* Dropdown Menu */}
                                    <div className="absolute top-full right-0 mt-1 min-w-[180px] z-20 bg-white border border-brand-gray-200 rounded-lg shadow-lg">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          onFulfillmentChange?.(item.id, 'pickup')
                                          setFulfillmentDropdowns(prev => ({ ...prev, [item.id]: false }))
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
                                          onFulfillmentChange?.(item.id, 'delivery')
                                          setFulfillmentDropdowns(prev => ({ ...prev, [item.id]: false }))
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
                          </div>
                          <div className="text-xs text-brand-gray-600 space-y-0.5 mb-2">
                            {item.color && <p>Color: {item.color}</p>}
                            {item.size && <p>Size: {item.size}</p>}
                          </div>

                          {/* Price */}
                          <div className="flex flex-col gap-1 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-brand-black">
                                ${item.price.toFixed(2)}
                              </span>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <span className="text-xs text-brand-gray-500 line-through">
                                  ${item.originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="text-xs bg-brand-blue-100 text-brand-blue-700 px-2 py-0.5 rounded-md font-medium w-fit">
                                Saved ${((item.originalPrice - item.price) * item.quantity).toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Quantity Selector */}
                          <div className="flex items-center gap-3 mb-2">
                            <label htmlFor={`quantity-${item.id}`} className="text-xs text-brand-gray-600">
                              Quantity:
                            </label>
                            <div className="flex items-center border border-brand-gray-300 rounded-lg">
                              <button
                                onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="p-1.5 text-brand-black hover:bg-brand-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500 rounded-l-lg"
                                aria-label={`Decrease quantity for ${item.product.name}`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <input
                                id={`quantity-${item.id}`}
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value, 10)
                                  if (!isNaN(value) && value > 0) {
                                    onUpdateQuantity(item.id, value)
                                  }
                                }}
                                className="w-12 text-center text-sm text-brand-black border-0 focus:outline-none focus:ring-0"
                                aria-label={`Quantity for ${item.product.name}`}
                              />
                              <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="p-1.5 text-brand-black hover:bg-brand-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500 rounded-r-lg"
                                aria-label={`Increase quantity for ${item.product.name}`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Remove Link */}
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-xs text-brand-blue-500 hover:text-brand-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500 rounded"
                            aria-label={`Remove ${item.product.name} from cart`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {/* Complete the Look Section */}
            {upsellProduct && items.length > 0 && upsellProducts.length > 0 && (
              <div className="px-4 md:px-6 pt-4 border-t border-brand-gray-200">
                <h3 className="text-lg font-semibold text-brand-black mb-1">Complete the look</h3>
                <p className="text-sm text-brand-gray-600 mb-4">Description</p>
                
                {/* Scrollable Container */}
                <div className="relative">
                  {/* Left Arrow */}
                  {canScrollLeft && (
                    <button
                      onClick={() => scroll('left')}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-brand-gray-300 rounded-lg p-2 shadow-md hover:bg-brand-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                      aria-label="Scroll left"
                    >
                      <svg className="w-4 h-4 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}

                  {/* Right Arrow */}
                  {canScrollRight && (
                    <button
                      onClick={() => scroll('right')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-brand-gray-300 rounded-lg p-2 shadow-md hover:bg-brand-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                      aria-label="Scroll right"
                    >
                      <svg className="w-4 h-4 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}

                  {/* Scrollable Product Cards */}
                  <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    onScroll={checkScrollability}
                  >
                    {upsellProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex-shrink-0 w-[180px] bg-white border border-brand-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Product Image */}
                        <Link href={`/product/${product.id}`} className="block relative aspect-square bg-brand-gray-100">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          {/* Badges */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {product.isNew && (
                              <span className="bg-green-500 text-white px-2 py-0.5 text-xs font-semibold uppercase rounded-md">
                                NEW
                              </span>
                            )}
                            {product.isBestSeller && (
                              <span className="bg-brand-blue-500 text-white px-2 py-0.5 text-xs font-semibold uppercase rounded-md">
                                BEST SELLER
                              </span>
                            )}
                          </div>
                        </Link>

                        {/* Product Details */}
                        <div className="p-3">
                          {/* Brand/Category */}
                          {product.brand && (
                            <p className="text-xs text-brand-gray-600 mb-1">
                              {product.brand}
                            </p>
                          )}
                          
                          {/* Product Name */}
                          <Link href={`/product/${product.id}`}>
                            <h4 className="text-sm font-medium text-brand-black mb-2 line-clamp-2 hover:text-brand-blue-600 transition-colors">
                              {product.name}
                            </h4>
                          </Link>

                          {/* Price */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-semibold text-brand-black">
                              ${product.price.toFixed(2)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-xs text-brand-gray-500 line-through">
                                ${product.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Add to Cart Button */}
                          {onAddUpsellToCart && (
                            <button
                              onClick={() => {
                                onAddUpsellToCart(product)
                                // Set pending scroll product ID - useEffect will watch for it in items array
                                setPendingScrollProductId(product.id)
                              }}
                              className="w-full btn btn-primary text-sm py-2"
                              aria-label={`Add ${product.name} to cart`}
                            >
                              Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="flex-shrink-0 border-t border-brand-gray-200 p-4 md:p-6 bg-white space-y-3">
            {/* Checkout Button */}
            <button
              onClick={onCheckout}
              className="w-full btn btn-primary"
              aria-label={`Checkout for $${subtotal.toFixed(2)}`}
            >
              Checkout ${subtotal.toFixed(2)}
            </button>

            {/* Continue Shopping Button */}
            <button
              onClick={onContinueShopping}
              className="w-full btn btn-secondary"
              aria-label="Continue shopping"
            >
              Continue Shopping
            </button>

            {/* View Cart Link */}
            <button
              ref={lastFocusableRef}
              onClick={onViewCart}
              className="w-full text-center text-sm text-brand-blue-500 hover:text-brand-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500 rounded py-2"
              aria-label="View full cart"
            >
              View Cart
            </button>
          </div>
        )}
      </div>

      {/* Store Locator Modal */}
      {onStoreChange && (
        <StoreLocatorModal
          isOpen={showStoreLocator}
          onClose={() => setShowStoreLocator(false)}
          onSelectStore={(store) => {
            onStoreChange(store)
            setShowStoreLocator(false)
          }}
          selectedStoreId={selectedStoreId}
        />
      )}
    </>
  )
}
