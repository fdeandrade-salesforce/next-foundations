'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Navigation from './Navigation'
import Footer from './Footer'
import AnnouncementBar from './AnnouncementBar'
import ProductCard from './ProductCard'
import { Product } from './ProductListingPage'
import { getFeaturedProducts, getAllProductsWithVariants } from '../lib/products'
import { addToCart } from '../lib/cart'
import { toggleWishlist } from '../lib/wishlist'
import QuickViewModal from './QuickViewModal'
import NotifyMeModal from './NotifyMeModal'

// ===========================
// Types & Interfaces
// ===========================

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
  image: string
  isBOPIS?: boolean
  store?: {
    name: string
    address: string
  }
}

interface ShippingAddress {
  name: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
}

interface ShippingMethod {
  name: string
  description: string
  estimatedDelivery: string
}

interface PaymentMethod {
  type: string
  brand?: string
  lastFour?: string
  cardholderName?: string
}

interface PickupStore {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  hours: string
  pickupTime?: string
}

interface BOPISItem {
  id: string
  name: string
  store?: {
    name: string
    address: string
  }
  quantity: number
  price: number
  image: string
}

interface MultiShipment {
  addressId: string
  address: ShippingAddress | null
  items: OrderItem[]
  shippingMethod: ShippingMethod | null
}

interface OrderConfirmationData {
  orderNumber: string
  email: string
  phone?: string
  orderDate: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  promoCode?: string
  shippingAddress: ShippingAddress | null
  shippingMethod: ShippingMethod | null
  paymentMethod: PaymentMethod | null
  hasBOPIS: boolean
  hasDelivery: boolean
  pickupStore: PickupStore | null
  bopisItems: BOPISItem[]
  // Multi-shipping data
  isMultiship?: boolean
  shipments?: MultiShipment[]
}

interface OrderConfirmationProps {
  orderNumber: string
}

// ===========================
// Cross-Sell Component (matches MyAccountPage)
// ===========================

function CrossSellSection() {
  const [crossSellProducts, setCrossSellProducts] = useState<Product[]>([])
  const [allProductsForVariants, setAllProductsForVariants] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [notifyMeProduct, setNotifyMeProduct] = useState<Product | null>(null)

  useEffect(() => {
    // Fetch featured products for cross-sell and all products for variant resolution
    const fetchProducts = async () => {
      try {
        const [featured, all] = await Promise.all([
          getFeaturedProducts(),
          getAllProductsWithVariants()
        ])
        // Get first 4 products for cross-sell
        setCrossSellProducts(featured.slice(0, 4))
        setAllProductsForVariants(all)
      } catch (error) {
        console.error('Error fetching cross-sell products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Helper function to check if product has variants
  const hasVariants = (product: Product): boolean => {
    if (product.size && product.size.length > 1) return true
    if (product.colors && product.colors.length > 1) return true
    if (product.variants && product.variants > 0) return true
    return false
  }

  // Unified handler for Quick View/Quick Add
  const handleUnifiedAction = (product: Product) => {
    if (!product.inStock) {
      setNotifyMeProduct(product)
      return
    }

    if (hasVariants(product)) {
      setQuickViewProduct(product)
    } else {
      addToCart(product, 1)
    }
  }

  const handleAddToCart = (product: Product, quantity: number = 1, size?: string, color?: string) => {
    addToCart(product, quantity, size, color)
  }

  const handleAddToWishlist = (product: Product, size?: string, color?: string) => {
    // Only pass size/color if they were explicitly selected (from QuickViewModal)
    toggleWishlist(product, size, color, size || color ? 'pdp' : 'card')
  }

  const handleNotifyMe = (email: string) => {
    console.log(`Notify ${email} when ${notifyMeProduct?.name} is available`)
  }

  if (loading) {
    return (
      <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue-500"></div>
        </div>
      </div>
    )
  }

  if (crossSellProducts.length === 0) {
    return null
  }

  return (
    <>
      <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-brand-black mb-4">You May Also Like</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {crossSellProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onUnifiedAction={handleUnifiedAction}
              onAddToWishlist={handleAddToWishlist}
              allProducts={allProductsForVariants}
            />
          ))}
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          productVariants={[]}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
          onNotify={(product) => setNotifyMeProduct(product)}
        />
      )}

      {/* Notify Me Modal */}
      {notifyMeProduct && (
        <NotifyMeModal
          product={notifyMeProduct}
          isOpen={!!notifyMeProduct}
          onClose={() => setNotifyMeProduct(null)}
          onNotify={handleNotifyMe}
        />
      )}
    </>
  )
}

