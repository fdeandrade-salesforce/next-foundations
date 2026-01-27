'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navigation from './Navigation'
import Footer from './Footer'
import AnnouncementBar from './AnnouncementBar'
import ProductCard from './ProductCard'
import { Product } from './ProductListingPage'
import { getFeaturedProducts, getAllProducts, getProductById } from '../lib/products'
import { getWishlist, removeFromWishlist } from '../lib/wishlist'
import { addToCart } from '../lib/cart'
import { getCurrentUser, User } from '../lib/auth'
import { getOrderRepo } from '../src/data'
import type { Order as RepoOrder } from '../src/types'
import Toast from './Toast'
import QuickViewModal from './QuickViewModal'
import NotifyMeModal from './NotifyMeModal'
import StoreLocatorModal from './StoreLocatorModal'

interface ShippingGroup {
  groupId: string
  store: string
  status: 'Delivered' | 'In Transit' | 'Processing' | 'Cancelled' | 'Ready for Pickup' | 'Picked Up' | 'Partially Delivered'
  trackingNumber?: string
  carrier?: string
  carrierTrackingUrl?: string
  deliveryDate?: string
  shippingMethod?: string
  shippingAddress?: string
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
  expanded?: boolean
  orderDate?: string // Date when order was placed (e.g., 'Sep 15, 2024')
  items?: Array<{ 
    image: string
    name: string
    id: string
    quantity: number
    color?: string
    size?: string
    price?: number
    originalPrice?: number
    store?: string
    shippingGroup?: string
  }>
  subtotal?: number
  promotions?: number
  shipping?: number
  tax?: number
  total?: number
  paymentInfo?: string
  shippingAddress?: string
  shippingMethod?: string
  deliveryDate?: string
  trackingNumber?: string
  carrier?: string
  carrierTrackingUrl?: string
  shippingGroups?: ShippingGroup[]
  isBOPIS?: boolean
  pickupLocation?: string
  pickupAddress?: string
  pickupDate?: string
  pickupReadyDate?: string
  canReturn?: boolean
  canCancel?: boolean
  returnDeadline?: string
  customerName?: string
  customerEmail?: string
}

interface WishlistItem extends Product {
  selectedColor?: string
  selectedSize?: string
}

interface Wishlist {
  id: string
  name: string
  isDefault: boolean
  itemCount: number
  items: WishlistItem[]
}

interface PaymentMethod {
  id: string
  type: 'visa' | 'mastercard' | 'ach' | 'apple-pay' | 'paypal'
  last4?: string
  bankName?: string
  expiryMonth?: number
  expiryYear?: number
  cardholderName: string
  isDefault: boolean
  isSelected?: boolean
}

interface Address {
  id: string
  firstName: string
  lastName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
  isSelected?: boolean
  deliveryInstructions?: string
}

interface Passkey {
  id: string
  name: string
  createdAt: string
  lastUsed?: string
  deviceType: 'device' | 'platform'
}

