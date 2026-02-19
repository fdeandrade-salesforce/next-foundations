'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navigation from './Navigation'
import Footer from './Footer'
import AnnouncementBar from './AnnouncementBar'
import ProductCard from './ProductCard'
import { Product } from './ProductListingPage'
import { getFeaturedProducts, getAllProductsWithVariants } from '../lib/products'
import QuickViewModal from './QuickViewModal'
import NotifyMeModal from './NotifyMeModal'
import { addToCart } from '../lib/cart'
import { toggleWishlist } from '../lib/wishlist'

interface OrderItem {
  image: string
  name: string
  id: string
  quantity: number
  color?: string
  size?: string
  price: number
  originalPrice?: number
  store?: string
  shippingGroup?: string
}

interface ShippingGroup {
  groupId: string
  store: string
  status: 'Delivered' | 'In Transit' | 'Processing' | 'Cancelled' | 'Ready for Pickup' | 'Picked Up'
  trackingNumber?: string
  carrier?: string
  carrierTrackingUrl?: string
  deliveryDate?: string
  shippingMethod?: string
  shippingAddress?: string
  // BOPIS fields
  pickupLocation?: string
  pickupAddress?: string
  pickupDate?: string
  pickupReadyDate?: string
  isBOPIS?: boolean
}

interface Order {
  orderNumber: string
  status: 'Delivered' | 'In Transit' | 'Processing' | 'Cancelled' | 'Partially Delivered' | 'Ready for Pickup' | 'Picked Up'
  method: string
  amount: string
  items: OrderItem[]
  subtotal: number
  promotions: number
  shipping: number
  tax: number
  total: number
  paymentInfo: string
  shippingAddress: string
  shippingMethod?: string
  deliveryDate?: string
  shippingGroups?: ShippingGroup[]
  // BOPIS fields
  isBOPIS?: boolean
  pickupLocation?: string
  pickupAddress?: string
  pickupDate?: string
  pickupReadyDate?: string
  // Legacy fields for backward compatibility
  trackingNumber?: string
  carrier?: string
  carrierTrackingUrl?: string
  canReturn?: boolean
  canCancel?: boolean
  returnDeadline?: string
  customerName?: string
  customerEmail?: string
}

interface OrderDetailPageProps {
  order: Order
}