// ===========================
// Marketing Sign Up Component
// ===========================

function MarketingSignUp() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsSubmitted(true)
    setIsLoading(false)
  }

  if (isSubmitted) {
    return (
      <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-brand-black">Thanks for subscribing! Check your email for 10% off.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
      <p className="text-sm font-medium text-brand-black mb-3">
        Get 10% off your next order. Join email list.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="flex-1 px-4 py-2.5 bg-white border border-brand-gray-200 rounded-lg text-sm text-brand-black placeholder-brand-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Joining...' : 'Join'}
        </button>
      </form>
    </div>
  )
}

// ===========================
// Social Share Component
// ===========================

function SocialShare() {
  return (
    <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6 text-center">
      <p className="text-sm text-brand-gray-600">
        Show us how you style it! <span className="font-medium text-brand-black">#MarketStreet</span>
      </p>
    </div>
  )
}

// ===========================
// Main Component
// ===========================

export default function OrderConfirmationPage({ orderNumber }: OrderConfirmationProps) {
  const searchParams = useSearchParams()
  const isSuccess = searchParams.get('success') === 'true'
  
  const [orderData, setOrderData] = useState<OrderConfirmationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Try to get order data from sessionStorage
    const storedData = sessionStorage.getItem('orderConfirmation')
    console.log('Order Confirmation - Raw stored data:', storedData)
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData)
        console.log('Order Confirmation - Parsed data:', parsed)
        console.log('Order Confirmation - Items:', parsed.items)
        // Verify the order number matches
        if (parsed.orderNumber === orderNumber) {
          setOrderData(parsed)
        } else {
          console.log('Order number mismatch:', parsed.orderNumber, 'vs', orderNumber)
        }
      } catch (error) {
        console.error('Error parsing order data:', error)
      }
    } else {
      console.log('No order confirmation data found in sessionStorage')
    }
    setIsLoading(false)
  }, [orderNumber])

  // Generate estimated pickup/delivery time
  const getEstimatedPickupTime = () => {
    const now = new Date()
    const pickupTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours from now
    return pickupTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const getEstimatedDeliveryDate = () => {
    const now = new Date()
    const deliveryDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    return deliveryDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }

  // Format store address for Google Maps
  const getDirectionsUrl = (store: PickupStore | { name: string; address: string } | null | undefined) => {
    if (!store) return '#'
    const address = 'city' in store 
      ? `${store.address}, ${store.city}, ${store.state} ${store.zipCode}`
      : store.address
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <AnnouncementBar />
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-500"></div>
        </main>
        <Footer />
      </div>
    )
  }

  // Order not found state
  if (!isSuccess || !orderData) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <AnnouncementBar />
        <Navigation />
        
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-brand-black mb-2">Order Not Found</h1>
            <p className="text-brand-gray-600 mb-8">We couldn&apos;t find an order with this number.</p>
            <Link 
              href="/shop" 
              className="inline-block px-6 py-3 bg-brand-blue-500 text-white font-medium rounded-lg hover:bg-brand-blue-600 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
        
        <Footer />
      </div>
    )
  }

  // Get unique stores from BOPIS items
  const getUniqueStores = () => {
    const storesMap = new Map<string, { name: string; address: string; fullAddress: string; items: OrderItem[] }>()
    
    // First check pickupStore from checkout
    if (orderData.pickupStore) {
      const storeKey = orderData.pickupStore.name
      const bopisItemsForStore = orderData.items.filter(item => item.isBOPIS)
      storesMap.set(storeKey, {
        name: orderData.pickupStore.name,
        address: orderData.pickupStore.address,
        fullAddress: `${orderData.pickupStore.address}, ${orderData.pickupStore.city}, ${orderData.pickupStore.state} ${orderData.pickupStore.zipCode}`,
        items: bopisItemsForStore,
      })
    }
    
    // Then check individual BOPIS items for their stores
    orderData.items.filter(item => item.isBOPIS && item.store).forEach(item => {
      if (item.store) {
        const storeKey = item.store.name
        if (!storesMap.has(storeKey)) {
          storesMap.set(storeKey, {
            name: item.store.name,
            address: item.store.address,
            fullAddress: item.store.address,
            items: [],
          })
        }
        storesMap.get(storeKey)?.items.push(item)
      }
    })
    
    return Array.from(storesMap.values())
  }

  const stores = getUniqueStores()
  const deliveryItems = orderData.items.filter(item => !item.isBOPIS)
  const customerFirstName = orderData.shippingAddress?.name?.split(' ')[0] || 'Customer'

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Navigation />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Main Order Card - matches Order Details structure */}
          <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 pb-6 border-b border-brand-gray-200">
              <div>
                <h1 className="text-2xl font-semibold text-brand-black mb-1">
                  Thank you, {customerFirstName}!
                </h1>
                <p className="text-base text-brand-gray-600">Order #{orderData.orderNumber}</p>
                <p className="text-sm text-brand-gray-500 mt-1">
                  Confirmation email sent to {orderData.email}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 whitespace-nowrap flex-shrink-0">
                Processing
              </div>
            </div>

            {/* Order Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Items Ordered - Left Column */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold text-brand-black">Items Ordered</h3>
                
                {/* BOPIS Shipment Groups */}
                {stores.map((store, storeIdx) => (
                  <div key={storeIdx} className="border border-brand-gray-200 rounded-lg overflow-hidden">
                    {/* Group Header */}
                    <div className="bg-brand-gray-50 px-4 py-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <span className="font-medium text-brand-black truncate">
                          Pickup at {store.name}
                        </span>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700 whitespace-nowrap flex-shrink-0">
                        Ready for Pickup
                      </span>
                    </div>
                    
                    {/* Items */}
                    <div className="p-4">
                      <div className="space-y-3 mb-4">
                        {store.items.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-4 p-4 border border-brand-gray-200 rounded-lg hover:bg-brand-gray-50 transition-colors">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              <div className="w-20 h-20 bg-brand-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={item.image || '/images/products/placeholder.png'}
                                  alt={item.name || 'Product'}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = '/images/products/placeholder.png'
                                  }}
                                />
                              </div>
                            </div>
                            
                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-brand-black mb-1">{item.name || 'Product'}</p>
                              {(item.color || item.size) && (
                                <p className="text-xs text-brand-gray-500 mb-1">
                                  {[item.color, item.size].filter(Boolean).join(' / ')}
                                </p>
                              )}
                              <p className="text-xs text-brand-gray-500">Quantity: {item.quantity}</p>
                            </div>
                            
                            {/* Price */}
                            <div className="flex-shrink-0 text-right">
                              <p className="text-sm font-semibold text-brand-black">
                                ${(item.price || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Pickup Information */}
                      <div className="border-t border-brand-gray-200 pt-3 mt-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-brand-blue-50 border border-brand-blue-200 rounded-lg p-3">
                            <p className="text-xs font-medium text-brand-gray-600 mb-1">Pickup Location</p>
                            <p className="text-sm font-medium text-brand-black">{store.name}</p>
                            <p className="text-xs text-brand-gray-600 mt-1">{store.fullAddress}</p>
                            <a
                              href={getDirectionsUrl({ name: store.name, address: store.fullAddress })}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-brand-blue-500 hover:text-brand-blue-600 hover:underline mt-2"
                            >
                              Get Directions
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                          <div className="bg-white border border-brand-gray-200 rounded-lg p-3">
                            <p className="text-xs font-medium text-brand-gray-600 mb-1">Estimated Pickup</p>
                            <p className="text-sm font-medium text-brand-black">
                              Today at {getEstimatedPickupTime()}
                            </p>
                            <p className="text-xs text-brand-gray-500 mt-2">Store Hours: Mon-Sat 10AM-9PM</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Delivery Shipment Groups - Multi-shipping or single */}
                {orderData.hasDelivery && (
                  <>
                    {orderData.isMultiship && orderData.shipments && orderData.shipments.length > 0 ? (
                      // Multi-shipping: Show each shipment separately
                      orderData.shipments.map((shipment, shipmentIdx) => (
                        <div key={shipment.addressId} className="border border-brand-gray-200 rounded-lg overflow-hidden">
                          {/* Group Header */}
                          <div className="bg-brand-gray-50 px-4 py-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                              <span className="font-medium text-brand-black whitespace-nowrap">
                                Shipment {shipmentIdx + 1}
                              </span>
                              {shipment.address && (
                                <span className="text-sm text-brand-gray-600 truncate hidden sm:inline">
                                  → {shipment.address.name}
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700 whitespace-nowrap flex-shrink-0">
                              Processing
                            </span>
                          </div>
                          
                          {/* Items */}
                          <div className="p-4">
                            <div className="space-y-3 mb-4">
                              {shipment.items.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 border border-brand-gray-200 rounded-lg hover:bg-brand-gray-50 transition-colors">
                                  {/* Product Image */}
                                  <div className="flex-shrink-0">
                                    <div className="w-20 h-20 bg-brand-gray-100 rounded-lg overflow-hidden">
                                      <img
                                        src={item.image || '/images/products/placeholder.png'}
                                        alt={item.name || 'Product'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.src = '/images/products/placeholder.png'
                                        }}
                                      />
                                    </div>
                                  </div>
                                  
                                  {/* Product Details */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-brand-black mb-1">{item.name || 'Product'}</p>
                                    {(item.color || item.size) && (
                                      <p className="text-xs text-brand-gray-500 mb-1">
                                        {[item.color, item.size].filter(Boolean).join(' / ')}
                                      </p>
                                    )}
                                    <p className="text-xs text-brand-gray-500">Quantity: {item.quantity}</p>
                                  </div>
                                  
                                  {/* Price */}
                                  <div className="flex-shrink-0 text-right">
                                    <p className="text-sm font-semibold text-brand-black">
                                      ${(item.price || 0).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Shipping Information */}
                            {shipment.address && (
                              <div className="border-t border-brand-gray-200 pt-3 mt-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="bg-brand-blue-50 border border-brand-blue-200 rounded-lg p-3">
                                    <p className="text-xs font-medium text-brand-gray-600 mb-1">Estimated Delivery</p>
                                    <p className="text-sm font-medium text-brand-black">{getEstimatedDeliveryDate()}</p>
                                    <p className="text-xs text-brand-gray-600 mt-1">
                                      {shipment.shippingMethod?.name || 'Standard Shipping'}
                                    </p>
                                  </div>
                                  <div className="bg-white border border-brand-gray-200 rounded-lg p-3">
                                    <p className="text-xs font-medium text-brand-gray-600 mb-1">Shipping Address</p>
                                    <p className="text-sm text-brand-black">{shipment.address.name}</p>
                                    <p className="text-xs text-brand-gray-600">
                                      {shipment.address.addressLine1}{shipment.address.addressLine2 ? `, ${shipment.address.addressLine2}` : ''}, {shipment.address.city}, {shipment.address.state} {shipment.address.zipCode}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Single shipping: Show all delivery items together
                      deliveryItems.length > 0 && (
                        <div className="border border-brand-gray-200 rounded-lg overflow-hidden">
                          {/* Group Header */}
                          <div className="bg-brand-gray-50 px-4 py-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                              <span className="font-medium text-brand-black whitespace-nowrap">
                                Shipment 1
                              </span>
                              {orderData.shippingAddress && (
                                <span className="text-sm text-brand-gray-600 truncate hidden sm:inline">
                                  → {orderData.shippingAddress.name}
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700 whitespace-nowrap flex-shrink-0">
                              Processing
                            </span>
                          </div>
                          
                          {/* Items */}
                          <div className="p-4">
                            <div className="space-y-3 mb-4">
                              {deliveryItems.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 border border-brand-gray-200 rounded-lg hover:bg-brand-gray-50 transition-colors">
                                  {/* Product Image */}
                                  <div className="flex-shrink-0">
                                    <div className="w-20 h-20 bg-brand-gray-100 rounded-lg overflow-hidden">
                                      <img
                                        src={item.image || '/images/products/placeholder.png'}
                                        alt={item.name || 'Product'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.src = '/images/products/placeholder.png'
                                        }}
                                      />
                                    </div>
                                  </div>
                                  
                                  {/* Product Details */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-brand-black mb-1">{item.name || 'Product'}</p>
                                    {(item.color || item.size) && (
                                      <p className="text-xs text-brand-gray-500 mb-1">
                                        {[item.color, item.size].filter(Boolean).join(' / ')}
                                      </p>
                                    )}
                                    <p className="text-xs text-brand-gray-500">Quantity: {item.quantity}</p>
                                  </div>
                                  
                                  {/* Price */}
                                  <div className="flex-shrink-0 text-right">
                                    <p className="text-sm font-semibold text-brand-black">
                                      ${(item.price || 0).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Shipping Information */}
                            {orderData.shippingAddress && (
                              <div className="border-t border-brand-gray-200 pt-3 mt-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="bg-brand-blue-50 border border-brand-blue-200 rounded-lg p-3">
                                    <p className="text-xs font-medium text-brand-gray-600 mb-1">Estimated Delivery</p>
                                    <p className="text-sm font-medium text-brand-black">{getEstimatedDeliveryDate()}</p>
                                    <p className="text-xs text-brand-gray-600 mt-1">
                                      {orderData.shippingMethod?.name || 'Standard Shipping'}
                                    </p>
                                  </div>
                                  <div className="bg-white border border-brand-gray-200 rounded-lg p-3">
                                    <p className="text-xs font-medium text-brand-gray-600 mb-1">Shipping Address</p>
                                    <p className="text-sm text-brand-black">{orderData.shippingAddress.name}</p>
                                    <p className="text-xs text-brand-gray-600">
                                      {orderData.shippingAddress.addressLine1}{orderData.shippingAddress.addressLine2 ? `, ${orderData.shippingAddress.addressLine2}` : ''}, {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.zipCode}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </>
                )}
              </div>

              {/* Order Summary - Right Column */}
              <div className="lg:sticky lg:top-20 space-y-4 self-start">
                <h3 className="text-lg font-semibold text-brand-black">Order Summary</h3>
                <div className="bg-brand-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-gray-600">Subtotal</span>
                    <span className="text-brand-black">${orderData.subtotal.toFixed(2)}</span>
                  </div>
                  {orderData.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-gray-600">Promotions</span>
                      <span className="text-green-600">-${orderData.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-gray-600">Shipping</span>
                    <span className="text-brand-black">
                      {orderData.shipping === 0 ? '$0.00' : `$${orderData.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-gray-600">Tax</span>
                    <span className="text-brand-black">${orderData.tax.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-brand-gray-200">
                    <div className="flex justify-between">
                      <span className="font-semibold text-brand-black">Total</span>
                      <span className="font-semibold text-brand-black">${orderData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Payment Method */}
                <div>
                  <h4 className="text-sm font-semibold text-brand-black mb-2">Payment Method</h4>
                  <div className="bg-white border border-brand-gray-200 rounded-lg p-3">
                    <p className="text-sm text-brand-gray-700">
                      {orderData.paymentMethod?.brand || 'Card'} ending in {orderData.paymentMethod?.lastFour || '****'}
                    </p>
                  </div>
                </div>
                
                {/* Download Receipt */}
                <div>
                  <button
                    onClick={() => {
                      // Handle download receipt - in production this would trigger a PDF download
                      console.log('Download receipt for order:', orderData.orderNumber)
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Receipt
                  </button>
                </div>
              </div>
            </div>

            {/* Need Help Section - Full Width */}
            <div className="pt-6 mt-6 border-t border-brand-gray-200">
              <p className="text-sm font-medium text-brand-black mb-3">Need help?</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/faq"
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  FAQ
                </Link>
                <Link
                  href="/customer-service"
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  Contact Us
                </Link>
                <Link
                  href="/shipping-returns"
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  Return Policy
                </Link>
              </div>
            </div>
          </div>

          {/* Marketing Sign Up */}
          <MarketingSignUp />

          {/* Cross-Sell Section */}
          <CrossSellSection />

          {/* Social Share */}
          <SocialShare />

        </div>
      </main>
      
      <Footer />
    </div>
  )
}