// Order Detail Content Component for inline display in My Account
function OrderDetailContent({ orderNumber, showToastMessage }: { orderNumber: string | null, showToastMessage?: (message: string, type?: 'success' | 'error') => void }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [showTrackShipmentDropdown, setShowTrackShipmentDropdown] = useState(false)
  const [showReturnItemModal, setShowReturnItemModal] = useState(false)
  const [showCancelItemModal, setShowCancelItemModal] = useState(false)
  const [selectedItemForReturn, setSelectedItemForReturn] = useState<{ item: any; orderNumber: string; groupId: string } | null>(null)
  const [selectedItemForCancel, setSelectedItemForCancel] = useState<{ item: any; orderNumber: string; groupId: string } | null>(null)
  const [returnReason, setReturnReason] = useState('')
  const [returnQuantity, setReturnQuantity] = useState(1)
  const [cancelReason, setCancelReason] = useState('')
  
  // Fetch order by number from repository
  useEffect(() => {
    if (!orderNumber) {
      setLoading(false)
      return
    }
    
    // Fetch order from repository
    const fetchOrder = async () => {
      try {
        const orderRepo = getOrderRepo()
        const foundOrder = await orderRepo.getOrder(orderNumber)
        if (foundOrder) {
          // Map RepoOrder to local Order type
          const mappedOrder: Order = {
            orderNumber: foundOrder.orderNumber,
            status: foundOrder.status,
            method: foundOrder.method,
            amount: foundOrder.amount,
            orderDate: foundOrder.orderDate,
            items: foundOrder.items.map(item => ({
              id: item.id,
              image: item.image,
              name: item.name,
              quantity: item.quantity,
              color: item.color,
              size: item.size,
              price: item.price,
              originalPrice: item.originalPrice,
              store: item.store,
              shippingGroup: item.shippingGroup,
            })),
            subtotal: foundOrder.subtotal,
            promotions: foundOrder.promotions,
            shipping: foundOrder.shipping,
            tax: foundOrder.tax,
            total: foundOrder.total,
            paymentInfo: foundOrder.paymentInfo,
            shippingAddress: foundOrder.shippingAddress,
            shippingMethod: foundOrder.shippingMethod,
            deliveryDate: foundOrder.deliveryDate,
            trackingNumber: foundOrder.trackingNumber,
            carrier: foundOrder.carrier,
            carrierTrackingUrl: foundOrder.carrierTrackingUrl,
            shippingGroups: foundOrder.shippingGroups,
            isBOPIS: foundOrder.isBOPIS,
            pickupLocation: foundOrder.pickupLocation,
            pickupAddress: foundOrder.pickupAddress,
            pickupDate: foundOrder.pickupDate,
            pickupReadyDate: foundOrder.pickupReadyDate,
            canReturn: foundOrder.canReturn,
            canCancel: foundOrder.canCancel,
            returnDeadline: foundOrder.returnDeadline,
            customerName: foundOrder.customerName,
            customerEmail: foundOrder.customerEmail,
          }
          setOrder(mappedOrder)
        } else {
          setOrder(null)
        }
      } catch (error) {
        console.error('Error fetching order:', error)
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrder()
  }, [orderNumber])
  
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showTrackShipmentDropdown && !target.closest('.track-shipment-dropdown')) {
        setShowTrackShipmentDropdown(false)
      }
    }

    if (showTrackShipmentDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showTrackShipmentDropdown])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-500"></div>
      </div>
    )
  }
  
  if (!order) {
    return (
      <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-8 text-center">
        <h2 className="text-xl font-semibold text-brand-black mb-2">Order Not Found</h2>
        <p className="text-brand-gray-600 mb-4">
          The order number &quot;{orderNumber}&quot; could not be found.
        </p>
        <Link 
          href="/account/order-history"
          className="text-brand-blue-500 hover:text-brand-blue-600 font-medium hover:underline"
        >
          Return to Order History
        </Link>
      </div>
    )
  }
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
      case 'Picked Up':
        return 'bg-green-100 text-green-700'
      case 'Partially Delivered':
        return 'bg-yellow-100 text-yellow-700'
      case 'In Transit':
      case 'Ready for Pickup':
        return 'bg-blue-100 text-blue-700'
      case 'Cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }
  
  // Group items by shipping group
  const getGroupedItems = () => {
    if (!order.shippingGroups || order.shippingGroups.length === 0) {
      // No shipping groups - return all items as one group
      return [{
        groupId: 'default',
        status: order.status,
        items: order.items || [],
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        carrierTrackingUrl: order.carrierTrackingUrl,
        shippingAddress: order.shippingAddress,
        shippingMethod: order.shippingMethod,
        deliveryDate: order.deliveryDate,
        isBOPIS: order.isBOPIS,
        pickupLocation: order.pickupLocation,
        pickupAddress: order.pickupAddress,
        pickupDate: order.pickupDate,
        pickupReadyDate: order.pickupReadyDate,
      }]
    }
    
    return order.shippingGroups.map((group, idx) => ({
      ...group,
      items: (order.items || []).filter(item => item.shippingGroup === group.groupId),
      displayIndex: idx + 1,
    }))
  }
  
  const groupedItems = getGroupedItems()
  
  return (
    <div className="space-y-6">
      {/* Order Header Card */}
      <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 pb-6 border-b border-brand-gray-200">
          <div>
            <h1 className="text-2xl font-semibold text-brand-black mb-1">Order Details</h1>
            <p className="text-base text-brand-gray-600">Order #{order.orderNumber}</p>
            {order.customerEmail && (
              <p className="text-sm text-brand-gray-500 mt-1">
                Confirmation email sent to {order.customerEmail}
              </p>
            )}
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusBadge(order.status)}`}>
            {(order.status === 'Delivered' || order.status === 'Picked Up') && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {order.status}
          </div>
        </div>
        
        {/* Order Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items Ordered */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-brand-black">Items Ordered</h3>
            
            {groupedItems.map((group, groupIdx) => (
              <div key={group.groupId} className="border border-brand-gray-200 rounded-lg overflow-hidden">
                {/* Group Header */}
                <div className="bg-brand-gray-50 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-brand-black">
                      {order.isBOPIS 
                        ? `Pickup at ${group.pickupLocation || 'Store'}`
                        : `Shipment ${groupIdx + 1}`
                      }
                    </span>
                    {group.shippingAddress && !order.isBOPIS && (
                      <span className="text-sm text-brand-gray-600 hidden sm:inline">
                        → {group.shippingAddress?.split(',')[0]}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusBadge(group.status)}`}>
                    {group.status}
                  </span>
                </div>
                
                {/* Items */}
                <div className="p-4">
                  <div className="space-y-3 mb-4">
                    {group.items.map((item, idx) => {
                      // Determine if item can be returned (delivered/picked up items)
                      const canReturnItem = order.canReturn && 
                        (group.status === 'Delivered' || group.status === 'Picked Up' || order.status === 'Delivered' || order.status === 'Picked Up')
                      
                      // Determine if item can be cancelled (not yet delivered/picked up)
                      const canCancelItem = order.canCancel && 
                        order.status !== 'Cancelled' && 
                        group.status !== 'Delivered' && 
                        group.status !== 'Picked Up' &&
                        group.status !== 'In Transit'
                      
                      return (
                        <div key={idx} className="flex items-start gap-4 p-4 border border-brand-gray-200 rounded-lg hover:bg-brand-gray-50 transition-colors">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 bg-brand-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-brand-black mb-1">{item.name}</p>
                        {(item.color || item.size) && (
                              <p className="text-xs text-brand-gray-500 mb-1">
                            {[item.color, item.size].filter(Boolean).join(' / ')}
                          </p>
                        )}
                            {item.quantity && (
                              <p className="text-xs text-brand-gray-500 mb-2">Quantity: {item.quantity}</p>
                            )}
                            
                            {/* Item Actions */}
                            {(canReturnItem || canCancelItem) && (
                              <div className="flex flex-wrap gap-3 mt-2">
                                {canReturnItem && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedItemForReturn({ item, orderNumber: order.orderNumber, groupId: group.groupId })
                                      setReturnQuantity(item.quantity || 1)
                                      setReturnReason('')
                                      setShowReturnItemModal(true)
                                    }}
                                    className="text-xs text-brand-blue-500 hover:text-brand-blue-600 hover:underline font-medium"
                                  >
                                    Return Item
                                  </button>
                                )}
                                {canCancelItem && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedItemForCancel({ item, orderNumber: order.orderNumber, groupId: group.groupId })
                                      setCancelReason('')
                                      setShowCancelItemModal(true)
                                    }}
                                    className="text-xs text-red-600 hover:text-red-700 hover:underline font-medium"
                                  >
                                    Cancel Item
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Price and Buy Again */}
                          <div className="flex-shrink-0 flex flex-col items-end gap-2">
                        {item.price !== undefined && (
                              <div className="text-right">
                            {item.originalPrice && item.originalPrice > item.price && (
                                  <p className="text-xs text-brand-gray-400 line-through mb-0.5">
                                    ${item.originalPrice.toFixed(2)}
                                  </p>
                            )}
                                <p className="text-sm font-semibold text-brand-black">
                            ${item.price.toFixed(2)}
                          </p>
                              </div>
                        )}
                            <button className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm whitespace-nowrap">
                              Buy Again
                            </button>
                      </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Pickup Information - Always visible for BOPIS orders */}
                  {order.isBOPIS && (group.pickupLocation || group.pickupAddress || group.pickupDate || group.pickupReadyDate) && (
                    <div className="border-t border-brand-gray-200 pt-3 mt-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {group.pickupLocation && (
                              <div className="bg-brand-blue-50 border border-brand-blue-200 rounded-lg p-3">
                                <p className="text-xs font-medium text-brand-gray-600 mb-1">Pickup Location</p>
                                <p className="text-sm font-medium text-brand-black">{group.pickupLocation}</p>
                                {group.pickupAddress && (
                                  <p className="text-xs text-brand-gray-600 mt-1">{group.pickupAddress}</p>
                                )}
                              </div>
                        )}
                              {(group.pickupDate || group.pickupReadyDate) && (
                                <div className="bg-white border border-brand-gray-200 rounded-lg p-3">
                                  <p className="text-xs font-medium text-brand-gray-600 mb-1">
                                    {group.status === 'Picked Up' ? 'Picked Up On' : 'Pickup Window'}
                                  </p>
                                  <p className="text-sm font-medium text-brand-black">
                                    {group.pickupDate || group.pickupReadyDate}
                                  </p>
                                </div>
                              )}
                      </div>
                    </div>
                  )}

                  {/* Tracking Info - Always visible (only for non-BOPIS orders) */}
                  {!order.isBOPIS && (group.trackingNumber || group.carrierTrackingUrl || group.shippingAddress) && (
                    <div className="border-t border-brand-gray-200 pt-3 mt-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {group.trackingNumber && (
                                <div className="bg-brand-blue-50 border border-brand-blue-200 rounded-lg p-3">
                                  <p className="text-xs font-medium text-brand-gray-600 mb-1">Tracking Number</p>
                                  <p className="text-sm font-mono font-medium text-brand-black">{group.trackingNumber}</p>
                                  {group.carrier && (
                                    <p className="text-xs text-brand-gray-600 mt-1">{group.carrier}</p>
                                  )}
                                  {group.carrierTrackingUrl && (
                                    <a
                                      href={group.carrierTrackingUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-brand-blue-500 hover:text-brand-blue-600 hover:underline mt-2"
                                    >
                                      Track on {group.carrier || 'carrier'} website
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                    </a>
                                  )}
                                </div>
                              )}
                        {group.shippingAddress && (
                              <div className="bg-white border border-brand-gray-200 rounded-lg p-3">
                                <p className="text-xs font-medium text-brand-gray-600 mb-1">Shipping Address</p>
                                <p className="text-sm text-brand-black">{group.shippingAddress}</p>
                                {group.shippingMethod && (
                                  <p className="text-xs text-brand-gray-500 mt-2">{group.shippingMethod}</p>
                                )}
                              </div>
                          )}
                        </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="lg:sticky lg:top-4 space-y-4 self-start">
            <h3 className="text-lg font-semibold text-brand-black">Order Summary</h3>
            <div className="bg-brand-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-brand-gray-600">Subtotal</span>
                <span className="text-brand-black">${order.subtotal?.toFixed(2)}</span>
              </div>
              {order.promotions !== undefined && order.promotions !== 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-brand-gray-600">Promotions</span>
                  <span className="text-green-600">-${Math.abs(order.promotions).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-brand-gray-600">Shipping</span>
                <span className="text-brand-black">
                  {order.shipping === 0 ? '$0.00' : `$${order.shipping?.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-gray-600">Tax</span>
                <span className="text-brand-black">${order.tax?.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-brand-gray-200">
                <div className="flex justify-between">
                  <span className="font-semibold text-brand-black">Total</span>
                  <span className="font-semibold text-brand-black">${order.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Payment Method */}
            <div>
              <h4 className="text-sm font-semibold text-brand-black mb-2">Payment Method</h4>
              <div className="bg-white border border-brand-gray-200 rounded-lg p-3">
                <p className="text-sm text-brand-gray-700">{order.paymentInfo}</p>
              </div>
            </div>
            
            {/* Download Receipt */}
            <div>
              <button
                onClick={() => {
                  // Handle download receipt - in production this would trigger a PDF download
                  if (showToastMessage) {
                    showToastMessage('Receipt download started')
                  }
                  // You can implement actual download logic here
                  // Example: window.open(`/api/receipt/${order.orderNumber}`, '_blank')
                }}
                className="w-full px-4 py-2.5 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Receipt
              </button>
            </div>
            
            {/* Track Shipment - Multi-shipment dropdown */}
            {!order.isBOPIS && groupedItems.length > 1 && groupedItems.some(g => g.carrierTrackingUrl) && (
              <div className="relative track-shipment-dropdown">
                <button
                  onClick={() => setShowTrackShipmentDropdown(!showTrackShipmentDropdown)}
                  className="w-full px-4 py-2.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  Track Shipment
                  <svg 
                    className={`w-4 h-4 transition-transform ${showTrackShipmentDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showTrackShipmentDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-brand-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                    {groupedItems.map((group, idx) => {
                      if (!group.carrierTrackingUrl) return null
                      
                      // Extract name from shipping address (first part before comma)
                      const getRecipientName = (address?: string) => {
                        if (!address) return `Shipment ${idx + 1}`
                        const name = address.split(',')[0].trim()
                        return name || `Shipment ${idx + 1}`
                      }
                      
                      const recipientName = getRecipientName(group.shippingAddress)
                      
                      return (
                        <button
                          key={group.groupId}
                          onClick={() => {
                            if (group.carrierTrackingUrl) {
                              window.open(group.carrierTrackingUrl, '_blank', 'noopener,noreferrer')
                            }
                            setShowTrackShipmentDropdown(false)
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-brand-black hover:bg-brand-gray-50 transition-colors border-b border-brand-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">{recipientName}</div>
                          {group.trackingNumber && (
                            <div className="text-xs text-brand-gray-500 mt-0.5 font-mono">
                              {group.trackingNumber}
                            </div>
                          )}
                          {group.carrier && (
                            <div className="text-xs text-brand-gray-500">{group.carrier}</div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
            
            {/* Track Shipment - Single shipment button */}
            {!order.isBOPIS && groupedItems.length === 1 && groupedItems[0]?.carrierTrackingUrl && (
                <a
                href={groupedItems[0].carrierTrackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm text-center block"
                >
                  Track Shipment
                </a>
              )}
            
            {/* Return Info */}
            {order.canReturn && order.returnDeadline && (
              <div className="text-sm text-brand-gray-600">
                Eligible for return until {order.returnDeadline}
              </div>
              )}
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
      </div>

      {/* Cross-Sell Component */}
      <CrossSellSection />

      {/* Return Item Modal */}
      {showReturnItemModal && selectedItemForReturn && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowReturnItemModal(false)}></div>
            <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-brand-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
                <h2 className="text-xl font-semibold text-brand-black">Return Item</h2>
                <button
                  onClick={() => setShowReturnItemModal(false)}
                  className="p-2 text-brand-gray-500 hover:text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="p-4 bg-brand-gray-50 rounded-lg">
                  <p className="text-sm text-brand-gray-600 mb-1">Order Number</p>
                  <p className="text-base font-semibold text-brand-black">{selectedItemForReturn.orderNumber}</p>
                </div>

                {/* Item Details */}
                <div className="flex gap-4 p-4 border border-brand-gray-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-brand-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={selectedItemForReturn.item.image}
                        alt={selectedItemForReturn.item.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brand-black mb-1">{selectedItemForReturn.item.name}</p>
                    {(selectedItemForReturn.item.color || selectedItemForReturn.item.size) && (
                      <p className="text-xs text-brand-gray-500 mb-2">
                        {[selectedItemForReturn.item.color, selectedItemForReturn.item.size].filter(Boolean).join(' / ')}
                      </p>
                    )}
                    {selectedItemForReturn.item.price !== undefined && (
                      <p className="text-sm font-semibold text-brand-black">${selectedItemForReturn.item.price.toFixed(2)}</p>
                    )}
                  </div>
                </div>

                {/* Return Quantity */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Quantity to Return
                  </label>
                  <select
                    value={returnQuantity}
                    onChange={(e) => setReturnQuantity(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 border border-brand-gray-300 rounded-lg text-brand-black bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                  >
                    {Array.from({ length: selectedItemForReturn.item.quantity || 1 }, (_, i) => i + 1).map((qty) => (
                      <option key={qty} value={qty}>{qty}</option>
                    ))}
                  </select>
                </div>

                {/* Return Reason */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Reason for Return <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-4 py-2.5 border border-brand-gray-300 rounded-lg text-brand-black bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a reason</option>
                    <option value="defective">Defective or damaged item</option>
                    <option value="wrong-item">Wrong item received</option>
                    <option value="not-as-described">Not as described</option>
                    <option value="size-fit">Size/fit issue</option>
                    <option value="changed-mind">Changed my mind</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Return Instructions */}
                <div className="p-4 bg-brand-blue-50 border border-brand-blue-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-brand-black mb-2">Return Instructions</h3>
                  <ul className="text-sm text-brand-gray-700 space-y-1 list-disc list-inside">
                    <li>You will receive a prepaid return shipping label via email</li>
                    <li>Please pack the item securely in its original packaging if possible</li>
                    <li>Returns must be initiated within 30 days of delivery</li>
                    <li>Refunds will be processed within 5-7 business days after we receive your return</li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-brand-gray-200">
                  <button
                    onClick={() => setShowReturnItemModal(false)}
                    className="flex-1 px-4 py-2.5 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!returnReason) {
                        if (showToastMessage) {
                          showToastMessage('Please select a reason for return', 'error')
                        }
                        return
                      }
                      // Handle return submission
                      if (showToastMessage) {
                        showToastMessage(`Return request submitted for ${returnQuantity} item(s)`)
                      }
                      setShowReturnItemModal(false)
                      setSelectedItemForReturn(null)
                      setReturnReason('')
                      setReturnQuantity(1)
                    }}
                    className="flex-1 px-4 py-2.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                  >
                    Submit Return Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Item Modal */}
      {showCancelItemModal && selectedItemForCancel && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowCancelItemModal(false)}></div>
            <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-brand-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
                <h2 className="text-xl font-semibold text-brand-black">Cancel Item</h2>
                <button
                  onClick={() => setShowCancelItemModal(false)}
                  className="p-2 text-brand-gray-500 hover:text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Warning */}
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-semibold text-red-800 mb-1">Are you sure you want to cancel this item?</h3>
                      <p className="text-sm text-red-700">
                        This action cannot be undone. If your order has already shipped, you may need to return it instead.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Info */}
                <div className="p-4 bg-brand-gray-50 rounded-lg">
                  <p className="text-sm text-brand-gray-600 mb-1">Order Number</p>
                  <p className="text-base font-semibold text-brand-black">{selectedItemForCancel.orderNumber}</p>
                </div>

                {/* Item Details */}
                <div className="flex gap-4 p-4 border border-brand-gray-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-brand-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={selectedItemForCancel.item.image}
                        alt={selectedItemForCancel.item.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brand-black mb-1">{selectedItemForCancel.item.name}</p>
                    {(selectedItemForCancel.item.color || selectedItemForCancel.item.size) && (
                      <p className="text-xs text-brand-gray-500 mb-2">
                        {[selectedItemForCancel.item.color, selectedItemForCancel.item.size].filter(Boolean).join(' / ')}
                      </p>
                    )}
                    {selectedItemForCancel.item.quantity && (
                      <p className="text-xs text-brand-gray-500 mb-1">Quantity: {selectedItemForCancel.item.quantity}</p>
                    )}
                    {selectedItemForCancel.item.price !== undefined && (
                      <p className="text-sm font-semibold text-brand-black">${selectedItemForCancel.item.price.toFixed(2)}</p>
                    )}
                  </div>
                </div>

                {/* Cancel Reason */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Reason for Cancellation <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-4 py-2.5 border border-brand-gray-300 rounded-lg text-brand-black bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a reason</option>
                    <option value="changed-mind">Changed my mind</option>
                    <option value="found-better-price">Found a better price elsewhere</option>
                    <option value="no-longer-needed">No longer needed</option>
                    <option value="shipping-delay">Shipping delay</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Refund Info */}
                <div className="p-4 bg-brand-gray-50 border border-brand-gray-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-brand-black mb-2">Refund Information</h3>
                  <p className="text-sm text-brand-gray-700">
                    If your order hasn&apos;t shipped yet, you&apos;ll receive a full refund to your original payment method within 5-7 business days.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-brand-gray-200">
                  <button
                    onClick={() => setShowCancelItemModal(false)}
                    className="flex-1 px-4 py-2.5 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors"
                  >
                    Keep Item
                  </button>
                  <button
                    onClick={() => {
                      if (!cancelReason) {
                        if (showToastMessage) {
                          showToastMessage('Please select a reason for cancellation', 'error')
                        }
                        return
                      }
                      // Handle cancellation
                      if (showToastMessage) {
                        showToastMessage('Item cancellation request submitted')
                      }
                      setShowCancelItemModal(false)
                      setSelectedItemForCancel(null)
                      setCancelReason('')
                    }}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Cancel Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Cross-Sell Component for Order Pages
function CrossSellSection() {
  const [crossSellProducts, setCrossSellProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch featured products for cross-sell
    const fetchProducts = async () => {
      try {
        const products = await getFeaturedProducts()
        // Get first 4 products for cross-sell
        setCrossSellProducts(products.slice(0, 4))
      } catch (error) {
        console.error('Error fetching cross-sell products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

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
    <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-brand-black mb-4">You May Also Like</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {crossSellProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={(product) => {
              // Handle quick view if needed
              console.log('Quick view:', product)
            }}
          />
        ))}
      </div>
    </div>
  )
}

function renderIcon(iconName: string) {
  const iconClass = 'w-5 h-5'
  switch (iconName) {
    case 'overview':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    case 'account':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    case 'orders':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    case 'wishlist':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    case 'loyalty':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    case 'addresses':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    case 'store':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    case 'payment':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    case 'passkey':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      )
    case 'logout':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      )
    default:
      return null
  }
}

export default function MyAccountPage() {
  const pathname = usePathname()
  const router = useRouter()
  
  // Determine active section from URL
  const getActiveSectionFromPath = () => {
    if (pathname?.includes('/account-details')) return 'account-details'
    if (pathname?.match(/\/order\/[^/]+/)) return 'order-detail' // Order detail pages
    if (pathname?.includes('/order-history')) return 'order-history'
    if (pathname?.includes('/wishlist')) return 'wishlist'
    if (pathname?.includes('/payment')) return 'payment'
    if (pathname?.includes('/addresses')) return 'addresses'
    if (pathname?.includes('/store-preferences')) return 'store-preferences'
    if (pathname?.includes('/loyalty')) return 'loyalty'
    return 'overview' // Default to overview
  }
  
  // Extract order number from URL for order detail pages
  const getOrderNumberFromPath = () => {
    const match = pathname?.match(/\/order\/([^/]+)/)
    return match ? match[1] : null
  }
  
  const [activeSection, setActiveSection] = useState(getActiveSectionFromPath())
  const wishlistCount = 23 // Total items in default wishlist
  
  // Get logged-in user data
  const [user, setUser] = useState<User | null>(null)
  
  // Orders state - loaded from repository
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  
  // Products state for QuickViewModal
  const [allProducts, setAllProducts] = useState<Product[]>([])
  
  // Update active section when pathname changes
  useEffect(() => {
    const newSection = getActiveSectionFromPath()
    setActiveSection(newSection)
    
    // Always collapse sidebar when navigating to an order detail page (from any page)
    // Check both the section and the pathname to ensure we catch all order detail pages
    const isOrderDetailPage = newSection === 'order-detail' || (pathname && pathname.match(/\/order\/[^/]+/))
    
    if (isOrderDetailPage) {
      setIsSidebarCollapsed(true)
    }
    // For all other navigation, preserve the current collapsed state (handled by localStorage)
  }, [pathname])
  
  // Load user data on mount and listen for changes
  useEffect(() => {
    const loadUser = () => {
      setUser(getCurrentUser())
    }
    
    loadUser()

    // Listen for login/logout events
    const handleLogin = () => {
      loadUser()
    }
    
    const handleLogout = () => {
      loadUser()
    }

    // Guard for SSR - window not available during server-side rendering
    if (typeof window !== 'undefined') {
    window.addEventListener('userLoggedIn', handleLogin)
    window.addEventListener('userLoggedOut', handleLogout)

    return () => {
      window.removeEventListener('userLoggedIn', handleLogin)
      window.removeEventListener('userLoggedOut', handleLogout)
      }
    }
  }, [])
  
  // Load orders and products from repository
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const orderRepo = getOrderRepo()
        // Using customer-1 as the default customer ID (in production, this would come from auth)
        const result = await orderRepo.listOrders('customer-1', undefined, 'date-desc', 1, 100)
        // Map repository orders to local Order type
        const mappedOrders: Order[] = result.items.map(order => ({
          orderNumber: order.orderNumber,
          status: order.status,
          method: order.method,
          amount: order.amount,
          orderDate: order.orderDate,
          items: order.items.map(item => ({
            id: item.id,
            image: item.image,
            name: item.name,
            quantity: item.quantity,
            color: item.color,
            size: item.size,
            price: item.price,
            originalPrice: item.originalPrice,
            store: item.store,
            shippingGroup: item.shippingGroup,
          })),
          subtotal: order.subtotal,
          promotions: order.promotions,
          shipping: order.shipping,
          tax: order.tax,
          total: order.total,
          paymentInfo: order.paymentInfo,
          shippingAddress: order.shippingAddress,
          shippingMethod: order.shippingMethod,
          deliveryDate: order.deliveryDate,
          trackingNumber: order.trackingNumber,
          carrier: order.carrier,
          carrierTrackingUrl: order.carrierTrackingUrl,
          shippingGroups: order.shippingGroups,
          isBOPIS: order.isBOPIS,
          pickupLocation: order.pickupLocation,
          pickupAddress: order.pickupAddress,
          pickupDate: order.pickupDate,
          pickupReadyDate: order.pickupReadyDate,
          canReturn: order.canReturn,
          canCancel: order.canCancel,
          returnDeadline: order.returnDeadline,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
        }))
        setRecentOrders(mappedOrders)
      } catch (error) {
        console.error('Error loading orders:', error)
        setRecentOrders([])
      } finally {
        setOrdersLoading(false)
      }
    }
    
    const loadProducts = async () => {
      try {
        const products = await getAllProducts()
        setAllProducts(products)
      } catch (error) {
        console.error('Error loading products:', error)
        setAllProducts([])
      }
    }
    
    loadOrders()
    loadProducts()
  }, [])

  // Use logged-in user data or fallback to mock data
  const userName = user?.firstName || 'John'
  const userLastName = user?.lastName || 'Doe'
  const userEmail = user?.email || 'john.doe@example.com'
  const userPhone = user?.phone || '+1 (555) 123-4567'
  const ordersCount = 350
  const loyaltyPoints = 2450
  const loyaltyStatus = (user?.loyaltyStatus || 'Gold') as 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  
  // Helper function for loyalty status badge colors
  const getLoyaltyStatusColor = (status?: string) => {
    switch (status) {
      case 'Platinum':
        return 'bg-purple-100 text-purple-700'
      case 'Gold':
        return 'bg-yellow-100 text-yellow-700'
      case 'Silver':
        return 'bg-gray-100 text-gray-700'
      case 'Bronze':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }
  
  // Helper function for loyalty status background gradient
  const getLoyaltyStatusGradient = (status?: string) => {
    switch (status) {
      case 'Platinum':
        return 'from-purple-50 to-purple-100 border-purple-200'
      case 'Gold':
        return 'from-yellow-50 to-yellow-100 border-yellow-200'
      case 'Silver':
        return 'from-gray-50 to-gray-100 border-gray-200'
      case 'Bronze':
        return 'from-orange-50 to-orange-100 border-orange-200'
      default:
        return 'from-gray-50 to-gray-100 border-gray-200'
    }
  }
  
  // Helper function for loyalty status icon background
  const getLoyaltyStatusIconBg = (status?: string) => {
    switch (status) {
      case 'Platinum':
        return 'bg-purple-500'
      case 'Gold':
        return 'bg-yellow-500'
      case 'Silver':
        return 'bg-gray-500'
      case 'Bronze':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }
  
  // Helper function for loyalty status progress bar color
  const getLoyaltyStatusProgressColor = (status?: string) => {
    switch (status) {
      case 'Platinum':
        return 'bg-purple-500'
      case 'Gold':
        return 'bg-yellow-500'
      case 'Silver':
        return 'bg-gray-500'
      case 'Bronze':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }
  
  // Profile completion data
  const profileCompletion = {
    hasEmail: true,
    emailVerified: false,
    hasPhone: true,
    phoneVerified: false,
    hasAddress: true,
    hasPaymentMethod: true,
    hasPassword: true,
  }
  
  // Calculate profile completion percentage
  const profileCompletionSteps = [
    profileCompletion.hasEmail && profileCompletion.emailVerified,
    profileCompletion.hasPhone && profileCompletion.phoneVerified,
    profileCompletion.hasAddress,
    profileCompletion.hasPaymentMethod,
    profileCompletion.hasPassword,
  ]
  const completedSteps = profileCompletionSteps.filter(Boolean).length
  const profileCompletionPercentage = (completedSteps / profileCompletionSteps.length) * 100
  
  // Get next steps for profile completion
  const getNextSteps = () => {
    const steps = []
    if (!profileCompletion.emailVerified) {
      steps.push({ label: 'Verify your email', link: '/account/account-details#email', section: 'account-details' })
    }
    if (!profileCompletion.phoneVerified) {
      steps.push({ label: 'Verify your phone number', link: '/account/account-details#phone', section: 'account-details' })
    }
    if (!profileCompletion.hasAddress) {
      steps.push({ label: 'Add a shipping address', link: '/account/addresses', section: 'addresses' })
    }
    if (!profileCompletion.hasPaymentMethod) {
      steps.push({ label: 'Add a payment method', link: '/account/payment', section: 'payment' })
    }
    return steps
  }
  
  const nextSteps = getNextSteps()
  
  // Get user initials for avatar
  const getUserInitials = () => {
    return `${userName.charAt(0)}${userLastName.charAt(0)}`.toUpperCase()
  }

  const [expandedTracking, setExpandedTracking] = useState<Set<string>>(new Set())
  const [showTrackingDropdown, setShowTrackingDropdown] = useState<Record<string, boolean>>({})
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [orderSearchTerm, setOrderSearchTerm] = useState<string>('')
  const [selectedWishlistId, setSelectedWishlistId] = useState<string>('my-favorites')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('visa-1')
  const [selectedAddressId, setSelectedAddressId] = useState<string>('address-1')
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [showRemoveAddressModal, setShowRemoveAddressModal] = useState(false)
  const [addressToRemove, setAddressToRemove] = useState<string | null>(null)
  const [addressForm, setAddressForm] = useState<Partial<Address>>({
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  })
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [returningOrderId, setReturningOrderId] = useState<string | null>(null)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [showRenameWishlistModal, setShowRenameWishlistModal] = useState(false)
  
  // Gift Cards State
  const [giftCards, setGiftCards] = useState([
    { id: 'gc-1', balance: 75.00, last4: '1234' },
    { id: 'gc-2', balance: 50.00, last4: '5678' },
  ])
  const [showAddGiftCardModal, setShowAddGiftCardModal] = useState(false)
  const [showRemoveGiftCardModal, setShowRemoveGiftCardModal] = useState(false)
  const [giftCardToRemove, setGiftCardToRemove] = useState<string | null>(null)
  const [giftCardForm, setGiftCardForm] = useState({
    cardNumber: '',
    pin: '',
  })
  
  // Store Credit History State
  const [showCreditHistory, setShowCreditHistory] = useState(false)
  const [renamingWishlistId, setRenamingWishlistId] = useState<string | null>(null)
  const [newWishlistName, setNewWishlistName] = useState('')
  const [wishlistSortBy, setWishlistSortBy] = useState<'recent' | 'name' | 'price-low' | 'price-high'>('recent')
  const [wishlistFilter, setWishlistFilter] = useState<string>('all')
  const [showShareWishlistModal, setShowShareWishlistModal] = useState(false)
  const [sharingWishlistId, setSharingWishlistId] = useState<string | null>(null)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [notifyMeProduct, setNotifyMeProduct] = useState<Product | null>(null)
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])
  const [wishlists, setWishlists] = useState<Wishlist[]>([])
  const [showCreateWishlistModal, setShowCreateWishlistModal] = useState(false)
  const [showInterestsModal, setShowInterestsModal] = useState(false)
  const [interestsModalCategory, setInterestsModalCategory] = useState<'designStyles' | 'roomTypes' | 'materials' | 'aesthetics'>('designStyles')
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [preferencesModalCategory, setPreferencesModalCategory] = useState<'productCategories' | null>(null)
  const [isMobileMenuCollapsed, setIsMobileMenuCollapsed] = useState(true)
  
  // Desktop sidebar collapse state - persisted during navigation using localStorage
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Initialize from localStorage if available, otherwise check if we're on an order detail page
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('myAccountSidebarCollapsed')
      if (saved !== null) {
        return saved === 'true'
      }
      // If no saved preference, auto-collapse on order detail pages
      return window.location.pathname.match(/\/order\/[^/]+/) !== null
    }
    return false
  })
  
  // Persist sidebar state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('myAccountSidebarCollapsed', String(isSidebarCollapsed))
    }
  }, [isSidebarCollapsed])

  // Store Preferences State
  const [showStoreSelector, setShowStoreSelector] = useState(false)
  const [preferredStoreForPickup, setPreferredStoreForPickup] = useState({
    id: '1',
    name: 'Market Street - San Francisco',
    address: '415 Mission Street, San Francisco, CA 94105',
    hours: 'Open today: 10:00 AM - 8:00 PM',
  })
  const [showAddPersonModal, setShowAddPersonModal] = useState(false)
  const [isEditingPickupPreferences, setIsEditingPickupPreferences] = useState(false)
  const [pickupPreferencesForm, setPickupPreferencesForm] = useState({
    autoSelectStore: true,
    pickupNotifications: true,
    storeEventsPromotions: false,
  })
  const [authorizedPersonForm, setAuthorizedPersonForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    relationship: '',
  })

  // Account Details Edit States
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false)
  const [isEditingInterestsAndPreferences, setIsEditingInterestsAndPreferences] = useState(false)
  const [isEditingProfileVisibility, setIsEditingProfileVisibility] = useState(false)
  
  // Feature flags - set to true to enable Profile Visibility section
  const showProfileVisibility = false
  const [isEditingMarketing, setIsEditingMarketing] = useState(false)

  // Account Details Form States
  const [personalInfoForm, setPersonalInfoForm] = useState({
    firstName: userName,
    lastName: userLastName,
    email: userEmail,
    phone: userPhone,
    dateOfBirth: '15/05/1990',
    gender: 'Prefer not to say',
    anniversary: '',
    weddingDay: '',
  })
  
  // Update personalInfoForm when user data changes (only when not editing)
  useEffect(() => {
    if (user && !isEditingPersonalInfo) {
      setPersonalInfoForm(prev => ({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || prev.phone || '+1 (555) 123-4567',
        dateOfBirth: prev.dateOfBirth || '15/05/1990',
        gender: prev.gender || 'Prefer not to say',
        anniversary: prev.anniversary || '',
        weddingDay: prev.weddingDay || '',
      }))
    }
  }, [user, isEditingPersonalInfo])

  // Handle hash navigation for email/phone verification
  useEffect(() => {
    if (activeSection === 'account-details') {
      const handleHashChange = () => {
        const hash = window.location.hash
        if (hash === '#email' || hash === '#phone') {
          // Enable editing mode
          setIsEditingPersonalInfo(true)
          
          // Scroll to the field after a short delay to ensure DOM is ready
          setTimeout(() => {
            const element = document.getElementById(hash.substring(1))
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' })
              // Focus on the input field if it exists
              const input = element.querySelector('input')
              if (input) {
                setTimeout(() => input.focus(), 100)
              }
            }
          }, 100)
        }
      }
      
      // Check hash on mount and when pathname changes
      handleHashChange()
      
      // Listen for hash changes
      window.addEventListener('hashchange', handleHashChange)
      
      return () => {
        window.removeEventListener('hashchange', handleHashChange)
      }
    }
  }, [activeSection, pathname])

  const [interestsForm, setInterestsForm] = useState({
    designStyles: ['Minimalist', 'Geometric'],
    roomTypes: ['Living Room', 'Office'],
    materials: ['Ceramic'],
    aesthetics: ['Modern'],
  })

  const [preferencesForm, setPreferencesForm] = useState({
    productCategories: ['Geometric', 'Sets'],
    shoppingPreferences: 'unisex' as 'womens' | 'mens' | 'unisex',
  })

  const [measuresForm, setMeasuresForm] = useState({
    roomWidth: '',
    roomLength: '',
    ceilingHeight: '',
    preferredProductSize: '',
  })

  const [profileVisibilityForm, setProfileVisibilityForm] = useState({
    displayName: 'Full Name',
    locationDisplay: false,
  })

  const [marketingForm, setMarketingForm] = useState({
    emailOrderUpdates: true,
    emailPromotions: false,
    emailNewsletter: false,
    smsOrderUpdates: true,
    smsPromotions: false,
  })

  // Toast state
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
  }

  // Disabled toggle feedback
  const [showEditHint, setShowEditHint] = useState<string | null>(null)
  const handleDisabledToggleClick = (section: string) => {
    setShowEditHint(section)
    setTimeout(() => setShowEditHint(null), 2000)
  }

  // Orders are now loaded from repository in useEffect above
  // The recentOrders state is populated from getOrderRepo().listOrders()
  // See /src/data/mock/orders.ts for the order data

  // Normalization function to convert raw order JSON into fulfillmentGroups
  // This ensures we always have at least 1 fulfillment group, handling:
  // - Multi-shipping (multiple shipments)
  // - Single shipping (no shipments array, use order-level fields)
  // - BOPIS/Pickup (isBOPIS flag or pickup fields)
  type FulfillmentGroup = {
    type: 'shipping' | 'pickup'
    title: string // e.g. "Shipment 1" or "Pickup"
    status?: string
    items: Array<{ 
      id: string
      name: string
      price?: number
      image?: string
      variantInfo?: string
      quantity?: number
      color?: string
      size?: string
      originalPrice?: number
    }>
    shippingInfo?: {
      address?: string
      method?: string
      carrier?: string
      trackingNumber?: string
      eta?: string
      trackingUrl?: string
    }
    pickupInfo?: {
      locationName?: string
      address?: string
      readyDate?: string
      pickupWindow?: string
      instructions?: string
    }
  }

  const normalizeOrderToFulfillmentGroups = (order: Order): FulfillmentGroup[] => {
    // If order.shipments exists and is non-empty, map each shipment to a fulfillmentGroup
    if (order.shippingGroups && order.shippingGroups.length > 0) {
      return order.shippingGroups.map((group, idx) => {
        const isPickup = group.isBOPIS || order.isBOPIS
        const items = (order.items || []).filter(item => item.shippingGroup === group.groupId)
        
        if (isPickup) {
          return {
            type: 'pickup' as const,
            title: 'Pickup',
            status: group.status,
            items: items.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              quantity: item.quantity,
              color: item.color,
              size: item.size,
              originalPrice: item.originalPrice,
              variantInfo: [item.color, item.size].filter(Boolean).join(', ') || undefined,
            })),
            pickupInfo: {
              locationName: group.pickupLocation || order.pickupLocation,
              address: group.pickupAddress || order.pickupAddress,
              readyDate: group.pickupReadyDate || order.pickupReadyDate,
              pickupWindow: group.pickupDate || order.pickupDate,
              instructions: 'Your order is ready for pickup. Please bring a valid ID and your order confirmation.',
            },
          }
      } else {
          return {
            type: 'shipping' as const,
            title: `Shipment ${idx + 1}`,
            status: group.status,
            items: items.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              quantity: item.quantity,
              color: item.color,
              size: item.size,
              originalPrice: item.originalPrice,
              variantInfo: [item.color, item.size].filter(Boolean).join(', ') || undefined,
            })),
            shippingInfo: {
              address: group.shippingAddress || order.shippingAddress,
              method: group.shippingMethod || order.shippingMethod,
              carrier: group.carrier,
              trackingNumber: group.trackingNumber,
              eta: group.deliveryDate,
              trackingUrl: group.carrierTrackingUrl,
            },
          }
        }
      })
    }
    
    // Else if order.pickup (or order.fulfillmentType indicates pickup/BOPIS)
    if (order.isBOPIS || order.pickupLocation) {
      return [{
        type: 'pickup' as const,
        title: 'Pickup',
        status: order.status,
        items: (order.items || []).map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          originalPrice: item.originalPrice,
          variantInfo: [item.color, item.size].filter(Boolean).join(', ') || undefined,
        })),
        pickupInfo: {
          locationName: order.pickupLocation,
          address: order.pickupAddress,
          readyDate: order.pickupReadyDate,
          pickupWindow: order.pickupDate,
          instructions: 'Your order is ready for pickup. Please bring a valid ID and your order confirmation.',
        },
      }]
    }
    
    // Else: Create 1 default shipping group using order.items[] and order-level shipping/tracking fields
    return [{
      type: 'shipping' as const,
      title: 'Shipment 1',
      status: order.status,
      items: (order.items || []).map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        originalPrice: item.originalPrice,
        variantInfo: [item.color, item.size].filter(Boolean).join(', ') || undefined,
      })),
      shippingInfo: {
        address: order.shippingAddress,
        method: order.shippingMethod,
        carrier: order.carrier,
        trackingNumber: order.trackingNumber,
        eta: order.deliveryDate,
        trackingUrl: order.carrierTrackingUrl,
      },
    }]
  }


  // Responsive Order Item Thumbnails Component
  const OrderItemThumbnails = ({ items, orderId }: { items: Array<{ image?: string; name?: string; id?: string; quantity?: number }>, orderId: string }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    // Initialize state to match SSR render (up to 3 items) to prevent hydration mismatch
    const ssrVisibleCount = Math.min(items.length, 3)
    const [visibleCount, setVisibleCount] = useState(ssrVisibleCount)
    const [showBadge, setShowBadge] = useState(items.length > 3)
    const [remainingCount, setRemainingCount] = useState(Math.max(0, items.length - 3))

    // Constants
    const TILE = 64 // w-16 = 64px (THUMB_SIZE_PX)
    const GAP = 8 // gap-2 = 8px (GAP_PX)

    // Pure function that returns values instead of setting state
    const calculateVisibleItems = useCallback((): { visibleCount: number; showBadge: boolean; remainingCount: number } => {
      // Guard for SSR or missing ref
      if (typeof window === 'undefined' || !containerRef.current || items.length === 0) {
        return {
          visibleCount: items.length,
          showBadge: false,
          remainingCount: 0
        }
      }

      const el = containerRef.current
      // Get inner width by subtracting padding
      const rect = el.getBoundingClientRect()
      const style = window.getComputedStyle(el)
      const paddingLeft = parseFloat(style.paddingLeft) || 0
      const paddingRight = parseFloat(style.paddingRight) || 0
      const innerWidth = rect.width - paddingLeft - paddingRight

      // Formula: k*TILE + (k-1)*GAP <= innerWidth
      // Solving: k*(TILE+GAP) - GAP <= innerWidth
      // k <= (innerWidth + GAP) / (TILE+GAP)
      const maxTiles = Math.floor((innerWidth + GAP) / (TILE + GAP))
      
      // Ensure at least 1 tile can fit
      const maxVisible = Math.max(1, maxTiles)

      if (items.length <= maxVisible) {
        // All items fit - show all, no +N badge
        return {
          visibleCount: items.length,
          showBadge: false,
          remainingCount: 0
        }
      } else {
        // Not all fit - reserve last slot for +N badge tile
        // visibleCount = maxVisible - 1, but must be at least 1
        const visibleCount = Math.max(1, maxVisible - 1)
        return {
          visibleCount,
          showBadge: true,
          remainingCount: items.length - visibleCount
        }
      }
    }, [items.length])

    // State updates ONLY happen inside useEffect (client-only)
    useEffect(() => {
      // Guard for SSR - browser APIs not available during server-side rendering
      if (typeof window === 'undefined') return
      if (!containerRef.current) return

      // Calculate and set state
      const result = calculateVisibleItems()
      setVisibleCount(result.visibleCount)
      setShowBadge(result.showBadge)
      setRemainingCount(result.remainingCount)

      // Set up ResizeObserver
      const resizeObserver = new ResizeObserver(() => {
        if (!containerRef.current) return
        const result = calculateVisibleItems()
        setVisibleCount(result.visibleCount)
        setShowBadge(result.showBadge)
        setRemainingCount(result.remainingCount)
      })

      resizeObserver.observe(containerRef.current)

      return () => {
        resizeObserver.disconnect()
      }
    }, [calculateVisibleItems])

    if (items.length === 0) return null

    // Use state values for rendering (initialized to match SSR, then updated by useEffect)
    const visibleItems = items.slice(0, visibleCount)
    const shouldShowBadge = showBadge
    const badgeCount = remainingCount

    return (
      <div ref={containerRef} className="flex items-center gap-2 mb-4">
        {visibleItems.map((item, itemIdx) => (
          <div key={item.id || `${orderId}-item-${itemIdx}`} className="relative flex-shrink-0">
            <div className="w-16 h-16 bg-brand-gray-100 rounded-lg overflow-hidden border border-brand-gray-200">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name || 'Product'}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            {/* Quantity Badge */}
            {item.quantity && item.quantity > 1 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white">
                {item.quantity}
              </div>
            )}
          </div>
        ))}
        {shouldShowBadge && (
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 bg-brand-gray-100 rounded-lg border border-brand-gray-200 flex items-center justify-center">
              <span className="text-sm font-semibold text-brand-gray-600">
                +{badgeCount}
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Reusable Order Summary Card Component
  const OrderSummaryCard = ({ order, variant = 'full' }: { order: Order; variant?: 'full' | 'compact' }) => {
    const fulfillmentGroups = normalizeOrderToFulfillmentGroups(order)
    const allItems = fulfillmentGroups.flatMap(g => g.items)
    const totalItemsCount = allItems.length
    const isPickup = order.isBOPIS || fulfillmentGroups.some(g => g.type === 'pickup')
    const pickupGroup = fulfillmentGroups.find(g => g.type === 'pickup')
    const isCompact = variant === 'compact'

    return (
      <div 
        className={`${isCompact ? 'p-4' : 'p-6'} hover:bg-brand-gray-50 transition-colors cursor-pointer border-b border-brand-gray-200 last:border-b-0`}
        onClick={(e) => {
          // Only navigate if clicking on the row itself, not on links/buttons
          if ((e.target as HTMLElement).closest('a, button')) return
          router.push(`/order/${order.orderNumber}`)
        }}
      >
        {/* Meta Bar: Order Date, Total, Items Count, Status */}
        <div className={`bg-brand-gray-50 border-b border-brand-gray-200 ${isCompact ? '-mx-4 -mt-4 px-4 pt-2.5 pb-2.5 mb-4' : '-mx-6 -mt-6 px-6 pt-3 pb-3 mb-6'} rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 flex-1">
              {/* Order Date */}
              {order.orderDate && (
                <div>
                  <span className="text-xs text-brand-gray-500 font-medium">Order Date</span>
                  <p className="text-sm font-semibold text-brand-black mt-0.5">{order.orderDate}</p>
                </div>
              )}
              {/* Total */}
              <div>
                <span className="text-xs text-brand-gray-500 font-medium">Total</span>
                <p className="text-sm font-semibold text-brand-black mt-0.5">{order.amount}</p>
              </div>
              {/* Items Count */}
              <div>
                <span className="text-xs text-brand-gray-500 font-medium">Items</span>
                <p className="text-sm font-semibold text-brand-black mt-0.5">{totalItemsCount}</p>
              </div>
            </div>
            {/* Status Pill - Right aligned */}
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold ${
              order.status === 'Delivered' || order.status === 'Picked Up'
                ? 'bg-green-600 text-white'
                : order.status === 'Partially Delivered'
                ? 'bg-yellow-100 text-yellow-700'
                : order.status === 'In Transit' || order.status === 'Ready for Pickup'
                ? 'bg-blue-100 text-blue-700'
                : order.status === 'Cancelled'
                ? 'bg-red-100 text-red-700'
                : 'bg-brand-gray-100 text-brand-gray-700'
            }`}>
              {(order.status === 'Delivered' || order.status === 'Picked Up') && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {order.status === 'Cancelled' && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {order.status}
            </span>
          </div>
        </div>

        {/* Thumbnails Row - Responsive */}
        {allItems.length > 0 && (
          <div className={isCompact ? 'mb-4' : 'mb-6'}>
            <OrderItemThumbnails items={allItems} orderId={order.orderNumber} />
          </div>
        )}

        {/* Pickup Location Card - Always show for BOPIS orders */}
        {isPickup && pickupGroup?.pickupInfo && (
          <div className={`${isCompact ? 'mb-4 p-3' : 'mb-6 p-4'} bg-brand-blue-50 border border-brand-blue-200 rounded-lg`}>
            <h4 className={`${isCompact ? 'text-xs mb-2' : 'text-sm mb-3'} font-semibold text-brand-black`}>Pickup Location</h4>
            <div className={isCompact ? 'space-y-1.5' : 'space-y-2'}>
              {pickupGroup.pickupInfo.locationName && (
                <div>
                  <p className="text-xs font-medium text-brand-gray-600 mb-0.5">Location</p>
                  <p className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-brand-black`}>{pickupGroup.pickupInfo.locationName}</p>
                </div>
              )}
              {pickupGroup.pickupInfo.address && (
                <div>
                  <p className="text-xs font-medium text-brand-gray-600 mb-0.5">Address</p>
                  <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-brand-black`}>{pickupGroup.pickupInfo.address}</p>
                </div>
              )}
              {pickupGroup.pickupInfo.pickupWindow && (
                <div>
                  <p className="text-xs font-medium text-brand-gray-600 mb-0.5">Pickup Window</p>
                  <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-brand-black`}>{pickupGroup.pickupInfo.pickupWindow}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTA: View Order Details & Download Receipt */}
        <div className={`${isCompact ? 'mt-1' : 'mt-2'} flex items-center justify-between gap-4`}>
          <Link
            href={`/order/${order.orderNumber}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline font-medium flex items-center gap-1.5"
          >
            View Order Details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (showToastMessage) {
                showToastMessage('Receipt download started')
              }
              // You can implement actual download logic here
              // Example: window.open(`/api/receipt/${order.orderNumber}`, '_blank')
            }}
            className="text-sm text-brand-gray-600 hover:text-brand-black font-medium flex items-center gap-1.5 transition-colors"
            title="Download Receipt"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {!isCompact && <span>Download Receipt</span>}
          </button>
        </div>
      </div>
    )
  }

  // Get selected wishlist and filter/sort items
  const selectedWishlist = wishlists.find(w => w.id === selectedWishlistId) || wishlists[0] || { id: 'my-favorites', name: 'My Favorites', isDefault: true, itemCount: 0, items: [] }
  
  // Filter and sort items
  let filteredItems = [...selectedWishlist.items]
  
  // Apply filter
  if (wishlistFilter === 'in-stock') {
    filteredItems = filteredItems.filter(item => item.inStock)
  } else if (wishlistFilter === 'out-of-stock') {
    filteredItems = filteredItems.filter(item => !item.inStock)
  } else if (wishlistFilter === 'on-sale') {
    filteredItems = filteredItems.filter(item => item.originalPrice && item.originalPrice > item.price)
  }
  
  // Apply sort
  filteredItems.sort((a, b) => {
    if (wishlistSortBy === 'name') {
      return a.name.localeCompare(b.name)
    } else if (wishlistSortBy === 'price-low') {
      return a.price - b.price
    } else if (wishlistSortBy === 'price-high') {
      return b.price - a.price
    }
    // recent (default) - keep original order
    return 0
  })
  
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)

  // Mock payment methods data
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'visa-1',
      type: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2026,
      cardholderName: 'John Doe',
      isDefault: true,
      isSelected: true,
    },
    {
      id: 'mastercard-1',
      type: 'mastercard',
      last4: '5555',
      expiryMonth: 12,
      expiryYear: 2026,
      cardholderName: 'John Doe',
      isDefault: false,
      isSelected: false,
    },
    {
      id: 'ach-1',
      type: 'ach',
      bankName: 'Bank Account Name',
      cardholderName: 'John Doe',
      isDefault: false,
      isSelected: false,
    },
  ])
  
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [avatarImage, setAvatarImage] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [paymentForm, setPaymentForm] = useState<Partial<PaymentMethod>>({
    type: 'visa',
    cardholderName: '',
    last4: '',
    expiryMonth: undefined,
    expiryYear: undefined,
    bankName: '',
  })
  const [showRemovePaymentMethodModal, setShowRemovePaymentMethodModal] = useState(false)
  const [paymentMethodToRemove, setPaymentMethodToRemove] = useState<string | null>(null)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showAddPasskeyModal, setShowAddPasskeyModal] = useState(false)
  const [showRemovePasskeyModal, setShowRemovePasskeyModal] = useState(false)
  const [passkeyToRemove, setPasskeyToRemove] = useState<string | null>(null)

  // Mock addresses data
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 'address-1',
      firstName: 'John',
      lastName: 'Doe',
      addressLine1: '415 Mission Street',
      addressLine2: '',
      city: 'San Francisco',
      state: 'California',
      zipCode: '94105',
      country: 'United States',
      isDefault: true,
      isSelected: true,
    },
    {
      id: 'address-2',
      firstName: 'Eva',
      lastName: 'Smith',
      addressLine1: '456 Broadwray',
      addressLine2: '',
      city: 'San Francisco',
      state: 'California',
      zipCode: '94105',
      country: 'United States',
      isDefault: false,
      isSelected: false,
    },
    {
      id: 'address-3',
      firstName: 'Mary',
      lastName: 'Doe',
      addressLine1: '987 Grand Avenue',
      addressLine2: '',
      city: 'Oakland',
      state: 'California',
      zipCode: '94607',
      country: 'United States',
      isDefault: false,
      isSelected: false,
    },
  ])

  const handleOpenAddAddress = () => {
    setAddressForm({
      firstName: '',
      lastName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    })
    setEditingAddressId(null)
    setShowAddressModal(true)
  }

  const handleOpenEditAddress = (addressId: string) => {
    const address = addresses.find(a => a.id === addressId)
    if (address) {
      setAddressForm(address)
      setEditingAddressId(addressId)
      setShowAddressModal(true)
    }
  }

  const handleSaveAddress = () => {
    if (editingAddressId) {
      // Update existing address
      setAddresses(prev => prev.map(addr => 
        addr.id === editingAddressId 
          ? { ...addressForm as Address, id: editingAddressId }
          : addr
      ))
    } else {
      // Add new address
      const newAddress: Address = {
        ...addressForm as Address,
        id: `address-${Date.now()}`,
        isDefault: false,
        isSelected: false,
      }
      setAddresses(prev => [...prev, newAddress])
    }
    setShowAddressModal(false)
    setEditingAddressId(null)
  }

  const handleSetDefaultAddress = (addressId: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId,
    })))
  }

  const handleSetDefaultPaymentMethod = (paymentMethodId: string) => {
    setPaymentMethods(prev => {
      const updated = prev.map(method => ({
        ...method,
        isDefault: method.id === paymentMethodId,
      }))
      // Sort so default is always first
      return updated.sort((a, b) => {
        if (a.isDefault) return -1
        if (b.isDefault) return 1
        return 0
      })
    })
    showToastMessage('Default payment method updated')
  }

  const handleRemoveAddress = (addressId: string) => {
    const removedAddress = addresses.find(addr => addr.id === addressId)
    const wasDefault = removedAddress?.isDefault
    
    setAddresses(prev => {
      const remaining = prev.filter(addr => addr.id !== addressId)
      // If removed address was default, set first remaining address as default
      if (wasDefault && remaining.length > 0) {
        return remaining.map((addr, index) => ({
          ...addr,
          isDefault: index === 0,
        }))
      }
      return remaining
    })
  }

  // Mock passkeys data
  const [passkeys, setPasskeys] = useState<Passkey[]>([
    {
      id: 'passkey-1',
      name: 'iPhone 14 Pro',
      createdAt: '2024-01-15',
      lastUsed: '2024-09-20',
      deviceType: 'device',
    },
    {
      id: 'passkey-2',
      name: 'MacBook Pro',
      createdAt: '2024-03-10',
      lastUsed: '2024-09-19',
      deviceType: 'platform',
    },
  ])

  // Wishlist handlers
  const handleRenameWishlist = (wishlistId: string) => {
    const wishlist = wishlists.find(w => w.id === wishlistId)
    if (wishlist) {
      setNewWishlistName(wishlist.name)
      setRenamingWishlistId(wishlistId)
      setShowRenameWishlistModal(true)
    }
  }

  const handleSaveRenameWishlist = () => {
    if (renamingWishlistId && newWishlistName.trim()) {
      setWishlists(prev => prev.map(w => 
        w.id === renamingWishlistId ? { ...w, name: newWishlistName.trim() } : w
      ))
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        const wishlistsToSave = wishlists.map(w => 
          w.id === renamingWishlistId ? { ...w, name: newWishlistName.trim() } : w
        ).filter(w => !w.isDefault)
        localStorage.setItem('marketstreet_wishlists', JSON.stringify(wishlistsToSave))
      }
      
      showToastMessage('Wishlist renamed successfully', 'success')
      setShowRenameWishlistModal(false)
      setRenamingWishlistId(null)
      setNewWishlistName('')
    }
  }

  const handleDeleteWishlist = (wishlistId: string) => {
    if (confirm('Are you sure you want to delete this wishlist? All items will be removed.')) {
      setWishlists(prev => prev.filter(w => w.id !== wishlistId))
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        const wishlistsToSave = wishlists.filter(w => w.id !== wishlistId && !w.isDefault)
        localStorage.setItem('marketstreet_wishlists', JSON.stringify(wishlistsToSave))
      }
      
      if (selectedWishlistId === wishlistId) {
        setSelectedWishlistId('my-favorites')
      }
      
      showToastMessage('Wishlist deleted successfully', 'success')
    }
  }

  const handleShareWishlist = (wishlistId: string) => {
    setSharingWishlistId(wishlistId)
    setShowShareWishlistModal(true)
  }

  const handleCreateWishlist = () => {
    if (newWishlistName.trim()) {
      const newWishlist: Wishlist = {
        id: `wishlist-${Date.now()}`,
        name: newWishlistName.trim(),
        isDefault: false,
        itemCount: 0,
        items: [],
      }
      
      setWishlists(prev => [...prev, newWishlist])
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        const wishlistsToSave = [...wishlists.filter(w => !w.isDefault), newWishlist]
        localStorage.setItem('marketstreet_wishlists', JSON.stringify(wishlistsToSave))
      }
      
      showToastMessage('Wishlist created successfully', 'success')
      setShowCreateWishlistModal(false)
      setNewWishlistName('')
      setSelectedWishlistId(newWishlist.id)
    }
  }

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId)
    showToastMessage('Item removed from wishlist', 'success')
  }

  const handleAddToCart = (product: Product, size?: string, color?: string) => {
    addToCart(product, 1, size, color)
    showToastMessage(`${product.name} added to cart`, 'success')
  }

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveAvatar = () => {
    if (avatarPreview) {
      setAvatarImage(avatarPreview)
      showToastMessage('Profile picture updated successfully')
    }
    setShowAvatarModal(false)
    setAvatarPreview(null)
  }

  const handleRemoveAvatar = () => {
    setAvatarImage(null)
    setAvatarPreview(null)
    showToastMessage('Profile picture removed')
    setShowAvatarModal(false)
  }

  const [curatedProducts, setCuratedProducts] = useState<Product[]>([])
  
  // Load curated products
  useEffect(() => {
    const loadCuratedProducts = async () => {
      const featured = await getFeaturedProducts()
      setCuratedProducts(featured.slice(0, 5))
    }
    loadCuratedProducts()
  }, [])

  // Helper function to check if product has variants
  const hasVariants = (product: Product): boolean => {
    if (product.size && product.size.length > 1) return true
    if (product.colors && product.colors.length > 1) return true
    if (product.variants && product.variants > 0) return true
    return false
  }

  // Unified handler for Quick View/Quick Add
  const handleCuratedUnifiedAction = (product: Product) => {
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
      showToastMessage(`${product.name} added to cart`, 'success')
    }
  }

  const handleNotifyMe = (email: string) => {
    console.log(`Notify ${email} when ${notifyMeProduct?.name} is available`)
    showToastMessage(`We'll notify you when ${notifyMeProduct?.name} is available`, 'success')
  }

  const handleCuratedAddToWishlist = (product: Product) => {
    console.log('Add to wishlist:', product.id)
    // Add to wishlist logic here
  }

  // Load wishlist products on mount and when wishlist section is active
  useEffect(() => {
    if (activeSection === 'wishlist') {
      const products = getWishlist()
      setWishlistProducts(products)
      
      // Initialize wishlists with default one containing wishlist products
      const defaultWishlist: Wishlist = {
        id: 'my-favorites',
        name: 'My Favorites',
        isDefault: true,
        itemCount: products.length,
        items: products.map(p => ({ ...p, selectedColor: p.color, selectedSize: p.size?.[0] })),
      }
      
      // Load additional wishlists from localStorage or use defaults
      const savedWishlists = typeof window !== 'undefined' ? localStorage.getItem('marketstreet_wishlists') : null
      const additionalWishlists: Wishlist[] = savedWishlists 
        ? JSON.parse(savedWishlists)
        : [
            { id: 'christmas-gifts', name: 'Christmas Gifts', isDefault: false, itemCount: 0, items: [] },
            { id: 'i-want', name: 'I want', isDefault: false, itemCount: 0, items: [] },
            { id: 'bedroom', name: 'Bedroom', isDefault: false, itemCount: 0, items: [] },
          ]
      
      setWishlists([defaultWishlist, ...additionalWishlists])
    }
  }, [activeSection])

  // Listen for wishlist updates
  useEffect(() => {
    const handleWishlistUpdate = () => {
      if (activeSection === 'wishlist') {
        const products = getWishlist()
        setWishlistProducts(products)
        setWishlists(prev => {
          const defaultWishlist = prev.find(w => w.id === 'my-favorites')
          if (defaultWishlist) {
            defaultWishlist.items = products.map(p => ({ ...p, selectedColor: p.color, selectedSize: p.size?.[0] }))
            defaultWishlist.itemCount = products.length
            return prev.map(w => w.id === 'my-favorites' ? defaultWishlist : w)
          }
          return prev
        })
      }
    }
    
    // Guard for SSR - window not available during server-side rendering
    if (typeof window !== 'undefined') {
    window.addEventListener('wishlistUpdated', handleWishlistUpdate as EventListener)
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate as EventListener)
    }
  }, [activeSection])

  // Compute addresses count from addresses array
  const addressesCount = addresses.length

  const accountMenuItems = [
    { id: 'overview', label: 'Overview', icon: 'overview', href: '/account/overview' },
    { id: 'account-details', label: 'Account Details', icon: 'account', href: '/account/account-details' },
    { id: 'order-history', label: 'Order History', icon: 'orders', href: '/account/order-history' },
    { id: 'wishlist', label: 'Wishlist', count: wishlistCount, icon: 'wishlist', href: '/account/wishlist' },
    { id: 'loyalty', label: 'Loyalty Rewards', icon: 'loyalty', href: '/account/loyalty' },
    { id: 'addresses', label: 'Addresses', count: addressesCount, icon: 'addresses', href: '/account/addresses' },
    { id: 'store-preferences', label: 'Store Preferences', icon: 'store', href: '/account/store-preferences' },
    { id: 'payment', label: 'Payment Methods', count: paymentMethods.length, icon: 'payment', href: '/account/payment' },
    { id: 'logout', label: 'Log Out', icon: 'logout', href: '#' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Sidebar - Account Navigation */}
          <aside className={`transition-all duration-300 ease-in-out flex-shrink-0 w-full lg:w-auto ${
            isSidebarCollapsed 
              ? 'lg:w-12' 
              : 'lg:w-64'
          }`}>
            <div className="sticky top-4">
              {/* Header with Toggle */}
              <div className="flex items-center justify-between mb-4 lg:mb-6 overflow-hidden">
                <h2 className={`text-lg font-semibold text-brand-black whitespace-nowrap truncate transition-all duration-300 ${
                  isSidebarCollapsed ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100'
                }`}>My Account</h2>
                {/* Mobile toggle */}
                <button
                  onClick={() => setIsMobileMenuCollapsed(!isMobileMenuCollapsed)}
                  className="lg:hidden p-2 rounded-lg hover:bg-brand-gray-100 transition-colors"
                  aria-label={isMobileMenuCollapsed ? 'Expand menu' : 'Collapse menu'}
                  aria-expanded={!isMobileMenuCollapsed}
                >
                  <svg 
                    className={`w-5 h-5 text-brand-gray-600 transition-transform ${!isMobileMenuCollapsed ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {/* Desktop sidebar toggle */}
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="hidden lg:flex items-center justify-center p-2 rounded-lg hover:bg-brand-gray-100 transition-colors"
                  aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  <svg 
                    className={`w-5 h-5 text-brand-gray-600 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              
              {/* Navigation Menu */}
              <div className={`lg:block overflow-hidden lg:overflow-visible transition-all duration-300 ease-in-out ${
                isMobileMenuCollapsed 
                  ? 'max-h-0 lg:max-h-none' 
                  : 'max-h-[600px]'
              }`}>
                <nav className={`space-y-1 transition-opacity duration-200 ${
                  isMobileMenuCollapsed 
                    ? 'opacity-0 lg:opacity-100' 
                    : 'opacity-100'
                }`}>
                {accountMenuItems.map((item) => {
                  // Check if this item should be active (for order-detail, highlight order-history)
                  const isActive = activeSection === item.id || 
                    (activeSection === 'order-detail' && item.id === 'order-history')
                  
                  if (item.id === 'logout') {
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          // Handle logout
                          console.log('Logout clicked')
                        }}
                        className={`w-full grid items-center py-3 rounded-lg text-left transition-all duration-300 text-brand-black hover:bg-brand-gray-50 overflow-hidden px-4 ${
                          isSidebarCollapsed 
                            ? 'lg:grid-cols-[20px_0_0]' 
                            : 'grid-cols-[20px_1fr_auto]'
                        }`}
                        title={isSidebarCollapsed ? item.label : undefined}
                      >
                        {/* Icon - always left-aligned, fixed 20x20 size */}
                        <span className="inline-flex items-center justify-center w-5 h-5 shrink-0 text-brand-gray-600 transition-colors">
                          {renderIcon(item.icon)}
                        </span>
                        {/* Label - collapses to 0 width when collapsed */}
                        <span className={`text-sm font-medium whitespace-nowrap px-3 transition-all duration-300 ${
                          isSidebarCollapsed 
                            ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden lg:px-0' 
                            : ''
                        }`}>
                          {item.label}
                        </span>
                        {/* Chevron - collapses to 0 width when collapsed */}
                        <svg className={`w-4 h-4 flex-shrink-0 px-4 transition-all duration-300 ${
                          isSidebarCollapsed 
                            ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden lg:px-0' 
                            : ''
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )
                  }
                  
                  return (
                    <div
                      key={item.id}
                      className={`group w-full grid items-center py-3 rounded-lg text-left transition-all duration-300 relative overflow-hidden ${
                        isSidebarCollapsed 
                          ? 'lg:grid-cols-[20px_0_0] lg:px-3 lg:justify-items-start' 
                          : 'grid-cols-[20px_1fr_auto]'
                      } px-4 ${
                        isActive
                          ? 'bg-brand-blue-50 text-brand-blue-600 hover:bg-brand-blue-100'
                          : 'text-brand-black hover:bg-brand-gray-50'
                      }`}
                    >
                      <Link
                        href={item.href || '#'}
                        onClick={() => {
                          // Close mobile menu when item is clicked (on mobile only)
                          if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                            setIsMobileMenuCollapsed(true)
                          }
                          // Keep sidebar state unchanged - only order detail pages should collapse it
                        }}
                        className="absolute inset-0 z-10"
                        title={isSidebarCollapsed ? item.label : undefined}
                        aria-label={item.label}
                      />
                      {/* Icon - always left-aligned, fixed 20x20 size */}
                      <span className="inline-flex items-center justify-center w-5 h-5 shrink-0 transition-colors">
                        {renderIcon(item.icon)}
                      </span>
                      {/* Label - collapses to 0 width when collapsed */}
                      <span className={`text-sm font-medium whitespace-nowrap px-3 transition-all duration-300 ${
                        isSidebarCollapsed 
                          ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden lg:px-0' 
                          : ''
                      }`}>
                        {item.label}
                      </span>
                      {/* Count - collapses to 0 width when collapsed */}
                      {item.count !== undefined && (
                        <span className={`text-xs flex-shrink-0 px-4 transition-all duration-300 ${
                          isActive ? 'text-brand-blue-500' : 'text-brand-gray-500'
                        } ${
                          isSidebarCollapsed 
                            ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden lg:px-0' 
                            : ''
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </div>
                  )
                })}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Order Detail Section - Inline view with breadcrumb */}
            {activeSection === 'order-detail' && (
              <div className="space-y-6">
                {/* Breadcrumb Navigation */}
                <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
                  <Link 
                    href="/account/overview" 
                    className="text-brand-gray-500 hover:text-brand-gray-700 transition-colors"
                  >
                    My Account
                  </Link>
                  <svg className="w-4 h-4 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <Link 
                    href="/account/order-history" 
                    className="text-brand-gray-500 hover:text-brand-gray-700 transition-colors"
                  >
                    Order History
                  </Link>
                  <svg className="w-4 h-4 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-brand-black font-medium">
                    Order #{getOrderNumberFromPath()}
                  </span>
                </nav>
                
                {/* Back Button */}
                <button 
                  onClick={() => router.push('/account/order-history')}
                  className="inline-flex items-center gap-2 text-sm text-brand-gray-600 hover:text-brand-black transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Order History
                </button>
                
                {/* Order Detail Content - Will be rendered by OrderDetailContent component */}
                <OrderDetailContent orderNumber={getOrderNumberFromPath()} showToastMessage={showToastMessage} />
              </div>
            )}
            
            {activeSection === 'overview' && (
              <div className="space-y-8">
                {/* Profile Header */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                    {/* Avatar */}
                    <button
                      onClick={() => setShowAvatarModal(true)}
                      className="relative w-16 h-16 sm:w-20 sm:h-20 bg-brand-blue-500 rounded-full flex items-center justify-center flex-shrink-0 group cursor-pointer transition-all hover:ring-2 hover:ring-brand-blue-300 hover:ring-offset-2"
                    >
                      {avatarImage ? (
                        <img 
                          src={avatarImage} 
                          alt={`${userName} ${userLastName}`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-semibold text-white">{getUserInitials()}</span>
                      )}
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </button>
                    
                    {/* Profile Info */}
                    <div className="flex-1 text-center sm:text-left w-full">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 mb-2">
                        <h1 className="text-xl sm:text-2xl font-semibold text-brand-black">
                          {userName} {userLastName}
                        </h1>
                        {loyaltyStatus && (
                          <span className={`px-3 py-1 text-sm font-semibold rounded ${getLoyaltyStatusColor(loyaltyStatus)}`}>
                            {loyaltyStatus} Member
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-brand-gray-600 mb-4">{userEmail}</p>
                      
                      {/* Profile Completion Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-brand-black">Profile Complete</span>
                          <span className="text-sm text-brand-gray-600">{Math.round(profileCompletionPercentage)}%</span>
                        </div>
                        <div className="w-full bg-brand-gray-200 rounded-full h-2">
                          <div 
                            className="bg-brand-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${profileCompletionPercentage}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Next Steps Helper */}
                      {nextSteps.length > 0 && (
                        <div className="bg-brand-blue-50 border border-brand-blue-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-brand-blue-800 mb-2">Complete your profile</p>
                          <div className="space-y-2">
                            {nextSteps.map((step, idx) => (
                              <Link
                                key={idx}
                                href={step.link}
                                className="flex items-center gap-2 text-sm text-brand-blue-600 hover:text-brand-blue-700 hover:underline"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                {step.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Balance Snapshots */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-medium text-brand-black mb-4">Account Balance</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Gift Cards */}
                    <Link href="/account/payment#gift-cards" className="border border-brand-gray-200 rounded-lg p-4 hover:border-brand-blue-500 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-brand-black">Gift Cards</span>
                        <svg className="w-5 h-5 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <p className="text-2xl font-semibold text-brand-black">$125.00</p>
                      <p className="text-xs text-brand-gray-500 mt-1">2 active cards</p>
                      <p className="text-xs text-brand-blue-500 mt-2 hover:underline">Manage gift cards →</p>
                    </Link>
                    
                    {/* Store Credit */}
                    <Link href="/account/payment#store-credit" className="border border-brand-gray-200 rounded-lg p-4 hover:border-brand-blue-500 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-brand-black">Store Credit</span>
                        <svg className="w-5 h-5 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-2xl font-semibold text-brand-black">$50.00</p>
                      <p className="text-xs text-brand-gray-500 mt-1">Available credit</p>
                      <p className="text-xs text-brand-blue-500 mt-2 hover:underline">View details →</p>
                    </Link>
                    
                    {/* Reward Points */}
                    <Link href="/account/loyalty" className="border border-brand-gray-200 rounded-lg p-4 hover:border-brand-blue-500 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-brand-black">Reward Points</span>
                        <svg className="w-5 h-5 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <p className="text-2xl font-semibold text-brand-black">{loyaltyPoints.toLocaleString()}</p>
                      <p className="text-xs text-brand-gray-500 mt-1">Points available</p>
                      <p className="text-xs text-brand-blue-500 mt-2 hover:underline">View details →</p>
                    </Link>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm">
                  <div className="px-6 pt-6 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-medium text-brand-black">Recent Orders</h2>
                        <p className="text-sm text-brand-gray-600 mt-1">These are your last 5 orders</p>
                      </div>
                      <Link 
                        href="/account/order-history"
                        className="text-sm text-brand-blue-500 hover:text-brand-blue-600 font-medium"
                      >
                        View All
                      </Link>
                    </div>
                  </div>
                  <div className="divide-y divide-brand-gray-200">
                    {recentOrders.slice(0, 5).map((order, idx) => (
                      <OrderSummaryCard key={idx} order={order} variant="compact" />
                    ))}
                  </div>
                </div>

                {/* Rate and Review Prompts */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-medium text-brand-black">Rate Your Recent Purchases</h2>
                      <p className="text-sm text-brand-gray-600 mt-1">Share your experience and help others discover great products</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {recentOrders
                      .filter(order => order.status === 'Delivered' && order.items && order.items.length > 0)
                      .slice(0, 3)
                      .map((order, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 border border-brand-gray-200 rounded-lg hover:bg-brand-gray-50 transition-colors">
                          <div className="flex gap-2">
                            {order.items?.slice(0, 2).map((item, itemIdx) => (
                              <div key={itemIdx} className="w-16 h-16 rounded-lg overflow-hidden relative bg-brand-gray-100">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-brand-black">
                              {order.items?.map(item => item.name).join(', ')}
                            </p>
                            <p className="text-xs text-brand-gray-500">Order {order.orderNumber} • Delivered</p>
                          </div>
                          <Link
                            href={`/product/${order.items?.[0]?.id || ''}?review=true`}
                            className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors whitespace-nowrap shadow-sm"
                          >
                            Rate & review
                          </Link>
                        </div>
                      ))}
                    {recentOrders.filter(order => order.status === 'Delivered').length === 0 && (
                      <p className="text-sm text-brand-gray-500 text-center py-4">No recent deliveries to review yet</p>
                    )}
                  </div>
                </div>

                {/* Curated for You */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-medium text-brand-black">Curated for You</h2>
                      <p className="text-sm text-brand-gray-600 mt-1">Description</p>
                    </div>
                    <button className="text-sm text-brand-blue-500 hover:text-brand-blue-600 font-medium">
                      View More
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {curatedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onUnifiedAction={handleCuratedUnifiedAction}
                        onAddToWishlist={handleCuratedAddToWishlist}
                      />
                    ))}
                  </div>
                </div>

                {/* Need Help? */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-medium text-brand-black mb-2">Need Help?</h2>
                  <p className="text-sm text-brand-gray-600 mb-4">
                    We&apos;re here to assist you with any questions or concerns
                  </p>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <button className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm">
                      Start a Chat
                    </button>
                    <button className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm">
                      Contact info
                    </button>
                    <button className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm">
                      Browse FAQ
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Type your question here..."
                    className="w-full px-4 py-3 border border-brand-gray-300 rounded-lg text-brand-black placeholder-brand-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Download Apps */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-medium text-brand-black mb-2">Download Our App</h2>
                      <p className="text-sm text-brand-gray-600 mb-4">
                        Get the best shopping experience on the go. Access exclusive deals, track orders, and shop faster.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <a
                          href="#"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue-500 text-white rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.33-1.09-.58-2.09-.87-3.24-.87-1.15 0-2.19.29-3.24.87-1.03.55-2.1.62-3.08.33-1.71-1.03-2.48-3.5-1.75-6.32 1.11-4.25 4.87-7.11 8.07-7.11s6.96 2.86 8.07 7.11c.73 2.82-.04 5.29-1.75 6.32z"/>
                          </svg>
                          <span className="text-sm font-medium">App Store</span>
                        </a>
                        <a
                          href="#"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue-500 text-white rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm2.27-2.27L6.05 2.66l10.76 6.22-2.27 2.27zM6.05 2.66l10.76 6.22-2.27 2.27L6.05 2.66z"/>
                          </svg>
                          <span className="text-sm font-medium">Google Play</span>
                        </a>
                      </div>
                    </div>
                    <div className="ml-6 flex-shrink-0">
                      <div className="w-32 h-32 bg-brand-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-brand-gray-300">
                        <svg className="w-16 h-16 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      </div>
                      <p className="text-xs text-brand-gray-500 text-center mt-2">QR Code</p>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div>
                  <h2 className="text-xl font-medium text-brand-black mb-4">Quick Links</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link
                      href="/account/account-details"
                      className="flex flex-col items-center gap-2 p-4 border border-brand-gray-200 rounded-lg hover:bg-brand-gray-50 transition-colors"
                    >
                      <svg className="w-6 h-6 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm font-medium text-brand-black">Update Profile</span>
                    </Link>
                    <Link
                      href="/account/addresses"
                      className="flex flex-col items-center gap-2 p-4 border border-brand-gray-200 rounded-lg hover:bg-brand-gray-50 transition-colors"
                    >
                      <svg className="w-6 h-6 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium text-brand-black">Manage Addresses</span>
                    </Link>
                    <Link
                      href="/account/payment"
                      className="flex flex-col items-center gap-2 p-4 border border-brand-gray-200 rounded-lg hover:bg-brand-gray-50 transition-colors"
                    >
                      <svg className="w-6 h-6 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="text-sm font-medium text-brand-black">Payment Methods</span>
                    </Link>
                    <Link
                      href="/account/security"
                      className="flex flex-col items-center gap-2 p-4 border border-brand-gray-200 rounded-lg hover:bg-brand-gray-50 transition-colors"
                    >
                      <svg className="w-6 h-6 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-sm font-medium text-brand-black">Security</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Account Details Section */}
            {activeSection === 'account-details' && (
              <div className="space-y-5">
                {/* Account Details Header Card */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-brand-black mb-1.5">Account Details</h2>
                      <p className="text-sm text-brand-gray-600">Manage your personal information</p>
                    </div>
                  </div>
                </div>

                {/* Personal Information Card */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between p-6 border-b border-brand-gray-200">
                    <div>
                      <h3 className="text-base font-semibold text-brand-black mb-1.5">Personal Information</h3>
                      <p className="text-sm text-brand-gray-600">Manage your personal information</p>
                    </div>
                    {!isEditingPersonalInfo ? (
                      <button 
                        onClick={() => setIsEditingPersonalInfo(true)}
                        className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setIsEditingPersonalInfo(false)
                            showToastMessage('Personal information saved successfully')
                          }}
                          className="px-4 py-2 text-sm font-medium bg-brand-blue-500 text-white hover:bg-brand-blue-600 rounded-lg transition-colors shadow-sm"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => {
                            setIsEditingPersonalInfo(false)
                            setPersonalInfoForm({
                              firstName: userName,
                              lastName: userLastName,
                              email: userEmail,
                              phone: userPhone,
                              dateOfBirth: '15/05/1990',
                              gender: 'Prefer not to say',
                              anniversary: '',
                              weddingDay: '',
                            })
                          }}
                          className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black hover:bg-brand-gray-50 rounded-lg transition-colors shadow-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-4">
                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-brand-black mb-2">First Name</label>
                        {isEditingPersonalInfo ? (
                          <input
                            type="text"
                            value={personalInfoForm.firstName}
                            onChange={(e) => setPersonalInfoForm({ ...personalInfoForm, firstName: e.target.value })}
                            className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="px-0 py-2 text-sm text-brand-black">{personalInfoForm.firstName}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-black mb-2">Last Name</label>
                        {isEditingPersonalInfo ? (
                          <input
                            type="text"
                            value={personalInfoForm.lastName}
                            onChange={(e) => setPersonalInfoForm({ ...personalInfoForm, lastName: e.target.value })}
                            className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="px-0 py-2 text-sm text-brand-black">{personalInfoForm.lastName}</div>
                        )}
                      </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div id="email">
                        <label className="block text-sm font-medium text-brand-black mb-2">Email Address</label>
                        <div className="flex items-center gap-3">
                          {isEditingPersonalInfo ? (
                            <input
                              type="email"
                              value={personalInfoForm.email}
                              onChange={(e) => setPersonalInfoForm({ ...personalInfoForm, email: e.target.value })}
                              className="flex-1 px-3 py-2 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <div className="px-0 py-2 text-sm text-brand-black flex-1">{personalInfoForm.email}</div>
                          )}
                          {!isEditingPersonalInfo && (
                            (user?.emailVerified || profileCompletion.emailVerified) ? (
                              <div className="flex items-center gap-1.5 text-green-600 flex-shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs font-medium">Verified</span>
                              </div>
                            ) : (
                              <Link
                                href="/account/account-details#email"
                                className="text-xs text-brand-blue-500 hover:text-brand-blue-600 hover:underline font-medium flex-shrink-0 whitespace-nowrap"
                              >
                                Verify Email
                              </Link>
                            )
                          )}
                        </div>
                      </div>
                      <div id="phone">
                        <label className="block text-sm font-medium text-brand-black mb-2">Phone Number</label>
                        <div className="flex items-center gap-3">
                          {isEditingPersonalInfo ? (
                            <div className="flex gap-2 flex-1">
                              <div className="flex items-center gap-2 px-3 py-2 border border-brand-gray-300 rounded-lg w-[62px]">
                                <span className="text-sm text-brand-black">+1</span>
                              </div>
                              <input
                                type="tel"
                                value={personalInfoForm.phone}
                                onChange={(e) => setPersonalInfoForm({ ...personalInfoForm, phone: e.target.value })}
                                className="flex-1 px-3 py-2 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                              />
                            </div>
                          ) : (
                            <div className="flex gap-2 flex-1">
                              <div className="flex items-center gap-2 px-0 py-2 w-[62px]">
                                <svg className="w-4 h-4 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                <span className="text-sm text-brand-black">+1</span>
                              </div>
                              <div className="flex-1 px-0 py-2 text-sm text-brand-black">{personalInfoForm.phone}</div>
                            </div>
                          )}
                          {!isEditingPersonalInfo && (
                            (user?.phoneVerified || profileCompletion.phoneVerified) ? (
                              <div className="flex items-center gap-1.5 text-green-600 flex-shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs font-medium">Verified</span>
                              </div>
                            ) : (
                              <Link
                                href="/account/account-details#phone"
                                className="text-xs text-brand-blue-500 hover:text-brand-blue-600 hover:underline font-medium flex-shrink-0 whitespace-nowrap"
                              >
                                Verify Phone
                              </Link>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-medium text-brand-black mb-2">Date of Birth</label>
                      {isEditingPersonalInfo ? (
                        <input
                          type="text"
                          value={personalInfoForm.dateOfBirth}
                          onChange={(e) => setPersonalInfoForm({ ...personalInfoForm, dateOfBirth: e.target.value })}
                          placeholder="DD/MM/YYYY"
                          className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center gap-2 px-0 py-2">
                          <svg className="w-4 h-4 text-brand-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-brand-black">{personalInfoForm.dateOfBirth}</span>
                        </div>
                      )}
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-brand-black mb-2">Gender</label>
                      {isEditingPersonalInfo ? (
                        <div className="relative">
                          <select
                            value={personalInfoForm.gender}
                            onChange={(e) => setPersonalInfoForm({ ...personalInfoForm, gender: e.target.value })}
                            className="w-full px-3 py-2 pr-10 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent appearance-none bg-white"
                          >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Non-binary</option>
                            <option>Prefer not to say</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-4 h-4 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div className="px-0 py-2 text-sm text-brand-black">{personalInfoForm.gender}</div>
                      )}
                    </div>

                    {/* Anniversary */}
                    <div>
                      <label className="block text-sm font-medium text-brand-black mb-2">Anniversary</label>
                      {isEditingPersonalInfo ? (
                        <input
                          type="text"
                          value={personalInfoForm.anniversary}
                          onChange={(e) => setPersonalInfoForm({ ...personalInfoForm, anniversary: e.target.value })}
                          placeholder="DD/MM/YYYY"
                          className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="px-0 py-2 text-sm text-brand-gray-500">{personalInfoForm.anniversary || 'Not set'}</div>
                      )}
                    </div>

                    {/* Wedding Day */}
                    <div>
                      <label className="block text-sm font-medium text-brand-black mb-2">Wedding Day</label>
                      {isEditingPersonalInfo ? (
                        <input
                          type="text"
                          value={personalInfoForm.weddingDay}
                          onChange={(e) => setPersonalInfoForm({ ...personalInfoForm, weddingDay: e.target.value })}
                          placeholder="DD/MM/YYYY"
                          className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="px-0 py-2 text-sm text-brand-gray-500">{personalInfoForm.weddingDay || 'Not set'}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interests & Preferences Card */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between p-6 border-b border-brand-gray-200">
                    <div>
                      <h3 className="text-base font-semibold text-brand-black mb-1.5">Interests & Preferences</h3>
                      <p className="text-sm text-brand-gray-600">Add your design interests and manage your shopping preferences</p>
                    </div>
                    {!isEditingInterestsAndPreferences ? (
                      <button 
                        onClick={() => setIsEditingInterestsAndPreferences(true)}
                        className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setIsEditingInterestsAndPreferences(false)
                            showToastMessage('Interests & preferences saved successfully')
                          }}
                          className="px-4 py-2 text-sm font-medium bg-brand-blue-500 text-white hover:bg-brand-blue-600 rounded-lg transition-colors shadow-sm"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => {
                            setIsEditingInterestsAndPreferences(false)
                            setInterestsForm({
                              designStyles: ['Minimalist', 'Geometric'],
                              roomTypes: ['Living Room', 'Office'],
                              materials: ['Ceramic'],
                              aesthetics: ['Modern'],
                            })
                            setPreferencesForm({
                              productCategories: ['Geometric', 'Sets'],
                              shoppingPreferences: 'unisex',
                            })
                            setMeasuresForm({
                              roomWidth: '',
                              roomLength: '',
                              ceilingHeight: '',
                              preferredProductSize: '',
                            })
                          }}
                          className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black hover:bg-brand-gray-50 rounded-lg transition-colors shadow-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Interests */}
                    <div>
                      <label className="block text-sm font-semibold text-brand-black mb-3 uppercase tracking-wider">Your Interests</label>
                      {!isEditingInterestsAndPreferences ? (
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            const allInterests = [
                              ...interestsForm.designStyles,
                              ...interestsForm.roomTypes,
                              ...interestsForm.materials,
                              ...interestsForm.aesthetics,
                            ]
                            return allInterests.length > 0 ? (
                              allInterests.map((interest) => (
                                <span key={interest} className="px-3 py-1.5 bg-brand-blue-50 text-brand-blue-700 text-sm font-medium rounded-lg">
                                  {interest}
                              </span>
                            ))
                          ) : (
                              <span className="text-sm text-brand-gray-500">No interests selected</span>
                            )
                          })()}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {interestsForm.designStyles.map((style) => (
                              <span key={`design-${style}`} className="px-3 py-1.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-2">
                                {style}
                                <button
                                  onClick={() => {
                                    setInterestsForm({
                                      ...interestsForm,
                                      designStyles: interestsForm.designStyles.filter(s => s !== style)
                                    })
                                  }}
                                  className="hover:bg-brand-blue-600 rounded-full p-0.5 transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </span>
                            ))}
                            {interestsForm.roomTypes.map((room) => (
                              <span key={`room-${room}`} className="px-3 py-1.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-2">
                                {room}
                                <button
                                  onClick={() => {
                                    setInterestsForm({
                                      ...interestsForm,
                                      roomTypes: interestsForm.roomTypes.filter(r => r !== room)
                                    })
                                  }}
                                  className="hover:bg-brand-blue-600 rounded-full p-0.5 transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </span>
                            ))}
                            {interestsForm.materials.map((material) => (
                              <span key={`material-${material}`} className="px-3 py-1.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-2">
                                {material}
                                <button
                                  onClick={() => {
                                    setInterestsForm({
                                      ...interestsForm,
                                      materials: interestsForm.materials.filter(m => m !== material)
                                    })
                                  }}
                                  className="hover:bg-brand-blue-600 rounded-full p-0.5 transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </span>
                            ))}
                            {interestsForm.aesthetics.map((aesthetic) => (
                              <span key={`aesthetic-${aesthetic}`} className="px-3 py-1.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-2">
                                {aesthetic}
                                <button
                                  onClick={() => {
                                    setInterestsForm({
                                      ...interestsForm,
                                      aesthetics: interestsForm.aesthetics.filter(a => a !== aesthetic)
                                    })
                                  }}
                                  className="hover:bg-brand-blue-600 rounded-full p-0.5 transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={() => {
                              setInterestsModalCategory('designStyles')
                              setShowInterestsModal(true)
                            }}
                            className="text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline font-medium"
                          >
                            + Add more
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Product Categories */}
                    <div>
                      <label className="block text-sm font-semibold text-brand-black mb-3 uppercase tracking-wider">Product Categories</label>
                      {!isEditingInterestsAndPreferences ? (
                        <div className="flex flex-wrap gap-2">
                          {preferencesForm.productCategories.length > 0 ? (
                            preferencesForm.productCategories.map((category) => (
                              <span key={category} className="px-3 py-1.5 bg-brand-blue-50 text-brand-blue-700 text-sm font-medium rounded-lg">
                                {category}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-brand-gray-500">No categories selected</span>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {preferencesForm.productCategories.map((category) => (
                              <span key={category} className="px-3 py-1.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-2">
                                {category}
                                <button
                                  onClick={() => {
                                    setPreferencesForm({
                                      ...preferencesForm,
                                      productCategories: preferencesForm.productCategories.filter(c => c !== category)
                                    })
                                  }}
                                  className="hover:bg-brand-blue-600 rounded-full p-0.5 transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={() => {
                              setPreferencesModalCategory('productCategories')
                              setShowPreferencesModal(true)
                            }}
                            className="text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline font-medium"
                          >
                            + Add more
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Shopping Preferences */}
                    <div>
                      <label className="block text-sm font-semibold text-brand-black mb-3 uppercase tracking-wider">Shopping Preferences</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { value: 'womens', label: "Women's" },
                          { value: 'mens', label: "Men's" },
                          { value: 'unisex', label: 'Unisex' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              if (!isEditingInterestsAndPreferences) return
                              setPreferencesForm({ ...preferencesForm, shoppingPreferences: option.value as any })
                            }}
                            disabled={!isEditingInterestsAndPreferences}
                            className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all shadow-sm ${
                              preferencesForm.shoppingPreferences === option.value
                                ? 'bg-brand-blue-500 text-white border-brand-blue-500'
                                : 'bg-white text-brand-black border-brand-gray-200 hover:border-brand-gray-300'
                            } ${!isEditingInterestsAndPreferences ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Measures */}
                    <div>
                      <label className="block text-sm font-semibold text-brand-black mb-3 uppercase tracking-wider">Measures</label>
                      {!isEditingInterestsAndPreferences ? (
                        <div className="space-y-2">
                          {measuresForm.roomWidth || measuresForm.roomLength ? (
                            <div className="text-sm text-brand-gray-700">
                              <span className="font-medium">Room dimensions: </span>
                              {measuresForm.roomWidth && measuresForm.roomLength 
                                ? `${measuresForm.roomWidth}" × ${measuresForm.roomLength}"`
                                : measuresForm.roomWidth || measuresForm.roomLength}
                          </div>
                          ) : null}
                          {measuresForm.ceilingHeight && (
                            <div className="text-sm text-brand-gray-700">
                              <span className="font-medium">Ceiling height: </span>
                              {measuresForm.ceilingHeight}&quot;
                        </div>
                          )}
                          {measuresForm.preferredProductSize && (
                            <div className="text-sm text-brand-gray-700">
                              <span className="font-medium">Preferred product size: </span>
                              {measuresForm.preferredProductSize}
                        </div>
                      )}
                          {!measuresForm.roomWidth && !measuresForm.roomLength && !measuresForm.ceilingHeight && !measuresForm.preferredProductSize && (
                            <span className="text-sm text-brand-gray-500">No measures provided</span>
                          )}
                    </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                    <div>
                              <label className="block text-sm font-medium text-brand-black mb-2">Room Width (inches)</label>
                              <input
                                type="text"
                                value={measuresForm.roomWidth}
                                onChange={(e) => setMeasuresForm({ ...measuresForm, roomWidth: e.target.value })}
                                placeholder="e.g., 120"
                                className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-brand-black mb-2">Room Length (inches)</label>
                              <input
                                type="text"
                                value={measuresForm.roomLength}
                                onChange={(e) => setMeasuresForm({ ...measuresForm, roomLength: e.target.value })}
                                placeholder="e.g., 180"
                                className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-brand-black mb-2">Ceiling Height (inches)</label>
                            <input
                              type="text"
                              value={measuresForm.ceilingHeight}
                              onChange={(e) => setMeasuresForm({ ...measuresForm, ceilingHeight: e.target.value })}
                              placeholder="e.g., 96"
                              className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-brand-black mb-2">Preferred Product Size</label>
                        <div className="relative">
                          <select
                                value={measuresForm.preferredProductSize}
                                onChange={(e) => setMeasuresForm({ ...measuresForm, preferredProductSize: e.target.value })}
                            className="w-full px-3 py-2 pr-10 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent appearance-none bg-white"
                          >
                                <option value="">No preference</option>
                                <option value="Small">Small</option>
                                <option value="Medium">Medium</option>
                                <option value="Large">Large</option>
                                <option value="Extra Large">Extra Large</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-4 h-4 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                            <p className="text-xs text-brand-gray-500 mt-1">Help us recommend products that fit your space</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Visibility Card - Hidden but can be enabled by setting showProfileVisibility to true */}
                {showProfileVisibility && (
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between p-6 border-b border-brand-gray-200">
                    <div>
                      <h3 className="text-base font-semibold text-brand-black mb-1.5">Profile Visibility</h3>
                      <p className="text-sm text-brand-gray-600">Control how your profile appears in community features</p>
                    </div>
                    {!isEditingProfileVisibility ? (
                      <button 
                        onClick={() => setIsEditingProfileVisibility(true)}
                        className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setIsEditingProfileVisibility(false)
                            showToastMessage('Profile visibility settings saved successfully')
                          }}
                          className="px-4 py-2 text-sm font-medium bg-brand-blue-500 text-white hover:bg-brand-blue-600 rounded-lg transition-colors shadow-sm"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => {
                            setIsEditingProfileVisibility(false)
                            setProfileVisibilityForm({
                              displayName: 'Full Name',
                              locationDisplay: false,
                            })
                          }}
                          className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black hover:bg-brand-gray-50 rounded-lg transition-colors shadow-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-4">
                    {/* Name Display */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="mb-1">
                          <p className="text-sm font-medium text-brand-black">Display Name</p>
                        </div>
                        <p className="text-sm text-brand-gray-600">Choose how your name appears in reviews and community features</p>
                      </div>
                      {isEditingProfileVisibility ? (
                        <div className="relative">
                          <select
                            value={profileVisibilityForm.displayName}
                            onChange={(e) => setProfileVisibilityForm({ ...profileVisibilityForm, displayName: e.target.value })}
                            className="px-3 py-2 pr-10 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 appearance-none bg-white"
                          >
                            <option>Full Name</option>
                            <option>First Name Only</option>
                            <option>Nickname</option>
                            <option>Anonymous</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-4 h-4 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div className="px-3 py-2 text-sm text-brand-black">{profileVisibilityForm.displayName}</div>
                      )}
                    </div>

                    {/* Location Display */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="mb-1">
                          <p className="text-sm font-medium text-brand-black">Location Display</p>
                        </div>
                        <p className="text-sm text-brand-gray-600">Show your location in reviews and community features</p>
                      </div>
                      {isEditingProfileVisibility ? (
                        <button
                          onClick={() => setProfileVisibilityForm({ ...profileVisibilityForm, locationDisplay: !profileVisibilityForm.locationDisplay })}
                          className={`relative w-9 h-5 rounded-full p-0.5 flex items-center shadow-sm transition-colors cursor-pointer ${
                            profileVisibilityForm.locationDisplay ? 'bg-brand-blue-500 justify-end' : 'bg-brand-gray-200'
                          }`}
                        >
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </button>
                      ) : (
                        <div className="relative">
                          <button
                            onClick={() => handleDisabledToggleClick('profile-visibility')}
                            className={`relative w-9 h-5 rounded-full p-0.5 flex items-center shadow-sm opacity-50 cursor-not-allowed transition-all ${
                              profileVisibilityForm.locationDisplay ? 'bg-brand-blue-300 justify-end' : 'bg-brand-gray-200'
                            }`}
                            title="Click Edit to make changes"
                          >
                            <div className="w-4 h-4 bg-white rounded-full"></div>
                          </button>
                          {showEditHint === 'profile-visibility' && (
                            <div className="absolute right-0 top-full mt-2 z-10 animate-fade-in">
                              <div className="bg-brand-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                                Click &quot;Edit&quot; to make changes
                                <div className="absolute -top-1 right-4 w-2 h-2 bg-brand-gray-900 transform rotate-45"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                )}

                {/* Marketing and Communication Preferences Card */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between p-6 border-b border-brand-gray-200">
                    <div>
                      <h3 className="text-base font-semibold text-brand-black">Marketing & Communication Preferences</h3>
                    </div>
                    {!isEditingMarketing ? (
                      <button 
                        onClick={() => setIsEditingMarketing(true)}
                        className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setIsEditingMarketing(false)
                            showToastMessage('Marketing preferences saved successfully')
                          }}
                          className="px-4 py-2 text-sm font-medium bg-brand-blue-500 text-white hover:bg-brand-blue-600 rounded-lg transition-colors shadow-sm"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => {
                            setIsEditingMarketing(false)
                            setMarketingForm({
                              emailOrderUpdates: true,
                              emailPromotions: false,
                              emailNewsletter: false,
                              smsOrderUpdates: true,
                              smsPromotions: false,
                            })
                          }}
                          className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black hover:bg-brand-gray-50 rounded-lg transition-colors shadow-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-4">
                    {/* Email Preferences Section */}
                    <div>
                      <p className="text-sm font-semibold text-brand-black mb-3">Email</p>
                      <div className="space-y-4 pl-4">
                        {/* Order updates */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="mb-1">
                              <p className="text-sm font-medium text-brand-black">Order updates</p>
                            </div>
                            <p className="text-sm text-brand-gray-600">Receive notifications about your orders</p>
                          </div>
                          {isEditingMarketing ? (
                            <button
                              onClick={() => setMarketingForm({ ...marketingForm, emailOrderUpdates: !marketingForm.emailOrderUpdates })}
                              className={`relative w-9 h-5 rounded-full p-0.5 flex items-center shadow-sm transition-colors cursor-pointer ${
                                marketingForm.emailOrderUpdates ? 'bg-brand-blue-500 justify-end' : 'bg-brand-gray-200'
                              }`}
                            >
                              <div className="w-4 h-4 bg-white rounded-full"></div>
                            </button>
                          ) : (
                            <div className="relative">
                              <button
                                onClick={() => handleDisabledToggleClick('marketing')}
                                className={`relative w-9 h-5 rounded-full p-0.5 flex items-center shadow-sm opacity-50 cursor-not-allowed transition-all ${
                                  marketingForm.emailOrderUpdates ? 'bg-brand-blue-300 justify-end' : 'bg-brand-gray-200'
                                }`}
                                title="Click Edit to make changes"
                              >
                                <div className="w-4 h-4 bg-white rounded-full"></div>
                              </button>
                              {showEditHint === 'marketing' && (
                                <div className="absolute right-0 top-full mt-2 z-10 animate-fade-in">
                                  <div className="bg-brand-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                                    Click &quot;Edit&quot; to make changes
                                    <div className="absolute -top-1 right-4 w-2 h-2 bg-brand-gray-900 transform rotate-45"></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Promotions and offers */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="mb-1">
                              <p className="text-sm font-medium text-brand-black">Promotions and offers</p>
                            </div>
                            <p className="text-sm text-brand-gray-600">Get updates on sales and special offers</p>
                          </div>
                          {isEditingMarketing ? (
                            <button
                              onClick={() => setMarketingForm({ ...marketingForm, emailPromotions: !marketingForm.emailPromotions })}
                              className={`relative w-9 h-5 rounded-full p-0.5 flex items-center shadow-sm transition-colors cursor-pointer ${
                                marketingForm.emailPromotions ? 'bg-brand-blue-500 justify-end' : 'bg-brand-gray-200'
                              }`}
                            >
                              <div className="w-4 h-4 bg-white rounded-full"></div>
                            </button>
                          ) : (
                            <div className="relative">
                              <button
                                onClick={() => handleDisabledToggleClick('marketing')}
                                className={`relative w-9 h-5 rounded-full p-0.5 flex items-center shadow-sm opacity-50 cursor-not-allowed transition-all ${
                                  marketingForm.emailPromotions ? 'bg-brand-blue-300 justify-end' : 'bg-brand-gray-200'
                                }`}
                                title="Click Edit to make changes"
                              >
                                <div className="w-4 h-4 bg-white rounded-full"></div>
                              </button>
                              {showEditHint === 'marketing' && (
                                <div className="absolute right-0 top-full mt-2 z-10 animate-fade-in">
                                  <div className="bg-brand-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                                    Click &quot;Edit&quot; to make changes
                                    <div className="absolute -top-1 right-4 w-2 h-2 bg-brand-gray-900 transform rotate-45"></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Newsletter */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="mb-1">
                              <p className="text-sm font-medium text-brand-black">Newsletter</p>
                            </div>
                            <p className="text-sm text-brand-gray-600">Receive our monthly newsletter</p>
                          </div>
                          {isEditingMarketing ? (
                            <button
                              onClick={() => setMarketingForm({ ...marketingForm, emailNewsletter: !marketingForm.emailNewsletter })}
                              className={`relative w-9 h-5 rounded-full p-0.5 flex items-center shadow-sm transition-colors cursor-pointer ${
                                marketingForm.emailNewsletter ? 'bg-brand-blue-500 justify-end' : 'bg-brand-gray-200'
                              }`}
                            >
                              <div className="w-4 h-4 bg-white rounded-full"></div>
                            </button>
                          ) : (
                            <div className="relative">
                              <button
                                onClick={() => handleDisabledToggleClick('marketing')}
                                className={`relative w-9 h-5 rounded-full p-0.5 flex items-center shadow-sm opacity-50 cursor-not-allowed transition-all ${
                                  marketingForm.emailNewsletter ? 'bg-brand-blue-300 justify-end' : 'bg-brand-gray-200'
                                }`}
                                title="Click Edit to make changes"
                              >
                                <div className="w-4 h-4 bg-white rounded-full"></div>
                              </button>
                              {showEditHint === 'marketing' && (
                                <div className="absolute right-0 top-full mt-2 z-10 animate-fade-in">
                                  <div className="bg-brand-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                                    Click &quot;Edit&quot; to make changes
                                    <div className="absolute -top-1 right-4 w-2 h-2 bg-brand-gray-900 transform rotate-45"></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SMS Preferences Section */}
                    <div className="pt-4 border-t border-brand-gray-200">
                      <p className="text-sm font-semibold text-brand-black mb-3">SMS / Text Messages</p>
                      <div className="space-y-4 pl-4">
                        {/* Order updates SMS */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="mb-1">
                              <p className="text-sm font-medium text-brand-black">Order updates</p>
                            </div>
                            <p className="text-sm text-brand-gray-600">Receive text notifications about your orders</p>
                          </div>
                          {isEditingMarketing ? (
                            <button
                              onClick={() => setMarketingForm({ ...marketingForm, smsOrderUpdates: !marketingForm.smsOrderUpdates })}
                              className={`relative w-9 h-5 rounded-full p-0.5 flex items-center shadow-sm transition-colors cursor-pointer ${
                                marketingForm.smsOrderUpdates ? 'bg-brand-blue-500 justify-end' : 'bg-brand-gray-200'
                              }`}
                            >
                              <div className="w-4 h-4 bg-white rounded-full"></div>
                            </button>
                          ) : (
                            <div className="relative">
                              <button
                                onClick={() => handleDisabledToggleClick('marketing')}
                                className={`relative w-9 h-5 rounded-full p-0.5 flex items-center shadow-sm opacity-50 cursor-not-allowed transition-all ${
                                  marketingForm.smsOrderUpdates ? 'bg-brand-blue-300 justify-end' : 'bg-brand-gray-200'
                                }`}
                                title="Click Edit to make changes"
                              >
                                <div className="w-4 h-4 bg-white rounded-full"></div>
                              </button>
                              {showEditHint === 'marketing' && (
                                <div className="absolute right-0 top-full mt-2 z-10 animate-fade-in">
                                  <div className="bg-brand-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                                    Click &quot;Edit&quot; to make changes
                                    <div className="absolute -top-1 right-4 w-2 h-2 bg-brand-gray-900 transform rotate-45"></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Promotions SMS */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="mb-1">
                              <p className="text-sm font-medium text-brand-black">Promotions and offers</p>
                            </div>
                            <p className="text-sm text-brand-gray-600">Get text updates on sales and special offers</p>
                          </div>
                          {isEditingMarketing ? (
                            <button
                              onClick={() => setMarketingForm({ ...marketingForm, smsPromotions: !marketingForm.smsPromotions })}
                              className={`relative w-9 h-5 rounded-full p-0.5 flex items-center shadow-sm transition-colors cursor-pointer ${
                                marketingForm.smsPromotions ? 'bg-brand-blue-500 justify-end' : 'bg-brand-gray-200'
                              }`}
                            >
                              <div className="w-4 h-4 bg-white rounded-full"></div>
                            </button>
                          ) : (
                            <div className="relative">
                              <button
                                onClick={() => handleDisabledToggleClick('marketing')}
                                className={`relative w-9 h-5 rounded-full p-0.5 flex items-center shadow-sm opacity-50 cursor-not-allowed transition-all ${
                                  marketingForm.smsPromotions ? 'bg-brand-blue-300 justify-end' : 'bg-brand-gray-200'
                                }`}
                                title="Click Edit to make changes"
                              >
                                <div className="w-4 h-4 bg-white rounded-full"></div>
                              </button>
                              {showEditHint === 'marketing' && (
                                <div className="absolute right-0 top-full mt-2 z-10 animate-fade-in">
                                  <div className="bg-brand-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                                    Click &quot;Edit&quot; to make changes
                                    <div className="absolute -top-1 right-4 w-2 h-2 bg-brand-gray-900 transform rotate-45"></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Legal Disclaimer */}
                    <div className="pt-4 border-t border-brand-gray-200">
                      <p className="text-sm text-brand-gray-700 leading-relaxed">
                        By enabling these communication preferences, you agree to receive marketing communications from Market Street, including exclusive offers, latest product info, news about upcoming collections and more. Please see our{' '}
                        <a href="/terms" className="text-brand-blue-500 hover:text-brand-blue-600 hover:underline">Terms & Conditions</a> and{' '}
                        <a href="/privacy" className="text-brand-blue-500 hover:text-brand-blue-600 hover:underline">Privacy Policy</a> for more details.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Password & Security Card */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm">
                  <div className="p-6 border-b border-brand-gray-200">
                    <h3 className="text-base font-semibold text-brand-black">Password & Security</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Password Section */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="mb-1">
                          <p className="text-sm font-medium text-brand-black">Password</p>
                        </div>
                        <p className="text-sm text-brand-gray-600">Last changed 3 months ago</p>
                      </div>
                      <button 
                        onClick={() => {
                          setPasswordForm({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          })
                          setShowChangePasswordModal(true)
                        }}
                        className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black hover:bg-brand-gray-50 rounded-lg transition-colors shadow-sm whitespace-nowrap"
                      >
                        Change password
                      </button>
                    </div>

                    {/* Passkeys Section */}
                    <div className="pt-6 border-t border-brand-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-sm font-semibold text-brand-black mb-1">Passkeys</h4>
                          <p className="text-xs text-brand-gray-600">Sign in securely without passwords using your device</p>
                        </div>
                        <button 
                          onClick={() => setShowAddPasskeyModal(true)}
                          className="px-4 py-2 text-sm font-medium bg-brand-blue-500 text-white rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm whitespace-nowrap"
                        >
                          Add passkey
                        </button>
                      </div>

                      {passkeys.length === 0 ? (
                        <div className="text-center py-8 border border-brand-gray-200 rounded-lg bg-brand-gray-50">
                          <svg className="w-12 h-12 text-brand-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <p className="text-sm font-medium text-brand-black mb-2">No passkeys set up</p>
                          <p className="text-xs text-brand-gray-600 mb-4">Add a passkey to sign in faster and more securely</p>
                          <button 
                            onClick={() => setShowAddPasskeyModal(true)}
                            className="px-4 py-2 text-sm font-medium bg-brand-blue-500 text-white rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                          >
                            Get Started
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {passkeys.map((passkey) => (
                            <div key={passkey.id} className="flex items-center justify-between p-4 border border-brand-gray-200 rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-brand-blue-100 rounded-lg flex items-center justify-center">
                                  {passkey.deviceType === 'device' ? (
                                    <svg className="w-6 h-6 text-brand-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-6 h-6 text-brand-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-brand-black">{passkey.name}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-brand-gray-600">Created {new Date(passkey.createdAt).toLocaleDateString()}</p>
                                    {passkey.lastUsed && (
                                      <>
                                        <span className="text-xs text-brand-gray-400">•</span>
                                        <p className="text-xs text-brand-gray-600">Last used {new Date(passkey.lastUsed).toLocaleDateString()}</p>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setPasskeyToRemove(passkey.id)
                                  setShowRemovePasskeyModal(true)
                                }}
                                className="text-sm text-red-600 hover:text-red-700 hover:underline font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* About Passkeys Info */}
                      <div className="mt-4 p-3 bg-brand-blue-50 border border-brand-blue-200 rounded-lg">
                        <p className="text-xs font-medium text-brand-blue-800 mb-2">About Passkeys</p>
                        <p className="text-xs text-brand-blue-700 mb-2">
                          Passkeys use biometric authentication (Face ID, Touch ID, or Windows Hello) or your device PIN to sign in securely without passwords.
                        </p>
                        <div className="space-y-1.5 text-xs text-brand-blue-700">
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-brand-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p>More secure than passwords</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-brand-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p>Faster sign-in experience</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-brand-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p>Works across all your devices</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delete Account Card */}
                <div className="bg-white border border-red-200 rounded-xl shadow-sm">
                  <div className="p-6 border-b border-red-200">
                    <h3 className="text-base font-semibold text-red-600">Delete Account</h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="mb-1">
                          <p className="text-sm font-medium text-brand-black">Permanently delete your account</p>
                        </div>
                        <p className="text-sm text-brand-gray-600">This action cannot be undone. All your data will be permanently deleted.</p>
                      </div>
                      <button 
                        onClick={() => setShowDeleteAccountModal(true)}
                        className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order History Section */}
            {activeSection === 'order-history' && (() => {
              // Guard for undefined/null orders array
              if (!recentOrders || !Array.isArray(recentOrders)) {
                return (
              <div className="space-y-5">
                    <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-12 text-center">
                      <p className="text-brand-gray-600">No orders available.</p>
                    </div>
                    </div>
                )
              }

              // Extract unique years from orders
              const extractYear = (dateStr: string | undefined): number | null => {
                if (!dateStr || typeof dateStr !== 'string') return null
                // Parse date string like "Sep 10, 2024" or "2024-09-10"
                const yearMatch = dateStr.match(/\b(20\d{2})\b/)
                return yearMatch ? parseInt(yearMatch[1], 10) : null
              }

              const availableYears = Array.from(
                new Set(
                  recentOrders
                    .map(order => extractYear(order?.orderDate))
                    .filter((year): year is number => year !== null)
                )
              ).sort((a, b) => b - a) // Sort descending (newest first)

              // Filter orders by year and search term
              const filteredOrders = recentOrders.filter(order => {
                if (!order) return false
                // Year filter
                if (selectedYear !== 'all') {
                  const orderYear = extractYear(order.orderDate)
                  if (orderYear !== parseInt(selectedYear, 10)) {
                    return false
                  }
                }

                // Search filter
                if (orderSearchTerm.trim()) {
                  const searchLower = orderSearchTerm.toLowerCase()
                  const matchesOrderNumber = order.orderNumber?.toLowerCase().includes(searchLower) || false
                  const matchesStatus = order.status?.toLowerCase().includes(searchLower) || false
                  const matchesItems = order.items?.some(item => 
                    item?.name?.toLowerCase().includes(searchLower)
                  ) || false
                  
                  if (!matchesOrderNumber && !matchesStatus && !matchesItems) {
                    return false
                  }
                }

                return true
              })

              return (
                <div className="space-y-5">
                  {/* Order History Header Card */}
                  <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-b border-brand-gray-200">
                                                              <div>
                        <h2 className="text-2xl font-semibold text-brand-black mb-1.5">Order History</h2>
                        <p className="text-sm text-brand-gray-600">View and track your orders</p>
                                                                    </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Filter by Year */}
                        <div className="flex items-center gap-2">
                          <label htmlFor="year-filter" className="text-sm text-brand-gray-600 whitespace-nowrap">
                            Filter by Year:
                          </label>
                          <select
                            id="year-filter"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="px-3 py-2 border border-brand-gray-200 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent shadow-sm bg-white min-w-[140px]"
                          >
                            <option value="all">All Years</option>
                            {availableYears.map(year => (
                              <option key={year} value={year.toString()}>
                                {year}
                              </option>
                            ))}
                          </select>
                                                                </div>
                        {/* Search Input */}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search orders"
                            value={orderSearchTerm}
                            onChange={(e) => setOrderSearchTerm(e.target.value)}
                            className="w-[212px] pl-10 pr-4 py-2 border border-brand-gray-200 rounded-lg text-sm text-brand-black placeholder-brand-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent shadow-sm"
                          />
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                                    </svg>
                                                              </div>
                                                            </div>
                                        </div>

                    {/* Orders List - Compact Summary Cards */}
                    <div className="divide-y divide-brand-gray-200">
                      {filteredOrders.length === 0 ? (
                        <div className="p-12 text-center">
                          <p className="text-brand-gray-600">No orders found matching your criteria.</p>
                                                                  </div>
                      ) : (
                        filteredOrders.map((order, idx) => (
                          <OrderSummaryCard key={idx} order={order} variant="full" />
                        ))
                      )}
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between p-6 border-t border-brand-gray-200">
                    <p className="text-sm text-brand-gray-600">
                      Viewing {filteredOrders.length} of {recentOrders.length} orders
                    </p>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 bg-white border border-brand-gray-200 text-sm font-medium text-brand-black rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm opacity-50 cursor-not-allowed">
                        Previous
                      </button>
                      <button className="px-4 py-2 bg-white border border-brand-gray-200 text-sm font-medium text-brand-black rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm">
                        Next
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cross-Sell Component */}
                <CrossSellSection />
              </div>
              )
            })()}

            {/* Wishlist Section */}
            {activeSection === 'wishlist' && (
              <div className="space-y-5">
                {/* Wishlist Header */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-brand-black mb-1.5">My Wishlists</h2>
                      <p className="text-sm text-brand-gray-600">Manage your personal information</p>
                    </div>
                    <button 
                      onClick={() => {
                        setNewWishlistName('')
                        setShowCreateWishlistModal(true)
                      }}
                      className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                    >
                      Create new list
                    </button>
                  </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Your Lists */}
                  <div className="lg:col-span-1">
                    <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
                      <h3 className="text-base font-semibold text-brand-black mb-4">Your Lists</h3>
                      <div className="space-y-1">
                        {wishlists.map((list) => (
                          <div
                            key={list.id}
                            onClick={() => {
                              setSelectedWishlistId(list.id)
                              setCurrentPage(1)
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${
                              selectedWishlistId === list.id
                                ? 'bg-brand-blue-50 text-brand-blue-600'
                                : 'text-brand-black hover:bg-brand-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {list.isDefault ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              )}
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${selectedWishlistId === list.id ? 'text-brand-blue-600' : 'text-brand-black'}`}>
                                  {list.name}
                                </p>
                                {list.isDefault && (
                                  <p className="text-xs text-brand-gray-500 mt-0.5">Default List - {list.itemCount} items</p>
                                )}
                                {!list.isDefault && (
                                  <p className="text-xs text-brand-gray-500 mt-0.5">{list.itemCount} items</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleRenameWishlist(list.id)}
                                className="p-1.5 text-brand-gray-500 hover:text-brand-blue-600 hover:bg-brand-blue-50 rounded transition-colors"
                                title="Rename"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleShareWishlist(list.id)}
                                className="p-1.5 text-brand-gray-500 hover:text-brand-blue-600 hover:bg-brand-blue-50 rounded transition-colors"
                                title="Share"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                              </button>
                              {!list.isDefault && (
                                <button
                                  onClick={() => handleDeleteWishlist(list.id)}
                                  className="p-1.5 text-brand-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Wishlist Items */}
                  <div className="lg:col-span-2">
                    <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm">
                      {/* Wishlist Items Header */}
                      <div className="p-6 border-b border-brand-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-brand-black mb-1">{selectedWishlist.name}</h3>
                            <p className="text-sm text-brand-gray-600">{selectedWishlist.itemCount} items saved.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleRenameWishlist(selectedWishlistId)}
                              className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                            >
                              Rename
                            </button>
                            <button 
                              onClick={() => handleShareWishlist(selectedWishlistId)}
                              className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                            >
                              Share
                            </button>
                            {!selectedWishlist.isDefault && (
                              <button 
                                onClick={() => handleDeleteWishlist(selectedWishlistId)}
                                className="px-4 py-2 text-sm font-medium bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                              >
                                Delete
                              </button>
                            )}
                            <button className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm">
                              + Add Item
                            </button>
                          </div>
                        </div>
                        
                        {/* Sort and Filter Controls */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-brand-gray-600">Sort by:</label>
                            <div className="relative">
                              <select
                                value={wishlistSortBy}
                                onChange={(e) => setWishlistSortBy(e.target.value as any)}
                                className="px-3 py-1.5 pr-10 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent appearance-none bg-white"
                              >
                                <option value="recent">Recently Added</option>
                                <option value="name">Name (A-Z)</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-4 h-4 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-brand-gray-600">Filter:</label>
                            <div className="relative">
                              <select
                                value={wishlistFilter}
                                onChange={(e) => setWishlistFilter(e.target.value)}
                                className="px-3 py-1.5 pr-10 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent appearance-none bg-white"
                              >
                                <option value="all">All Items</option>
                                <option value="in-stock">In Stock</option>
                                <option value="out-of-stock">Out of Stock</option>
                                <option value="on-sale">On Sale</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-4 h-4 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Wishlist Items Grid */}
                      <div className="p-6">
                        {paginatedItems.length === 0 ? (
                          <div className="text-center py-12">
                            <svg className="w-16 h-16 text-brand-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <p className="text-brand-gray-600 mb-2">This wishlist is empty</p>
                            <p className="text-sm text-brand-gray-500">Start adding items to your wishlist!</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {paginatedItems.map((item) => (
                              <div key={item.id} className="flex gap-4 p-4 border border-brand-gray-200 rounded-lg hover:border-brand-gray-300 transition-colors">
                                {/* Product Image */}
                                <Link href={`/product/${item.id}`} className="w-24 h-24 bg-brand-gray-100 rounded-lg flex-shrink-0 overflow-hidden group">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={96}
                                    height={96}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </Link>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                  <Link href={`/product/${item.id}`} className="block">
                                    <h4 className="text-base font-medium text-brand-black mb-1 hover:text-brand-blue-600 transition-colors">{item.name}</h4>
                                  </Link>
                                  <div className="flex flex-wrap items-center gap-2 text-sm text-brand-gray-600 mb-2">
                                    {item.color && (
                                      <span>Color: {item.color}</span>
                                    )}
                                    {item.selectedSize && (
                                      <span>Size: {item.selectedSize}</span>
                                    )}
                                    {item.brand && (
                                      <span className="text-brand-gray-500">• {item.brand}</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {item.inStock ? (
                                      <span className="text-xs text-green-600 font-medium">In Stock</span>
                                    ) : (
                                      <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                                    )}
                                    {item.storeAvailable && (
                                      <span className="text-xs text-brand-blue-600 font-medium">Pickup Available</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 mt-2">
                                    <button 
                                      onClick={() => handleRemoveFromWishlist(item.id)}
                                      className="text-sm text-brand-gray-500 hover:text-red-600 hover:underline transition-colors"
                                    >
                                      Remove
                                    </button>
                                    <span className="text-brand-gray-300">•</span>
                                    <button
                                      onClick={() => setQuickViewProduct(item)}
                                      className="text-sm text-brand-gray-500 hover:text-brand-blue-600 hover:underline transition-colors"
                                    >
                                      Quick view
                                    </button>
                                  </div>
                                </div>

                                {/* Price and Actions */}
                                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                  <div className="text-right">
                                    {item.originalPrice && item.originalPrice > item.price ? (
                                      <>
                                        <p className="text-sm text-brand-gray-400 line-through">${item.originalPrice.toFixed(2)}</p>
                                        <p className="text-lg font-semibold text-brand-black">${item.price.toFixed(2)}</p>
                                        <span className="text-xs text-red-600 font-medium">
                                          Save ${(item.originalPrice - item.price).toFixed(2)}
                                        </span>
                                      </>
                                    ) : (
                                      <p className="text-lg font-semibold text-brand-black">${item.price.toFixed(2)}</p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleAddToCart(item, item.selectedSize, item.selectedColor)}
                                    disabled={!item.inStock}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${
                                      item.inStock
                                        ? 'bg-brand-blue-500 text-white hover:bg-brand-blue-600'
                                        : 'bg-brand-gray-200 text-brand-gray-500 cursor-not-allowed'
                                    }`}
                                  >
                                    {item.inStock ? 'Add to cart' : 'Out of stock'}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between mt-6 pt-6 border-t border-brand-gray-200">
                            <p className="text-sm text-brand-gray-600">
                              Viewing {paginatedItems.length} of {filteredItems.length} items
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-white border border-brand-gray-200 text-sm font-medium text-brand-black rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Previous
                              </button>
                              <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-white border border-brand-gray-200 text-sm font-medium text-brand-black rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Methods Section */}
            {activeSection === 'payment' && (
              <div className="space-y-5">
                {/* Payment Methods Header */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-brand-black mb-1.5">Payment Methods</h2>
                      <p className="text-sm text-brand-gray-600">Manage your payment methods, gift cards, and store credit</p>
                    </div>
                  </div>
                </div>

                {/* Payment Methods Card */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between p-6 border-b border-brand-gray-200">
                    <div>
                      <h3 className="text-base font-semibold text-brand-black mb-1.5">Payment Methods</h3>
                      <p className="text-sm text-brand-gray-600">Manage your saved payment methods</p>
                    </div>
                    <button 
                      onClick={() => {
                        setPaymentForm({
                          type: 'visa',
                          cardholderName: '',
                          last4: '',
                          expiryMonth: undefined,
                          expiryYear: undefined,
                          bankName: '',
                        })
                        setShowPaymentModal(true)
                      }}
                      className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black hover:bg-brand-gray-50 rounded-lg transition-colors shadow-sm"
                    >
                      Add payment method
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {paymentMethods.sort((a, b) => {
                        if (a.isDefault) return -1
                        if (b.isDefault) return 1
                        return 0
                      }).map((method) => {
                    return (
                      <div
                        key={method.id}
                        className={`bg-white border rounded-xl shadow-sm p-6 relative ${
                          method.isDefault ? 'border-brand-blue-500' : 'border-brand-gray-200'
                        }`}
                      >
                        {/* Card Brand Icon */}
                        <div className="absolute top-6 right-6">
                          {method.type === 'visa' && (
                            <div className="w-10 h-6 bg-[#1434CB] rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">VISA</span>
                            </div>
                          )}
                          {method.type === 'mastercard' && (
                            <div className="w-10 h-6 bg-[#EB001B] rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">MC</span>
                            </div>
                          )}
                          {method.type === 'ach' && (
                            <svg className="w-6 h-6 text-brand-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          )}
                        </div>

                        {/* Card Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-base font-medium text-brand-black">
                              {method.type === 'visa' && `Visa **** ${method.last4}`}
                              {method.type === 'mastercard' && `Mastercard **** ${method.last4}`}
                              {method.type === 'ach' && `ACH ${method.bankName}`}
                            </span>
                            {method.isDefault && (
                              <span className="px-2 py-0.5 bg-brand-blue-100 text-brand-blue-700 text-xs font-semibold rounded">
                                Default
                              </span>
                            )}
                          </div>
                          {(method.expiryMonth && method.expiryYear) && (
                            <p className="text-sm text-brand-gray-600 mb-4">
                              Expires {String(method.expiryMonth).padStart(2, '0')}/{method.expiryYear} | {method.cardholderName}
                            </p>
                          )}
                          {method.type === 'ach' && (
                            <p className="text-sm text-brand-gray-600 mb-4">
                              {method.cardholderName}
                            </p>
                          )}

                          {/* Action Links */}
                          <div className="flex items-center gap-4">
                            {!method.isDefault && (
                              <button 
                                onClick={() => handleSetDefaultPaymentMethod(method.id)}
                                className="text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline"
                              >
                                Set Default
                              </button>
                            )}
                            {method.isDefault && (
                              <button className="text-sm text-brand-gray-400 cursor-not-allowed" disabled>
                                Set Default
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                setPaymentMethodToRemove(method.id)
                                setShowRemovePaymentMethodModal(true)
                              }}
                              className="text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline"
                            >
                              Remove
                            </button>
                        </div>
                      </div>
                    </div>
                    )
                  })}
                    </div>
                  </div>
                </div>

                {/* Gift Cards Card */}
                <div id="gift-cards" className="scroll-mt-8 bg-white border border-brand-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between p-6 border-b border-brand-gray-200">
                    <div>
                      <h3 className="text-base font-semibold text-brand-black mb-1.5">Gift Cards</h3>
                      <p className="text-sm text-brand-gray-600">Manage your gift cards and balances</p>
                    </div>
                    <button
                      onClick={() => {
                        setGiftCardForm({ cardNumber: '', pin: '' })
                        setShowAddGiftCardModal(true)
                      }}
                      className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black hover:bg-brand-gray-50 rounded-lg transition-colors shadow-sm"
                    >
                      Add gift card
                    </button>
                  </div>
                  <div className="p-6">
                    {giftCards.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {giftCards.map((card) => (
                            <div key={card.id} className="border border-brand-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-brand-black">Gift Card</span>
                                <svg className="w-5 h-5 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                              </div>
                              <p className="text-2xl font-semibold text-brand-black mb-1">${card.balance.toFixed(2)}</p>
                              <p className="text-xs text-brand-gray-500 mb-3">Card ending in {card.last4}</p>
                              <button 
                                onClick={() => {
                                  setGiftCardToRemove(card.id)
                                  setShowRemoveGiftCardModal(true)
                                }}
                                className="text-xs text-brand-blue-500 hover:text-brand-blue-600 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="pt-4 border-t border-brand-gray-200">
                          <p className="text-sm font-medium text-brand-black">Total Balance: <span className="text-brand-blue-500">${giftCards.reduce((sum, card) => sum + card.balance, 0).toFixed(2)}</span></p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <svg className="w-12 h-12 text-brand-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <p className="text-sm text-brand-gray-600 mb-2">No gift cards added yet</p>
                        <p className="text-xs text-brand-gray-500">Add a gift card to start using it for purchases</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Store Credit Card */}
                <div id="store-credit" className="scroll-mt-8 bg-white border border-brand-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between p-6 border-b border-brand-gray-200">
                    <div>
                      <h3 className="text-base font-semibold text-brand-black mb-1.5">Store Credit</h3>
                      <p className="text-sm text-brand-gray-600">Your available store credit balance</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-3xl font-semibold text-brand-black mb-1">$50.00</p>
                        <p className="text-sm text-brand-gray-600">Available credit</p>
                      </div>
                      <svg className="w-12 h-12 text-brand-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="pt-4 border-t border-brand-gray-200">
                      <p className="text-sm text-brand-gray-600 mb-2">Store credit can be used for any purchase</p>
                      <button 
                        onClick={() => setShowCreditHistory(true)}
                        className="text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline"
                      >
                        View credit history →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Addresses Section */}
            {activeSection === 'addresses' && (
              <div className="space-y-5">
                {/* Addresses Header */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-brand-black mb-1.5">Addresses</h2>
                      <p className="text-sm text-brand-gray-600">Manage your shipping addresses</p>
                    </div>
                    <button 
                      onClick={handleOpenAddAddress}
                      className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add new address
                    </button>
                  </div>
                </div>

                {/* Addresses List */}
                <div className="space-y-4">
                  {addresses.map((address) => {
                    return (
                      <div
                        key={address.id}
                        className={`bg-white border rounded-xl shadow-sm p-6 ${
                          address.isDefault ? 'border-brand-blue-500' : 'border-brand-gray-200'
                        }`}
                      >
                        <div className="flex items-start">
                          {/* Address Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-base font-medium text-brand-black">
                                {address.firstName} {address.lastName}
                              </span>
                              {address.isDefault && (
                                <span className="px-2 py-0.5 bg-brand-blue-100 text-brand-blue-700 text-xs font-semibold rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-brand-gray-600 mb-1">{address.addressLine1}</p>
                            <p className="text-sm text-brand-gray-600 mb-2">
                              {address.zipCode}, {address.city}, {address.state}, {address.country}
                            </p>
                            {address.deliveryInstructions && (
                              <div className="mb-4 p-2 bg-brand-blue-50 border border-brand-blue-200 rounded-lg">
                                <p className="text-xs font-medium text-brand-blue-800 mb-1">Delivery Instructions:</p>
                                <p className="text-xs text-brand-blue-700">{address.deliveryInstructions}</p>
                              </div>
                            )}

                            {/* Action Links */}
                            <div className="flex items-center gap-4">
                              <button 
                                onClick={() => handleOpenEditAddress(address.id)}
                                className="text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline"
                              >
                                Edit Address
                              </button>
                              {!address.isDefault && (
                                <button 
                                  onClick={() => handleSetDefaultAddress(address.id)}
                                  className="text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline"
                                >
                                  Set Default
                                </button>
                              )}
                              {address.isDefault && (
                                <button className="text-sm text-brand-gray-400 cursor-not-allowed" disabled>
                                  Set Default
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  setAddressToRemove(address.id)
                                  setShowRemoveAddressModal(true)
                                }}
                                className="text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Loyalty Rewards Section */}
            {activeSection === 'loyalty' && (
              <div className="space-y-5">
                {/* Loyalty Header */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-brand-black mb-1.5">Loyalty Rewards</h2>
                    <p className="text-sm text-brand-gray-600">Your current tier, points, and exclusive benefits</p>
                  </div>
                </div>

                {/* Current Tier Badge */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
                  <div className={`flex items-center gap-4 p-4 bg-gradient-to-r border rounded-lg ${getLoyaltyStatusGradient(loyaltyStatus)}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${getLoyaltyStatusIconBg(loyaltyStatus)}`}>
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getLoyaltyStatusColor(loyaltyStatus)}`}>
                          {loyaltyStatus} Member
                        </span>
                        <span className="px-2 py-0.5 bg-brand-gray-500 text-white text-xs font-semibold rounded">Active</span>
                      </div>
                      <p className="text-sm text-brand-gray-600 mb-2">{loyaltyPoints.toLocaleString()} points</p>
                      <div className="w-full bg-brand-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getLoyaltyStatusProgressColor(loyaltyStatus)}`}
                          style={{ width: `${Math.min((loyaltyPoints / 5000) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-brand-gray-500 mt-1">
                        {5000 - loyaltyPoints} points until Platinum tier
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tier Progress */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-brand-black mb-4">Tier Progress</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${loyaltyStatus === 'Bronze' ? 'bg-brand-gray-400' : 'bg-brand-gray-200'}`}>
                        {loyaltyStatus !== 'Bronze' && (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-brand-black">Bronze</p>
                        <p className="text-xs text-brand-gray-600">0 - 999 points</p>
                      </div>
                      <span className={`text-xs font-medium ${loyaltyStatus === 'Bronze' ? 'text-brand-gray-700' : 'text-green-600'}`}>
                        {loyaltyStatus === 'Bronze' ? 'Current' : 'Completed'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${loyaltyStatus === 'Silver' ? 'bg-brand-gray-400' : loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? 'bg-brand-gray-200' : 'bg-brand-gray-200'}`}>
                        {(loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum') && (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-brand-black">Silver</p>
                        <p className="text-xs text-brand-gray-600">1,000 - 2,499 points</p>
                      </div>
                      <span className={`text-xs font-medium ${loyaltyStatus === 'Silver' ? 'text-brand-gray-700' : loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? 'text-green-600' : 'text-brand-gray-400'}`}>
                        {loyaltyStatus === 'Silver' ? 'Current' : (loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum') ? 'Completed' : 'Locked'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${loyaltyStatus === 'Gold' ? 'bg-yellow-500' : loyaltyStatus === 'Platinum' ? 'bg-brand-gray-200' : 'bg-brand-gray-200'}`}>
                        {loyaltyStatus === 'Platinum' && (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-brand-black">Gold</p>
                        <p className="text-xs text-brand-gray-600">2,500 - 4,999 points</p>
                      </div>
                      <span className={`text-xs font-medium ${loyaltyStatus === 'Gold' ? 'text-brand-gray-700' : loyaltyStatus === 'Platinum' ? 'text-green-600' : 'text-brand-gray-400'}`}>
                        {loyaltyStatus === 'Gold' ? 'Current' : loyaltyStatus === 'Platinum' ? 'Completed' : 'Locked'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${loyaltyStatus === 'Platinum' ? 'bg-purple-500' : 'bg-brand-gray-200'}`}>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-brand-black">Platinum</p>
                        <p className="text-xs text-brand-gray-600">5,000+ points</p>
                      </div>
                      <span className={`text-xs font-medium ${loyaltyStatus === 'Platinum' ? 'text-brand-gray-700' : 'text-brand-gray-400'}`}>
                        {loyaltyStatus === 'Platinum' ? 'Current' : 'Locked'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tier Benefits */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-brand-black mb-4">Tier Benefits</h3>
                  <div className="space-y-4">
                    {/* Bronze Benefits */}
                    <div className={`p-4 rounded-lg border ${loyaltyStatus === 'Bronze' ? 'bg-brand-blue-50 border-brand-blue-200' : 'bg-brand-gray-50 border-brand-gray-200'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${loyaltyStatus === 'Bronze' ? 'bg-brand-gray-400' : 'bg-brand-gray-300'}`}>
                          {loyaltyStatus !== 'Bronze' && (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <h4 className="text-base font-semibold text-brand-black">Bronze Benefits</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-brand-gray-700">
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>1 point for every $1 spent</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Birthday reward (10% off)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Early access to sales</span>
                        </li>
                      </ul>
                    </div>

                    {/* Silver Benefits */}
                    <div className={`p-4 rounded-lg border ${loyaltyStatus === 'Silver' ? 'bg-brand-blue-50 border-brand-blue-200' : loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? 'bg-brand-gray-50 border-brand-gray-200' : 'bg-brand-gray-50 border-brand-gray-200 opacity-60'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${loyaltyStatus === 'Silver' ? 'bg-brand-gray-400' : loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? 'bg-brand-gray-300' : 'bg-brand-gray-200'}`}>
                          {(loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum') && (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <h4 className="text-base font-semibold text-brand-black">Silver Benefits</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-brand-gray-700">
                        <li className="flex items-start gap-2">
                          <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${loyaltyStatus === 'Silver' || loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? 'text-green-600' : 'text-brand-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={loyaltyStatus === 'Silver' || loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                          </svg>
                          <span className={loyaltyStatus === 'Silver' || loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? '' : 'text-brand-gray-400'}>1.5 points for every $1 spent</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${loyaltyStatus === 'Silver' || loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? 'text-green-600' : 'text-brand-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={loyaltyStatus === 'Silver' || loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                          </svg>
                          <span className={loyaltyStatus === 'Silver' || loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? '' : 'text-brand-gray-400'}>Free standard shipping on all orders</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${loyaltyStatus === 'Silver' || loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? 'text-green-600' : 'text-brand-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={loyaltyStatus === 'Silver' || loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                          </svg>
                          <span className={loyaltyStatus === 'Silver' || loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? '' : 'text-brand-gray-400'}>15% off birthday reward</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${loyaltyStatus === 'Silver' || loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? 'text-green-600' : 'text-brand-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={loyaltyStatus === 'Silver' || loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                          </svg>
                          <span className={loyaltyStatus === 'Silver' || loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? '' : 'text-brand-gray-400'}>Exclusive member-only sales</span>
                        </li>
                      </ul>
                    </div>

                    {/* Gold Benefits */}
                    <div className={`p-4 rounded-lg border ${loyaltyStatus === 'Gold' ? 'bg-brand-blue-50 border-brand-blue-200' : loyaltyStatus === 'Platinum' ? 'bg-brand-gray-50 border-brand-gray-200' : 'bg-brand-gray-50 border-brand-gray-200 opacity-60'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${loyaltyStatus === 'Gold' ? 'bg-yellow-500' : loyaltyStatus === 'Platinum' ? 'bg-brand-gray-300' : 'bg-brand-gray-200'}`}>
                          {loyaltyStatus === 'Platinum' && (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <h4 className="text-base font-semibold text-brand-black">Gold Benefits</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-brand-gray-700">
                        <li className="flex items-start gap-2">
                          <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? 'text-green-600' : 'text-brand-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                          </svg>
                          <span className={loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? '' : 'text-brand-gray-400'}>2 points for every $1 spent</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? 'text-green-600' : 'text-brand-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                          </svg>
                          <span className={loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? '' : 'text-brand-gray-400'}>Free express shipping on orders over $100</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? 'text-green-600' : 'text-brand-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                          </svg>
                          <span className={loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? '' : 'text-brand-gray-400'}>20% off birthday reward</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? 'text-green-600' : 'text-brand-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                          </svg>
                          <span className={loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? '' : 'text-brand-gray-400'}>Priority customer support</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? 'text-green-600' : 'text-brand-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                          </svg>
                          <span className={loyaltyStatus === 'Gold' || loyaltyStatus === 'Platinum' ? '' : 'text-brand-gray-400'}>Extended return window (60 days)</span>
                        </li>
                      </ul>
                    </div>

                    {/* Platinum Benefits */}
                    <div className={`p-4 rounded-lg border ${loyaltyStatus === 'Platinum' ? 'bg-brand-blue-50 border-brand-blue-200' : 'bg-brand-gray-50 border-brand-gray-200 opacity-60'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${loyaltyStatus === 'Platinum' ? 'bg-purple-500' : 'bg-brand-gray-200'}`}>
                        </div>
                        <h4 className="text-base font-semibold text-brand-black">Platinum Benefits</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-brand-gray-700">
                        <li className="flex items-start gap-2">
                          <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${loyaltyStatus === 'Platinum' ? 'text-green-600' : 'text-brand-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={loyaltyStatus === 'Platinum' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                          </svg>
                          <span className={loyaltyStatus === 'Platinum' ? '' : 'text-brand-gray-400'}>3 points for every $1 spent</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${loyaltyStatus === 'Platinum' ? 'text-green-600' : 'text-brand-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={loyaltyStatus === 'Platinum' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                          </svg>
                          <span className={loyaltyStatus === 'Platinum' ? '' : 'text-brand-gray-400'}>Free express shipping on all orders</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${loyaltyStatus === 'Platinum' ? 'text-green-600' : 'text-brand-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={loyaltyStatus === 'Platinum' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                          </svg>
                          <span className={loyaltyStatus === 'Platinum' ? '' : 'text-brand-gray-400'}>25% off birthday reward</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${loyaltyStatus === 'Platinum' ? 'text-green-600' : 'text-brand-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={loyaltyStatus === 'Platinum' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                          </svg>
                          <span className={loyaltyStatus === 'Platinum' ? '' : 'text-brand-gray-400'}>Dedicated VIP support line</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${loyaltyStatus === 'Platinum' ? 'text-green-600' : 'text-brand-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={loyaltyStatus === 'Platinum' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                          </svg>
                          <span className={loyaltyStatus === 'Platinum' ? '' : 'text-brand-gray-400'}>Extended return window (90 days)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${loyaltyStatus === 'Platinum' ? 'text-green-600' : 'text-brand-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={loyaltyStatus === 'Platinum' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                          </svg>
                          <span className={loyaltyStatus === 'Platinum' ? '' : 'text-brand-gray-400'}>Exclusive Platinum-only products and events</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${loyaltyStatus === 'Platinum' ? 'text-green-600' : 'text-brand-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={loyaltyStatus === 'Platinum' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                          </svg>
                          <span className={loyaltyStatus === 'Platinum' ? '' : 'text-brand-gray-400'}>Annual gift on membership anniversary</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-brand-black mb-4">Recent Achievements</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-brand-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-brand-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-xs font-medium text-brand-black">First Order</p>
                      <p className="text-xs text-brand-gray-500 mt-1">Unlocked</p>
                    </div>
                    <div className="text-center p-3 bg-brand-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-brand-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-xs font-medium text-brand-black">10 Orders</p>
                      <p className="text-xs text-brand-gray-500 mt-1">Unlocked</p>
                    </div>
                    <div className="text-center p-3 bg-brand-gray-50 rounded-lg border-2 border-dashed border-brand-gray-300">
                      <div className="w-10 h-10 bg-brand-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p className="text-xs font-medium text-brand-gray-400">50 Orders</p>
                      <p className="text-xs text-brand-gray-400 mt-1">Locked</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Store Preferences Section */}
            {activeSection === 'store-preferences' && (
              <div className="space-y-5">
                {/* Store Preferences Header */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-brand-black mb-1.5">Store Preferences</h2>
                    <p className="text-sm text-brand-gray-600">Manage your preferred store locations and pickup preferences</p>
                  </div>
                </div>

                {/* Preferred Store for Pickup */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-brand-black mb-1.5">Preferred Store for Pickup</h3>
                      <p className="text-sm text-brand-gray-600">Select your preferred store for in-store pickup orders</p>
                    </div>
                    <button 
                      onClick={() => setShowStoreSelector(true)}
                      className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black hover:bg-brand-gray-50 rounded-lg transition-colors shadow-sm"
                    >
                      Change store
                    </button>
                  </div>
                  <div className="p-4 bg-brand-gray-50 rounded-lg border border-brand-gray-200">
                    <p className="text-sm font-medium text-brand-black mb-1">{preferredStoreForPickup.name}</p>
                    <p className="text-sm text-brand-gray-600">{preferredStoreForPickup.address}</p>
                    <p className="text-xs text-brand-gray-500 mt-1">{preferredStoreForPickup.hours}</p>
                  </div>
                </div>

                {/* Authorized Pickup People */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-brand-black mb-1.5">Authorized Pickup People</h3>
                      <p className="text-sm text-brand-gray-600">Add people who are authorized to pick up orders on your behalf</p>
                    </div>
                    <button 
                      onClick={() => {
                        setAuthorizedPersonForm({
                          firstName: '',
                          lastName: '',
                          email: '',
                          relationship: '',
                        })
                        setShowAddPersonModal(true)
                      }}
                      className="px-4 py-2 text-sm font-medium bg-brand-blue-500 text-white rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Person
                    </button>
                  </div>
                  
                  {/* Authorized People List */}
                  <div className="space-y-3">
                    <div className="p-4 border border-brand-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-brand-black">Sarah Johnson</p>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">Active</span>
                          </div>
                          <p className="text-sm text-brand-gray-600 mb-1">sarah.johnson@email.com</p>
                          <p className="text-xs text-brand-gray-500">Relationship: Spouse</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-brand-gray-500 hover:text-brand-blue-600 hover:bg-brand-blue-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button className="p-2 text-brand-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-brand-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-brand-black">Michael Chen</p>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">Active</span>
                          </div>
                          <p className="text-sm text-brand-gray-600 mb-1">michael.chen@email.com</p>
                          <p className="text-xs text-brand-gray-500">Relationship: Family Member</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-brand-gray-500 hover:text-brand-blue-600 hover:bg-brand-blue-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button className="p-2 text-brand-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info Message */}
                  <div className="mt-4 p-3 bg-brand-blue-50 border border-brand-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-brand-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-brand-blue-800">
                        Authorized pickup people will need to show a valid ID matching the name on file when picking up orders.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pickup Preferences */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between p-6 border-b border-brand-gray-200">
                    <div>
                      <h3 className="text-base font-semibold text-brand-black mb-1.5">Pickup Preferences</h3>
                      <p className="text-sm text-brand-gray-600">Manage your pickup notification and store preferences</p>
                    </div>
                    {!isEditingPickupPreferences ? (
                      <button 
                        onClick={() => setIsEditingPickupPreferences(true)}
                        className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setIsEditingPickupPreferences(false)
                            showToastMessage('Pickup preferences saved successfully')
                          }}
                          className="px-4 py-2 text-sm font-medium bg-brand-blue-500 text-white hover:bg-brand-blue-600 rounded-lg transition-colors shadow-sm"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => {
                            setIsEditingPickupPreferences(false)
                            setPickupPreferencesForm({
                              autoSelectStore: true,
                              pickupNotifications: true,
                              storeEventsPromotions: false,
                            })
                          }}
                          className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black hover:bg-brand-gray-50 rounded-lg transition-colors shadow-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-brand-black mb-1">Auto-select preferred store</p>
                        <p className="text-xs text-brand-gray-600">Automatically use your preferred store for pickup orders</p>
                      </div>
                      {isEditingPickupPreferences ? (
                        <button 
                          onClick={() => setPickupPreferencesForm({ ...pickupPreferencesForm, autoSelectStore: !pickupPreferencesForm.autoSelectStore })}
                          className={`relative w-9 h-5 rounded-full p-0.5 flex items-center shadow-sm transition-colors cursor-pointer ${pickupPreferencesForm.autoSelectStore ? 'bg-brand-blue-500 justify-end' : 'bg-brand-gray-200'}`}
                        >
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </button>
                      ) : (
                        <button className={`relative w-9 h-5 rounded-full p-0.5 flex items-center shadow-sm opacity-50 cursor-not-allowed transition-all ${pickupPreferencesForm.autoSelectStore ? 'bg-brand-blue-300 justify-end' : 'bg-brand-gray-200'}`} title="Click Edit to make changes">
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </button>
                      )}
                    </div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-brand-black mb-1">Pickup notifications</p>
                        <p className="text-xs text-brand-gray-600">Get notified when your order is ready for pickup</p>
                      </div>
                      {isEditingPickupPreferences ? (
                        <button 
                          onClick={() => setPickupPreferencesForm({ ...pickupPreferencesForm, pickupNotifications: !pickupPreferencesForm.pickupNotifications })}
                          className={`relative w-9 h-5 rounded-full p-0.5 flex items-center shadow-sm transition-colors cursor-pointer ${pickupPreferencesForm.pickupNotifications ? 'bg-brand-blue-500 justify-end' : 'bg-brand-gray-200'}`}
                        >
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </button>
                      ) : (
                        <button className={`relative w-9 h-5 rounded-full p-0.5 flex items-center shadow-sm opacity-50 cursor-not-allowed transition-all ${pickupPreferencesForm.pickupNotifications ? 'bg-brand-blue-300 justify-end' : 'bg-brand-gray-200'}`} title="Click Edit to make changes">
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </button>
                      )}
                    </div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-brand-black mb-1">Store events & promotions</p>
                        <p className="text-xs text-brand-gray-600">Receive updates about events and promotions at your preferred store</p>
                      </div>
                      {isEditingPickupPreferences ? (
                        <button 
                          onClick={() => setPickupPreferencesForm({ ...pickupPreferencesForm, storeEventsPromotions: !pickupPreferencesForm.storeEventsPromotions })}
                          className={`relative w-9 h-5 rounded-full p-0.5 flex items-center shadow-sm transition-colors cursor-pointer ${pickupPreferencesForm.storeEventsPromotions ? 'bg-brand-blue-500 justify-end' : 'bg-brand-gray-200'}`}
                        >
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </button>
                      ) : (
                        <button className={`relative w-9 h-5 rounded-full p-0.5 flex items-center shadow-sm opacity-50 cursor-not-allowed transition-all ${pickupPreferencesForm.storeEventsPromotions ? 'bg-brand-blue-300 justify-end' : 'bg-brand-gray-200'}`} title="Click Edit to make changes">
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other sections placeholder */}
            {activeSection !== 'overview' && activeSection !== 'account-details' && activeSection !== 'order-history' && activeSection !== 'wishlist' && activeSection !== 'payment' && activeSection !== 'addresses' && activeSection !== 'passkeys' && activeSection !== 'loyalty' && activeSection !== 'store-preferences' && (
              <div className="py-12 text-center">
                <p className="text-brand-gray-600">This section is coming soon</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddressModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-brand-black">
                  {editingAddressId ? 'Edit address' : 'Add new address'}
                </h2>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="p-2 text-brand-gray-500 hover:text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Form */}
              <div className="space-y-4">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-black mb-2">First Name</label>
                    <input
                      type="text"
                      value={addressForm.firstName || ''}
                      onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                      className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-black mb-2">Last Name</label>
                    <input
                      type="text"
                      value={addressForm.lastName || ''}
                      onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                      className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">Select Country</label>
                  <div className="relative">
                    <select
                      value={addressForm.country || 'United States'}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="w-full px-4 py-2 pr-10 border border-brand-gray-300 rounded-lg text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="Mexico">Mexico</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Address Line 1 */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">Address Line 1</label>
                  <input
                    type="text"
                    value={addressForm.addressLine1 || ''}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                    className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                    placeholder="415 Mission Street"
                  />
                </div>

                {/* Address Line 2 */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">Address Line 2</label>
                  <input
                    type="text"
                    value={addressForm.addressLine2 || ''}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                    className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                    placeholder="Address Line 2"
                  />
                </div>

                {/* Zip Code, City, State */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-black mb-2">Zip Code</label>
                    <input
                      type="text"
                      value={addressForm.zipCode || ''}
                      onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                      className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                      placeholder="94105"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-black mb-2">City</label>
                    <input
                      type="text"
                      value={addressForm.city || ''}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                      placeholder="San Francisco"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-black mb-2">UF</label>
                    <div className="relative">
                      <select
                        value={addressForm.state || ''}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="w-full px-4 py-2 pr-10 border border-brand-gray-300 rounded-lg text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="">Select State</option>
                        <option value="California">California</option>
                        <option value="New York">New York</option>
                        <option value="Texas">Texas</option>
                        <option value="Florida">Florida</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Instructions */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">Delivery Instructions (Optional)</label>
                  <textarea
                    value={addressForm.deliveryInstructions || ''}
                    onChange={(e) => setAddressForm({ ...addressForm, deliveryInstructions: e.target.value })}
                    className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                    placeholder="Leave at front door, ring doorbell, etc."
                    rows={3}
                  />
                  <p className="text-xs text-brand-gray-500 mt-1">Add special instructions for delivery drivers</p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-brand-gray-200">
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAddress}
                  className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Items Modal */}
      {showReturnModal && returningOrderId && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowReturnModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-brand-black">Return Items</h2>
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="p-2 text-brand-gray-500 hover:text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Order Info */}
              <div className="mb-6 p-4 bg-brand-gray-50 rounded-lg">
                <p className="text-sm text-brand-gray-600 mb-1">Order Number</p>
                <p className="text-base font-semibold text-brand-black">{returningOrderId}</p>
              </div>

              {/* Return Instructions */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-brand-black mb-3">Select items to return</h3>
                <div className="space-y-3">
                  {recentOrders.find(o => o.orderNumber === returningOrderId)?.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border border-brand-gray-200 rounded-lg">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-brand-blue-500 border-brand-gray-300 rounded focus:ring-brand-blue-500"
                      />
                      <div className="w-16 h-16 rounded-lg flex-shrink-0 relative bg-brand-gray-100 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-brand-black">{item.name}</p>
                        <p className="text-xs text-brand-gray-600">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Return Reason */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-brand-black mb-2">Reason for return</label>
                <div className="relative">
                  <select className="w-full px-4 py-2 pr-10 border border-brand-gray-300 rounded-lg text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent appearance-none bg-white">
                    <option value="">Select a reason</option>
                    <option value="defective">Defective or damaged</option>
                    <option value="wrong-item">Wrong item received</option>
                    <option value="not-as-described">Not as described</option>
                    <option value="changed-mind">Changed my mind</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Return Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-brand-black mb-2">Return method</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-brand-gray-200 rounded-lg cursor-pointer hover:border-brand-gray-300">
                    <input type="radio" name="return-method" value="mail" className="text-brand-blue-500" defaultChecked />
                    <div>
                      <p className="text-sm font-medium text-brand-black">Return by mail</p>
                      <p className="text-xs text-brand-gray-600">We&apos;ll email you a prepaid return label</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-brand-gray-200 rounded-lg cursor-pointer hover:border-brand-gray-300">
                    <input type="radio" name="return-method" value="store" className="text-brand-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-brand-black">Return to store</p>
                      <p className="text-xs text-brand-gray-600">Bring items to any Market Street location</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-brand-gray-200">
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle return submission
                    setShowReturnModal(false)
                    setReturningOrderId(null)
                  }}
                  className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors"
                >
                  Start Return
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteAccountModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-red-600">Delete Account</h2>
                <button
                  onClick={() => setShowDeleteAccountModal(false)}
                  className="p-2 text-brand-gray-500 hover:text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Warning Message */}
              <div className="mb-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <p className="text-sm text-red-800 font-medium mb-2">This action cannot be undone</p>
                  <p className="text-sm text-red-700">
                    Deleting your account will permanently remove all your data, including order history, wishlists, and saved payment methods.
                  </p>
                </div>
                <p className="text-sm text-brand-gray-600">
                  If you&apos;re sure you want to delete your account, please contact our support team. This process requires verification for security purposes.
                </p>
              </div>

              {/* Contact Support */}
              <div className="mb-6 p-4 bg-brand-gray-50 rounded-lg">
                <p className="text-sm font-medium text-brand-black mb-2">Contact Support</p>
                <p className="text-sm text-brand-gray-600 mb-3">To delete your account, please reach out to our support team:</p>
                <div className="space-y-2">
                  <a href="mailto:support@marketstreet.com" className="text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline block">
                    support@marketstreet.com
                  </a>
                  <a href="tel:+15551234567" className="text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline block">
                    +1 (555) 123-4567
                  </a>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-brand-gray-200">
                <button
                  onClick={() => setShowDeleteAccountModal(false)}
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // In a real app, this would open support contact or redirect
                    if (typeof window !== 'undefined') {
                    window.location.href = 'mailto:support@marketstreet.com?subject=Account Deletion Request'
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rename Wishlist Modal */}
      {showRenameWishlistModal && renamingWishlistId && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowRenameWishlistModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-brand-black">Rename Wishlist</h2>
                <button
                  onClick={() => setShowRenameWishlistModal(false)}
                  className="p-2 text-brand-gray-500 hover:text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-brand-black mb-2">Wishlist Name</label>
                <input
                  type="text"
                  value={newWishlistName}
                  onChange={(e) => setNewWishlistName(e.target.value)}
                  className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                  placeholder="Enter wishlist name"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-brand-gray-200">
                <button
                  onClick={() => setShowRenameWishlistModal(false)}
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRenameWishlist}
                  className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Wishlist Modal */}
      {showShareWishlistModal && sharingWishlistId && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowShareWishlistModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-brand-black">Share Wishlist</h2>
                <button
                  onClick={() => setShowShareWishlistModal(false)}
                  className="p-2 text-brand-gray-500 hover:text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-brand-black mb-2">Share Link</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://marketstreet.com/wishlist/${sharingWishlistId}`}
                    className="flex-1 px-4 py-2 border border-brand-gray-300 rounded-lg text-brand-black bg-brand-gray-50"
                  />
                  <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://marketstreet.com/wishlist/${sharingWishlistId}`)
                    showToastMessage('Link copied to clipboard!', 'success')
                  }}
                  className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-brand-gray-500 mt-2">Anyone with this link can view your wishlist</p>
              </div>
              <div className="mb-6">
                <p className="text-sm font-medium text-brand-black mb-3">Share via</p>
                <div className="flex items-center gap-3">
                  <button className="flex-1 px-4 py-2 border border-brand-gray-200 rounded-lg hover:bg-brand-gray-50 transition-colors">
                    <svg className="w-5 h-5 text-brand-gray-600 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                  <button className="flex-1 px-4 py-2 border border-brand-gray-200 rounded-lg hover:bg-brand-gray-50 transition-colors">
                    <svg className="w-5 h-5 text-brand-gray-600 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </button>
                  <button className="flex-1 px-4 py-2 border border-brand-gray-200 rounded-lg hover:bg-brand-gray-50 transition-colors">
                    <svg className="w-5 h-5 text-brand-gray-600 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.9.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-brand-gray-200">
                <button
                  onClick={() => setShowShareWishlistModal(false)}
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowPaymentModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-brand-black">Add Payment Method</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 text-brand-gray-500 hover:text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Form */}
              <div className="space-y-4">
                {/* Payment Method Type */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">Payment Method Type</label>
                  <div className="relative">
                    <select
                      value={paymentForm.type || 'visa'}
                      onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value as any })}
                      className="w-full px-4 py-2 pr-10 border border-brand-gray-300 rounded-lg text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="visa">Credit Card (Visa)</option>
                      <option value="mastercard">Credit Card (Mastercard)</option>
                      <option value="ach">Bank Account (ACH)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    value={paymentForm.cardholderName || ''}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cardholderName: e.target.value })}
                    className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                {/* Card Number (for credit cards) */}
                {(paymentForm.type === 'visa' || paymentForm.type === 'mastercard') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-brand-black mb-2">Card Number</label>
                      <input
                        type="text"
                        value={paymentForm.last4 || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 16)
                          setPaymentForm({ ...paymentForm, last4: value.slice(-4) })
                        }}
                        className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                        placeholder="1234 5678 9012 3456"
                        maxLength={16}
                      />
                    </div>

                    {/* Expiry Date */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-brand-black mb-2">Expiry Month</label>
                        <div className="relative">
                          <select
                            value={paymentForm.expiryMonth || ''}
                            onChange={(e) => setPaymentForm({ ...paymentForm, expiryMonth: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 pr-10 border border-brand-gray-300 rounded-lg text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent appearance-none bg-white"
                          >
                            <option value="">Month</option>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                              <option key={month} value={month}>
                                {String(month).padStart(2, '0')}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-4 h-4 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-black mb-2">Expiry Year</label>
                        <div className="relative">
                          <select
                            value={paymentForm.expiryYear || ''}
                            onChange={(e) => setPaymentForm({ ...paymentForm, expiryYear: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 pr-10 border border-brand-gray-300 rounded-lg text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent appearance-none bg-white"
                          >
                            <option value="">Year</option>
                          {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-4 h-4 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Bank Name (for ACH) */}
                {paymentForm.type === 'ach' && (
                  <div>
                    <label className="block text-sm font-medium text-brand-black mb-2">Bank Name</label>
                    <input
                      type="text"
                      value={paymentForm.bankName || ''}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                      className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                      placeholder="Bank Account Name"
                    />
                  </div>
                )}

                {/* Set as Default */}
                <div className="flex items-center gap-3 p-4 bg-brand-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="set-default"
                    checked={paymentForm.isDefault || false}
                    onChange={(e) => setPaymentForm({ ...paymentForm, isDefault: e.target.checked })}
                    className="w-5 h-5 text-brand-blue-500 border-brand-gray-300 rounded focus:ring-brand-blue-500"
                  />
                  <label htmlFor="set-default" className="text-sm text-brand-black cursor-pointer">
                    Set as default payment method
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-brand-gray-200">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Validate form
                    if (!paymentForm.cardholderName) {
                      alert('Please enter cardholder name')
                      return
                    }
                    if ((paymentForm.type === 'visa' || paymentForm.type === 'mastercard') && !paymentForm.last4) {
                      alert('Please enter card number')
                      return
                    }
                    if ((paymentForm.type === 'visa' || paymentForm.type === 'mastercard') && (!paymentForm.expiryMonth || !paymentForm.expiryYear)) {
                      alert('Please enter expiry date')
                      return
                    }
                    if (paymentForm.type === 'ach' && !paymentForm.bankName) {
                      alert('Please enter bank name')
                      return
                    }

                    // Add new payment method
                    const newPaymentMethod: PaymentMethod = {
                      id: `${paymentForm.type}-${Date.now()}`,
                      type: paymentForm.type as 'visa' | 'mastercard' | 'ach',
                      cardholderName: paymentForm.cardholderName || '',
                      isDefault: paymentForm.isDefault || false,
                      isSelected: false,
                      ...(paymentForm.type === 'ach' 
                        ? { bankName: paymentForm.bankName || '' }
                        : {
                            last4: paymentForm.last4 || '',
                            expiryMonth: paymentForm.expiryMonth,
                            expiryYear: paymentForm.expiryYear,
                          }
                      ),
                    }

                    // If setting as default, unset other defaults
                    if (newPaymentMethod.isDefault) {
                      setPaymentMethods(paymentMethods.map(pm => ({ ...pm, isDefault: false })))
                    }

                    setPaymentMethods([...paymentMethods, newPaymentMethod])
                    setShowPaymentModal(false)
                    setPaymentForm({
                      type: 'visa',
                      cardholderName: '',
                      last4: '',
                      expiryMonth: undefined,
                      expiryYear: undefined,
                      bankName: '',
                    })
                  }}
                  className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                >
                  Add Payment Method
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAvatarModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-brand-black">Change Profile Picture</h2>
                <button
                  onClick={() => {
                    setShowAvatarModal(false)
                    setAvatarPreview(null)
                  }}
                  className="p-2 text-brand-gray-500 hover:text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Avatar Preview */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 bg-brand-blue-500 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Preview"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : avatarImage ? (
                    <img 
                      src={avatarImage} 
                      alt={`${userName} ${userLastName}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-semibold text-white">{getUserInitials()}</span>
                  )}
                </div>
                <p className="text-sm text-brand-gray-600 text-center">
                  {avatarPreview ? 'Preview of your new profile picture' : 'Upload a new profile picture'}
                </p>
              </div>

              {/* Upload Options */}
              <div className="space-y-3 mb-6">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                  <div className="w-full px-4 py-3 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm cursor-pointer text-center">
                    Choose File
                  </div>
                </label>
                {avatarImage && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="w-full px-4 py-3 bg-white border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                  >
                    Remove Current Picture
                  </button>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-brand-gray-200">
                <button
                  onClick={() => {
                    setShowAvatarModal(false)
                    setAvatarPreview(null)
                  }}
                  className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black hover:bg-brand-gray-50 rounded-lg transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAvatar}
                  disabled={!avatarPreview}
                  className="px-4 py-2 text-sm font-medium bg-brand-blue-500 text-white hover:bg-brand-blue-600 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Select Interests Modal */}
      {showInterestsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => {
            setShowInterestsModal(false)
          }} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-brand-gray-200">
                <h2 className="text-xl font-semibold text-brand-black">Add Your Interests</h2>
                <button
                  onClick={() => {
                    setShowInterestsModal(false)
                  }}
                  className="text-brand-gray-400 hover:text-brand-black transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Category Tabs */}
              <div className="flex items-center gap-1 px-6 pt-4 border-b border-brand-gray-200">
                <button
                  onClick={() => setInterestsModalCategory('designStyles')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    interestsModalCategory === 'designStyles'
                      ? 'bg-white border-t border-l border-r border-brand-gray-200 text-brand-black'
                      : 'text-brand-gray-600 hover:text-brand-black'
                  }`}
                >
                  Design Styles
                </button>
                <button
                  onClick={() => setInterestsModalCategory('roomTypes')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    interestsModalCategory === 'roomTypes'
                      ? 'bg-white border-t border-l border-r border-brand-gray-200 text-brand-black'
                      : 'text-brand-gray-600 hover:text-brand-black'
                  }`}
                >
                  Room Types
                </button>
                <button
                  onClick={() => setInterestsModalCategory('materials')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    interestsModalCategory === 'materials'
                      ? 'bg-white border-t border-l border-r border-brand-gray-200 text-brand-black'
                      : 'text-brand-gray-600 hover:text-brand-black'
                  }`}
                >
                  Materials
                </button>
                <button
                  onClick={() => setInterestsModalCategory('aesthetics')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    interestsModalCategory === 'aesthetics'
                      ? 'bg-white border-t border-l border-r border-brand-gray-200 text-brand-black'
                      : 'text-brand-gray-600 hover:text-brand-black'
                  }`}
                >
                  Aesthetics
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {(() => {
                    const allOptions = interestsModalCategory === 'designStyles' 
                      ? ['Minimalist', 'Geometric', 'Abstract', 'Modern', 'Contemporary', 'Scandinavian', 'Bauhaus', 'Organic']
                      : interestsModalCategory === 'roomTypes'
                      ? ['Living Room', 'Bedroom', 'Office', 'Studio', 'Gallery', 'Kitchen', 'Dining', 'Entryway']
                      : interestsModalCategory === 'materials'
                      ? ['Ceramic', 'Metal', 'Wood', 'Glass', 'Stone', 'Resin', 'Concrete', 'Marble']
                      : ['Minimalist', 'Bold', 'Organic', 'Architectural', 'Sculptural', 'Industrial', 'Elegant', 'Playful']
                    
                    const currentSelected = interestsModalCategory === 'designStyles'
                      ? interestsForm.designStyles
                      : interestsModalCategory === 'roomTypes'
                      ? interestsForm.roomTypes
                      : interestsModalCategory === 'materials'
                      ? interestsForm.materials
                      : interestsForm.aesthetics

                    return allOptions.map((option) => {
                      const isSelected = currentSelected.includes(option)
                      return (
                        <label
                          key={option}
                          className="flex items-center gap-4 p-4 border border-brand-gray-200 rounded-lg cursor-pointer hover:border-brand-gray-300 hover:bg-brand-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-brand-black">{option}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (interestsModalCategory === 'designStyles') {
                                setInterestsForm({
                                  ...interestsForm,
                                  designStyles: e.target.checked
                                    ? [...interestsForm.designStyles, option]
                                    : interestsForm.designStyles.filter(s => s !== option)
                                })
                              } else if (interestsModalCategory === 'roomTypes') {
                                setInterestsForm({
                                  ...interestsForm,
                                  roomTypes: e.target.checked
                                    ? [...interestsForm.roomTypes, option]
                                    : interestsForm.roomTypes.filter(r => r !== option)
                                })
                              } else if (interestsModalCategory === 'materials') {
                                setInterestsForm({
                                  ...interestsForm,
                                  materials: e.target.checked
                                    ? [...interestsForm.materials, option]
                                    : interestsForm.materials.filter(m => m !== option)
                                })
                              } else {
                                setInterestsForm({
                                  ...interestsForm,
                                  aesthetics: e.target.checked
                                    ? [...interestsForm.aesthetics, option]
                                    : interestsForm.aesthetics.filter(a => a !== option)
                                })
                              }
                            }}
                            className="w-5 h-5 text-brand-blue-500 border-brand-gray-300 rounded focus:ring-brand-blue-500"
                          />
                        </label>
                      )
                    })
                  })()}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-brand-gray-200">
                <button
                  onClick={() => {
                    setShowInterestsModal(false)
                  }}
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowInterestsModal(false)
                  }}
                  className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Select Preferences Modal */}
      {showPreferencesModal && preferencesModalCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => {
            setShowPreferencesModal(false)
            setPreferencesModalCategory(null)
          }} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-brand-gray-200">
                <h2 className="text-xl font-semibold text-brand-black">Select Product Categories</h2>
                <button
                  onClick={() => {
                    setShowPreferencesModal(false)
                    setPreferencesModalCategory(null)
                  }}
                  className="text-brand-gray-400 hover:text-brand-black transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {['Geometric', 'Abstract', 'Modular', 'Premium', 'Sets'].map((category) => {
                    const isSelected = preferencesForm.productCategories.includes(category)
                    return (
                      <label
                        key={category}
                        className="flex items-center gap-4 p-4 border border-brand-gray-200 rounded-lg cursor-pointer hover:border-brand-gray-300 hover:bg-brand-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-brand-black">{category}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            setPreferencesForm({
                              ...preferencesForm,
                              productCategories: e.target.checked
                                ? [...preferencesForm.productCategories, category]
                                : preferencesForm.productCategories.filter(c => c !== category)
                            })
                          }}
                          className="w-5 h-5 text-brand-blue-500 border-brand-gray-300 rounded focus:ring-brand-blue-500"
                        />
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-brand-gray-200">
                <button
                  onClick={() => {
                    setShowPreferencesModal(false)
                    setPreferencesModalCategory(null)
                  }}
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowPreferencesModal(false)
                    setPreferencesModalCategory(null)
                  }}
                  className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <Toast 
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          allProducts={allProducts}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={(product, size, color) => {
            addToCart(product, 1, size, color)
            showToastMessage(`${product.name} added to cart`, 'success')
          }}
          onAddToWishlist={handleCuratedAddToWishlist}
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

      {/* Store Locator Modal */}
      <StoreLocatorModal
        isOpen={showStoreSelector}
        onClose={() => setShowStoreSelector(false)}
        onSelectStore={(store) => {
          setPreferredStoreForPickup({
            id: store.id,
            name: store.name,
            address: store.address,
            hours: store.hours,
          })
          setShowStoreSelector(false)
          showToastMessage(`Preferred store updated to ${store.name}`, 'success')
        }}
        selectedStoreId={preferredStoreForPickup.id}
      />

      {/* Add Authorized Person Modal */}
      {showAddPersonModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddPersonModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-brand-black">
                  Add Authorized Person
                </h2>
                <button
                  onClick={() => setShowAddPersonModal(false)}
                  className="p-2 text-brand-gray-500 hover:text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
    </div>

              {/* Modal Content */}
              <div className="space-y-4">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-black mb-2">First Name</label>
                    <input
                      type="text"
                      value={authorizedPersonForm.firstName}
                      onChange={(e) => setAuthorizedPersonForm({ ...authorizedPersonForm, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                      placeholder="First Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-black mb-2">Last Name</label>
                    <input
                      type="text"
                      value={authorizedPersonForm.lastName}
                      onChange={(e) => setAuthorizedPersonForm({ ...authorizedPersonForm, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                      placeholder="Last Name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">Email Address</label>
                  <input
                    type="email"
                    value={authorizedPersonForm.email}
                    onChange={(e) => setAuthorizedPersonForm({ ...authorizedPersonForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>

                {/* Relationship */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">Relationship</label>
                  <div className="relative">
                    <select
                      value={authorizedPersonForm.relationship}
                      onChange={(e) => setAuthorizedPersonForm({ ...authorizedPersonForm, relationship: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">Select Relationship</option>
                      <option value="spouse">Spouse</option>
                      <option value="family-member">Family Member</option>
                      <option value="friend">Friend</option>
                      <option value="colleague">Colleague</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Info Message */}
                <div className="p-3 bg-brand-blue-50 border border-brand-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-brand-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-brand-blue-800">
                      This person will be authorized to pick up orders on your behalf. They will need to show a valid ID matching the name provided when picking up orders.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-brand-gray-200">
                <button
                  onClick={() => setShowAddPersonModal(false)}
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!authorizedPersonForm.firstName || !authorizedPersonForm.lastName || !authorizedPersonForm.email || !authorizedPersonForm.relationship) {
                      showToastMessage('Please fill in all required fields', 'error')
                      return
                    }
                    // TODO: Add person to authorized list
                    showToastMessage(`${authorizedPersonForm.firstName} ${authorizedPersonForm.lastName} added as authorized pickup person`)
                    setShowAddPersonModal(false)
                    setAuthorizedPersonForm({
                      firstName: '',
                      lastName: '',
                      email: '',
                      relationship: '',
                    })
                  }}
                  className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Gift Card Modal */}
      {showAddGiftCardModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddGiftCardModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-brand-black">Add Gift Card</h2>
                <button
                  onClick={() => setShowAddGiftCardModal(false)}
                  className="p-2 text-brand-gray-500 hover:text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">Gift Card Number</label>
                  <input
                    type="text"
                    value={giftCardForm.cardNumber}
                    onChange={(e) => setGiftCardForm({ ...giftCardForm, cardNumber: e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim() })}
                    className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">PIN or Security Code</label>
                  <input
                    type="text"
                    value={giftCardForm.pin}
                    onChange={(e) => setGiftCardForm({ ...giftCardForm, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                    placeholder="1234"
                    maxLength={4}
                  />
                </div>
                <div className="p-3 bg-brand-blue-50 border border-brand-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-brand-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-brand-blue-800">
                      The PIN is typically found on the back of your gift card or in the email confirmation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-brand-gray-200">
                <button
                  onClick={() => setShowAddGiftCardModal(false)}
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!giftCardForm.cardNumber || !giftCardForm.pin) {
                      showToastMessage('Please enter both card number and PIN', 'error')
                      return
                    }
                    // Extract last 4 digits
                    const cardNumber = giftCardForm.cardNumber.replace(/\s/g, '')
                    const last4 = cardNumber.slice(-4)
                    // Add new gift card
                    const newCard = {
                      id: `gc-${Date.now()}`,
                      balance: 0, // Would be fetched from API
                      last4: last4,
                    }
                    setGiftCards([...giftCards, newCard])
                    setShowAddGiftCardModal(false)
                    setGiftCardForm({ cardNumber: '', pin: '' })
                    showToastMessage('Gift card added successfully')
                  }}
                  className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                >
                  Add Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Gift Card Confirmation Modal */}
      {showRemoveGiftCardModal && giftCardToRemove && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => {
            setShowRemoveGiftCardModal(false)
            setGiftCardToRemove(null)
          }} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-brand-black">Remove Gift Card</h2>
                <button
                  onClick={() => {
                    setShowRemoveGiftCardModal(false)
                    setGiftCardToRemove(null)
                  }}
                  className="p-2 text-brand-gray-500 hover:text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="mb-6">
                {(() => {
                  const card = giftCards.find(c => c.id === giftCardToRemove)
                  if (!card) {
                    return <p className="text-sm text-brand-gray-600">Gift card not found.</p>
                  }
                  const cardBalance = card.balance
                  const cardLast4 = card.last4
                  return (
                    <>
                      <p className="text-sm text-brand-gray-600 mb-4">
                        Are you sure you want to remove this gift card?
                      </p>
                      <div className="p-4 bg-brand-gray-50 border border-brand-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-brand-black">Gift Card</span>
                          <svg className="w-5 h-5 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <p className="text-xl font-semibold text-brand-black mb-1">${cardBalance.toFixed(2)}</p>
                        <p className="text-xs text-brand-gray-500">Card ending in {cardLast4}</p>
                      </div>
                      {cardBalance > 0 && (
                        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-xs text-orange-800">
                              This card has a remaining balance of ${cardBalance.toFixed(2)}. You will not be able to use this balance after removing the card.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRemoveGiftCardModal(false)
                    setGiftCardToRemove(null)
                  }}
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (giftCardToRemove) {
                      setGiftCards(giftCards.filter(c => c.id !== giftCardToRemove))
                      setShowRemoveGiftCardModal(false)
                      setGiftCardToRemove(null)
                      showToastMessage('Gift card removed successfully')
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                >
                  Remove Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Payment Method Confirmation Modal */}
      {showRemovePaymentMethodModal && paymentMethodToRemove && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => {
            setShowRemovePaymentMethodModal(false)
            setPaymentMethodToRemove(null)
          }} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-brand-black">Remove Payment Method</h2>
                <button
                  onClick={() => {
                    setShowRemovePaymentMethodModal(false)
                    setPaymentMethodToRemove(null)
                  }}
                  className="p-2 text-brand-gray-500 hover:text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="mb-6">
                {(() => {
                  const method = paymentMethods.find(m => m.id === paymentMethodToRemove)
                  if (!method) {
                    return <p className="text-sm text-brand-gray-600">Payment method not found.</p>
                  }
                  const methodDisplayName = method.type === 'visa' 
                    ? `Visa **** ${method.last4}`
                    : method.type === 'mastercard'
                    ? `Mastercard **** ${method.last4}`
                    : `ACH ${method.bankName}`
                  const methodDetails = method.type === 'ach'
                    ? method.cardholderName
                    : `${String(method.expiryMonth || '').padStart(2, '0')}/${method.expiryYear || ''} | ${method.cardholderName}`
                  
                  return (
                    <>
                      <p className="text-sm text-brand-gray-600 mb-4">
                        Are you sure you want to remove this payment method?
                      </p>
                      <div className="p-4 bg-brand-gray-50 border border-brand-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-brand-black">Payment Method</span>
                          {method.type === 'visa' && (
                            <div className="w-10 h-6 bg-[#1434CB] rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">VISA</span>
                            </div>
                          )}
                          {method.type === 'mastercard' && (
                            <div className="w-10 h-6 bg-[#EB001B] rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">MC</span>
                            </div>
                          )}
                          {method.type === 'ach' && (
                            <svg className="w-6 h-6 text-brand-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          )}
                        </div>
                        <p className="text-base font-semibold text-brand-black mb-1">{methodDisplayName}</p>
                        <p className="text-xs text-brand-gray-500">{methodDetails}</p>
                        {method.isDefault && (
                          <div className="mt-2">
                            <span className="px-2 py-0.5 bg-brand-blue-100 text-brand-blue-700 text-xs font-semibold rounded">
                              Default
                            </span>
                          </div>
                        )}
                      </div>
                      {method.isDefault && (
                        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-xs text-orange-800">
                              This is your default payment method. Removing it will automatically set another payment method as default if available.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRemovePaymentMethodModal(false)
                    setPaymentMethodToRemove(null)
                  }}
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (paymentMethodToRemove) {
                      const methodToRemove = paymentMethods.find(m => m.id === paymentMethodToRemove)
                      const wasDefault = methodToRemove?.isDefault
                      
                      setPaymentMethods(prev => {
                        const filtered = prev.filter(m => m.id !== paymentMethodToRemove)
                        // If removed method was default and there are other methods, set first one as default
                        if (wasDefault && filtered.length > 0) {
                          return filtered.map((m, index) => ({
                            ...m,
                            isDefault: index === 0,
                          }))
                        }
                        return filtered
                      })
                      
                      setShowRemovePaymentMethodModal(false)
                      setPaymentMethodToRemove(null)
                      showToastMessage('Payment method removed successfully')
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Address Confirmation Modal */}
      {showRemoveAddressModal && addressToRemove && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => {
            setShowRemoveAddressModal(false)
            setAddressToRemove(null)
          }} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-brand-black">Remove Address</h2>
                <button
                  onClick={() => {
                    setShowRemoveAddressModal(false)
                    setAddressToRemove(null)
                  }}
                  className="p-2 text-brand-gray-500 hover:text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="mb-6">
                {(() => {
                  const address = addresses.find(a => a.id === addressToRemove)
                  if (!address) {
                    return <p className="text-sm text-brand-gray-600">Address not found.</p>
                  }
                  
                  return (
                    <>
                      <p className="text-sm text-brand-gray-600 mb-4">
                        Are you sure you want to remove this address?
                      </p>
                      <div className="p-4 bg-brand-gray-50 border border-brand-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base font-medium text-brand-black">
                            {address.firstName} {address.lastName}
                          </span>
                          {address.isDefault && (
                            <span className="px-2 py-0.5 bg-brand-blue-100 text-brand-blue-700 text-xs font-semibold rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-brand-gray-600 mb-1">{address.addressLine1}</p>
                        <p className="text-sm text-brand-gray-600">
                          {address.zipCode}, {address.city}, {address.state}, {address.country}
                        </p>
                      </div>
                      {address.isDefault && (
                        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-xs text-orange-800">
                              This is your default address. Removing it will automatically set another address as default if available.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRemoveAddressModal(false)
                    setAddressToRemove(null)
                  }}
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (addressToRemove) {
                      handleRemoveAddress(addressToRemove)
                      setShowRemoveAddressModal(false)
                      setAddressToRemove(null)
                      showToastMessage('Address removed successfully')
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowChangePasswordModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-brand-black mb-1">Password & Security</h2>
                <p className="text-sm text-brand-gray-600">Manage your password and security settings</p>
              </div>

              {/* Modal Content */}
              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                    placeholder="Enter current password"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>

                {/* Password Requirements */}
                <div className="pt-2">
                  <p className="text-sm font-medium text-brand-black mb-3">Password Requirements</p>
                  <div className="space-y-2">
                    {(() => {
                      const requirements = [
                        {
                          label: 'At least 8 characters',
                          met: passwordForm.newPassword.length >= 8,
                        },
                        {
                          label: 'At least one uppercase letter',
                          met: /[A-Z]/.test(passwordForm.newPassword),
                        },
                        {
                          label: 'At least one lowercase letter',
                          met: /[a-z]/.test(passwordForm.newPassword),
                        },
                        {
                          label: 'At least one number',
                          met: /[0-9]/.test(passwordForm.newPassword),
                        },
                        {
                          label: 'At least one special character',
                          met: /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword),
                        },
                      ]
                      return requirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <svg 
                            className={`w-5 h-5 flex-shrink-0 ${req.met ? 'text-brand-blue-600' : 'text-brand-gray-300'}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <p className={`text-sm ${req.met ? 'text-brand-black' : 'text-brand-gray-500'}`}>
                            {req.label}
                          </p>
                        </div>
                      ))
                    })()}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-brand-gray-200">
                <button
                  onClick={() => {
                    setShowChangePasswordModal(false)
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    })
                  }}
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Validate password requirements
                    const requirements = [
                      passwordForm.newPassword.length >= 8,
                      /[A-Z]/.test(passwordForm.newPassword),
                      /[a-z]/.test(passwordForm.newPassword),
                      /[0-9]/.test(passwordForm.newPassword),
                      /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword),
                    ]
                    const allRequirementsMet = requirements.every(req => req === true)
                    
                    if (!passwordForm.currentPassword) {
                      showToastMessage('Please enter your current password', 'error')
                      return
                    }
                    if (!passwordForm.newPassword) {
                      showToastMessage('Please enter a new password', 'error')
                      return
                    }
                    if (!allRequirementsMet) {
                      showToastMessage('Please meet all password requirements', 'error')
                      return
                    }
                    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                      showToastMessage('New passwords do not match', 'error')
                      return
                    }
                    if (passwordForm.currentPassword === passwordForm.newPassword) {
                      showToastMessage('New password must be different from current password', 'error')
                      return
                    }
                    
                    // In a real app, this would make an API call to change the password
                    showToastMessage('Password changed successfully')
                    setShowChangePasswordModal(false)
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    })
                  }}
                  className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Passkey Modal */}
      {showAddPasskeyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddPasskeyModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-brand-black mb-1">Add Passkey</h2>
                  <p className="text-sm text-brand-gray-600">Set up a passkey for faster, more secure sign-in</p>
                </div>
                <button
                  onClick={() => setShowAddPasskeyModal(false)}
                  className="p-2 text-brand-gray-500 hover:text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="mb-6">
                <div className="p-4 bg-brand-blue-50 border border-brand-blue-200 rounded-lg mb-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-brand-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-brand-blue-800 mb-1">What happens next?</p>
                      <p className="text-xs text-brand-blue-700">
                        You&apos;ll be prompted to use your device&apos;s biometric authentication (Face ID, Touch ID, or Windows Hello) or enter your device PIN to create the passkey.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-brand-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm text-brand-gray-700">More secure than passwords</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-brand-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm text-brand-gray-700">Faster sign-in experience</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-brand-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm text-brand-gray-700">Works across all your devices</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowAddPasskeyModal(false)}
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && 'PublicKeyCredential' in window) {
                      // Close modal first, then trigger WebAuthn
                      setShowAddPasskeyModal(false)
                      // In a real app, this would trigger WebAuthn API
                      // For now, we'll simulate adding a passkey
                      setTimeout(() => {
                        const deviceName = navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')
                          ? 'iPhone/iPad'
                          : navigator.userAgent.includes('Mac')
                          ? 'MacBook'
                          : navigator.userAgent.includes('Windows')
                          ? 'Windows PC'
                          : 'Device'
                        
                        const newPasskey: Passkey = {
                          id: `passkey-${Date.now()}`,
                          name: `${deviceName} - ${new Date().toLocaleDateString()}`,
                          createdAt: new Date().toISOString().split('T')[0],
                          lastUsed: undefined,
                          deviceType: 'device',
                        }
                        setPasskeys([...passkeys, newPasskey])
                        showToastMessage('Passkey added successfully')
                      }, 500)
                    } else {
                      showToastMessage('Passkeys are not supported in this browser', 'error')
                      setShowAddPasskeyModal(false)
                    }
                  }}
                  className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Passkey Confirmation Modal */}
      {showRemovePasskeyModal && passkeyToRemove && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => {
            setShowRemovePasskeyModal(false)
            setPasskeyToRemove(null)
          }} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-brand-black">Remove Passkey</h2>
                <button
                  onClick={() => {
                    setShowRemovePasskeyModal(false)
                    setPasskeyToRemove(null)
                  }}
                  className="p-2 text-brand-gray-500 hover:text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="mb-6">
                {(() => {
                  const passkey = passkeys.find(p => p.id === passkeyToRemove)
                  if (!passkey) {
                    return <p className="text-sm text-brand-gray-600">Passkey not found.</p>
                  }
                  
                  return (
                    <>
                      <p className="text-sm text-brand-gray-600 mb-4">
                        Are you sure you want to remove this passkey?
                      </p>
                      <div className="p-4 bg-brand-gray-50 border border-brand-gray-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-brand-blue-100 rounded-lg flex items-center justify-center">
                            {passkey.deviceType === 'device' ? (
                              <svg className="w-7 h-7 text-brand-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg className="w-7 h-7 text-brand-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-brand-black">{passkey.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-brand-gray-600">Created {new Date(passkey.createdAt).toLocaleDateString()}</p>
                              {passkey.lastUsed && (
                                <>
                                  <span className="text-xs text-brand-gray-400">•</span>
                                  <p className="text-xs text-brand-gray-600">Last used {new Date(passkey.lastUsed).toLocaleDateString()}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <p className="text-xs text-orange-800">
                            You will need to use your password or another passkey to sign in after removing this passkey.
                          </p>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRemovePasskeyModal(false)
                    setPasskeyToRemove(null)
                  }}
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (passkeyToRemove) {
                      setPasskeys(passkeys.filter(p => p.id !== passkeyToRemove))
                      setShowRemovePasskeyModal(false)
                      setPasskeyToRemove(null)
                      showToastMessage('Passkey removed successfully')
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credit History Modal */}
      {showCreditHistory && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowCreditHistory(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full p-6" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-brand-black">Store Credit History</h2>
                  <p className="text-sm text-brand-gray-600 mt-1">View your store credit transactions and balance history</p>
                </div>
                <button
                  onClick={() => setShowCreditHistory(false)}
                  className="p-2 text-brand-gray-500 hover:text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Current Balance Summary */}
              <div className="mb-6 p-4 bg-brand-blue-50 border border-brand-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-brand-gray-600 mb-1">Current Balance</p>
                    <p className="text-3xl font-semibold text-brand-black">$50.00</p>
                  </div>
                  <svg className="w-12 h-12 text-brand-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              {/* Transaction History */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border border-brand-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brand-black">Credit Added</p>
                      <p className="text-xs text-brand-gray-500">Return - Order #INV001</p>
                      <p className="text-xs text-brand-gray-400">Sep 15, 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">+$50.00</p>
                    <p className="text-xs text-brand-gray-500">Balance: $50.00</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-brand-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brand-black">Credit Used</p>
                      <p className="text-xs text-brand-gray-500">Purchase - Order #INV002</p>
                      <p className="text-xs text-brand-gray-400">Aug 20, 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-600">-$25.00</p>
                    <p className="text-xs text-brand-gray-500">Balance: $25.00</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-brand-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brand-black">Credit Added</p>
                      <p className="text-xs text-brand-gray-500">Return - Order #INV003</p>
                      <p className="text-xs text-brand-gray-400">Jul 10, 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">+$25.00</p>
                    <p className="text-xs text-brand-gray-500">Balance: $25.00</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-brand-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brand-black">Credit Added</p>
                      <p className="text-xs text-brand-gray-500">Promotional Credit</p>
                      <p className="text-xs text-brand-gray-400">Jun 1, 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">+$25.00</p>
                    <p className="text-xs text-brand-gray-500">Balance: $25.00</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end mt-6 pt-6 border-t border-brand-gray-200">
                <button
                  onClick={() => setShowCreditHistory(false)}
                  className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

