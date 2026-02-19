'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCart, clearCart } from '../lib/cart'
import { getCurrentUser, User } from '../lib/auth'
import { CartItem } from './MiniCart'
import Toast from './Toast'
import StoreLocatorModal from './StoreLocatorModal'
import ModalHeader from './ModalHeader'

// ===========================
// Types & Interfaces
// ===========================

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
  phone?: string
  isDefault?: boolean
}

interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
  estimatedDelivery: string
}

interface PaymentMethod {
  id: string
  type: 'card' | 'paypal' | 'affirm' | 'klarna' | 'ach'
  lastFour?: string
  brand?: string
  expiryMonth?: string
  expiryYear?: string
  isDefault?: boolean
  billingAddressId?: string | null // null means "same as shipping address"
  bankName?: string
  cardholderName?: string
}

interface Store {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  hours: string
  pickupTime?: string
  distance?: number
}

type CheckoutStep = 'contact' | 'shipping' | 'store-pickup' | 'shipping-method' | 'payment' | 'review'
type CheckoutMode = 'guest' | 'registered' | 'multiship'

// ===========================
// Mock Data
// ===========================

const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: 'Delivered in 5-7 business days',
    price: 0,
    estimatedDelivery: '5-7 business days',
  },
  {
    id: 'express',
    name: 'Express Shipping',
    description: 'Delivered in 2-3 business days',
    price: 9.99,
    estimatedDelivery: '2-3 business days',
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    description: 'Delivered next business day',
    price: 19.99,
    estimatedDelivery: 'Next business day',
  },
]

const SAVED_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    firstName: 'John',
    lastName: 'Doe',
    addressLine1: '415 Mission Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'United States',
    phone: '+1 (415) 555-0100',
    isDefault: true,
  },
  {
    id: 'addr-2',
    firstName: 'Eva',
    lastName: 'Smith',
    addressLine1: '456 Broadway',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'United States',
    phone: '+1 (415) 555-0200',
  },
  {
    id: 'addr-3',
    firstName: 'Mary',
    lastName: 'Doe',
    addressLine1: '987 Grand Avenue',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94607',
    country: 'United States',
    phone: '+1 (510) 555-0300',
  },
]

const PAYMENT_COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
] as const

type PaymentCountryCode = typeof PAYMENT_COUNTRIES[number]['code']

const PAYMENT_METHODS_BY_COUNTRY: Record<PaymentCountryCode, Array<{ id: string, name: string, type: 'credit-card' | 'ach' | 'sepa' | 'pix' }>> = {
  US: [
    { id: 'credit-card', name: 'Credit Card', type: 'credit-card' },
    { id: 'ach', name: 'ACH', type: 'ach' },
  ],
  FR: [
    { id: 'credit-card', name: 'Credit Card', type: 'credit-card' },
    { id: 'sepa', name: 'SEPA Direct Debit', type: 'sepa' },
  ],
  BR: [
    { id: 'credit-card', name: 'Credit Card', type: 'credit-card' },
    { id: 'pix', name: 'PIX', type: 'pix' },
  ],
}

const SAVED_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card-1',
    type: 'card',
    lastFour: '4242',
    brand: 'Visa',
    expiryMonth: '12',
    expiryYear: '2027',
    isDefault: true,
    billingAddressId: null, // Same as shipping address
  },
  {
    id: 'card-2',
    type: 'card',
    lastFour: '8888',
    brand: 'Mastercard',
    expiryMonth: '06',
    expiryYear: '2026',
    billingAddressId: null, // Same as shipping address
  },
]

// ===========================
// Sub-Components
// ===========================

// Express Payment Buttons - Using SVG images from resources folder
function ExpressPaymentButtons({ onPayment }: { onPayment: (method: string) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-brand-gray-600 text-center">Express Checkout</p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {/* Google Pay */}
        <button
          onClick={() => onPayment('google-pay')}
          className="flex items-center justify-center h-10 rounded-md hover:opacity-90 transition-opacity overflow-hidden bg-black"
        >
          <img 
            src="/images/Google Pay Button.svg" 
            alt="Google Pay" 
            className="h-full w-full object-contain"
          />
        </button>
        
        {/* Apple Pay */}
        <button
          onClick={() => onPayment('apple-pay')}
          className="flex items-center justify-center h-10 rounded-md hover:opacity-90 transition-opacity overflow-hidden bg-black"
        >
          <img 
            src="/images/Apple Pay Button.svg" 
            alt="Apple Pay" 
            className="h-full w-full object-contain"
          />
        </button>
        
        {/* PayPal */}
        <button
          onClick={() => onPayment('paypal')}
          className="flex items-center justify-center h-10 rounded-md hover:opacity-90 transition-opacity overflow-hidden bg-payment-paypal-yellow"
        >
          <img 
            src="/images/yellow.svg" 
            alt="PayPal" 
            className="h-full w-full object-contain"
          />
        </button>
        
        {/* Venmo */}
        <button
          onClick={() => onPayment('venmo')}
          className="flex items-center justify-center h-10 rounded-md hover:opacity-90 transition-opacity overflow-hidden bg-payment-venmo-blue"
        >
          <img 
            src="/images/blue.svg" 
            alt="Venmo" 
            className="h-full w-full object-contain"
          />
        </button>
        
        {/* Amazon Pay */}
        <button
          onClick={() => onPayment('amazon-pay')}
          className="flex items-center justify-center h-10 rounded-md hover:opacity-90 transition-opacity overflow-hidden bg-payment-amazon-gray col-span-2 sm:col-span-1"
        >
          <img 
            src="/images/yellow 2.svg" 
            alt="Amazon Pay" 
            className="h-full w-full object-contain"
          />
        </button>
      </div>
    </div>
  )
}

// Section Card Component
function SectionCard({ 
  title, 
  isActive, 
  isCompleted,
  isUpcoming,
  onEdit,
  summary,
  headerAction,
  children 
}: { 
  title: string
  isActive: boolean
  isCompleted: boolean
  isUpcoming: boolean
  onEdit?: () => void
  summary?: React.ReactNode
  headerAction?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className={`bg-white border rounded-lg shadow-md transition-all ${
      isActive ? 'border-brand-blue-200' : 'border-brand-gray-200'
    }`}>
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-brand-gray-200">
        <h2 className="text-lg font-semibold text-brand-black tracking-tight">{title}</h2>
        <div className="flex items-center gap-3">
          {/* Header action is always visible when provided */}
          {headerAction}
          {/* Edit button only shows when completed and not currently active */}
          {isCompleted && onEdit && !isActive && (
            <button
              onClick={onEdit}
              className="text-sm text-brand-blue-500 hover:text-brand-blue-600 font-medium"
            >
              Edit
            </button>
          )}
        </div>
      </div>
      
      {isCompleted && summary && !isActive ? (
        <div className="px-4 md:px-6 py-4">
          {summary}
        </div>
      ) : isUpcoming ? (
        <div className="px-4 md:px-6 py-4">
          <p className="text-sm text-brand-gray-400">Complete previous steps to continue</p>
        </div>
      ) : (
        <div className="px-4 md:px-6 py-4">
          {children}
        </div>
      )}
    </div>
  )
}

// Form Input Component
function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = '',
}: {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-brand-black mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm text-brand-black placeholder-brand-gray-400 
          focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent shadow-sm
          ${error ? 'border-red-400' : 'border-brand-gray-200'}`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

// Radio Option Component
function RadioOption({
  selected,
  onClick,
  children,
  className = '',
  disabled = false,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-start gap-3 p-4 rounded-lg border transition-all w-full text-left ${
        selected 
          ? 'border-brand-blue-500 bg-brand-blue-50/50' 
          : 'border-brand-gray-200 hover:border-brand-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
        selected ? 'border-brand-blue-500' : 'border-brand-gray-300'
      }`}>
        {selected && <div className="w-2 h-2 rounded-full bg-brand-blue-500" />}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </button>
  )
}

