'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import OrderDetailPage from '../../../components/OrderDetailPage'
import ErrorBoundary from '../../../components/ErrorBoundary'

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

// Mock function to fetch order - in production, this would be an API call
// This allows guest orders to be viewed by order number
function getOrderByNumber(orderNumber: string): Order | null {
  // Mock orders database - in production, this would query your backend
  const mockOrders: Order[] = [
    {
      orderNumber: 'INV001',
      status: 'Partially Delivered',
      method: 'Credit Card',
      amount: '$54.00',
      items: [
        {
          image: '/images/products/pure-cube-white-1.png',
          name: 'Pure Cube',
          id: 'item-1',
          quantity: 1,
          color: 'Grey',
          size: 'XL',
          price: 15.00,
          originalPrice: 20.00,
          store: 'Market Street San Francisco',
          shippingGroup: 'shipment-1',
        },
        {
          image: '/images/products/steady-prism-1.png',
          name: 'Steady Prism',
          id: 'item-2',
          quantity: 1,
          color: 'Grey',
          size: 'XL',
          price: 15.00,
          originalPrice: 20.00,
          store: 'Market Street New York',
          shippingGroup: 'shipment-1',
        },
        {
          image: '/images/products/soft-sphere-1.png',
          name: 'Soft Sphere',
          id: 'item-3',
          quantity: 1,
          color: 'Grey',
          size: 'XL',
          price: 15.00,
          originalPrice: 20.00,
          store: 'Market Street San Francisco',
          shippingGroup: 'shipment-2',
        },
        {
          image: '/images/products/solid-cylinder-1.png',
          name: 'Solid Cylinder',
          id: 'item-4',
          quantity: 1,
          color: 'Grey',
          size: 'XL',
          price: 15.00,
          originalPrice: 20.00,
          store: 'Market Street New York',
          shippingGroup: 'shipment-2',
        },
      ],
      subtotal: 60.00,
      promotions: -10.00,
      shipping: 0.00,
      tax: 4.00,
      total: 54.00,
      paymentInfo: 'VISA Ending in 1234',
      shippingAddress: 'John Doe, 415 Mission Street, 94105, San Francisco, CA, United States',
      shippingGroups: [
        {
          groupId: 'shipment-1',
          store: 'Multiple Stores',
          status: 'Delivered',
          trackingNumber: '1Z999AA10123456784',
          carrier: 'UPS',
          carrierTrackingUrl: 'https://www.ups.com/track?tracknum=1Z999AA10123456784',
          deliveryDate: 'Sep 15, 2024',
          shippingMethod: 'Free | Standard Shipping',
          shippingAddress: 'John Doe, 415 Mission Street, 94105, San Francisco, CA, United States',
        },
        {
          groupId: 'shipment-2',
          store: 'Multiple Stores',
          status: 'In Transit',
          trackingNumber: '1Z999AA10234567890',
          carrier: 'UPS',
          carrierTrackingUrl: 'https://www.ups.com/track?tracknum=1Z999AA10234567890',
          deliveryDate: 'Sep 18-19, 2024',
          shippingMethod: 'Free | Standard Shipping',
          shippingAddress: 'Jane Doe, 789 Market Street, 94102, San Francisco, CA, United States',
        },
      ],
      canReturn: true,
      canCancel: false,
      returnDeadline: 'Oct 15, 2024',
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
    },
    {
      orderNumber: 'INV003',
      status: 'Ready for Pickup',
      method: 'Credit Card',
      amount: '$45.00',
      items: [
        {
          image: '/images/products/pure-cube-white-1.png',
          name: 'Pure Cube',
          id: 'item-1',
          quantity: 1,
          color: 'White',
          size: 'One Size',
          price: 15.00,
          originalPrice: 20.00,
          store: 'Market Street San Francisco',
          shippingGroup: 'pickup-sf',
        },
        {
          image: '/images/products/steady-prism-1.png',
          name: 'Steady Prism',
          id: 'item-2',
          quantity: 2,
          color: 'Grey',
          size: 'One Size',
          price: 15.00,
          originalPrice: 20.00,
          store: 'Market Street San Francisco',
          shippingGroup: 'pickup-sf',
        },
      ],
      subtotal: 45.00,
      promotions: 0.00,
      shipping: 0.00,
      tax: 3.38,
      total: 48.38,
      paymentInfo: 'VISA Ending in 5678',
      shippingAddress: 'John Doe, 415 Mission Street, 94105, San Francisco, CA, United States',
      isBOPIS: true,
      pickupLocation: 'Market Street San Francisco',
      pickupAddress: '415 Mission Street, San Francisco, CA 94105',
      pickupReadyDate: 'Sep 16, 2024',
      pickupDate: 'Sep 16-20, 2024',
      shippingGroups: [
        {
          groupId: 'pickup-sf',
          store: 'Market Street San Francisco',
          status: 'Ready for Pickup',
          pickupLocation: 'Market Street San Francisco',
          pickupAddress: '415 Mission Street, San Francisco, CA 94105',
          pickupReadyDate: 'Sep 16, 2024',
          pickupDate: 'Sep 16-20, 2024',
          isBOPIS: true,
        },
      ],
      canReturn: true,
      canCancel: true,
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
    },
    {
      orderNumber: 'INV002',
      status: 'In Transit',
      method: 'Credit Card',
      amount: '$45.00',
      items: [
        {
          image: '/images/products/pure-cube-white-1.png',
          name: 'Pure Cube',
          id: 'item-1',
          quantity: 2,
          color: 'White',
          size: 'One Size',
          price: 15.00,
        },
      ],
      subtotal: 30.00,
      promotions: 0.00,
      shipping: 10.00,
      tax: 3.00,
      total: 43.00,
      paymentInfo: 'VISA Ending in 5678',
      shippingAddress: 'Jane Smith, 123 Main St, 10001, New York, NY, United States',
      shippingMethod: 'Standard Shipping',
      deliveryDate: 'Sep 20-22, 2024',
      trackingNumber: '1Z999AA10987654321',
      carrier: 'UPS',
      carrierTrackingUrl: 'https://www.ups.com/track?tracknum=1Z999AA10987654321',
      canReturn: false,
      canCancel: true,
      customerName: 'Jane Smith',
      customerEmail: 'jane.smith@example.com',
    },
    {
      orderNumber: 'INV004',
      status: 'Cancelled',
      method: 'Credit Card',
      amount: '$95.92',
      items: [
        {
          image: '/images/products/pure-cube-gray-1.png',
          name: 'Pure Cube',
          id: 'item-1',
          quantity: 1,
          color: 'Gray',
          size: 'M',
          price: 49.00,
          originalPrice: 49.00,
          store: 'Market Street San Francisco',
          shippingGroup: 'canceled-group', // A dummy group for canceled items
        },
        {
          image: '/images/products/fine-cone-1.png',
          name: 'Fine Cone',
          id: 'item-2',
          quantity: 1,
          color: 'Black',
          size: 'L',
          price: 39.00,
          originalPrice: 39.00,
          store: 'Market Street New York',
          shippingGroup: 'canceled-group',
        },
      ],
      subtotal: 88.00,
      promotions: 0.00,
      shipping: 0.00,
      tax: 7.92,
      total: 95.92,
      paymentInfo: 'VISA Ending in 3456',
      shippingAddress: 'John Doe, 415 Mission Street, 94105, San Francisco, CA, United States',
      shippingMethod: 'Free | Standard Shipping',
      deliveryDate: 'N/A', // Canceled orders don't have a delivery date
      canReturn: false,
      canCancel: false,
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
    },
  ]

  return mockOrders.find(order => order.orderNumber === orderNumber) || null
}

export default function OrderPage() {
  const params = useParams()
  const orderNumber = params?.orderNumber as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderNumber) {
      const foundOrder = getOrderByNumber(orderNumber)
      setOrder(foundOrder)
      setLoading(false)
    }
  }, [orderNumber])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue-500"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-brand-black mb-4">Order Not Found</h1>
            <p className="text-brand-gray-600 mb-6">
              The order number &quot;{orderNumber}&quot; could not be found.
            </p>
            <a
              href="/"
              className="text-brand-blue-500 hover:text-brand-blue-600 hover:underline font-medium"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <OrderDetailPage order={order} />
    </ErrorBoundary>
  )
}