export default function OrderDetailPage({ order }: OrderDetailPageProps) {
  const [email, setEmail] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showTrackingDropdown, setShowTrackingDropdown] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [notifyMeProduct, setNotifyMeProduct] = useState<Product | null>(null)
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      const [featured, all] = await Promise.all([
        getFeaturedProducts(),
        getAllProductsWithVariants(),
      ])
      setSuggestedProducts(featured.slice(0, 4))
      setAllProducts(all)
    }
    loadProducts()
  }, [])

  // Safety check - if order is invalid, show error (after hooks)
  if (!order || !order.orderNumber) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-brand-black mb-4">Invalid Order</h1>
          <p className="text-brand-gray-600 mb-6">The order data is invalid or missing.</p>
          <Link href="/" className="text-brand-blue-500 hover:underline">Return to Home</Link>
        </div>
      </div>
    )
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle email signup
    console.log('Email signup:', email)
    setEmail('')
  }

  // Helper function to check if product has variants
  const hasVariants = (product: Product): boolean => {
    if (product.size && product.size.length > 1) return true
    if (product.colors && product.colors.length > 1) return true
    if (product.variants && product.variants > 0) return true
    return false
  }

  // Unified handler for Quick View/Quick Add
  const handleUnifiedAction = (product: Product) => {
    // Check if product is out of stock first
    if (!product.inStock) {
      setNotifyMeProduct(product)
      return
    }

    if (hasVariants(product)) {
      // Product has variants - open modal for variant selection
      setQuickViewProduct(product)
    } else {
      // No variants - add to cart directly
      addToCart(product, 1)
    }
  }

  const handleNotifyMe = (email: string) => {
    console.log(`Notify ${email} when ${notifyMeProduct?.name} is available`)
  }

  const handleAddToWishlist = (product: Product, size?: string, color?: string) => {
    // Only pass size/color if they were explicitly selected (from QuickViewModal)
    toggleWishlist(product, size, color, size || color ? 'pdp' : 'card')
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, suggestedProducts.length - 3))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(1, suggestedProducts.length - 3)) % Math.max(1, suggestedProducts.length - 3))
  }

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Confirmation Card */}
        <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-8 mb-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 pb-6 border-b border-brand-gray-200">
            <div>
              <h1 className="text-3xl font-semibold text-brand-black mb-2">Order Details</h1>
              <p className="text-lg text-brand-gray-600 mb-2">#{order.orderNumber}</p>
              {order.customerEmail && (
                <p className="text-sm text-brand-gray-600">
                  Receipt and order details sent to {order.customerEmail}
                </p>
              )}
            </div>
            <div className="mt-4 md:mt-0">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                order.status === 'Delivered' || order.status === 'Picked Up'
                  ? 'badge-success'
                  : order.status === 'Partially Delivered'
                  ? 'badge-warning'
                  : order.status === 'In Transit' || order.status === 'Ready for Pickup'
                  ? 'badge-info'
                  : order.status === 'Cancelled'
                  ? 'badge-error'
                  : 'badge-neutral'
              }`}>
                {(order.status === 'Delivered' || order.status === 'Picked Up') && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {order.status === 'Cancelled' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {order.status}
              </div>
            </div>
          </div>

          {/* Need Help Section */}
          <div className="mb-8 pb-6 border-b border-brand-gray-200">
            <p className="text-sm font-medium text-brand-black mb-3">Need help?</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/faq"
                className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
              >
                Contact Us
              </Link>
              <Link
                href="/returns"
                className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
              >
                Return Policy
              </Link>
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left Column - Items Ordered */}
            <div className="lg:col-span-2 space-y-6">
              {/* Items Ordered - Grouped by Shipment */}
              <div>
                <h3 className="text-lg font-semibold text-brand-black mb-4">Items Ordered</h3>
                {(() => {
                  // Group items by shipping group ID (which represents a shipment/address)
                  // First, create a map of shipping groups by their groupId
                  const shippingGroupsMap = new Map(
                    (order.shippingGroups || []).filter(sg => sg && sg.groupId).map(sg => [sg.groupId, sg])
                  )
                  
                  // Group items by shippingGroup ID
                  const groupedItems = (order.items || []).reduce((acc, item) => {
                    const groupKey = item.shippingGroup || 'default'
                    if (!acc[groupKey]) {
                      const shippingGroup = shippingGroupsMap.get(groupKey)
                      acc[groupKey] = {
                        groupId: groupKey,
                        items: []
                      }
                    }
                    acc[groupKey].items.push(item)
                    return acc
                  }, {} as Record<string, { groupId: string; items: OrderItem[] }>)

                  const groups = Object.entries(groupedItems)
                  
                  return (
                    <div className="space-y-8">
                      {groups.map(([groupKey, group], groupIdx) => {
                        if (!group || !group.items || group.items.length === 0) return null
                        // Find matching shipping group data
                        const shippingGroup = order.shippingGroups?.find(sg => sg && sg.groupId === groupKey)
                        const shipmentNumber = groupIdx + 1
                        const shipmentAddress = shippingGroup?.shippingAddress || order.shippingAddress || 'Address not available'
                        
                        return (
                          <div key={groupKey} className={groupIdx > 0 ? 'pt-8 border-t border-brand-gray-200' : ''}>
                            {/* Shipment Header with Status */}
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-sm font-semibold text-brand-black mb-1">
                                  Shipment {shipmentNumber}
                                </h4>
                                <p className="text-xs text-brand-gray-600">
                                  {shipmentAddress}
                                </p>
                              </div>
                              {shippingGroup && (
                                <span className={`text-xs font-semibold px-2 py-1 rounded-badge ${
                                  shippingGroup.status === 'Delivered' || shippingGroup.status === 'Picked Up'
                                    ? 'badge-success'
                                    : shippingGroup.status === 'In Transit' || shippingGroup.status === 'Ready for Pickup'
                                    ? 'badge-info'
                                    : shippingGroup.status === 'Cancelled'
                                    ? 'badge-error'
                                    : 'badge-neutral'
                                }`}>
                                  {shippingGroup.status}
                                </span>
                              )}
                            </div>

                            {/* Items - Horizontal Layout */}
                            <div className="flex flex-wrap gap-3 mb-6">
                              {(group.items || []).map((item, idx) => {
                                if (!item) return null
                                return (
                                <div key={idx} className="flex flex-col w-24">
                                  <div className="w-24 h-24 bg-brand-gray-100 rounded-lg overflow-hidden flex-shrink-0 mb-2">
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      width={96}
                                      height={96}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium text-brand-black mb-0.5 line-clamp-2">{item.name}</p>
                                    {item.color && (
                                      <p className="text-xs text-brand-gray-600">Color: {item.color}</p>
                                    )}
                                    {item.size && (
                                      <p className="text-xs text-brand-gray-600">Size: {item.size}</p>
                                    )}
                                    <div className="flex items-center gap-1.5 mt-1">
                                      {item.originalPrice && item.originalPrice > item.price && (
                                        <span className="text-xs text-brand-gray-500 line-through">
                                          ${item.originalPrice.toFixed(2)}
                                        </span>
                                      )}
                                      <span className="text-xs font-semibold text-brand-black">
                                        ${item.price.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                )
                              })}
                            </div>

                            {/* Contextual Tracking/Shipping or Pickup Info for this group */}
                            {shippingGroup ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-brand-gray-50 rounded-lg p-4">
                                {shippingGroup.isBOPIS ? (
                                  <>
                                    {/* Pickup Information */}
                                    <div>
                                      <h5 className="text-xs font-semibold text-brand-black mb-2">Pickup Information</h5>
                                      <div className="bg-brand-blue-50 border border-brand-blue-200 rounded-lg p-3 space-y-2">
                                        {shippingGroup.pickupLocation && (
                                          <div>
                                            <p className="text-xs font-medium text-brand-gray-600 mb-1">Pickup Location</p>
                                            <p className="text-sm font-medium text-brand-black">{shippingGroup.pickupLocation}</p>
                                          </div>
                                        )}
                                        {shippingGroup.pickupAddress && (
                                          <div>
                                            <p className="text-xs font-medium text-brand-gray-600 mb-1">Store Address</p>
                                            <p className="text-xs text-brand-black">{shippingGroup.pickupAddress}</p>
                                          </div>
                                        )}
                                        {shippingGroup.pickupReadyDate && (
                                          <div>
                                            <p className="text-xs font-medium text-brand-gray-600 mb-1">Ready for Pickup</p>
                                            <p className="text-sm font-medium text-brand-black">{shippingGroup.pickupReadyDate}</p>
                                          </div>
                                        )}
                                        {shippingGroup.pickupDate && (
                                          <div>
                                            <p className="text-xs font-medium text-brand-gray-600 mb-1">Pickup Window</p>
                                            <p className="text-xs text-brand-black">{shippingGroup.pickupDate}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {/* Pickup Instructions */}
                                    <div>
                                      <h5 className="text-xs font-semibold text-brand-black mb-2">Pickup Details</h5>
                                      <div className="bg-white rounded-lg border border-brand-gray-200 p-3 space-y-2">
                                        <p className="text-xs text-brand-gray-600">
                                          Your order is ready for pickup. Please bring a valid ID and your order confirmation.
                                        </p>
                                        {shippingGroup.status === 'Ready for Pickup' && (
                                          <p className="text-xs font-medium text-success">
                                            ✓ Ready to pick up
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {/* Tracking Information */}
                                    {shippingGroup.trackingNumber && (
                                      <div>
                                        <h5 className="text-xs font-semibold text-brand-black mb-2">Tracking</h5>
                                        <div className="bg-brand-blue-50 border border-brand-blue-200 rounded-lg p-3 space-y-2">
                                          <div>
                                            <p className="text-xs font-medium text-brand-gray-600 mb-1">Tracking Number</p>
                                            <p className="text-sm font-mono font-medium text-brand-black">{shippingGroup.trackingNumber}</p>
                                          </div>
                                          {shippingGroup.carrier && (
                                            <div>
                                              <p className="text-xs font-medium text-brand-gray-600 mb-1">Carrier</p>
                                              <p className="text-sm font-medium text-brand-black">{shippingGroup.carrier}</p>
                                            </div>
                                          )}
                                          {shippingGroup.deliveryDate && (
                                            <div>
                                              <p className="text-xs font-medium text-brand-gray-600 mb-1">Estimated Delivery</p>
                                              <p className="text-sm font-medium text-brand-black">{shippingGroup.deliveryDate}</p>
                                            </div>
                                          )}
                                          {shippingGroup.carrierTrackingUrl && (
                                            <a
                                              href={shippingGroup.carrierTrackingUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1.5 text-xs text-brand-blue-500 hover:text-brand-blue-600 hover:underline font-medium mt-2"
                                            >
                                              Track on {shippingGroup.carrier} website
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                              </svg>
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Shipping Information */}
                                    <div>
                                      <h5 className="text-xs font-semibold text-brand-black mb-2">Shipping Information</h5>
                                      <div className="bg-white rounded-lg border border-brand-gray-200 p-3 space-y-2">
                                        {shippingGroup.shippingAddress && (
                                          <div>
                                            <p className="text-xs font-medium text-brand-gray-500 mb-1">Shipping Address</p>
                                            <p className="text-xs text-brand-black">{shippingGroup.shippingAddress}</p>
                                          </div>
                                        )}
                                        {shippingGroup.shippingMethod && (
                                          <div>
                                            <p className="text-xs font-medium text-brand-gray-500 mb-1">Shipping Method</p>
                                            <p className="text-xs text-brand-black">{shippingGroup.shippingMethod}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            ) : (
                              // For simple orders without shippingGroups but with tracking info
                              order.trackingNumber && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-brand-gray-50 rounded-lg p-4">
                                  {/* Tracking Information */}
                                  <div>
                                    <h5 className="text-xs font-semibold text-brand-black mb-2">Tracking</h5>
                                    <div className="bg-brand-blue-50 border border-brand-blue-200 rounded-lg p-3 space-y-2">
                                      <div>
                                        <p className="text-xs font-medium text-brand-gray-600 mb-1">Tracking Number</p>
                                        <p className="text-sm font-mono font-medium text-brand-black">{order.trackingNumber}</p>
                                      </div>
                                      {order.carrier && (
                                        <div>
                                          <p className="text-xs font-medium text-brand-gray-600 mb-1">Carrier</p>
                                          <p className="text-sm font-medium text-brand-black">{order.carrier}</p>
                                        </div>
                                      )}
                                      {order.deliveryDate && (
                                        <div>
                                          <p className="text-xs font-medium text-brand-gray-600 mb-1">Estimated Delivery</p>
                                          <p className="text-sm font-medium text-brand-black">{order.deliveryDate}</p>
                                        </div>
                                      )}
                                      {order.carrierTrackingUrl && (
                                        <a
                                          href={order.carrierTrackingUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 text-xs text-brand-blue-500 hover:text-brand-blue-600 hover:underline font-medium mt-2"
                                        >
                                          Track on {order.carrier} website
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                          </svg>
                                        </a>
                                      )}
                                    </div>
                                  </div>

                                  {/* Shipping Information */}
                                  <div>
                                    <h5 className="text-xs font-semibold text-brand-black mb-2">Shipping Information</h5>
                                    <div className="bg-white rounded-lg border border-brand-gray-200 p-3 space-y-2">
                                      {order.shippingAddress && (
                                        <div>
                                          <p className="text-xs font-medium text-brand-gray-500 mb-1">Shipping Address</p>
                                          <p className="text-xs text-brand-black">{order.shippingAddress}</p>
                                        </div>
                                      )}
                                      {order.shippingMethod && (
                                        <div>
                                          <p className="text-xs font-medium text-brand-gray-500 mb-1">Shipping Method</p>
                                          <p className="text-xs text-brand-black">{order.shippingMethod}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>

              {/* Payment Method */}
              <div>
                <h4 className="text-sm font-semibold text-brand-black mb-3">Payment Method</h4>
                <div className="bg-white rounded-lg border border-brand-gray-200 p-4">
                  <p className="text-sm text-brand-gray-700">{order.paymentInfo}</p>
                </div>
              </div>

              {/* General Shipping Information (only if no shipping groups and no tracking shown after items) */}
              {(!order.shippingGroups || order.shippingGroups.length === 0) && !order.trackingNumber && (
                <div>
                  <h4 className="text-sm font-semibold text-brand-black mb-3">Shipping Information</h4>
                  <div className="bg-white rounded-lg border border-brand-gray-200 p-4 space-y-3">
                    {order.deliveryDate && (
                      <div>
                        <p className="text-xs font-medium text-brand-gray-500 mb-1">Estimated Delivery</p>
                        <p className="text-sm text-brand-black font-medium">Arriving by {order.deliveryDate}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-brand-gray-500 mb-1">Shipping Address</p>
                      <p className="text-sm text-brand-black">{order.shippingAddress}</p>
                    </div>
                    {order.shippingMethod && (
                      <div>
                        <p className="text-xs font-medium text-brand-gray-500 mb-1">Shipping Method</p>
                        <p className="text-sm text-brand-black">{order.shippingMethod}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Return Information */}
              {order.canReturn && order.returnDeadline && (
                <div>
                  <p className="text-sm text-brand-gray-700">
                    Eligible for return until {order.returnDeadline}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-brand-black mb-4">Order Summary</h3>
              
              {/* Order Summary */}
              <div className="bg-white rounded-lg border border-brand-gray-200 p-4 space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-gray-600">Subtotal</span>
                  <span className="text-brand-black">${order.subtotal.toFixed(2)}</span>
                </div>
                {order.promotions !== 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-gray-600">Promotions</span>
                    <span className="text-success">-${Math.abs(order.promotions).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-brand-gray-600">Shipping</span>
                  <span className="text-brand-black">
                    {order.shipping === 0 ? '$0.00' : `$${order.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-gray-600">Tax</span>
                  <span className="text-brand-black">${order.tax.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-brand-gray-200">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-brand-black">Total</span>
                    <span className="text-base font-semibold text-brand-black">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-brand-gray-200">
            <h4 className="text-sm font-semibold text-brand-black mb-3">Actions</h4>
            <div className="flex flex-wrap gap-2 relative">
              {order.status !== 'Cancelled' && (() => {
                // For BOPIS orders, show different action buttons
                if (order.isBOPIS) {
                  return (
                    <button className="px-4 py-2.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm">
                      View Pickup Instructions
                    </button>
                  )
                }
                
                // Show track order button if there's at least one tracking number
                const hasTracking = order.shippingGroups?.some(g => g.carrierTrackingUrl) || 
                                  (order.trackingNumber && order.carrierTrackingUrl)
                
                // Helper function to extract name from address
                const extractNameFromAddress = (address: string | undefined): string => {
                  try {
                    if (!address) return 'Shipment'
                    // Address format: "John Doe, 415 Mission Street, 94105, San Francisco, CA, United States"
                    const match = address.match(/^([^,]+),/)
                    return match ? match[1].trim() : 'Shipment'
                  } catch (error) {
                    return 'Shipment'
                  }
                }
                
                if (hasTracking && order.shippingGroups && order.shippingGroups.length > 1) {
                  // For multi-shipping, show dropdown with recipient names
                  const shipmentsWithTracking = (order.shippingGroups || []).filter(g => g && g.carrierTrackingUrl)
                  
                  return (
                    <div className="relative">
                      <button
                        onClick={() => setShowTrackingDropdown(!showTrackingDropdown)}
                        className="px-4 py-2.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm flex items-center gap-2"
                      >
                        Track shipment
                        <svg 
                          className={`w-4 h-4 transition-transform ${showTrackingDropdown ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {showTrackingDropdown && (
                        <>
                          {/* Backdrop to close dropdown */}
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowTrackingDropdown(false)}
                          />
                          {/* Dropdown menu */}
                          <div className="absolute top-full left-0 mt-2 bg-white border border-brand-gray-200 rounded-lg shadow-lg z-20 min-w-[200px]">
                            {shipmentsWithTracking.map((group) => {
                              if (!group || !group.carrierTrackingUrl) return null
                              const recipientName = extractNameFromAddress(group.shippingAddress || order.shippingAddress)
                              return (
                                <a
                                  key={group.groupId || Math.random()}
                                  href={group.carrierTrackingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block px-4 py-3 text-sm text-brand-black hover:bg-brand-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                                  onClick={() => setShowTrackingDropdown(false)}
                                >
                                  <div className="font-medium">{recipientName}</div>
                                  {group.trackingNumber && (
                                    <div className="text-xs text-brand-gray-600 mt-1 font-mono">
                                      {group.trackingNumber}
                                    </div>
                                  )}
                                </a>
                              )
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )
                } else if (hasTracking && order.shippingGroups && order.shippingGroups.length === 1) {
                  // Single shipment with shipping group - direct link
                  const group = order.shippingGroups[0]
                  return (
                    <a
                      href={group.carrierTrackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                    >
                      Track shipment
                    </a>
                  )
                } else if (order.trackingNumber && order.carrierTrackingUrl) {
                  // Legacy single tracking
                  return (
                    <a
                      href={order.carrierTrackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                    >
                      Track order
                    </a>
                  )
                }
                return null
              })()}
              {order.status !== 'Cancelled' && order.canReturn && (
                <button className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm">
                  Return items
                </button>
              )}
              {order.status !== 'Cancelled' && order.canCancel && (
                <button className="px-4 py-2 bg-white border border-error text-error text-sm font-medium rounded-lg hover:bg-error-light transition-colors shadow-sm">
                  Cancel order
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Email Signup Section */}
        <div className="bg-brand-blue-50 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-brand-black mb-1">
                Get 10% off your next order. Join email list.
              </p>
            </div>
            <form onSubmit={handleEmailSubmit} className="flex gap-2 flex-1 md:max-w-md">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="flex-1 px-4 py-2 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm whitespace-nowrap"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* You May Also Like Section */}
        {suggestedProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-brand-black">You May Also Like</h2>
              <div className="flex gap-2">
                <button
                  onClick={prevSlide}
                  className="p-2 border border-brand-gray-300 rounded-lg hover:bg-brand-gray-50 transition-colors"
                  aria-label="Previous products"
                >
                  <svg className="w-5 h-5 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="p-2 border border-brand-gray-300 rounded-lg hover:bg-brand-gray-50 transition-colors"
                  aria-label="Next products"
                >
                  <svg className="w-5 h-5 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {suggestedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onUnifiedAction={handleUnifiedAction}
                  onAddToWishlist={handleAddToWishlist}
                  allProducts={allProducts}
                />
              ))}
            </div>
          </div>
        )}

        {/* Social Media Prompt */}
        <div className="text-center py-8 mb-8">
          <p className="text-sm text-brand-gray-600">
            Show us how you style it! <span className="text-brand-blue-500 font-medium">#MarketStreet</span>
          </p>
        </div>
      </main>

      <Footer />

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          productVariants={[]}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={(product, quantity, size, color) => addToCart(product, quantity, size, color)}
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
    </div>
  )
}