// Order Summary Component
function OrderSummary({
  items,
  subtotal,
  shipping,
  tax,
  discount,
  total,
  promoCode,
  onApplyPromo,
  onRemovePromo,
  isLoading,
}: {
  items: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  promoCode: string
  onApplyPromo: (code: string) => void
  onRemovePromo: () => void
  isLoading?: boolean
}) {
  const [showPromoInput, setShowPromoInput] = useState(false)
  const [inputPromoCode, setInputPromoCode] = useState('')
  const [isExpanded, setIsExpanded] = useState(false) // Collapsed by default on mobile

  return (
    <div className="bg-white border border-brand-gray-200 rounded-lg shadow-sm lg:sticky lg:top-[88px] lg:max-h-[calc(100vh-120px)] lg:flex lg:flex-col">
      {/* Header - matches Cart OrderSummary, clickable on mobile */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 md:px-6 py-3.5 border-b border-brand-gray-200 flex items-center justify-between hover:bg-brand-gray-50 transition-colors lg:hover:bg-transparent lg:pointer-events-none flex-shrink-0"
        type="button"
      >
        {/* Mobile collapsed view - show summary */}
        <div className="flex items-center justify-between w-full lg:hidden">
          <span className="text-sm text-brand-gray-600">
            Estimated Total ({items.length} {items.length === 1 ? 'item' : 'items'})
          </span>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-brand-black">${total.toFixed(2)}</span>
            <svg
              className={`w-5 h-5 text-brand-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {/* Desktop view - show title */}
        <h2 className="hidden lg:block text-base font-semibold text-brand-black">Order Summary</h2>
      </button>

      {/* Content - hidden on mobile when collapsed, always visible on desktop */}
      <div className={`lg:flex lg:flex-col lg:flex-1 lg:min-h-0 ${isExpanded ? 'flex flex-col flex-1 min-h-0' : 'hidden'}`}>

      {/* Line Items - matches Cart OrderSummary */}
      <div className="px-4 md:px-6 py-4 space-y-1 flex-shrink-0">
        <div className="flex justify-between text-sm text-brand-gray-600">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-brand-gray-600">
            <span>Promotions</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-brand-gray-600">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between text-sm text-brand-gray-600">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
      </div>

      {/* Promotion Code - matches Cart OrderSummary */}
      <div className="px-4 md:px-6 py-2 border-t border-brand-gray-200 flex-shrink-0">
        <button
          onClick={() => setShowPromoInput(!showPromoInput)}
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
                  value={inputPromoCode}
                  onChange={(e) => setInputPromoCode(e.target.value)}
                  placeholder=""
                  className="w-full px-3 py-2 bg-white border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    onApplyPromo(inputPromoCode)
                    setInputPromoCode('')
                  }}
                  className="px-4 py-2 bg-brand-blue-500 text-white rounded-lg text-sm font-medium hover:bg-brand-blue-600 transition-colors h-[42px]"
                >
                  Apply
                </button>
              </div>
            </div>
            {promoCode && (
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs bg-brand-gray-100 text-brand-gray-700 px-2 py-0.5 rounded-md font-semibold">
                    {promoCode}
                  </span>
                  <button
                    onClick={onRemovePromo}
                    className="text-brand-gray-500 hover:text-brand-red-500 transition-colors p-1"
                    aria-label={`Remove ${promoCode}`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <span className="text-sm text-brand-gray-600">-${discount.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Total - matches Cart OrderSummary, hidden on mobile (shown in header) */}
      <div className="hidden lg:block px-4 md:px-6 py-4 border-t border-brand-gray-200 flex-shrink-0">
        <div className="flex justify-between text-lg font-bold">
          <span className="text-brand-black">Total</span>
          <span className="text-brand-black">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Cart Items - MiniCart style (no gray background) */}
      <div className="border-t border-brand-gray-200 lg:flex-1 lg:flex lg:flex-col lg:min-h-0">
        <div className="lg:flex-1 lg:overflow-y-auto divide-y divide-brand-gray-200">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 px-4 md:px-6 py-4">
                {/* Product Image */}
                <div className="flex-shrink-0 w-20 h-20 bg-brand-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <h3 className="text-sm font-medium text-brand-black line-clamp-2 flex-1">
                      {item.product.name}
                    </h3>
                    {/* Fulfillment Badge */}
                    {item.fulfillmentMethod && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium flex-shrink-0 ${
                        item.fulfillmentMethod === 'pickup' 
                          ? 'bg-brand-blue-100 text-brand-blue-700' 
                          : 'bg-brand-gray-100 text-brand-gray-700'
                      }`}>
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
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            Delivery
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs text-brand-gray-600 space-y-0.5 mb-2">
                    {item.color && <p>Color: {item.color}</p>}
                    {item.size && <p>Size: {item.size}</p>}
                    {item.fulfillmentMethod === 'pickup' && item.storeName && (
                      <p className="text-brand-blue-600">Pickup at: {item.storeName}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-brand-black">
                      ${item.price.toFixed(2)}
                    </span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-xs text-brand-gray-500 line-through">
                        ${item.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Quantity (read-only in checkout) */}
                  <p className="text-xs text-brand-gray-600">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
      </div>
    </div>
  )
}

// ===========================
// Main Checkout Component
// ===========================

export default function CheckoutPage() {
  const router = useRouter()
  
  // State
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Checkout mode state
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>('guest')
  const [isMultiship, setIsMultiship] = useState(false)
  
  // Refs for smooth scrolling to sections
  const contactSectionRef = useRef<HTMLDivElement>(null)
  const shippingSectionRef = useRef<HTMLDivElement>(null)
  const storePickupSectionRef = useRef<HTMLDivElement>(null)
  const shippingMethodSectionRef = useRef<HTMLDivElement>(null)
  const paymentSectionRef = useRef<HTMLDivElement>(null)
  const reviewSectionRef = useRef<HTMLDivElement>(null)
  
  // Computed: Determine fulfillment types from cart items
  const hasBOPISItems = useMemo(() => {
    return cartItems.some(item => item.fulfillmentMethod === 'pickup' && item.storeId)
  }, [cartItems])
  
  const hasDeliveryItems = useMemo(() => {
    return cartItems.some(item => item.fulfillmentMethod === 'delivery' || !item.fulfillmentMethod)
  }, [cartItems])
  
  // Group cart items by fulfillment type
  const bopisItems = useMemo(() => {
    return cartItems.filter(item => item.fulfillmentMethod === 'pickup' && item.storeId)
  }, [cartItems])
  
  const deliveryItems = useMemo(() => {
    return cartItems.filter(item => item.fulfillmentMethod === 'delivery' || !item.fulfillmentMethod)
  }, [cartItems])
  
  // Get unique pickup stores from BOPIS items
  const pickupStores = useMemo(() => {
    const storeMap = new Map<string, { storeId: string, storeName: string, storeAddress: string, items: CartItem[] }>()
    bopisItems.forEach(item => {
      if (item.storeId && item.storeName) {
        if (!storeMap.has(item.storeId)) {
          storeMap.set(item.storeId, {
            storeId: item.storeId,
            storeName: item.storeName,
            storeAddress: item.storeAddress || '',
            items: []
          })
        }
        storeMap.get(item.storeId)!.items.push(item)
      }
    })
    return Array.from(storeMap.values())
  }, [bopisItems])
  
  // Step tracking
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('contact')
  const [completedSteps, setCompletedSteps] = useState<Set<CheckoutStep>>(new Set())
  
  // Contact info state
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+1')
  
  // Shipping address state
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>(SAVED_ADDRESSES)
  
  // Address modal state (matches MyAccountPage pattern)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addingAddressForItemId, setAddingAddressForItemId] = useState<string | null>(null) // Track which item is getting a new address
  const [addressForm, setAddressForm] = useState<Partial<Address>>({
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
  })
  
  // Multiship state - maps item IDs to address IDs
  const [itemAddressMap, setItemAddressMap] = useState<Map<string, string>>(new Map())
  
  // BOPIS state
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [showStoreLocator, setShowStoreLocator] = useState(false)
  
  // Shipping method state
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>('standard')
  // For multiship: shipping method per address
  const [addressShippingMethodMap, setAddressShippingMethodMap] = useState<Map<string, string>>(new Map())
  
  // Group delivery items by address for multiship shipping method selection
  const shipmentsByAddress = useMemo(() => {
    if (!isMultiship) return []
    
    const addressMap = new Map<string, { addressId: string, address: Address | undefined, items: CartItem[] }>()
    
    deliveryItems.forEach(item => {
      const addressId = itemAddressMap.get(item.id) || ''
      if (addressId) {
        if (!addressMap.has(addressId)) {
          const address = savedAddresses.find(a => a.id === addressId)
          addressMap.set(addressId, {
            addressId,
            address,
            items: []
          })
        }
        addressMap.get(addressId)?.items.push(item)
      }
    })
    
    return Array.from(addressMap.values())
  }, [isMultiship, deliveryItems, itemAddressMap, savedAddresses])
  
  // Payment state
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethod[]>(SAVED_PAYMENT_METHODS)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [overrideBillingAddress, setOverrideBillingAddress] = useState(false)
  const [overrideBillingAddressId, setOverrideBillingAddressId] = useState<string | null | undefined>(undefined)
  const [paymentForm, setPaymentForm] = useState<{
    selectedCountry?: PaymentCountryCode
    selectedMethodType?: string
    cardNumber?: string
    cardName?: string
    expiryDate?: string
    cvv?: string
    billingAddressId?: string | null
  }>({
    selectedCountry: 'US',
    selectedMethodType: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    billingAddressId: null,
  })
  const [showNewBillingAddress, setShowNewBillingAddress] = useState(false)
  const [showNewBillingAddressInOverride, setShowNewBillingAddressInOverride] = useState(false)
  const [newBillingAddressForm, setNewBillingAddressForm] = useState<Partial<Address>>({
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
  })
  
  // Promo code
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)
  
  // Toast
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  // Loading states for each operation
  const [isLoadingContact, setIsLoadingContact] = useState(false)
  const [isLoadingShipping, setIsLoadingShipping] = useState(false)
  const [isLoadingStorePickup, setIsLoadingStorePickup] = useState(false)
  const [isLoadingShippingMethod, setIsLoadingShippingMethod] = useState(false)
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)
  const [isLoadingPaymentMethod, setIsLoadingPaymentMethod] = useState(false)
  const [isLoadingAddressSelection, setIsLoadingAddressSelection] = useState(false)
  const [isLoadingPaymentSelection, setIsLoadingPaymentSelection] = useState(false)
  
  // Marketing consent (for guest checkout)
  const [marketingConsent, setMarketingConsent] = useState(true)
  
  // Computed: check if any loading is active
  const isAnyLoading = isProcessing || isLoadingContact || isLoadingShipping || isLoadingStorePickup || 
    isLoadingShippingMethod || isLoadingPayment || isLoadingAddress || isLoadingPaymentMethod ||
    isLoadingAddressSelection || isLoadingPaymentSelection

  // Load cart and user on mount
  useEffect(() => {
    const cart = getCart()
    setCartItems(cart)
    
    const currentUser = getCurrentUser()
    setUser(currentUser)
    
    if (currentUser) {
      setCheckoutMode('registered')
      setEmail(currentUser.email)
      setPhone(currentUser.phone || '')
      // Pre-select default address for registered users
      const defaultAddress = SAVED_ADDRESSES.find(a => a.isDefault)
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id)
      }
      // Pre-select default payment for registered users
      const defaultPayment = SAVED_PAYMENT_METHODS.find(p => p.isDefault)
      if (defaultPayment) {
        setSelectedPaymentId(defaultPayment.id)
      }
      // Mark contact as completed for logged in users
      setCompletedSteps(new Set<CheckoutStep>(['contact']))
      setCurrentStep('shipping')
    }
    
    setIsLoading(false)
  }, [])

  // Calculations
  const calculations = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    
    // Calculate shipping based on multiship or single ship mode
    let shipping = 0
    if (hasDeliveryItems) {
      if (isMultiship && shipmentsByAddress.length > 0) {
        // Sum shipping costs for each shipment
        shipmentsByAddress.forEach(shipment => {
          const methodId = addressShippingMethodMap.get(shipment.addressId) || 'standard'
          const method = SHIPPING_METHODS.find(m => m.id === methodId)
          shipping += method?.price || 0
        })
      } else {
        // Single shipping method
        const shippingMethod = SHIPPING_METHODS.find(m => m.id === selectedShippingMethod)
        shipping = shippingMethod?.price || 0
      }
    }
    
    const tax = subtotal * 0.08 // 8% tax
    const total = subtotal - discount + shipping + tax
    
    return { subtotal, shipping, tax, total }
  }, [cartItems, selectedShippingMethod, discount, hasDeliveryItems, isMultiship, shipmentsByAddress, addressShippingMethodMap])

  // Step navigation - dynamic based on cart contents
  const getSteps = useMemo((): CheckoutStep[] => {
    const steps: CheckoutStep[] = ['contact']
    
    // Add shipping step only if there are delivery items
    if (hasDeliveryItems) {
      steps.push('shipping')
    }
    
    // Add store-pickup step only if there are BOPIS items
    if (hasBOPISItems) {
      steps.push('store-pickup')
    }
    
    // Add shipping method only if there are delivery items
    if (hasDeliveryItems) {
      steps.push('shipping-method')
    }
    
    steps.push('payment', 'review')
    return steps
  }, [hasDeliveryItems, hasBOPISItems])
  
  // Helper function to scroll to a section smoothly
  const scrollToSection = (step: CheckoutStep) => {
    // Small delay to ensure DOM has updated
    setTimeout(() => {
      let ref: React.RefObject<HTMLDivElement> | null = null
      
      switch (step) {
        case 'contact':
          ref = contactSectionRef
          break
        case 'shipping':
          ref = shippingSectionRef
          break
        case 'store-pickup':
          ref = storePickupSectionRef
          break
        case 'shipping-method':
          ref = shippingMethodSectionRef
          break
        case 'payment':
          ref = paymentSectionRef
          break
        case 'review':
          ref = reviewSectionRef
          break
      }
      
      if (ref?.current) {
        // Calculate offset for sticky header (approximately 80px)
        const headerOffset = 80
        const elementPosition = ref.current.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    }, 100)
  }

  const goToStep = (step: CheckoutStep) => {
    setCurrentStep(step)
    scrollToSection(step)
  }

  const completeStep = (step: CheckoutStep) => {
    setCompletedSteps(prev => new Set(prev).add(step))
    
    // Navigate to next step based on dynamic steps
    const currentIndex = getSteps.indexOf(step)
    if (currentIndex < getSteps.length - 1) {
      const nextStep = getSteps[currentIndex + 1]
      setCurrentStep(nextStep)
      scrollToSection(nextStep)
    }
  }

  const isStepCompleted = (step: CheckoutStep) => completedSteps.has(step)
  const isStepActive = (step: CheckoutStep) => currentStep === step
  const isStepUpcoming = (step: CheckoutStep) => {
    return getSteps.indexOf(step) > getSteps.indexOf(currentStep) && !completedSteps.has(step)
  }

  // Handlers
  const handleExpressPayment = (method: string) => {
    setIsProcessing(true)
    // Simulate express payment
    setTimeout(() => {
      setToastMessage(`Payment with ${method} initiated`)
      setToastType('success')
      setShowToast(true)
      setIsProcessing(false)
    }, 1500)
  }

  const handleContactSubmit = async () => {
    if (!email.trim()) {
      setToastMessage('Please enter your email address')
      setToastType('error')
      setShowToast(true)
      return
    }
    setIsLoadingContact(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    completeStep('contact')
    setIsLoadingContact(false)
  }

  // Address modal handlers (matches MyAccountPage pattern)
  const handleOpenAddAddress = (itemId?: string) => {
    setAddressForm({
      firstName: '',
      lastName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phone: '',
    })
    setEditingAddressId(null)
    setAddingAddressForItemId(itemId || null)
    setShowAddressModal(true)
  }

  const handleOpenEditAddress = (addressId: string) => {
    const address = savedAddresses.find(a => a.id === addressId)
    if (address) {
      setAddressForm(address)
      setEditingAddressId(addressId)
      setAddingAddressForItemId(null) // Reset when editing
      setShowAddressModal(true)
    }
  }

  const handleCloseAddressModal = () => {
    setShowAddressModal(false)
    setEditingAddressId(null)
    setAddingAddressForItemId(null)
  }

  const handleSaveAddress = async () => {
    // Validate required fields
    if (!addressForm.firstName || !addressForm.lastName || !addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.zipCode) {
      setToastMessage('Please fill in all required fields')
      setToastType('error')
      setShowToast(true)
      return
    }

    setIsLoadingAddress(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    setIsLoadingAddress(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    if (editingAddressId) {
      // Update existing address
      setSavedAddresses(prev => prev.map(addr => 
        addr.id === editingAddressId 
          ? { ...addressForm as Address, id: editingAddressId }
          : addr
      ))
      setToastMessage('Address updated successfully')
    } else {
      // Add new address
      const newAddress: Address = {
        ...addressForm as Address,
        id: `addr-${Date.now()}`,
        isDefault: savedAddresses.length === 0, // Make first address default
      }
      setSavedAddresses(prev => [...prev, newAddress])
      
      // If this address was added for a specific item in multiship, assign it to that item
      if (addingAddressForItemId) {
        const newMap = new Map(itemAddressMap)
        newMap.set(addingAddressForItemId, newAddress.id)
        setItemAddressMap(newMap)
      } else {
        // Otherwise, set it as the selected address for single shipping
        setSelectedAddressId(newAddress.id)
      }
      
      setToastMessage('Address added successfully')
    }
    setToastType('success')
    setShowToast(true)
    setIsLoadingAddress(false)
    handleCloseAddressModal()
  }

  const handleShippingSubmit = async () => {
    if (!selectedAddressId) {
      setToastMessage('Please select or add a shipping address')
      setToastType('error')
      setShowToast(true)
      return
    }
    // For multiship, validate all delivery items have addresses
    if (isMultiship) {
      const allDeliveryItemsHaveAddresses = deliveryItems.every(item => itemAddressMap.get(item.id))
      if (!allDeliveryItemsHaveAddresses) {
        setToastMessage('Please assign a shipping address to all items')
        setToastType('error')
        setShowToast(true)
        return
      }
    }
    setIsLoadingShipping(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    completeStep('shipping')
    setIsLoadingShipping(false)
  }
  
  const handleStorePickupSubmit = async () => {
    setIsLoadingStorePickup(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    // BOPIS items already have their store assigned from cart, so we just complete this step
    completeStep('store-pickup')
    setIsLoadingStorePickup(false)
  }

  const handleShippingMethodSubmit = async () => {
    // For multiship, validate all shipments have shipping methods selected
    if (isMultiship && shipmentsByAddress.length > 0) {
      const allShipmentsHaveMethods = shipmentsByAddress.every(shipment => 
        addressShippingMethodMap.has(shipment.addressId)
      )
      // If not all have explicit selections, set defaults
      if (!allShipmentsHaveMethods) {
        const newMap = new Map(addressShippingMethodMap)
        shipmentsByAddress.forEach(shipment => {
          if (!newMap.has(shipment.addressId)) {
            newMap.set(shipment.addressId, 'standard')
          }
        })
        setAddressShippingMethodMap(newMap)
      }
    }
    
    setIsLoadingShippingMethod(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    completeStep('shipping-method')
    setIsLoadingShippingMethod(false)
  }

  const handleOpenAddPayment = () => {
    setPaymentForm({
      selectedCountry: 'US',
      selectedMethodType: '',
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
      billingAddressId: null,
    })
    setShowNewBillingAddress(false)
    setShowPaymentModal(true)
  }

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false)
    setPaymentForm({
      selectedCountry: 'US',
      selectedMethodType: '',
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
      billingAddressId: null,
    })
    setShowNewBillingAddress(false)
  }

  const handleSavePayment = async () => {
    // Validate required fields
    if (paymentForm.selectedMethodType !== 'credit-card') {
      setToastMessage('Please select a payment method type')
      setToastType('error')
      setShowToast(true)
      return
    }

    if (!paymentForm.cardNumber || !paymentForm.cardName || !paymentForm.expiryDate || !paymentForm.cvv) {
      setToastMessage('Please fill in all payment details')
      setToastType('error')
      setShowToast(true)
      return
    }
    
    setIsLoadingPaymentMethod(true)

    // Validate billing address - null is valid (same as shipping), but undefined means not selected
    if (paymentForm.billingAddressId === undefined && !showNewBillingAddress) {
      setToastMessage('Please select or add a billing address')
      setToastType('error')
      setShowToast(true)
      return
    }

    // Clean card number (remove spaces)
    const cardNumberDigits = paymentForm.cardNumber.replace(/\D/g, '')
    
    if (cardNumberDigits.length < 13 || cardNumberDigits.length > 19) {
      setToastMessage('Please enter a valid card number')
      setToastType('error')
      setShowToast(true)
      return
    }

    // Extract card brand from first digit
    let brand = 'Visa'
    if (cardNumberDigits.startsWith('5')) brand = 'Mastercard'
    else if (cardNumberDigits.startsWith('3')) brand = 'Amex'
    else if (cardNumberDigits.startsWith('6')) brand = 'Discover'

    // Extract last 4 digits
    const lastFour = cardNumberDigits.slice(-4)

    // Parse expiry date (MM/YY format)
    const [expiryMonth, expiryYear] = paymentForm.expiryDate.split('/')
    if (!expiryMonth || !expiryYear || expiryMonth.length !== 2 || expiryYear.length !== 2) {
      setToastMessage('Please enter a valid expiration date (MM/YY)')
      setToastType('error')
      setShowToast(true)
      return
    }
    const fullYear = `20${expiryYear}`

    // Handle billing address - if new address was added, save it first
    let billingAddressId: string | null = paymentForm.billingAddressId === undefined ? null : paymentForm.billingAddressId
    if (showNewBillingAddress) {
      // Validate new billing address
      if (!addressForm.firstName || !addressForm.lastName || !addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.zipCode) {
        setToastMessage('Please fill in all required billing address fields')
        setToastType('error')
        setShowToast(true)
        return
      }
      // Save new billing address
      const newBillingAddress: Address = {
        ...addressForm as Address,
        id: `billing-addr-${Date.now()}`,
      }
      setSavedAddresses(prev => [...prev, newBillingAddress])
      billingAddressId = newBillingAddress.id
    }

    // Add new payment method
    const newPaymentMethod: PaymentMethod = {
      id: `card-${Date.now()}`,
      type: 'card',
      lastFour,
      brand,
      expiryMonth,
      expiryYear: fullYear,
      isDefault: savedPaymentMethods.length === 0,
      billingAddressId,
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setSavedPaymentMethods(prev => [...prev, newPaymentMethod])
    setSelectedPaymentId(newPaymentMethod.id)
    // Don't mark payment step as completed - user must click "Review Order"
    setToastMessage('Payment method added successfully')
    setToastType('success')
    setShowToast(true)
    setIsLoadingPaymentMethod(false)
    handleClosePaymentModal()
  }

  const handlePaymentSubmit = async () => {
    if (!selectedPaymentId) {
      setToastMessage('Please select or add a payment method')
      setToastType('error')
      setShowToast(true)
      return
    }
    
    // Validate billing address if "Add new" is selected
    if (overrideBillingAddress && showNewBillingAddressInOverride) {
      if (!newBillingAddressForm.firstName || !newBillingAddressForm.lastName || !newBillingAddressForm.addressLine1 || !newBillingAddressForm.city || !newBillingAddressForm.state || !newBillingAddressForm.zipCode) {
        setToastMessage('Please fill in all required billing address fields')
        setToastType('error')
        setShowToast(true)
        return
      }
      
      // Save new billing address to saved addresses
      const newBillingAddress: Address = {
        ...newBillingAddressForm as Address,
        id: `billing-addr-${Date.now()}`,
        isDefault: false,
      }
      setSavedAddresses(prev => [...prev, newBillingAddress])
      setOverrideBillingAddressId(newBillingAddress.id)
      setShowNewBillingAddressInOverride(false)
      // Reset form
      setNewBillingAddressForm({
        firstName: '',
        lastName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        phone: '',
      })
    }
    
    setIsLoadingPayment(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    completeStep('payment')
    setIsLoadingPayment(false)
  }

  const handlePlaceOrder = () => {
    setIsProcessing(true)
    
    // Simulate order processing
    setTimeout(() => {
      const orderNumber = `SF-${Date.now().toString().slice(-8)}`
      
      // Get selected address and payment details
      const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId)
      const selectedPayment = savedPaymentMethods.find(p => p.id === selectedPaymentId)
      const selectedShipping = SHIPPING_METHODS.find(m => m.id === selectedShippingMethod)
      
      // Build order confirmation data
      const orderConfirmationData = {
        orderNumber,
        email,
        phone,
        orderDate: new Date().toISOString(),
        items: cartItems.map(item => ({
          id: item.id,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          image: item.product.images?.[0] || item.product.image || '/images/products/placeholder.png',
          isBOPIS: item.fulfillmentMethod === 'pickup',
          store: item.storeName && item.storeAddress ? { name: item.storeName, address: item.storeAddress } : undefined,
        })),
        subtotal: calculations.subtotal,
        shipping: calculations.shipping,
        tax: calculations.tax,
        discount,
        total: calculations.total,
        promoCode,
        // Shipping address (if delivery items)
        shippingAddress: selectedAddress ? {
          name: `${selectedAddress.firstName} ${selectedAddress.lastName}`,
          addressLine1: selectedAddress.addressLine1,
          addressLine2: selectedAddress.addressLine2,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          country: selectedAddress.country,
          phone: selectedAddress.phone,
        } : null,
        shippingMethod: selectedShipping ? {
          name: selectedShipping.name,
          description: selectedShipping.description,
          estimatedDelivery: selectedShipping.estimatedDelivery,
        } : null,
        // Payment info
        paymentMethod: selectedPayment ? {
          type: selectedPayment.type,
          brand: selectedPayment.brand,
          lastFour: selectedPayment.lastFour,
          cardholderName: selectedPayment.cardholderName,
        } : null,
        // BOPIS info
        hasBOPIS: hasBOPISItems,
        hasDelivery: hasDeliveryItems,
        pickupStore: selectedStore ? {
          id: selectedStore.id,
          name: selectedStore.name,
          address: selectedStore.address,
          city: selectedStore.city,
          state: selectedStore.state,
          zipCode: selectedStore.zipCode,
          hours: selectedStore.hours,
          pickupTime: selectedStore.pickupTime,
        } : null,
        // Store-specific BOPIS items
        bopisItems: bopisItems.map(item => ({
          id: item.id,
          name: item.product.name,
          store: item.storeName && item.storeAddress ? { name: item.storeName, address: item.storeAddress } : undefined,
          quantity: item.quantity,
          price: item.price,
          image: item.product.images?.[0] || item.product.image || '/images/products/placeholder.png',
        })),
        // Multi-shipping data
        isMultiship: isMultiship && shipmentsByAddress.length > 0,
        shipments: isMultiship && shipmentsByAddress.length > 0 ? shipmentsByAddress.map(shipment => {
          const methodId = addressShippingMethodMap.get(shipment.addressId) || 'standard'
          const method = SHIPPING_METHODS.find(m => m.id === methodId)
          return {
            addressId: shipment.addressId,
            address: shipment.address ? {
              name: `${shipment.address.firstName} ${shipment.address.lastName}`,
              addressLine1: shipment.address.addressLine1,
              addressLine2: shipment.address.addressLine2,
              city: shipment.address.city,
              state: shipment.address.state,
              zipCode: shipment.address.zipCode,
              country: shipment.address.country,
              phone: shipment.address.phone,
            } : null,
            items: shipment.items.map(item => ({
              id: item.id,
              name: item.product.name,
              price: item.price,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
              image: item.product.images?.[0] || item.product.image || '/images/products/placeholder.png',
              isBOPIS: false,
            })),
            shippingMethod: method ? {
              name: method.name,
              description: method.description,
              estimatedDelivery: method.estimatedDelivery,
            } : null,
          }
        }) : undefined,
      }
      
      // Store order data for confirmation page
      console.log('Checkout - Storing order confirmation data:', orderConfirmationData)
      console.log('Checkout - Items being stored:', orderConfirmationData.items)
      sessionStorage.setItem('orderConfirmation', JSON.stringify(orderConfirmationData))
      
      clearCart()
      router.push(`/order/${orderNumber}?success=true`)
    }, 2000)
  }

  const handleApplyPromo = (code: string) => {
    if (code.trim()) {
      setPromoCode(code.toUpperCase())
      setDiscount(calculations.subtotal * 0.1) // 10% discount
      setToastMessage('Promo code applied!')
      setToastType('success')
      setShowToast(true)
    }
  }

  const handleRemovePromo = () => {
    setPromoCode('')
    setDiscount(0)
  }

  const handleStoreSelect = (store: any) => {
    setSelectedStore({
      id: store.id,
      name: store.name,
      address: store.address,
      city: '',
      state: '',
      zipCode: '',
      hours: store.hours,
      pickupTime: store.pickupTime,
      distance: store.distance,
    })
    setShowStoreLocator(false)
  }

  const getSelectedAddress = () => {
    return savedAddresses.find(a => a.id === selectedAddressId)
  }

  const getSelectedPayment = () => {
    return savedPaymentMethods.find(p => p.id === selectedPaymentId)
  }

  const getBillingAddressForPayment = (payment: PaymentMethod | undefined) => {
    if (!payment) return null
    
    // If override is active for this payment method, use the override
    if (overrideBillingAddress && selectedPaymentId === payment.id) {
      if (overrideBillingAddressId === null) {
        // Same as shipping address
        return getSelectedAddress()
      }
      if (overrideBillingAddressId) {
        return savedAddresses.find(a => a.id === overrideBillingAddressId)
      }
      return null
    }
    
    // Otherwise use the saved billing address from the payment method
    if (payment.billingAddressId === null) {
      // Same as shipping address
      return getSelectedAddress()
    }
    return savedAddresses.find(a => a.id === payment.billingAddressId)
  }

  const getSelectedShippingMethod = () => {
    return SHIPPING_METHODS.find(m => m.id === selectedShippingMethod)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-brand-gray-50">
        {/* Simple Header */}
        <header className="bg-white border-b border-brand-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <img 
                src="/images/logo.svg" 
                alt="Salesforce Foundations" 
                className="h-10 w-auto"
              />
            </Link>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <svg className="w-24 h-24 text-brand-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h1 className="text-2xl font-semibold text-brand-black mb-2">Your cart is empty</h1>
          <p className="text-brand-gray-600 mb-8">Add some items to your cart to continue checkout.</p>
          <Link href="/shop" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-brand-gray-200 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <img 
              src="/images/logo.svg" 
              alt="Salesforce Foundations" 
              className="h-10 w-auto"
            />
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-brand-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="hidden sm:inline">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-white border-b border-brand-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-black tracking-tight">Checkout</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-11">
          {/* Left Column - Checkout Steps */}
          <div className="flex-1 space-y-4 md:space-y-6">
            {/* Express Payment */}
            <div className="bg-white border border-brand-gray-200 rounded-lg shadow-md p-4 md:p-6">
              <ExpressPaymentButtons onPayment={handleExpressPayment} />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-brand-gray-200" />
              <span className="text-sm text-brand-gray-500">or continue below</span>
              <div className="flex-1 h-px bg-brand-gray-200" />
            </div>

            {/* Contact Information Section */}
            <div ref={contactSectionRef}>
            <SectionCard
              title="Contact Information"
              isActive={isStepActive('contact')}
              isCompleted={isStepCompleted('contact')}
              isUpcoming={false}
              onEdit={() => goToStep('contact')}
              summary={
                <div className="text-sm text-brand-gray-600">
                  <p className="font-medium text-brand-black">{email}</p>
                  {phone && <p>{countryCode} {phone}</p>}
                </div>
              }
            >
              <div className="space-y-4">
                {/* Login Link for Guest */}
                {!user && (
                  <div className="flex items-center justify-between p-3 bg-brand-blue-50 rounded-lg">
                    <p className="text-sm text-brand-blue-700">Already have an account?</p>
                    <Link href="/login" className="text-sm font-medium text-brand-blue-600 hover:text-brand-blue-700">
                      Log in
                    </Link>
                  </div>
                )}

                <FormInput
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  required
                />

                <div className="flex gap-2">
                  <div className="w-20">
                    <label className="block text-sm font-medium text-brand-black mb-1.5">Code</label>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full px-2 py-2.5 bg-white border border-brand-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                    >
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+33">+33</option>
                      <option value="+49">+49</option>
                    </select>
                  </div>
                  <FormInput
                    label="Phone Number"
                    type="tel"
                    value={phone}
                    onChange={setPhone}
                    placeholder="(555) 555-5555"
                    className="flex-1"
                  />
                </div>

                <button
                  onClick={handleContactSubmit}
                  disabled={isAnyLoading}
                  className="w-full py-3 bg-brand-blue-500 text-white rounded-lg font-medium hover:bg-brand-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {isLoadingContact && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {hasDeliveryItems ? 'Continue to Shipping Address' : 'Continue to Store Pickup'}
                </button>
              </div>
            </SectionCard>
            </div>

            {/* Shipping Address Section (only for delivery items) */}
            {hasDeliveryItems && (
              <div ref={shippingSectionRef}>
              <SectionCard
                title="Shipping Address"
                isActive={isStepActive('shipping')}
                isCompleted={isStepCompleted('shipping')}
                isUpcoming={isStepUpcoming('shipping')}
                onEdit={() => goToStep('shipping')}
                headerAction={
                  isStepActive('shipping') && (
                    <div className="flex items-center gap-3">
                      {user && deliveryItems.length > 1 && (
                        <button
                          onClick={() => setIsMultiship(!isMultiship)}
                          className="text-sm text-brand-blue-500 hover:text-brand-blue-600 font-medium"
                        >
                          {isMultiship ? 'Ship to single address' : 'Deliver to multiple addresses'}
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenAddAddress()}
                        className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black hover:bg-brand-gray-50 rounded-lg transition-colors shadow-sm"
                      >
                        Add new address
                      </button>
                    </div>
                  )
                }
                summary={
                  getSelectedAddress() && !isMultiship ? (
                    <div className="text-sm text-brand-gray-600">
                      <p className="font-medium text-brand-black">
                        {getSelectedAddress()?.firstName} {getSelectedAddress()?.lastName}
                      </p>
                      <p>{getSelectedAddress()?.addressLine1}</p>
                      {getSelectedAddress()?.addressLine2 && <p>{getSelectedAddress()?.addressLine2}</p>}
                      <p>{getSelectedAddress()?.city}, {getSelectedAddress()?.state} {getSelectedAddress()?.zipCode}</p>
                    </div>
                  ) : isMultiship ? (
                    <div className="text-sm text-brand-gray-600">
                      <p className="font-medium text-brand-black">Multiple addresses</p>
                      <p>{deliveryItems.length} items shipping to different addresses</p>
                    </div>
                  ) : null
                }
              >
                <div className="space-y-4">
                  {/* Saved Addresses (for registered users) */}
                  {user && savedAddresses.length > 0 && !isMultiship && (
                    <div className="space-y-4">
                      {savedAddresses.map((address) => {
                        const isSelected = selectedAddressId === address.id
                        return (
                          <div
                            key={address.id}
                            className={`bg-white border rounded-xl shadow-sm p-6 relative transition-all ${
                              isSelected ? 'border-brand-blue-500' : 'border-brand-gray-200 hover:border-brand-gray-300'
                            } ${isAnyLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            onClick={() => {
                              if (isAnyLoading || address.id === selectedAddressId) return
                              setIsLoadingAddressSelection(true)
                              // Simulate API call
                              setTimeout(() => {
                                setSelectedAddressId(address.id)
                                // Mark shipping step as completed when an address is selected
                                if (!completedSteps.has('shipping')) {
                                  setCompletedSteps(prev => new Set(prev).add('shipping'))
                                }
                                setIsLoadingAddressSelection(false)
                              }, 300)
                            }}
                          >
                            {/* Radio Button */}
                            <div className="absolute top-6 left-6">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'border-brand-blue-500' : 'border-brand-gray-300'
                              }`}>
                                {isSelected && (
                                  <div className="w-3 h-3 rounded-full bg-brand-blue-500" />
                                )}
                              </div>
                            </div>

                            {/* Address Info */}
                            <div className="flex-1 pl-10 pr-4">
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
                              <p className={`text-sm text-brand-gray-600 ${isSelected ? 'mb-2' : ''}`}>
                                {address.zipCode}, {address.city}, {address.state}, {address.country}
                              </p>

                              {/* Edit Address - only on selected */}
                              {isSelected && (
                                <div className="flex items-center gap-4">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleOpenEditAddress(address.id)
                                    }}
                                    className="text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline"
                                  >
                                    Edit Address
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Multiship View - only shows delivery items */}
                  {isMultiship && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-brand-gray-600">Select a shipping address for each item:</p>
                      </div>
                      {deliveryItems.map((item) => (
                        <div key={item.id} className="border border-brand-gray-200 rounded-lg p-4">
                          <div className="flex gap-4 mb-3">
                            <div className="w-16 h-16 bg-brand-gray-100 rounded-lg overflow-hidden shrink-0">
                              <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-medium text-brand-black">{item.product.name}</p>
                              <p className="text-sm text-brand-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={itemAddressMap.get(item.id) || ''}
                              onChange={(e) => {
                                const newMap = new Map(itemAddressMap)
                                newMap.set(item.id, e.target.value)
                                setItemAddressMap(newMap)
                              }}
                              className="flex-1 px-3 py-2 bg-white border border-brand-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                            >
                              <option value="">Select shipping address</option>
                              {savedAddresses.map((addr) => (
                                <option key={addr.id} value={addr.id}>
                                  {addr.firstName} {addr.lastName} - {addr.addressLine1}, {addr.city}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleOpenAddAddress(item.id)}
                              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-blue-500 hover:text-brand-blue-600 border border-brand-blue-500 rounded-lg hover:bg-brand-blue-50 transition-colors shrink-0"
                              title="Add new address"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              <span className="hidden sm:inline">Add</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={handleShippingSubmit}
                    disabled={isAnyLoading}
                    className="w-full py-3 bg-brand-blue-500 text-white rounded-lg font-medium hover:bg-brand-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                  >
                    {isLoadingShipping && (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    {hasBOPISItems ? 'Continue to Store Pickup' : 'Continue to Shipping Method'}
                  </button>
                </div>
              </SectionCard>
              </div>
            )}

            {/* Store Pickup Details Section (only for BOPIS items - contextual from cart) */}
            {hasBOPISItems && (
              <div ref={storePickupSectionRef}>
              <SectionCard
                title="Store Pickup Details"
                isActive={isStepActive('store-pickup')}
                isCompleted={isStepCompleted('store-pickup')}
                isUpcoming={isStepUpcoming('store-pickup')}
                onEdit={() => goToStep('store-pickup')}
                summary={
                  pickupStores.length > 0 && (
                    <div className="text-sm text-brand-gray-600 space-y-2">
                      {pickupStores.map(store => (
                        <div key={store.storeId}>
                          <p className="font-medium text-brand-black">{store.storeName}</p>
                          <p>{store.storeAddress}</p>
                          <p className="text-brand-gray-500">{store.items.length} item{store.items.length > 1 ? 's' : ''} for pickup</p>
                        </div>
                      ))}
                    </div>
                  )
                }
              >
                <div className="space-y-4">
                  {/* Display each pickup store with its items */}
                  {pickupStores.map(store => (
                    <div key={store.storeId} className="border border-brand-gray-200 rounded-lg overflow-hidden">
                      {/* Store Header */}
                      <div className="bg-brand-gray-50 px-4 py-3 border-b border-brand-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-brand-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-brand-black">{store.storeName}</p>
                            <p className="text-sm text-brand-gray-600">{store.storeAddress}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Ready in 2 hours
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Items for this store */}
                      <div className="p-4 space-y-3">
                        {store.items.map(item => (
                          <div key={item.id} className="flex gap-3">
                            <div className="w-12 h-12 bg-brand-gray-100 rounded-lg overflow-hidden shrink-0">
                              <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-brand-black text-sm truncate">{item.product.name}</p>
                              <p className="text-xs text-brand-gray-500">Qty: {item.quantity}</p>
                              {item.size && <p className="text-xs text-brand-gray-500">Size: {item.size}</p>}
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-brand-black text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {/* Pickup Person Info */}
                  <div className="p-4 bg-brand-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-brand-blue-800 mb-2">Pickup Information</p>
                    <p className="text-sm text-brand-blue-700">
                      {user ? `${user.firstName} ${user.lastName} will pickup using order confirmation.` : 'Order confirmation email will be sent for pickup.'}
                    </p>
                    <p className="text-xs text-brand-blue-600 mt-1">
                      Please bring a valid ID when picking up your order.
                    </p>
                  </div>

                  <button
                    onClick={handleStorePickupSubmit}
                    disabled={isAnyLoading}
                    className="w-full py-3 bg-brand-blue-500 text-white rounded-lg font-medium hover:bg-brand-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                  >
                    {isLoadingStorePickup && (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    {hasDeliveryItems ? 'Continue to Shipping Method' : 'Continue to Payment'}
                  </button>
                </div>
              </SectionCard>
              </div>
            )}

            {/* Shipping Method Section (only for delivery items) */}
            {hasDeliveryItems && (
              <div ref={shippingMethodSectionRef}>
              <SectionCard
                title="Shipping Method"
                isActive={isStepActive('shipping-method')}
                isCompleted={isStepCompleted('shipping-method')}
                isUpcoming={isStepUpcoming('shipping-method')}
                onEdit={() => goToStep('shipping-method')}
                summary={
                  isMultiship && shipmentsByAddress.length > 0 ? (
                    <div className="text-sm text-brand-gray-600 space-y-2">
                      {shipmentsByAddress.map((shipment, index) => {
                        const methodId = addressShippingMethodMap.get(shipment.addressId) || 'standard'
                        const method = SHIPPING_METHODS.find(m => m.id === methodId)
                        return (
                          <div key={shipment.addressId}>
                            <p className="font-medium text-brand-black">
                              Shipment {index + 1}: {shipment.address?.firstName} {shipment.address?.lastName}
                            </p>
                            <p>{method?.name} - {method?.price === 0 ? <span className="text-green-600">Free</span> : `$${method?.price.toFixed(2)}`}</p>
                          </div>
                        )
                      })}
                    </div>
                  ) : getSelectedShippingMethod() ? (
                    <div className="text-sm text-brand-gray-600">
                      <p className="font-medium text-brand-black">{getSelectedShippingMethod()?.name}</p>
                      <p>{getSelectedShippingMethod()?.description}</p>
                      <p className="mt-1">
                        {getSelectedShippingMethod()?.price === 0 ? (
                          <span className="text-green-600 font-medium">Free</span>
                        ) : (
                          `$${getSelectedShippingMethod()?.price.toFixed(2)}`
                        )}
                      </p>
                    </div>
                  ) : null
                }
              >
                <div className="space-y-4">
                  {/* Multiship: Show shipping methods for each shipment */}
                  {isMultiship && shipmentsByAddress.length > 0 ? (
                    <>
                      {shipmentsByAddress.map((shipment, index) => (
                        <div key={shipment.addressId} className="border border-brand-gray-200 rounded-lg overflow-hidden">
                          {/* Shipment Header - matches Order History style */}
                          <div className="bg-brand-gray-50 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-brand-black">Shipment {index + 1}</span>
                              <span className="text-sm text-brand-gray-600">
                                → {shipment.address?.firstName} {shipment.address?.lastName}
                              </span>
                            </div>
                          </div>
                          
                          {/* Shipment Address */}
                          <div className="px-4 py-3 border-b border-brand-gray-100 text-sm text-brand-gray-600">
                            {shipment.address?.addressLine1}
                            {shipment.address?.addressLine2 && `, ${shipment.address?.addressLine2}`}
                            , {shipment.address?.city}, {shipment.address?.state} {shipment.address?.zipCode}
                          </div>
                          
                          {/* Items in this shipment - Order History item card style */}
                          <div className="p-4">
                            <div className="space-y-3 mb-4">
                              {shipment.items.map(item => (
                                <div key={item.id} className="flex items-start gap-4 p-4 border border-brand-gray-200 rounded-lg hover:bg-brand-gray-50 transition-colors">
                                  {/* Product Image */}
                                  <div className="flex-shrink-0">
                                    <div className="w-20 h-20 bg-brand-gray-100 rounded-lg overflow-hidden">
                                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                    </div>
                                  </div>
                                  
                                  {/* Product Details */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-brand-black mb-1">{item.product.name}</p>
                                    {(item.color || item.size) && (
                                      <p className="text-xs text-brand-gray-500 mb-1">
                                        {[item.color, item.size].filter(Boolean).join(' / ')}
                                      </p>
                                    )}
                                    <p className="text-xs text-brand-gray-500">Quantity: {item.quantity}</p>
                                  </div>
                                  
                                  {/* Price */}
                                  <div className="flex-shrink-0 text-right">
                                    {item.originalPrice && item.originalPrice > item.price && (
                                      <p className="text-xs text-brand-gray-400 line-through mb-0.5">
                                        ${item.originalPrice.toFixed(2)}
                                      </p>
                                    )}
                                    <p className="text-sm font-semibold text-brand-black">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Shipping Methods for this shipment */}
                            <div className="space-y-3 pt-4 border-t border-brand-gray-100">
                              {SHIPPING_METHODS.map((method) => {
                                const isSelected = (addressShippingMethodMap.get(shipment.addressId) || 'standard') === method.id
                                return (
                                  <RadioOption
                                    key={method.id}
                                    selected={isSelected}
                                    onClick={() => {
                                      if (!isAnyLoading) {
                                        setIsLoadingShippingMethod(true)
                                        setTimeout(() => {
                                          const newMap = new Map(addressShippingMethodMap)
                                          newMap.set(shipment.addressId, method.id)
                                          setAddressShippingMethodMap(newMap)
                                          setIsLoadingShippingMethod(false)
                                        }, 300)
                                      }
                                    }}
                                    disabled={isAnyLoading}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium text-brand-black">{method.name}</p>
                                        <p className="text-sm text-brand-gray-500 mt-0.5">{method.description}</p>
                                      </div>
                                      <p className={`font-medium ${method.price === 0 ? 'text-green-600' : 'text-brand-black'}`}>
                                        {method.price === 0 ? 'Free' : `$${method.price.toFixed(2)}`}
                                      </p>
                                    </div>
                                  </RadioOption>
                                )
                              })}
                            </div>
                            
                            {/* Gift wrapping option */}
                            <label className="flex items-center gap-2 text-sm text-brand-gray-600 cursor-pointer mt-4 pt-4 border-t border-brand-gray-100">
                              <input type="checkbox" className="w-4 h-4 rounded border-brand-gray-300 text-brand-blue-500 focus:ring-brand-blue-500" />
                              <span>Send as a gift (gift wrapping)</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    /* Single ship: Show standard shipping method selection */
                    <div className="space-y-3">
                      {SHIPPING_METHODS.map((method) => (
                        <RadioOption
                          key={method.id}
                          selected={selectedShippingMethod === method.id}
                          onClick={() => {
                            if (!isAnyLoading) {
                              setIsLoadingShippingMethod(true)
                              setTimeout(() => {
                                setSelectedShippingMethod(method.id)
                                setIsLoadingShippingMethod(false)
                              }, 300)
                            }
                          }}
                          disabled={isAnyLoading}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-brand-black">{method.name}</p>
                              <p className="text-sm text-brand-gray-500 mt-0.5">{method.description}</p>
                            </div>
                            <p className={`font-medium ${method.price === 0 ? 'text-green-600' : 'text-brand-black'}`}>
                              {method.price === 0 ? 'Free' : `$${method.price.toFixed(2)}`}
                            </p>
                          </div>
                        </RadioOption>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={handleShippingMethodSubmit}
                    disabled={isAnyLoading}
                    className="w-full py-3 bg-brand-blue-500 text-white rounded-lg font-medium hover:bg-brand-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                  >
                    {isLoadingShippingMethod && (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    Continue to Payment
                  </button>
                </div>
              </SectionCard>
              </div>
            )}

            {/* Payment Section */}
            <div ref={paymentSectionRef}>
            <SectionCard
              title="Payment"
              isActive={isStepActive('payment')}
              isCompleted={isStepCompleted('payment')}
              isUpcoming={isStepUpcoming('payment')}
              onEdit={() => goToStep('payment')}
              headerAction={
                isStepActive('payment') && (
                  <button
                    onClick={handleOpenAddPayment}
                    className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black hover:bg-brand-gray-50 rounded-lg transition-colors shadow-sm"
                  >
                    Add payment method
                  </button>
                )
              }
              summary={
                getSelectedPayment() && (
                  <div className="text-sm text-brand-gray-600 space-y-1">
                    <p className="font-medium text-brand-black">
                      {getSelectedPayment()?.brand} •••• {getSelectedPayment()?.lastFour}
                    </p>
                    <p>Expires {getSelectedPayment()?.expiryMonth}/{getSelectedPayment()?.expiryYear}</p>
                    {(() => {
                      const billingAddr = getBillingAddressForPayment(getSelectedPayment())
                      const isOverridden = overrideBillingAddress && selectedPaymentId === getSelectedPayment()?.id
                      return (
                        <p className="text-xs text-brand-gray-500">
                          {billingAddr ? (
                            <>
                              Billing: {billingAddr.firstName} {billingAddr.lastName}, {billingAddr.city}
                              {isOverridden && <span className="ml-1 text-brand-blue-600">(overridden)</span>}
                            </>
                          ) : (
                            <>
                              Billing: Same as shipping address
                              {isOverridden && <span className="ml-1 text-brand-blue-600">(overridden)</span>}
                            </>
                          )}
                        </p>
                      )
                    })()}
                  </div>
                )
              }
            >
              <div className="space-y-4">
                {/* Saved Payment Methods (for registered users) */}
                {user && savedPaymentMethods.length > 0 && (
                  <div className="space-y-4">
                    {savedPaymentMethods.map((payment) => {
                      const isSelected = selectedPaymentId === payment.id
                      const getBrandColor = () => {
                        if (payment.brand === 'Visa') return 'bg-payment-visa-blue'
                        if (payment.brand === 'Mastercard') return 'bg-payment-mastercard-red'
                        return 'bg-brand-gray-100'
                      }
                      const getBrandDisplay = () => {
                        if (payment.brand === 'Mastercard') return 'MC'
                        if (payment.brand === 'Visa') return 'VISA'
                        return payment.brand?.toUpperCase() || 'CARD'
                      }
                      const isACH = payment.type === 'ach'
                      return (
                        <div
                          key={payment.id}
                          className={`bg-white border rounded-xl shadow-sm p-6 relative transition-all ${
                            isSelected ? 'border-brand-blue-500' : 'border-brand-gray-200 hover:border-brand-gray-300'
                          } ${isAnyLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          onClick={() => {
                            if (isAnyLoading || payment.id === selectedPaymentId) return
                            setIsLoadingPaymentSelection(true)
                            // Simulate API call
                            setTimeout(() => {
                              setSelectedPaymentId(payment.id)
                              // Don't mark payment step as completed - user must click "Review Order"
                              // Reset override when selecting a different payment method
                              setOverrideBillingAddress(false)
                              setOverrideBillingAddressId(undefined)
                              setShowNewBillingAddressInOverride(false)
                              setNewBillingAddressForm({
                                firstName: '',
                                lastName: '',
                                addressLine1: '',
                                addressLine2: '',
                                city: '',
                                state: '',
                                zipCode: '',
                                country: 'United States',
                                phone: '',
                              })
                              setIsLoadingPaymentSelection(false)
                            }, 300)
                          }}
                        >
                          {/* Radio Button */}
                          <div className="absolute top-6 left-6">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-brand-blue-500' : 'border-brand-gray-300'
                            }`}>
                              {isSelected && (
                                <div className="w-3 h-3 rounded-full bg-brand-blue-500" />
                              )}
                            </div>
                          </div>

                          {/* Card Brand Icon */}
                          <div className="absolute top-6 right-6">
                            {isACH ? (
                              <svg className="w-6 h-6 text-brand-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            ) : (
                              <div className={`w-10 h-6 ${getBrandColor()} rounded flex items-center justify-center`}>
                                <span className="text-white text-xs font-bold">{getBrandDisplay()}</span>
                              </div>
                            )}
                          </div>

                          {/* Card Info */}
                          <div className="flex-1 pl-10 pr-20">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-base font-medium text-brand-black">
                                {isACH ? `ACH ${payment.bankName || 'Bank Account'}` : `${payment.brand} **** ${payment.lastFour}`}
                              </span>
                              {payment.isDefault && (
                                <span className="px-2 py-0.5 bg-brand-blue-100 text-brand-blue-700 text-xs font-semibold rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            {!isACH && payment.expiryMonth && payment.expiryYear && (
                              <p className="text-sm text-brand-gray-600">
                                Expires {payment.expiryMonth}/{payment.expiryYear}
                              </p>
                            )}
                            {isACH && payment.cardholderName && (
                              <p className="text-sm text-brand-gray-600">
                                {payment.cardholderName}
                              </p>
                            )}
                            {(() => {
                              const billingAddr = getBillingAddressForPayment(payment)
                              return (
                                <p className="text-xs text-brand-gray-500 mt-1">
                                  {billingAddr ? (
                                    <>Billing: {billingAddr.firstName} {billingAddr.lastName}, {billingAddr.city}</>
                                  ) : (
                                    <>Billing: Same as shipping address</>
                                  )}
                                </p>
                              )
                            })()}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Guest or No Saved Payment Methods - Show Add New Card button */}
                {(!user || savedPaymentMethods.length === 0) && (
                  <button
                    onClick={handleOpenAddPayment}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-brand-gray-600 hover:text-brand-gray-700 px-4 py-3 bg-brand-gray-50 rounded-lg hover:bg-brand-gray-100 transition-colors border border-brand-gray-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Card
                  </button>
                )}

                {/* Billing Address Override (only show when a payment method is selected) */}
                {selectedPaymentId && getSelectedPayment() && (
                  <div className="border-t border-brand-gray-200 pt-4 mt-4">
                    <label className="flex items-center gap-2 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={overrideBillingAddress}
                        onChange={(e) => {
                          setOverrideBillingAddress(e.target.checked)
                          if (!e.target.checked) {
                            // Reset override when unchecked
                            setOverrideBillingAddressId(undefined)
                            setShowNewBillingAddressInOverride(false)
                            setNewBillingAddressForm({
                              firstName: '',
                              lastName: '',
                              addressLine1: '',
                              addressLine2: '',
                              city: '',
                              state: '',
                              zipCode: '',
                              country: 'United States',
                              phone: '',
                            })
                          } else {
                            // Default to same as shipping when enabling override
                            setOverrideBillingAddressId(null)
                          }
                        }}
                        className="w-4 h-4 rounded border-brand-gray-300 text-brand-blue-500 focus:ring-brand-blue-500"
                      />
                      <span className="text-sm text-brand-black">Use a different billing address</span>
                    </label>

                    {overrideBillingAddress && (
                      <div className="mt-3 space-y-3">
                        <div className="relative">
                          <select
                            value={showNewBillingAddressInOverride ? 'add-new' : (overrideBillingAddressId === null ? 'same-as-shipping' : (overrideBillingAddressId || ''))}
                            className={`w-full px-4 py-3 pr-10 border border-brand-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent appearance-none bg-white ${
                              overrideBillingAddressId !== undefined || showNewBillingAddressInOverride ? 'text-brand-black' : 'text-brand-gray-400'
                            }`}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === 'add-new') {
                                setShowNewBillingAddressInOverride(true)
                                setOverrideBillingAddressId(undefined)
                              } else if (value === 'same-as-shipping') {
                                setOverrideBillingAddressId(null)
                                setShowNewBillingAddressInOverride(false)
                              } else if (value) {
                                setOverrideBillingAddressId(value)
                                setShowNewBillingAddressInOverride(false)
                              } else {
                                setOverrideBillingAddressId(undefined)
                                setShowNewBillingAddressInOverride(false)
                              }
                            }}
                          >
                            <option value="">Select an Address</option>
                            <option value="same-as-shipping">Same as shipping address</option>
                            {savedAddresses.map((addr) => (
                              <option key={addr.id} value={addr.id}>
                                {addr.firstName} {addr.lastName} - {addr.addressLine1}, {addr.city}
                              </option>
                            ))}
                            <option value="add-new">+ Add new</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-4 h-4 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                            </svg>
                          </div>
                        </div>

                        {/* New Billing Address Form */}
                        {showNewBillingAddressInOverride && (
                          <div className="mt-4 space-y-3 p-4 bg-brand-gray-50 rounded-lg">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-brand-black mb-1.5">First Name*</label>
                                <input
                                  type="text"
                                  value={newBillingAddressForm.firstName || ''}
                                  onChange={(e) => setNewBillingAddressForm({ ...newBillingAddressForm, firstName: e.target.value })}
                                  className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-brand-black text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                                  placeholder="John"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-brand-black mb-1.5">Last Name*</label>
                                <input
                                  type="text"
                                  value={newBillingAddressForm.lastName || ''}
                                  onChange={(e) => setNewBillingAddressForm({ ...newBillingAddressForm, lastName: e.target.value })}
                                  className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-brand-black text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                                  placeholder="Doe"
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-brand-black mb-1.5">Address Line 1*</label>
                              <input
                                type="text"
                                value={newBillingAddressForm.addressLine1 || ''}
                                onChange={(e) => setNewBillingAddressForm({ ...newBillingAddressForm, addressLine1: e.target.value })}
                                className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-brand-black text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                                placeholder="123 Main Street"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-brand-black mb-1.5">Address Line 2 (Optional)</label>
                              <input
                                type="text"
                                value={newBillingAddressForm.addressLine2 || ''}
                                onChange={(e) => setNewBillingAddressForm({ ...newBillingAddressForm, addressLine2: e.target.value })}
                                className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-brand-black text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                                placeholder="Apt 4B"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-brand-black mb-1.5">City*</label>
                                <input
                                  type="text"
                                  value={newBillingAddressForm.city || ''}
                                  onChange={(e) => setNewBillingAddressForm({ ...newBillingAddressForm, city: e.target.value })}
                                  className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-brand-black text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                                  placeholder="New York"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-brand-black mb-1.5">State*</label>
                                <div className="relative">
                                  <select
                                    value={newBillingAddressForm.state || ''}
                                    onChange={(e) => setNewBillingAddressForm({ ...newBillingAddressForm, state: e.target.value })}
                                    className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-brand-black text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent appearance-none bg-white"
                                    required
                                  >
                                    <option value="">Select State</option>
                                    <option value="CA">California</option>
                                    <option value="NY">New York</option>
                                    <option value="TX">Texas</option>
                                    <option value="FL">Florida</option>
                                    <option value="IL">Illinois</option>
                                    <option value="PA">Pennsylvania</option>
                                    <option value="OH">Ohio</option>
                                    <option value="GA">Georgia</option>
                                    <option value="NC">North Carolina</option>
                                    <option value="MI">Michigan</option>
                                  </select>
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-brand-black mb-1.5">ZIP Code*</label>
                                <input
                                  type="text"
                                  value={newBillingAddressForm.zipCode || ''}
                                  onChange={(e) => setNewBillingAddressForm({ ...newBillingAddressForm, zipCode: e.target.value })}
                                  className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-brand-black text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                                  placeholder="10001"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-brand-black mb-1.5">Country*</label>
                                <input
                                  type="text"
                                  value={newBillingAddressForm.country || 'United States'}
                                  onChange={(e) => setNewBillingAddressForm({ ...newBillingAddressForm, country: e.target.value })}
                                  className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-brand-black text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                                  placeholder="United States"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Marketing Consent (Guest Checkout Only) */}
                {!user && (
                  <div className="border border-brand-gray-200 rounded-lg p-4 mt-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={marketingConsent}
                        onChange={(e) => setMarketingConsent(e.target.checked)}
                        className="w-5 h-5 mt-0.5 border-brand-gray-300 rounded text-brand-blue-500 focus:ring-brand-blue-500 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-brand-black">
                          I wish to receive product updates, news and promotions from Market Street.
                        </p>
                        <p className="text-xs text-brand-gray-500 mt-1">
                          By clicking below and placing your order, you agree (i) to make your purchase from Salesforce as merchant of record for this transaction, subject to Salesforce&apos;s{' '}
                          <Link href="/terms" className="text-brand-blue-500 hover:underline">Terms & Conditions</Link>; (ii) that your information will be handled by Salesforce in accordance with the{' '}
                          <Link href="/privacy" className="text-brand-blue-500 hover:underline">Salesforce Privacy Policy</Link>.
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                <button
                  onClick={handlePaymentSubmit}
                  disabled={isAnyLoading}
                  className="w-full py-3 bg-brand-blue-500 text-white rounded-lg font-medium hover:bg-brand-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                >
                  {isLoadingPayment && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  Review Order
                </button>
              </div>
            </SectionCard>
            </div>

            {/* Place Order Button */}
            {isStepCompleted('payment') && (
              <div ref={reviewSectionRef} className="bg-white border border-brand-gray-200 rounded-lg shadow-md p-4 md:p-6">
                <p className="text-sm text-brand-gray-600 mb-4">
                  By placing your order, you agree to our{' '}
                  <Link href="/terms" className="text-brand-blue-500 hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-brand-blue-500 hover:underline">Privacy Policy</Link>.
                </p>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isAnyLoading}
                  className="w-full py-4 bg-brand-blue-500 text-white rounded-lg font-semibold text-lg hover:bg-brand-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Place Order - ${calculations.total.toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="w-full lg:w-[343px] flex-shrink-0 order-first lg:order-last">
            <OrderSummary
              items={cartItems}
              subtotal={calculations.subtotal}
              shipping={calculations.shipping}
              tax={calculations.tax}
              discount={discount}
              total={calculations.total}
              promoCode={promoCode}
              onApplyPromo={handleApplyPromo}
              onRemovePromo={handleRemovePromo}
              isLoading={isProcessing}
            />
          </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-sm text-brand-gray-600 text-center">
            © Salesforce Foundations 1818 Cornwall Ave, Vancouver BC V5J 1C7
          </div>
        </div>
      </footer>

      {/* Store Locator Modal */}
      <StoreLocatorModal
        isOpen={showStoreLocator}
        onClose={() => setShowStoreLocator(false)}
        onSelectStore={handleStoreSelect}
      />

      {/* Add/Edit Address Modal (matches MyAccountPage pattern) */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div data-modal-overlay className="fixed inset-0 bg-black bg-opacity-50" onClick={handleCloseAddressModal} />
          <div data-modal-center className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <ModalHeader
                title={editingAddressId ? 'Edit address' : 'Add new address'}
                onClose={handleCloseAddressModal}
                closeAriaLabel="Close"
              />

              {/* Modal Form */}
              <div className="p-6 space-y-4">
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
                  <label className="block text-sm font-medium text-brand-black mb-2">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={addressForm.addressLine2 || ''}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                    className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                    placeholder="Apt, Suite, etc."
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
                    <label className="block text-sm font-medium text-brand-black mb-2">State</label>
                    <div className="relative">
                      <select
                        value={addressForm.state || ''}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="w-full px-4 py-2 pr-10 border border-brand-gray-300 rounded-lg text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="">Select State</option>
                        <option value="CA">California</option>
                        <option value="NY">New York</option>
                        <option value="TX">Texas</option>
                        <option value="FL">Florida</option>
                        <option value="IL">Illinois</option>
                        <option value="PA">Pennsylvania</option>
                        <option value="OH">Ohio</option>
                        <option value="GA">Georgia</option>
                        <option value="NC">North Carolina</option>
                        <option value="MI">Michigan</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={addressForm.phone || ''}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-brand-gray-200">
                <button
                  onClick={handleCloseAddressModal}
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAddress}
                  disabled={isAnyLoading}
                  className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoadingAddress && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div data-modal-overlay className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClosePaymentModal} />
          <div data-modal-center className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <ModalHeader
                title="Add Payment Method"
                onClose={handleClosePaymentModal}
                closeAriaLabel="Close"
              />

              {/* Modal Form */}
              <div className="p-6 space-y-5">
                {/* Payment Country Selector */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">Payment Country</label>
                  <div className="relative">
                    <select
                      value={paymentForm.selectedCountry || 'US'}
                      onChange={(e) => {
                        const newCountry = e.target.value as PaymentCountryCode
                        setPaymentForm({ 
                          ...paymentForm, 
                          selectedCountry: newCountry,
                          selectedMethodType: '',
                          cardNumber: '',
                          cardName: '',
                          expiryDate: '',
                          cvv: '',
                        })
                      }}
                      className="w-full px-4 py-3 pr-10 border border-brand-gray-300 rounded-lg text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      {PAYMENT_COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Payment Method Options */}
                {(() => {
                  const country = paymentForm.selectedCountry || 'US'
                  const methods = PAYMENT_METHODS_BY_COUNTRY[country] || []
                  return methods.map((method) => (
                    <div 
                      key={method.id}
                      className={`border rounded-lg transition-all ${
                        paymentForm.selectedMethodType === method.id
                          ? 'border-brand-blue-500 bg-white' 
                          : 'border-brand-gray-200 bg-white hover:border-brand-gray-300'
                      }`}
                    >
                      <label className="flex items-center gap-3 p-4 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentForm.selectedMethodType === method.id}
                          onChange={() => setPaymentForm({ ...paymentForm, selectedMethodType: method.id })}
                          className="w-4 h-4 text-brand-blue-500 border-brand-gray-300 focus:ring-brand-blue-500"
                        />
                        <span className="text-sm font-medium text-brand-black">{method.name}</span>
                        <div className="ml-auto">
                          {method.type === 'credit-card' ? (
                            <svg className="w-8 h-6 text-brand-blue-500" viewBox="0 0 32 24" fill="none">
                              <rect width="32" height="24" rx="4" fill="currentColor" fillOpacity="0.1"/>
                              <rect x="4" y="8" width="8" height="6" rx="1" fill="currentColor"/>
                              <rect x="4" y="16" width="12" height="2" rx="1" fill="currentColor" fillOpacity="0.5"/>
                            </svg>
                          ) : (
                            <svg className="w-8 h-6 text-brand-blue-500" viewBox="0 0 32 24" fill="none">
                              <rect width="32" height="24" rx="4" fill="currentColor" fillOpacity="0.1"/>
                              <rect x="6" y="6" width="20" height="12" rx="2" fill="currentColor" fillOpacity="0.3"/>
                              <rect x="8" y="8" width="16" height="8" rx="1" fill="currentColor"/>
                            </svg>
                          )}
                        </div>
                      </label>
                      
                      {/* Credit Card Form - Expanded */}
                      {paymentForm.selectedMethodType === method.id && method.type === 'credit-card' && (
                        <div className="px-4 pb-4 space-y-3 border-t border-brand-gray-100 pt-3">
                          <div>
                            <input
                              type="text"
                              value={paymentForm.cardName || ''}
                              onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value })}
                              className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-brand-black text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent placeholder-brand-gray-400"
                              placeholder="Name on Card*"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={paymentForm.cardNumber || ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 16)
                                setPaymentForm({ ...paymentForm, cardNumber: value })
                              }}
                              className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-brand-black text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent placeholder-brand-gray-400"
                              placeholder="Card Number*"
                              maxLength={19}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                              <input
                                type="text"
                                value={paymentForm.expiryDate || ''}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                                  let formatted = value
                                  if (value.length >= 2) {
                                    formatted = `${value.slice(0, 2)}/${value.slice(2)}`
                                  }
                                  setPaymentForm({ ...paymentForm, expiryDate: formatted })
                                }}
                                className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-brand-black text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent placeholder-brand-gray-400"
                                placeholder="mm/yy*"
                                maxLength={5}
                              />
                            </div>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-4 h-4 text-brand-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                                  <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                              </div>
                              <input
                                type="text"
                                value={paymentForm.cvv || ''}
                                onChange={(e) => {
                                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 4)
                                  setPaymentForm({ ...paymentForm, cvv: cleaned })
                                }}
                                className="w-full pl-9 pr-3 py-2 border border-brand-gray-300 rounded-lg text-brand-black text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent placeholder-brand-gray-400"
                                placeholder="CVV*"
                                maxLength={4}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                })()}

                {/* Billing Address */}
                <div className="pt-2">
                  <label className="block text-sm font-medium text-brand-black mb-2">Billing Address*</label>
                  
                  {/* Existing Address Selector */}
                  <div className="relative">
                    <select
                      value={paymentForm.billingAddressId === null ? 'same-as-shipping' : (paymentForm.billingAddressId || '')}
                      className={`w-full px-4 py-3 pr-10 border border-brand-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent appearance-none bg-white ${
                        paymentForm.billingAddressId !== undefined ? 'text-brand-black' : 'text-brand-gray-400'
                      }`}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === 'same-as-shipping') {
                          setPaymentForm({ ...paymentForm, billingAddressId: null })
                          setShowNewBillingAddress(false)
                        } else if (value) {
                          setPaymentForm({ ...paymentForm, billingAddressId: value })
                          setShowNewBillingAddress(false)
                        } else {
                          setPaymentForm({ ...paymentForm, billingAddressId: undefined })
                        }
                      }}
                    >
                      <option value="">Select an Address</option>
                      <option value="same-as-shipping">Same as shipping address</option>
                      {savedAddresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.firstName} {addr.lastName} - {addr.addressLine1}, {addr.city}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      const newState = !showNewBillingAddress
                      setShowNewBillingAddress(newState)
                      if (newState) {
                        setPaymentForm({ ...paymentForm, billingAddressId: '' })
                      }
                    }}
                    className="flex items-center gap-1 mt-2 text-sm text-brand-blue-500 hover:text-brand-blue-600 font-medium"
                  >
                    {showNewBillingAddress ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Address
                      </>
                    )}
                  </button>

                  {/* New Billing Address Form */}
                  {showNewBillingAddress && (
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={addressForm.firstName || ''}
                          onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                          className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-brand-black text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent placeholder-brand-gray-400"
                          placeholder="First Name"
                        />
                        <input
                          type="text"
                          value={addressForm.lastName || ''}
                          onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                          className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-brand-black text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent placeholder-brand-gray-400"
                          placeholder="Last Name"
                        />
                      </div>
                      <input
                        type="text"
                        value={addressForm.addressLine1 || ''}
                        onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                        className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-brand-black text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent placeholder-brand-gray-400"
                        placeholder="Address Line 1"
                      />
                      <input
                        type="text"
                        value={addressForm.addressLine2 || ''}
                        onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                        className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-brand-black text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent placeholder-brand-gray-400"
                        placeholder="Address Line 2 (Optional)"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={addressForm.city || ''}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-brand-black text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent placeholder-brand-gray-400"
                          placeholder="City"
                        />
                        <input
                          type="text"
                          value={addressForm.state || ''}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-brand-black text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent placeholder-brand-gray-400"
                          placeholder="State"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={addressForm.zipCode || ''}
                          onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                          className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-brand-black text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent placeholder-brand-gray-400"
                          placeholder="ZIP Code"
                        />
                        <input
                          type="text"
                          value={addressForm.country || 'United States'}
                          onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                          className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg text-brand-black text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent placeholder-brand-gray-400"
                          placeholder="Country"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-brand-gray-200">
                <button
                  onClick={handleClosePaymentModal}
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePayment}
                  disabled={isAnyLoading}
                  className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoadingPaymentMethod && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />
    </div>
  )
}
