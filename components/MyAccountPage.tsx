'use client'

import React, { useState, useEffect } from 'react'
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
import Toast from './Toast'
import QuickViewModal from './QuickViewModal'

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

export default function MyAccountPage() {
  const pathname = usePathname()
  const router = useRouter()
  
  // Determine active section from URL
  const getActiveSectionFromPath = () => {
    if (pathname?.includes('/account-details')) return 'account-details'
    if (pathname?.includes('/order-history')) return 'order-history'
    if (pathname?.includes('/wishlist')) return 'wishlist'
    if (pathname?.includes('/payment')) return 'payment'
    if (pathname?.includes('/addresses')) return 'addresses'
    if (pathname?.includes('/passkeys')) return 'passkeys'
    if (pathname?.includes('/loyalty')) return 'loyalty'
    return 'overview' // Default to overview
  }
  
  const [activeSection, setActiveSection] = useState(getActiveSectionFromPath())
  const wishlistCount = 23 // Total items in default wishlist
  
  // Update active section when pathname changes
  useEffect(() => {
    setActiveSection(getActiveSectionFromPath())
  }, [pathname])

  // Mock data
  const userName = 'John'
  const userLastName = 'Doe'
  const userEmail = 'john.doe@example.com'
  const userPhone = '+1 (555) 123-4567'
  const ordersCount = 350
  const loyaltyPoints = 2450
  const loyaltyStatus = 'Gold' as 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  
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
      steps.push({ label: 'Verify your email', link: '/account/account-details', section: 'account-details' })
    }
    if (!profileCompletion.phoneVerified) {
      steps.push({ label: 'Verify your phone number', link: '/account/account-details', section: 'account-details' })
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

  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [expandedTracking, setExpandedTracking] = useState<Set<string>>(new Set())
  const [showTrackingDropdown, setShowTrackingDropdown] = useState<Record<string, boolean>>({})
  const [selectedWishlistId, setSelectedWishlistId] = useState<string>('my-favorites')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('visa-1')
  const [selectedAddressId, setSelectedAddressId] = useState<string>('address-1')
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
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
  const [renamingWishlistId, setRenamingWishlistId] = useState<string | null>(null)
  const [newWishlistName, setNewWishlistName] = useState('')
  const [wishlistSortBy, setWishlistSortBy] = useState<'recent' | 'name' | 'price-low' | 'price-high'>('recent')
  const [wishlistFilter, setWishlistFilter] = useState<string>('all')
  const [showShareWishlistModal, setShowShareWishlistModal] = useState(false)
  const [sharingWishlistId, setSharingWishlistId] = useState<string | null>(null)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])
  const [wishlists, setWishlists] = useState<Wishlist[]>([])
  const [showCreateWishlistModal, setShowCreateWishlistModal] = useState(false)
  const [showInterestsModal, setShowInterestsModal] = useState(false)
  const [interestsModalCategory, setInterestsModalCategory] = useState<'designStyles' | 'roomTypes' | 'materials' | 'aesthetics' | null>(null)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [preferencesModalCategory, setPreferencesModalCategory] = useState<'productCategories' | null>(null)
  const [isMobileMenuCollapsed, setIsMobileMenuCollapsed] = useState(true)

  // Account Details Edit States
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false)
  const [isEditingInterests, setIsEditingInterests] = useState(false)
  const [isEditingPreferences, setIsEditingPreferences] = useState(false)
  const [isEditingProfileVisibility, setIsEditingProfileVisibility] = useState(false)
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

  const [interestsForm, setInterestsForm] = useState({
    designStyles: ['Minimalist', 'Geometric'],
    roomTypes: ['Living Room', 'Office'],
    materials: ['Ceramic'],
    aesthetics: ['Modern'],
  })

  const [preferencesForm, setPreferencesForm] = useState({
    newsletter: true,
    productCategories: ['Geometric', 'Sets'],
    shoppingPreferences: 'unisex' as 'womens' | 'mens' | 'unisex',
    preferredStore: '',
    sizePreference: '',
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

  const recentOrders: Order[] = [
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
          shippingGroup: 'sf-store-address1',
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
          store: 'Market Street San Francisco',
          shippingGroup: 'sf-store-address1',
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
          shippingGroup: 'sf-store-address2',
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
          shippingGroup: 'ny-store-address1',
        },
      ],
      subtotal: 60.00,
      promotions: -10.00,
      shipping: 0.00,
      tax: 4.00,
      total: 54.00,
      paymentInfo: 'VISA Ending in 1234',
      shippingAddress: 'John Doe, 415 Mission Street, 94105, San Francisco, CA, United States',
      shippingMethod: 'Free | Standard Shipping',
      deliveryDate: 'Sep 15-16, 2024',
      shippingGroups: [
        {
          groupId: 'sf-store-address1',
          store: 'Market Street San Francisco',
          status: 'Delivered',
          trackingNumber: '1Z999AA10123456784',
          carrier: 'UPS',
          carrierTrackingUrl: 'https://www.ups.com/track?tracknum=1Z999AA10123456784',
          deliveryDate: 'Sep 15, 2024',
          shippingMethod: 'Standard Shipping',
          shippingAddress: 'John Doe, 415 Mission Street, 94105, San Francisco, CA, United States',
        },
        {
          groupId: 'sf-store-address2',
          store: 'Market Street San Francisco',
          status: 'In Transit',
          trackingNumber: '1Z999AA10123456785',
          carrier: 'UPS',
          carrierTrackingUrl: 'https://www.ups.com/track?tracknum=1Z999AA10123456785',
          deliveryDate: 'Sep 20-22, 2024',
          shippingMethod: 'Express Shipping',
          shippingAddress: 'Jane Smith, 789 Market Street, 94103, San Francisco, CA, United States',
        },
        {
          groupId: 'ny-store-address1',
          store: 'Market Street New York',
          status: 'In Transit',
          trackingNumber: '9400111899223197428490',
          carrier: 'USPS',
          carrierTrackingUrl: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111899223197428490',
          deliveryDate: 'Sep 18-19, 2024',
          shippingMethod: 'Standard Shipping',
          shippingAddress: 'John Doe, 415 Mission Street, 94105, San Francisco, CA, United States',
        },
      ],
      canReturn: true,
      canCancel: false,
      returnDeadline: 'Oct 15, 2024',
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
    },
    { 
      orderNumber: 'INV002', 
      status: 'In Transit', 
      method: 'Credit Card', 
      amount: '$43.00',
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
      orderNumber: 'INV003', 
      status: 'Ready for Pickup', 
      method: 'Credit Card', 
      amount: '$48.38',
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
          color: 'Black', // Assuming a color for Fine Cone
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
    { 
      orderNumber: 'INV005', 
      status: 'Delivered', 
      method: 'Credit Card', 
      amount: '$250.00',
      items: [
        { image: '/images/products/fine-cone-1.png', name: 'Fine Cone', id: 'item-2', quantity: 1 },
        { image: '/images/products/soft-sphere-1.png', name: 'Soft Sphere', id: 'item-3', quantity: 1 },
        { image: '/images/products/solid-cylinder-1.png', name: 'Solid Cylinder', id: 'item-4', quantity: 1 },
      ],
      subtotal: 220.00,
      promotions: -15.00,
      shipping: 0.00,
      tax: 18.38,
      total: 223.38,
      paymentInfo: 'VISA Ending in 7890',
      shippingAddress: 'John Doe, 415 Mission Street, 94105, San Francisco, CA, United States',
      shippingMethod: 'Free | Standard Shipping',
      deliveryDate: 'Sep 5, 2024',
      trackingNumber: '1Z999AA10123456787',
      carrier: 'UPS',
      carrierTrackingUrl: 'https://www.ups.com/track?tracknum=1Z999AA10123456787',
      canReturn: true,
      canCancel: false,
      returnDeadline: 'Oct 5, 2024',
    },
  ]

  const toggleOrderDetails = (orderNumber: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(orderNumber)) {
        newSet.delete(orderNumber)
      } else {
        newSet.add(orderNumber)
      }
      return newSet
    })
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

  const handleRemoveAddress = (addressId: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== addressId))
    if (selectedAddressId === addressId) {
      const remaining = addresses.filter(addr => addr.id !== addressId)
      if (remaining.length > 0) {
        setSelectedAddressId(remaining[0].id)
      }
    }
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

  const curatedProducts: Product[] = getFeaturedProducts().slice(0, 5)

  const handleCuratedAddToCart = (product: Product, size?: string, color?: string) => {
    console.log('Add to cart:', product.id, { size, color })
    // Add to cart logic here
  }

  const handleCuratedQuickView = (product: Product) => {
    setQuickViewProduct(product)
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
    
    window.addEventListener('wishlistUpdated', handleWishlistUpdate as EventListener)
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate as EventListener)
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
    { id: 'payment', label: 'Payment Methods', count: paymentMethods.length, icon: 'payment', href: '/account/payment' },
    { id: 'passkeys', label: 'Passkeys', icon: 'passkey', href: '/account/passkeys' },
    { id: 'logout', label: 'Log Out', icon: 'logout', href: '#' },
  ]

  const renderIcon = (iconName: string) => {
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

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Account Navigation */}
          <aside className="lg:col-span-1">
            <div className="sticky top-4">
              {/* Mobile Menu Header with Toggle */}
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h2 className="text-lg font-semibold text-brand-black">My Account</h2>
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
                  if (item.id === 'logout') {
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          // Handle logout
                          console.log('Logout clicked')
                        }}
                        className={`w-full flex items-center ${isMobileMenuCollapsed ? 'justify-center lg:justify-between' : 'justify-between'} px-4 py-3 rounded-lg text-left transition-colors text-brand-black hover:bg-brand-gray-50`}
                      >
                        <div className={`flex items-center ${isMobileMenuCollapsed ? 'lg:gap-3' : 'gap-3'}`}>
                          <span className="text-brand-gray-600">
                            {renderIcon(item.icon)}
                          </span>
                          <span className={`text-sm font-medium ${isMobileMenuCollapsed ? 'hidden lg:inline' : ''}`}>
                            {item.label}
                          </span>
                        </div>
                        {!isMobileMenuCollapsed && (
                          <svg className="w-4 h-4 lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>
                    )
                  }
                  
                  return (
                    <Link
                      key={item.id}
                      href={item.href || '#'}
                      onClick={() => {
                        // Close mobile menu when item is clicked (on mobile only)
                        if (window.innerWidth < 1024) {
                          setIsMobileMenuCollapsed(true)
                        }
                      }}
                      className={`group w-full flex items-center ${isMobileMenuCollapsed ? 'justify-center lg:justify-between' : 'justify-between'} px-4 py-3 rounded-lg text-left transition-colors relative ${
                        activeSection === item.id
                          ? 'bg-brand-blue-50 text-brand-blue-600 hover:bg-brand-blue-100'
                          : 'text-brand-black hover:bg-brand-gray-50'
                      }`}
                      title={isMobileMenuCollapsed ? item.label : undefined}
                    >
                      <div className={`flex items-center ${isMobileMenuCollapsed ? 'lg:gap-3' : 'gap-3'}`}>
                        <span className={`transition-colors relative ${isMobileMenuCollapsed && item.count !== undefined ? 'lg:static' : ''}`}>
                          {renderIcon(item.icon)}
                          {isMobileMenuCollapsed && item.count !== undefined && (
                            <span className={`absolute -top-1 -right-1 lg:hidden text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${activeSection === item.id ? 'bg-brand-blue-500 text-white' : 'bg-brand-gray-400 text-white'}`}>
                              {item.count}
                            </span>
                          )}
                        </span>
                        <span className={`text-sm font-medium ${isMobileMenuCollapsed ? 'hidden lg:inline' : ''}`}>
                          {item.label}
                        </span>
                      </div>
                      {!isMobileMenuCollapsed && item.count !== undefined && (
                        <span className={`text-xs ${activeSection === item.id ? 'text-brand-blue-500' : 'text-brand-gray-500'}`}>
                          {item.count}
                        </span>
                      )}
                      {isMobileMenuCollapsed && item.count !== undefined && (
                        <span className={`hidden lg:inline text-xs ${activeSection === item.id ? 'text-brand-blue-500' : 'text-brand-gray-500'}`}>
                          {item.count}
                        </span>
                      )}
                    </Link>
                  )
                })}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeSection === 'overview' && (
              <div className="space-y-8">
                {/* Profile Header */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
                  <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <button
                      onClick={() => setShowAvatarModal(true)}
                      className="relative w-20 h-20 bg-brand-blue-500 rounded-full flex items-center justify-center flex-shrink-0 group cursor-pointer transition-all hover:ring-2 hover:ring-brand-blue-300 hover:ring-offset-2"
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
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-semibold text-brand-black">
                          {userName} {userLastName}
                        </h1>
                        {loyaltyStatus && (
                          <span className="px-3 py-1 bg-brand-blue-100 text-brand-blue-700 text-sm font-semibold rounded-full">
                            {loyaltyStatus} Member
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-brand-gray-600 mb-4">{userEmail}</p>
                      
                      {/* Verification Status */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          {profileCompletion.emailVerified ? (
                            <div className="flex items-center gap-1.5 text-green-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-xs font-medium">Email Verified</span>
                            </div>
                          ) : (
                            <Link 
                              href="/account/account-details"
                              className="flex items-center gap-1.5 text-brand-blue-500 hover:text-brand-blue-600 text-xs font-medium"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Verify Email
                            </Link>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {profileCompletion.phoneVerified ? (
                            <div className="flex items-center gap-1.5 text-green-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-xs font-medium">Phone Verified</span>
                            </div>
                          ) : (
                            <Link 
                              href="/account/account-details"
                              className="flex items-center gap-1.5 text-brand-blue-500 hover:text-brand-blue-600 text-xs font-medium"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Verify Phone
                            </Link>
                          )}
                        </div>
                      </div>
                      
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
                  <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-brand-gray-50 border-b border-brand-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-medium text-brand-black w-[120px]">Order Number</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-brand-black w-[200px]">Status</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-brand-black">Method</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-brand-black w-[100px]">Amount</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-brand-black w-[130px]"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-gray-200">
                          {recentOrders.slice(0, 5).map((order, idx) => {
                            const isExpanded = expandedOrders.has(order.orderNumber)
                            return (
                              <React.Fragment key={idx}>
                                <tr className="hover:bg-brand-gray-50 transition-colors">
                                  <td className="px-6 py-4 text-sm text-brand-black">{order.orderNumber}</td>
                                  <td className="px-6 py-4">
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
                                  </td>
                                  <td className="px-6 py-4 text-sm text-brand-black">{order.method}</td>
                                  <td className="px-6 py-4 text-sm text-brand-black">{order.amount}</td>
                                  <td className="px-6 py-4">
                                    <button 
                                      onClick={() => toggleOrderDetails(order.orderNumber)}
                                      className="px-4 py-2 bg-white border border-brand-gray-300 text-sm font-medium text-brand-black rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm whitespace-nowrap"
                                    >
                                      {isExpanded ? 'Hide details' : 'View details'}
                                    </button>
                                  </td>
                                </tr>
                                {isExpanded && order.items && (
                                  <tr>
                                    <td colSpan={5} className="px-6 py-8 bg-brand-gray-50 animate-order-expand">
                                      <div className="space-y-6">
                                        {/* Header with View Full Details Link */}
                                        <div className="flex items-center justify-between pb-4 border-b border-brand-gray-200">
                                          <h3 className="text-lg font-semibold text-brand-black">Order Details</h3>
                                          <Link
                                            href={`/order/${order.orderNumber}`}
                                            className="text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline font-medium flex items-center gap-1.5"
                                          >
                                            View Full Order Details
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                          </Link>
                                        </div>

                                        {/* Order Summary and Payment Method - At Top */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-brand-gray-200">
                                          {/* Order Summary */}
                                          <div>
                                            <h4 className="text-sm font-semibold text-brand-black mb-3">Order Summary</h4>
                                            <div className="bg-white rounded-lg border border-brand-gray-200 p-4 space-y-2">
                                              <div className="flex justify-between text-sm">
                                                <span className="text-brand-gray-600">Subtotal</span>
                                                <span className="text-brand-black">${order.subtotal?.toFixed(2)}</span>
                                              </div>
                                              {order.promotions && order.promotions !== 0 && (
                                                <div className="flex justify-between text-sm">
                                                  <span className="text-brand-gray-600">Promotions</span>
                                                  <span className="text-green-600">-${Math.abs(order.promotions || 0).toFixed(2)}</span>
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
                                                  <span className="text-base font-semibold text-brand-black">Total</span>
                                                  <span className="text-base font-semibold text-brand-black">${order.total?.toFixed(2)}</span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          {/* Payment Method */}
                                          <div>
                                            <h4 className="text-sm font-semibold text-brand-black mb-3">Payment Method</h4>
                                            <div className="bg-white rounded-lg border border-brand-gray-200 p-4">
                                              <p className="text-sm text-brand-gray-700">{order.paymentInfo}</p>
                                            </div>
                                            
                                            {/* Return Information */}
                                            {order.canReturn && order.returnDeadline && (
                                              <div className="mt-4">
                                                <p className="text-sm text-brand-gray-700">
                                                  Eligible for return until {order.returnDeadline}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Items Ordered - Grouped by Shipment */}
                                        <div>
                                          <h3 className="text-lg font-semibold text-brand-black mb-4">Items Ordered</h3>
                                          {(() => {
                                            // Group items by shipping group ID (which represents a shipment/address)
                                            const shippingGroupsMap = new Map(
                                              order.shippingGroups?.map(sg => [sg.groupId, sg]) || []
                                            )
                                            
                                            // Group items by shippingGroup ID
                                            const groupedItems = order.items.reduce((acc, item) => {
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
                                            }, {} as Record<string, { groupId: string; items: typeof order.items }>)

                                            const groups = Object.entries(groupedItems)
                                            
                                            return (
                                              <div className="space-y-6">
                                                {groups.map(([groupKey, group], groupIdx) => {
                                                  // Find matching shipping group data
                                                  const shippingGroup = order.shippingGroups?.find(sg => sg.groupId === groupKey)
                                                  const shipmentNumber = groupIdx + 1
                                                  const shipmentAddress = shippingGroup?.shippingAddress || order.shippingAddress
                                                  
                                                  return (
                                                    <div key={groupKey} className={groupIdx > 0 ? 'pt-6 border-t border-brand-gray-200' : ''}>
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
                                                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                                            shippingGroup.status === 'Delivered' || shippingGroup.status === 'Picked Up'
                                                              ? 'bg-green-100 text-green-700'
                                                              : shippingGroup.status === 'In Transit' || shippingGroup.status === 'Ready for Pickup'
                                                              ? 'bg-blue-100 text-blue-700'
                                                              : shippingGroup.status === 'Cancelled'
                                                              ? 'bg-red-100 text-red-700'
                                                              : 'bg-gray-100 text-gray-700'
                                                          }`}>
                                                            {shippingGroup.status}
                                                          </span>
                                                        )}
                                                      </div>

                                                      {/* Items - Horizontal Layout */}
                                                      <div className="flex flex-wrap gap-3 mb-4">
                                                        {group.items.map((item, idx) => (
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
                                                              {item.price && (
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
                                                              )}
                                                            </div>
                                                          </div>
                                                        ))}
                                                      </div>

                                                      {/* Collapsible Tracking/Shipping or Pickup Info for this group */}
                                                      {shippingGroup && (
                                                        <div>
                                                          <button
                                                            onClick={() => {
                                                              const trackingKey = `${order.orderNumber}-${groupKey}`
                                                              setExpandedTracking(prev => {
                                                                const newSet = new Set(prev)
                                                                if (newSet.has(trackingKey)) {
                                                                  newSet.delete(trackingKey)
                                                                } else {
                                                                  newSet.add(trackingKey)
                                                                }
                                                                return newSet
                                                              })
                                                            }}
                                                            className="flex items-center justify-between w-full text-left text-sm font-semibold text-brand-black mb-2 hover:text-brand-blue-600 transition-colors"
                                                          >
                                                            <span>{shippingGroup.isBOPIS ? 'Pickup Information' : 'Tracking & Shipping Information'}</span>
                                                            <svg 
                                                              className={`w-4 h-4 transition-transform ${expandedTracking.has(`${order.orderNumber}-${groupKey}`) ? 'rotate-180' : ''}`}
                                                              fill="none" 
                                                              stroke="currentColor" 
                                                              viewBox="0 0 24 24"
                                                            >
                                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                          </button>
                                                          {expandedTracking.has(`${order.orderNumber}-${groupKey}`) && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-brand-gray-50 rounded-lg p-3">
                                                          {shippingGroup.isBOPIS ? (
                                                            <>
                                                              {/* Pickup Information */}
                                                              <div>
                                                                <h5 className="text-xs font-semibold text-brand-black mb-2">Pickup Information</h5>
                                                                <div className="bg-brand-blue-50 border border-brand-blue-200 rounded-lg p-2 space-y-1.5">
                                                                  {shippingGroup.pickupLocation && (
                                                                    <div>
                                                                      <p className="text-xs font-medium text-brand-gray-600 mb-0.5">Pickup Location</p>
                                                                      <p className="text-xs font-medium text-brand-black">{shippingGroup.pickupLocation}</p>
                                                                    </div>
                                                                  )}
                                                                  {shippingGroup.pickupAddress && (
                                                                    <div>
                                                                      <p className="text-xs font-medium text-brand-gray-600 mb-0.5">Store Address</p>
                                                                      <p className="text-xs text-brand-black">{shippingGroup.pickupAddress}</p>
                                                                    </div>
                                                                  )}
                                                                  {shippingGroup.pickupReadyDate && (
                                                                    <div>
                                                                      <p className="text-xs font-medium text-brand-gray-600 mb-0.5">Ready for Pickup</p>
                                                                      <p className="text-xs font-medium text-brand-black">{shippingGroup.pickupReadyDate}</p>
                                                                    </div>
                                                                  )}
                                                                </div>
                                                              </div>
                                                              {/* Pickup Details */}
                                                              <div>
                                                                <h5 className="text-xs font-semibold text-brand-black mb-2">Pickup Details</h5>
                                                                <div className="bg-white rounded-lg border border-brand-gray-200 p-2">
                                                                  <p className="text-xs text-brand-gray-600">
                                                                    Your order is ready for pickup. Please bring a valid ID and your order confirmation.
                                                                  </p>
                                                                </div>
                                                              </div>
                                                            </>
                                                          ) : (
                                                            <>
                                                              {/* Tracking Information */}
                                                              {shippingGroup.trackingNumber && (
                                                                <div>
                                                                  <h5 className="text-xs font-semibold text-brand-black mb-2">Tracking</h5>
                                                                  <div className="bg-brand-blue-50 border border-brand-blue-200 rounded-lg p-2 space-y-1.5">
                                                                    <div>
                                                                      <p className="text-xs font-medium text-brand-gray-600 mb-0.5">Tracking Number</p>
                                                                      <p className="text-xs font-mono font-medium text-brand-black">{shippingGroup.trackingNumber}</p>
                                                                    </div>
                                                                    {shippingGroup.carrier && (
                                                                      <div>
                                                                        <p className="text-xs font-medium text-brand-gray-600 mb-0.5">Carrier</p>
                                                                        <p className="text-xs font-medium text-brand-black">{shippingGroup.carrier}</p>
                                                                      </div>
                                                                    )}
                                                                    {shippingGroup.deliveryDate && (
                                                                      <div>
                                                                        <p className="text-xs font-medium text-brand-gray-600 mb-0.5">Estimated Delivery</p>
                                                                        <p className="text-xs font-medium text-brand-black">{shippingGroup.deliveryDate}</p>
                                                                      </div>
                                                                    )}
                                                                    {shippingGroup.carrierTrackingUrl && (
                                                                      <a
                                                                        href={shippingGroup.carrierTrackingUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 text-xs text-brand-blue-500 hover:text-brand-blue-600 hover:underline font-medium mt-1"
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
                                                                <div className="bg-white rounded-lg border border-brand-gray-200 p-2 space-y-1.5">
                                                                  {shippingGroup.shippingAddress && (
                                                                    <div>
                                                                      <p className="text-xs font-medium text-brand-gray-500 mb-0.5">Shipping Address</p>
                                                                      <p className="text-xs text-brand-black">{shippingGroup.shippingAddress}</p>
                                                                    </div>
                                                                  )}
                                                                  {shippingGroup.shippingMethod && (
                                                                    <div>
                                                                      <p className="text-xs font-medium text-brand-gray-500 mb-0.5">Shipping Method</p>
                                                                      <p className="text-xs text-brand-black">{shippingGroup.shippingMethod}</p>
                                                                    </div>
                                                                  )}
                                                                </div>
                                                              </div>
                                                            </>
                                                          )}
                                                            </div>
                                                          )}
                                                        </div>
                                                      )}
                                                      {!shippingGroup && order.trackingNumber && (
                                                        // For simple orders without shippingGroups but with tracking info
                                                        <div>
                                                          <button
                                                            onClick={() => {
                                                              const trackingKey = `${order.orderNumber}-default`
                                                              setExpandedTracking(prev => {
                                                                const newSet = new Set(prev)
                                                                if (newSet.has(trackingKey)) {
                                                                  newSet.delete(trackingKey)
                                                                } else {
                                                                  newSet.add(trackingKey)
                                                                }
                                                                return newSet
                                                              })
                                                            }}
                                                            className="flex items-center justify-between w-full text-left text-sm font-semibold text-brand-black mb-2 hover:text-brand-blue-600 transition-colors"
                                                          >
                                                            <span>Tracking & Shipping Information</span>
                                                            <svg 
                                                              className={`w-4 h-4 transition-transform ${expandedTracking.has(`${order.orderNumber}-default`) ? 'rotate-180' : ''}`}
                                                              fill="none" 
                                                              stroke="currentColor" 
                                                              viewBox="0 0 24 24"
                                                            >
                                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                          </button>
                                                          {expandedTracking.has(`${order.orderNumber}-default`) && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-brand-gray-50 rounded-lg p-3">
                                                            {/* Tracking Information */}
                                                            <div>
                                                              <h5 className="text-xs font-semibold text-brand-black mb-2">Tracking</h5>
                                                              <div className="bg-brand-blue-50 border border-brand-blue-200 rounded-lg p-2 space-y-1.5">
                                                                <div>
                                                                  <p className="text-xs font-medium text-brand-gray-600 mb-0.5">Tracking Number</p>
                                                                  <p className="text-xs font-mono font-medium text-brand-black">{order.trackingNumber}</p>
                                                                </div>
                                                                {order.carrier && (
                                                                  <div>
                                                                    <p className="text-xs font-medium text-brand-gray-600 mb-0.5">Carrier</p>
                                                                    <p className="text-xs font-medium text-brand-black">{order.carrier}</p>
                                                                  </div>
                                                                )}
                                                                {order.deliveryDate && (
                                                                  <div>
                                                                    <p className="text-xs font-medium text-brand-gray-600 mb-0.5">Estimated Delivery</p>
                                                                    <p className="text-xs font-medium text-brand-black">{order.deliveryDate}</p>
                                                                  </div>
                                                                )}
                                                                {order.carrierTrackingUrl && (
                                                                  <a
                                                                    href={order.carrierTrackingUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-xs text-brand-blue-500 hover:text-brand-blue-600 hover:underline font-medium mt-1"
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
                                                              <div className="bg-white rounded-lg border border-brand-gray-200 p-2 space-y-1.5">
                                                                {order.shippingAddress && (
                                                                  <div>
                                                                    <p className="text-xs font-medium text-brand-gray-500 mb-0.5">Shipping Address</p>
                                                                    <p className="text-xs text-brand-black">{order.shippingAddress}</p>
                                                                  </div>
                                                                )}
                                                                {order.shippingMethod && (
                                                                  <div>
                                                                    <p className="text-xs font-medium text-brand-gray-500 mb-0.5">Shipping Method</p>
                                                                    <p className="text-xs text-brand-black">{order.shippingMethod}</p>
                                                                  </div>
                                                                )}
                                                              </div>
                                                            </div>
                                                          </div>
                                                          )}
                                                        </div>
                                                      )}
                                                    </div>
                                                  )
                                                })}
                                              </div>
                                            )
                                          })()}
                                        </div>

                                        {/* Action Buttons - Left Aligned */}
                                        <div>
                                          <h4 className="text-sm font-semibold text-brand-black mb-3">Actions</h4>
                                          <div className="flex flex-wrap gap-2 relative">
                                            {order.status !== 'Cancelled' && (() => {
                                              // Helper function to extract name from address
                                              const extractNameFromAddress = (address: string): string => {
                                                const match = address.match(/^([^,]+),/)
                                                return match ? match[1].trim() : 'Shipment'
                                              }
                                              
                                              // For multi-shipment orders, show dropdown
                                              if (order.shippingGroups && order.shippingGroups.length > 1) {
                                                const shipmentsWithTracking = order.shippingGroups.filter(g => g.carrierTrackingUrl)
                                                const dropdownKey = `${order.orderNumber}-tracking-dropdown`
                                                
                                                return (
                                                  <div className="relative">
                                                    <button
                                                      onClick={() => setShowTrackingDropdown(prev => ({ ...prev, [dropdownKey]: !prev[dropdownKey] }))}
                                                      className="px-4 py-2.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm flex items-center gap-2"
                                                    >
                                                      Track shipment
                                                      <svg 
                                                        className={`w-4 h-4 transition-transform ${showTrackingDropdown[dropdownKey] ? 'rotate-180' : ''}`}
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                      >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                      </svg>
                                                    </button>
                                                    
                                                    {showTrackingDropdown[dropdownKey] && (
                                                      <>
                                                        {/* Backdrop to close dropdown */}
                                                        <div 
                                                          className="fixed inset-0 z-10" 
                                                          onClick={() => setShowTrackingDropdown(prev => ({ ...prev, [dropdownKey]: false }))}
                                                        />
                                                        {/* Dropdown menu */}
                                                        <div className="absolute top-full left-0 mt-2 bg-white border border-brand-gray-200 rounded-lg shadow-lg z-20 min-w-[200px]">
                                                          {shipmentsWithTracking.map((group) => {
                                                            const recipientName = extractNameFromAddress(group.shippingAddress || order.shippingAddress || '')
                                                            return (
                                                              <a
                                                                key={group.groupId}
                                                                href={group.carrierTrackingUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="block px-4 py-3 text-sm text-brand-black hover:bg-brand-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                                                                onClick={() => setShowTrackingDropdown(prev => ({ ...prev, [dropdownKey]: false }))}
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
                                              } else if (order.shippingGroups && order.shippingGroups.length === 1) {
                                                // Single shipment with shipping group - direct link
                                                const group = order.shippingGroups[0]
                                                return group.carrierTrackingUrl ? (
                                                  <a
                                                    href={group.carrierTrackingUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                                                  >
                                                    Track shipment
                                                  </a>
                                                ) : null
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
                                              <button className="px-4 py-2 bg-white border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors shadow-sm">
                                                Cancel order
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            )
                          })}
                        </tbody>
                      </table>
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
                        onAddToCart={handleCuratedAddToCart}
                        onQuickView={handleCuratedQuickView}
                        onAddToWishlist={handleCuratedAddToWishlist}
                        showQuickAdd={true}
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
                      <div>
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
                            profileCompletion.emailVerified ? (
                              <div className="flex items-center gap-1.5 text-green-600 flex-shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs font-medium">Verified</span>
                              </div>
                            ) : (
                              <button 
                                onClick={() => {
                                  alert('Email verification would be triggered here')
                                }}
                                className="text-xs text-brand-blue-500 hover:text-brand-blue-600 hover:underline font-medium flex-shrink-0 whitespace-nowrap"
                              >
                                Verify Email
                              </button>
                            )
                          )}
                        </div>
                      </div>
                      <div>
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
                            profileCompletion.phoneVerified ? (
                              <div className="flex items-center gap-1.5 text-green-600 flex-shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs font-medium">Verified</span>
                              </div>
                            ) : (
                              <button 
                                onClick={() => {
                                  alert('Phone verification would be triggered here')
                                }}
                                className="text-xs text-brand-blue-500 hover:text-brand-blue-600 hover:underline font-medium flex-shrink-0 whitespace-nowrap"
                              >
                                Verify Phone
                              </button>
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

                {/* Interests Card */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between p-6 border-b border-brand-gray-200">
                    <div>
                      <h3 className="text-base font-semibold text-brand-black mb-1.5">Your Interests</h3>
                      <p className="text-sm text-brand-gray-600">Add your design interests to get personalized content, recommendations & offers</p>
                    </div>
                    {!isEditingInterests ? (
                      <button 
                        onClick={() => setIsEditingInterests(true)}
                        className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setIsEditingInterests(false)
                            showToastMessage('Interests saved successfully')
                          }}
                          className="px-4 py-2 text-sm font-medium bg-brand-blue-500 text-white hover:bg-brand-blue-600 rounded-lg transition-colors shadow-sm"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => {
                            setIsEditingInterests(false)
                            setInterestsForm({
                              designStyles: ['Minimalist', 'Geometric'],
                              roomTypes: ['Living Room', 'Office'],
                              materials: ['Ceramic'],
                              aesthetics: ['Modern'],
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
                    {/* Design Styles */}
                    <div>
                      <label className="block text-sm font-semibold text-brand-black mb-3 uppercase tracking-wider">Design Styles</label>
                      {!isEditingInterests ? (
                        <div className="flex flex-wrap gap-2">
                          {interestsForm.designStyles.length > 0 ? (
                            interestsForm.designStyles.map((style) => (
                              <span key={style} className="px-3 py-1.5 bg-brand-blue-50 text-brand-blue-700 text-sm font-medium rounded-lg">
                                {style}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-brand-gray-500">No design styles selected</span>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {interestsForm.designStyles.map((style) => (
                              <span key={style} className="px-3 py-1.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-2">
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

                    {/* Room Types */}
                    <div>
                      <label className="block text-sm font-semibold text-brand-black mb-3 uppercase tracking-wider">Room Types</label>
                      {!isEditingInterests ? (
                        <div className="flex flex-wrap gap-2">
                          {interestsForm.roomTypes.length > 0 ? (
                            interestsForm.roomTypes.map((room) => (
                              <span key={room} className="px-3 py-1.5 bg-brand-blue-50 text-brand-blue-700 text-sm font-medium rounded-lg">
                                {room}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-brand-gray-500">No room types selected</span>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {interestsForm.roomTypes.map((room) => (
                              <span key={room} className="px-3 py-1.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-2">
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
                          </div>
                          <button
                            onClick={() => {
                              setInterestsModalCategory('roomTypes')
                              setShowInterestsModal(true)
                            }}
                            className="text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline font-medium"
                          >
                            + Add more
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Materials */}
                    <div>
                      <label className="block text-sm font-semibold text-brand-black mb-3 uppercase tracking-wider">Materials</label>
                      {!isEditingInterests ? (
                        <div className="flex flex-wrap gap-2">
                          {interestsForm.materials.length > 0 ? (
                            interestsForm.materials.map((material) => (
                              <span key={material} className="px-3 py-1.5 bg-brand-blue-50 text-brand-blue-700 text-sm font-medium rounded-lg">
                                {material}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-brand-gray-500">No materials selected</span>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {interestsForm.materials.map((material) => (
                              <span key={material} className="px-3 py-1.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-2">
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
                          </div>
                          <button
                            onClick={() => {
                              setInterestsModalCategory('materials')
                              setShowInterestsModal(true)
                            }}
                            className="text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline font-medium"
                          >
                            + Add more
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Aesthetics */}
                    <div>
                      <label className="block text-sm font-semibold text-brand-black mb-3 uppercase tracking-wider">Aesthetics</label>
                      {!isEditingInterests ? (
                        <div className="flex flex-wrap gap-2">
                          {interestsForm.aesthetics.length > 0 ? (
                            interestsForm.aesthetics.map((aesthetic) => (
                              <span key={aesthetic} className="px-3 py-1.5 bg-brand-blue-50 text-brand-blue-700 text-sm font-medium rounded-lg">
                                {aesthetic}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-brand-gray-500">No aesthetics selected</span>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {interestsForm.aesthetics.map((aesthetic) => (
                              <span key={aesthetic} className="px-3 py-1.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-2">
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
                              setInterestsModalCategory('aesthetics')
                              setShowInterestsModal(true)
                            }}
                            className="text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline font-medium"
                          >
                            + Add more
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preferences Card */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between p-6 border-b border-brand-gray-200">
                    <div>
                      <h3 className="text-base font-semibold text-brand-black mb-1.5">Your Preferences</h3>
                      <p className="text-sm text-brand-gray-600">Manage your shopping preferences and newsletter subscription</p>
                    </div>
                    {!isEditingPreferences ? (
                      <button 
                        onClick={() => setIsEditingPreferences(true)}
                        className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setIsEditingPreferences(false)
                            showToastMessage('Preferences saved successfully')
                          }}
                          className="px-4 py-2 text-sm font-medium bg-brand-blue-500 text-white hover:bg-brand-blue-600 rounded-lg transition-colors shadow-sm"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => {
                            setIsEditingPreferences(false)
                            setPreferencesForm({
                              newsletter: true,
                              productCategories: ['Geometric', 'Sets'],
                              shoppingPreferences: 'unisex',
                              preferredStore: '',
                              sizePreference: '',
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
                    {/* Newsletter Subscription */}
                    <div>
                      <label className="block text-sm font-semibold text-brand-black mb-3 uppercase tracking-wider">Market Street Newsletter</label>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={preferencesForm.newsletter}
                          onChange={(e) => {
                            if (!isEditingPreferences) return
                            setPreferencesForm({ ...preferencesForm, newsletter: e.target.checked })
                          }}
                          disabled={!isEditingPreferences}
                          className="mt-1 w-4 h-4 text-brand-blue-500 border-brand-gray-300 rounded focus:ring-brand-blue-500 disabled:opacity-50"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-brand-gray-700 mb-2">
                            Sign me up to Market Street newsletter, featuring exclusive offers, latest product info, news about upcoming collections and more. Please see our{' '}
                            <a href="#" className="text-brand-blue-500 hover:underline">Terms & Conditions</a> and{' '}
                            <a href="#" className="text-brand-blue-500 hover:underline">Privacy Policy</a> for more details.
                          </p>
                          {preferencesForm.newsletter && (
                            <div className="mt-3 px-4 py-2 bg-brand-gray-50 border border-brand-gray-200 rounded-lg">
                              <p className="text-sm text-brand-gray-700 font-medium">You are currently receiving our newsletter.</p>
                              {isEditingPreferences && (
                                <p className="text-xs text-brand-gray-500 mt-1">* To unsubscribe, please untick the checkbox</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Product Categories */}
                    <div>
                      <label className="block text-sm font-semibold text-brand-black mb-3 uppercase tracking-wider">Product Categories</label>
                      {!isEditingPreferences ? (
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
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'womens', label: "Women's" },
                          { value: 'mens', label: "Men's" },
                          { value: 'unisex', label: 'Unisex' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              if (!isEditingPreferences) return
                              setPreferencesForm({ ...preferencesForm, shoppingPreferences: option.value as any })
                            }}
                            disabled={!isEditingPreferences}
                            className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all shadow-sm ${
                              preferencesForm.shoppingPreferences === option.value
                                ? 'bg-brand-blue-500 text-white border-brand-blue-500'
                                : 'bg-white text-brand-black border-brand-gray-200 hover:border-brand-gray-300'
                            } ${!isEditingPreferences ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Size Preference */}
                    <div>
                      <label className="block text-sm font-medium text-brand-black mb-2">Size Preference</label>
                      {isEditingPreferences ? (
                        <div className="relative">
                          <select
                            value={preferencesForm.sizePreference}
                            onChange={(e) => setPreferencesForm({ ...preferencesForm, sizePreference: e.target.value })}
                            className="w-full px-3 py-2 pr-10 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent appearance-none bg-white"
                          >
                            <option value="">No preference</option>
                            <option value="small">Small (S)</option>
                            <option value="medium">Medium (M)</option>
                            <option value="large">Large (L)</option>
                            <option value="xl">Extra Large (XL)</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-4 h-4 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div className="px-0 py-2 text-sm text-brand-gray-500">
                          {preferencesForm.sizePreference 
                            ? preferencesForm.sizePreference.charAt(0).toUpperCase() + preferencesForm.sizePreference.slice(1)
                            : 'No preference'}
                        </div>
                      )}
                      <p className="text-xs text-brand-gray-500 mt-1">Provide your size preference to have it preselected when you shop</p>
                    </div>

                    {/* Preferred Store */}
                    <div>
                      <label className="block text-sm font-medium text-brand-black mb-2">Preferred Store</label>
                      {isEditingPreferences ? (
                        <div className="relative">
                          <select
                            value={preferencesForm.preferredStore}
                            onChange={(e) => setPreferencesForm({ ...preferencesForm, preferredStore: e.target.value })}
                            className="w-full px-3 py-2 pr-10 border border-brand-gray-300 rounded-lg text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent appearance-none bg-white"
                          >
                            <option value="">No preferred store selected</option>
                            <option value="store-1">San Francisco Store</option>
                            <option value="store-2">New York Store</option>
                            <option value="store-3">Los Angeles Store</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-4 h-4 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div className="px-0 py-2 text-sm text-brand-gray-500">{preferencesForm.preferredStore || 'No preferred store selected'}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Visibility Card */}
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

                {/* Password & Security Card */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm">
                  <div className="p-6 border-b border-brand-gray-200">
                    <h3 className="text-base font-semibold text-brand-black">Password & Security</h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="mb-1">
                          <p className="text-sm font-medium text-brand-black">Password</p>
                        </div>
                        <p className="text-sm text-brand-gray-600">Last changed 3 months ago</p>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black hover:bg-brand-gray-50 rounded-lg transition-colors shadow-sm whitespace-nowrap">
                        Change password
                      </button>
                    </div>
                  </div>
                </div>

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
            {activeSection === 'order-history' && (
              <div className="space-y-5">
                {/* Order History Header Card */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between p-6 border-b border-brand-gray-200">
                    <div>
                      <h2 className="text-2xl font-semibold text-brand-black mb-1.5">Order History</h2>
                      <p className="text-sm text-brand-gray-600">View and track your orders</p>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search orders"
                        className="w-[212px] pl-10 pr-4 py-2 border border-brand-gray-200 rounded-lg text-sm text-brand-black placeholder-brand-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent shadow-sm"
                      />
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-brand-gray-50 border-b border-brand-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-medium text-brand-black w-[120px]">Order Number</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-brand-black w-[200px]">Status</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-brand-black">Method</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-brand-black w-[100px]">Amount</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-brand-black w-[130px]"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-gray-200">
                        {recentOrders.map((order, idx) => {
                          const isExpanded = expandedOrders.has(order.orderNumber)
                          return (
                            <React.Fragment key={idx}>
                              <tr className="hover:bg-brand-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-brand-black">{order.orderNumber}</td>
                                <td className="px-6 py-4">
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
                                </td>
                                <td className="px-6 py-4 text-sm text-brand-black">{order.method}</td>
                                <td className="px-6 py-4 text-sm text-brand-black">{order.amount}</td>
                                <td className="px-6 py-4">
                                  <button 
                                    onClick={() => toggleOrderDetails(order.orderNumber)}
                                    className="px-4 py-2 bg-white border border-brand-gray-300 text-sm font-medium text-brand-black rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm whitespace-nowrap"
                                  >
                                    {isExpanded ? 'Hide Details' : 'View Details'}
                                  </button>
                                </td>
                              </tr>
                              {isExpanded && order.items && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 bg-brand-gray-50 animate-order-expand">
                                      <div className="space-y-6">
                                        {/* Header with View Full Details Link */}
                                        <div className="flex items-center justify-between pb-4 border-b border-brand-gray-200">
                                          <h3 className="text-lg font-semibold text-brand-black">Order Details</h3>
                                          <Link
                                            href={`/order/${order.orderNumber}`}
                                            className="text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline font-medium flex items-center gap-1.5"
                                          >
                                            View Full Order Details
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                          </Link>
                                        </div>

                                        {/* Order Summary and Payment Method - At Top */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-brand-gray-200">
                                          {/* Order Summary */}
                                          <div>
                                            <h4 className="text-sm font-semibold text-brand-black mb-3">Order Summary</h4>
                                            <div className="bg-white rounded-lg border border-brand-gray-200 p-4 space-y-2">
                                              <div className="flex justify-between text-sm">
                                                <span className="text-brand-gray-600">Subtotal</span>
                                                <span className="text-brand-black">${order.subtotal?.toFixed(2)}</span>
                                              </div>
                                              {order.promotions && order.promotions !== 0 && (
                                                <div className="flex justify-between text-sm">
                                                  <span className="text-brand-gray-600">Promotions</span>
                                                  <span className="text-green-600">-${Math.abs(order.promotions || 0).toFixed(2)}</span>
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
                                                  <span className="text-base font-semibold text-brand-black">Total</span>
                                                  <span className="text-base font-semibold text-brand-black">${order.total?.toFixed(2)}</span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          {/* Payment Method */}
                                          <div>
                                            <h4 className="text-sm font-semibold text-brand-black mb-3">Payment Method</h4>
                                            <div className="bg-white rounded-lg border border-brand-gray-200 p-4">
                                              <p className="text-sm text-brand-gray-700">{order.paymentInfo}</p>
                                            </div>
                                            
                                            {/* Return Information */}
                                            {order.canReturn && order.returnDeadline && (
                                              <div className="mt-4">
                                                <p className="text-sm text-brand-gray-700">
                                                  Eligible for return until {order.returnDeadline}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Items Ordered - Grouped by Shipment */}
                                        <div>
                                          <h3 className="text-lg font-semibold text-brand-black mb-4">Items Ordered</h3>
                                          {(() => {
                                            // Group items by shipping group ID (which represents a shipment/address)
                                            const shippingGroupsMap = new Map(
                                              order.shippingGroups?.map(sg => [sg.groupId, sg]) || []
                                            )
                                            
                                            // Group items by shippingGroup ID
                                            const groupedItems = order.items.reduce((acc, item) => {
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
                                            }, {} as Record<string, { groupId: string; items: typeof order.items }>)

                                            const groups = Object.entries(groupedItems)
                                            
                                            return (
                                              <div className="space-y-6">
                                                {groups.map(([groupKey, group], groupIdx) => {
                                                  // Find matching shipping group data
                                                  const shippingGroup = order.shippingGroups?.find(sg => sg.groupId === groupKey)
                                                  const shipmentNumber = groupIdx + 1
                                                  const shipmentAddress = shippingGroup?.shippingAddress || order.shippingAddress
                                                  
                                                  return (
                                                    <div key={groupKey} className={groupIdx > 0 ? 'pt-6 border-t border-brand-gray-200' : ''}>
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
                                                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                                            shippingGroup.status === 'Delivered' || shippingGroup.status === 'Picked Up'
                                                              ? 'bg-green-100 text-green-700'
                                                              : shippingGroup.status === 'In Transit' || shippingGroup.status === 'Ready for Pickup'
                                                              ? 'bg-blue-100 text-blue-700'
                                                              : shippingGroup.status === 'Cancelled'
                                                              ? 'bg-red-100 text-red-700'
                                                              : 'bg-gray-100 text-gray-700'
                                                          }`}>
                                                            {shippingGroup.status}
                                                          </span>
                                                        )}
                                                      </div>

                                                      {/* Items - Horizontal Layout */}
                                                      <div className="flex flex-wrap gap-3 mb-4">
                                                        {group.items.map((item, idx) => (
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
                                                              {item.price && (
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
                                                              )}
                                                            </div>
                                                          </div>
                                                        ))}
                                                      </div>

                                                      {/* Collapsible Tracking/Shipping or Pickup Info for this group */}
                                                      {shippingGroup && (
                                                        <div>
                                                          <button
                                                            onClick={() => {
                                                              const trackingKey = `${order.orderNumber}-${groupKey}`
                                                              setExpandedTracking(prev => {
                                                                const newSet = new Set(prev)
                                                                if (newSet.has(trackingKey)) {
                                                                  newSet.delete(trackingKey)
                                                                } else {
                                                                  newSet.add(trackingKey)
                                                                }
                                                                return newSet
                                                              })
                                                            }}
                                                            className="flex items-center justify-between w-full text-left text-sm font-semibold text-brand-black mb-2 hover:text-brand-blue-600 transition-colors"
                                                          >
                                                            <span>{shippingGroup.isBOPIS ? 'Pickup Information' : 'Tracking & Shipping Information'}</span>
                                                            <svg 
                                                              className={`w-4 h-4 transition-transform ${expandedTracking.has(`${order.orderNumber}-${groupKey}`) ? 'rotate-180' : ''}`}
                                                              fill="none" 
                                                              stroke="currentColor" 
                                                              viewBox="0 0 24 24"
                                                            >
                                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                          </button>
                                                          {expandedTracking.has(`${order.orderNumber}-${groupKey}`) && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-brand-gray-50 rounded-lg p-3">
                                                          {shippingGroup.isBOPIS ? (
                                                            <>
                                                              {/* Pickup Information */}
                                                              <div>
                                                                <h5 className="text-xs font-semibold text-brand-black mb-2">Pickup Information</h5>
                                                                <div className="bg-brand-blue-50 border border-brand-blue-200 rounded-lg p-2 space-y-1.5">
                                                                  {shippingGroup.pickupLocation && (
                                                                    <div>
                                                                      <p className="text-xs font-medium text-brand-gray-600 mb-0.5">Pickup Location</p>
                                                                      <p className="text-xs font-medium text-brand-black">{shippingGroup.pickupLocation}</p>
                                                                    </div>
                                                                  )}
                                                                  {shippingGroup.pickupAddress && (
                                                                    <div>
                                                                      <p className="text-xs font-medium text-brand-gray-600 mb-0.5">Store Address</p>
                                                                      <p className="text-xs text-brand-black">{shippingGroup.pickupAddress}</p>
                                                                    </div>
                                                                  )}
                                                                  {shippingGroup.pickupReadyDate && (
                                                                    <div>
                                                                      <p className="text-xs font-medium text-brand-gray-600 mb-0.5">Ready for Pickup</p>
                                                                      <p className="text-xs font-medium text-brand-black">{shippingGroup.pickupReadyDate}</p>
                                                                    </div>
                                                                  )}
                                                                </div>
                                                              </div>
                                                              {/* Pickup Details */}
                                                              <div>
                                                                <h5 className="text-xs font-semibold text-brand-black mb-2">Pickup Details</h5>
                                                                <div className="bg-white rounded-lg border border-brand-gray-200 p-2">
                                                                  <p className="text-xs text-brand-gray-600">
                                                                    Your order is ready for pickup. Please bring a valid ID and your order confirmation.
                                                                  </p>
                                                                </div>
                                                              </div>
                                                            </>
                                                          ) : (
                                                            <>
                                                              {/* Tracking Information */}
                                                              {shippingGroup.trackingNumber && (
                                                                <div>
                                                                  <h5 className="text-xs font-semibold text-brand-black mb-2">Tracking</h5>
                                                                  <div className="bg-brand-blue-50 border border-brand-blue-200 rounded-lg p-2 space-y-1.5">
                                                                    <div>
                                                                      <p className="text-xs font-medium text-brand-gray-600 mb-0.5">Tracking Number</p>
                                                                      <p className="text-xs font-mono font-medium text-brand-black">{shippingGroup.trackingNumber}</p>
                                                                    </div>
                                                                    {shippingGroup.carrier && (
                                                                      <div>
                                                                        <p className="text-xs font-medium text-brand-gray-600 mb-0.5">Carrier</p>
                                                                        <p className="text-xs font-medium text-brand-black">{shippingGroup.carrier}</p>
                                                                      </div>
                                                                    )}
                                                                    {shippingGroup.deliveryDate && (
                                                                      <div>
                                                                        <p className="text-xs font-medium text-brand-gray-600 mb-0.5">Estimated Delivery</p>
                                                                        <p className="text-xs font-medium text-brand-black">{shippingGroup.deliveryDate}</p>
                                                                      </div>
                                                                    )}
                                                                    {shippingGroup.carrierTrackingUrl && (
                                                                      <a
                                                                        href={shippingGroup.carrierTrackingUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 text-xs text-brand-blue-500 hover:text-brand-blue-600 hover:underline font-medium mt-1"
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
                                                                <div className="bg-white rounded-lg border border-brand-gray-200 p-2 space-y-1.5">
                                                                  {shippingGroup.shippingAddress && (
                                                                    <div>
                                                                      <p className="text-xs font-medium text-brand-gray-500 mb-0.5">Shipping Address</p>
                                                                      <p className="text-xs text-brand-black">{shippingGroup.shippingAddress}</p>
                                                                    </div>
                                                                  )}
                                                                  {shippingGroup.shippingMethod && (
                                                                    <div>
                                                                      <p className="text-xs font-medium text-brand-gray-500 mb-0.5">Shipping Method</p>
                                                                      <p className="text-xs text-brand-black">{shippingGroup.shippingMethod}</p>
                                                                    </div>
                                                                  )}
                                                                </div>
                                                              </div>
                                                            </>
                                                          )}
                                                            </div>
                                                          )}
                                                        </div>
                                                      )}
                                                      {!shippingGroup && order.trackingNumber && (
                                                        // For simple orders without shippingGroups but with tracking info
                                                        <div>
                                                          <button
                                                            onClick={() => {
                                                              const trackingKey = `${order.orderNumber}-default`
                                                              setExpandedTracking(prev => {
                                                                const newSet = new Set(prev)
                                                                if (newSet.has(trackingKey)) {
                                                                  newSet.delete(trackingKey)
                                                                } else {
                                                                  newSet.add(trackingKey)
                                                                }
                                                                return newSet
                                                              })
                                                            }}
                                                            className="flex items-center justify-between w-full text-left text-sm font-semibold text-brand-black mb-2 hover:text-brand-blue-600 transition-colors"
                                                          >
                                                            <span>Tracking & Shipping Information</span>
                                                            <svg 
                                                              className={`w-4 h-4 transition-transform ${expandedTracking.has(`${order.orderNumber}-default`) ? 'rotate-180' : ''}`}
                                                              fill="none" 
                                                              stroke="currentColor" 
                                                              viewBox="0 0 24 24"
                                                            >
                                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                          </button>
                                                          {expandedTracking.has(`${order.orderNumber}-default`) && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-brand-gray-50 rounded-lg p-3">
                                                            {/* Tracking Information */}
                                                            <div>
                                                              <h5 className="text-xs font-semibold text-brand-black mb-2">Tracking</h5>
                                                              <div className="bg-brand-blue-50 border border-brand-blue-200 rounded-lg p-2 space-y-1.5">
                                                                <div>
                                                                  <p className="text-xs font-medium text-brand-gray-600 mb-0.5">Tracking Number</p>
                                                                  <p className="text-xs font-mono font-medium text-brand-black">{order.trackingNumber}</p>
                                                                </div>
                                                                {order.carrier && (
                                                                  <div>
                                                                    <p className="text-xs font-medium text-brand-gray-600 mb-0.5">Carrier</p>
                                                                    <p className="text-xs font-medium text-brand-black">{order.carrier}</p>
                                                                  </div>
                                                                )}
                                                                {order.deliveryDate && (
                                                                  <div>
                                                                    <p className="text-xs font-medium text-brand-gray-600 mb-0.5">Estimated Delivery</p>
                                                                    <p className="text-xs font-medium text-brand-black">{order.deliveryDate}</p>
                                                                  </div>
                                                                )}
                                                                {order.carrierTrackingUrl && (
                                                                  <a
                                                                    href={order.carrierTrackingUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-xs text-brand-blue-500 hover:text-brand-blue-600 hover:underline font-medium mt-1"
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
                                                              <div className="bg-white rounded-lg border border-brand-gray-200 p-2 space-y-1.5">
                                                                {order.shippingAddress && (
                                                                  <div>
                                                                    <p className="text-xs font-medium text-brand-gray-500 mb-0.5">Shipping Address</p>
                                                                    <p className="text-xs text-brand-black">{order.shippingAddress}</p>
                                                                  </div>
                                                                )}
                                                                {order.shippingMethod && (
                                                                  <div>
                                                                    <p className="text-xs font-medium text-brand-gray-500 mb-0.5">Shipping Method</p>
                                                                    <p className="text-xs text-brand-black">{order.shippingMethod}</p>
                                                                  </div>
                                                                )}
                                                              </div>
                                                            </div>
                                                          </div>
                                                          )}
                                                        </div>
                                                      )}
                                                    </div>
                                                  )
                                                })}
                                              </div>
                                            )
                                          })()}
                                        </div>

                                        {/* Action Buttons - Left Aligned */}
                                        <div>
                                          <h4 className="text-sm font-semibold text-brand-black mb-3">Actions</h4>
                                          <div className="flex flex-wrap gap-2 relative">
                                            {order.status !== 'Cancelled' && (() => {
                                              // Helper function to extract name from address
                                              const extractNameFromAddress = (address: string): string => {
                                                const match = address.match(/^([^,]+),/)
                                                return match ? match[1].trim() : 'Shipment'
                                              }
                                              
                                              // For multi-shipment orders, show dropdown
                                              if (order.shippingGroups && order.shippingGroups.length > 1) {
                                                const shipmentsWithTracking = order.shippingGroups.filter(g => g.carrierTrackingUrl)
                                                const dropdownKey = `${order.orderNumber}-tracking-dropdown`
                                                
                                                return (
                                                  <div className="relative">
                                                    <button
                                                      onClick={() => setShowTrackingDropdown(prev => ({ ...prev, [dropdownKey]: !prev[dropdownKey] }))}
                                                      className="px-4 py-2.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm flex items-center gap-2"
                                                    >
                                                      Track shipment
                                                      <svg 
                                                        className={`w-4 h-4 transition-transform ${showTrackingDropdown[dropdownKey] ? 'rotate-180' : ''}`}
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                      >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                      </svg>
                                                    </button>
                                                    
                                                    {showTrackingDropdown[dropdownKey] && (
                                                      <>
                                                        {/* Backdrop to close dropdown */}
                                                        <div 
                                                          className="fixed inset-0 z-10" 
                                                          onClick={() => setShowTrackingDropdown(prev => ({ ...prev, [dropdownKey]: false }))}
                                                        />
                                                        {/* Dropdown menu */}
                                                        <div className="absolute top-full left-0 mt-2 bg-white border border-brand-gray-200 rounded-lg shadow-lg z-20 min-w-[200px]">
                                                          {shipmentsWithTracking.map((group) => {
                                                            const recipientName = extractNameFromAddress(group.shippingAddress || order.shippingAddress || '')
                                                            return (
                                                              <a
                                                                key={group.groupId}
                                                                href={group.carrierTrackingUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="block px-4 py-3 text-sm text-brand-black hover:bg-brand-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                                                                onClick={() => setShowTrackingDropdown(prev => ({ ...prev, [dropdownKey]: false }))}
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
                                              } else if (order.shippingGroups && order.shippingGroups.length === 1) {
                                                // Single shipment with shipping group - direct link
                                                const group = order.shippingGroups[0]
                                                return group.carrierTrackingUrl ? (
                                                  <a
                                                    href={group.carrierTrackingUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                                                  >
                                                    Track shipment
                                                  </a>
                                                ) : null
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
                                              <button className="px-4 py-2 bg-white border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors shadow-sm">
                                                Cancel order
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between p-6 border-t border-brand-gray-200">
                    <p className="text-sm text-brand-gray-600">Viewing 10 of 23 orders</p>
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
              </div>
            )}

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

                {/* Gift Cards Card */}
                <div id="gift-cards" className="scroll-mt-8 bg-white border border-brand-gray-200 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between p-6 border-b border-brand-gray-200">
                    <div>
                      <h3 className="text-base font-semibold text-brand-black mb-1.5">Gift Cards</h3>
                      <p className="text-sm text-brand-gray-600">Manage your gift cards and balances</p>
                    </div>
                    <button
                      onClick={() => {
                        // In a real app, this would open a modal to add a gift card
                        alert('Add Gift Card modal would open here')
                      }}
                      className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black hover:bg-brand-gray-50 rounded-lg transition-colors shadow-sm"
                    >
                      Add gift card
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Gift Card 1 */}
                      <div className="border border-brand-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-brand-black">Gift Card</span>
                          <svg className="w-5 h-5 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <p className="text-2xl font-semibold text-brand-black mb-1">$75.00</p>
                        <p className="text-xs text-brand-gray-500 mb-3">Card ending in 1234</p>
                        <div className="flex items-center gap-2">
                          <button className="text-xs text-brand-blue-500 hover:text-brand-blue-600 hover:underline">
                            View Details
                          </button>
                          <span className="text-xs text-brand-gray-300">•</span>
                          <button className="text-xs text-brand-blue-500 hover:text-brand-blue-600 hover:underline">
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      {/* Gift Card 2 */}
                      <div className="border border-brand-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-brand-black">Gift Card</span>
                          <svg className="w-5 h-5 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <p className="text-2xl font-semibold text-brand-black mb-1">$50.00</p>
                        <p className="text-xs text-brand-gray-500 mb-3">Card ending in 5678</p>
                        <div className="flex items-center gap-2">
                          <button className="text-xs text-brand-blue-500 hover:text-brand-blue-600 hover:underline">
                            View Details
                          </button>
                          <span className="text-xs text-brand-gray-300">•</span>
                          <button className="text-xs text-brand-blue-500 hover:text-brand-blue-600 hover:underline">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-brand-gray-200">
                      <p className="text-sm font-medium text-brand-black">Total Balance: <span className="text-brand-blue-500">$125.00</span></p>
                    </div>
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
                      <button className="text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline">
                        View credit history →
                      </button>
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
                      {paymentMethods.map((method) => {
                    const isSelected = selectedPaymentMethodId === method.id
                    return (
                      <div
                        key={method.id}
                        className={`bg-white border rounded-xl shadow-sm p-6 relative ${
                          isSelected ? 'border-brand-blue-500' : 'border-brand-gray-200'
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

                        {/* Radio Button and Card Info */}
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => setSelectedPaymentMethodId(method.id)}
                            className="mt-1 flex-shrink-0"
                          >
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'border-brand-blue-500'
                                  : 'border-brand-gray-300'
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-brand-blue-500" />
                              )}
                            </div>
                          </button>

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
                              <button className="text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline">
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
                                if (confirm(`Are you sure you want to remove this payment method?`)) {
                                  setPaymentMethods(paymentMethods.filter(p => p.id !== method.id))
                                }
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

                {/* Local Store Preference */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-brand-black mb-1.5">Preferred Store for Pickup</h3>
                      <p className="text-sm text-brand-gray-600">Select your preferred store for in-store pickup orders</p>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium bg-white border border-brand-gray-300 text-brand-black hover:bg-brand-gray-50 rounded-lg transition-colors shadow-sm">
                      Change store
                    </button>
                  </div>
                  <div className="p-4 bg-brand-gray-50 rounded-lg border border-brand-gray-200">
                    <p className="text-sm font-medium text-brand-black mb-1">Market Street - San Francisco</p>
                    <p className="text-sm text-brand-gray-600">415 Mission Street, San Francisco, CA 94105</p>
                    <p className="text-xs text-brand-gray-500 mt-1">Open today: 10:00 AM - 8:00 PM</p>
                  </div>
                </div>

                {/* Addresses List */}
                <div className="space-y-4">
                  {addresses.map((address) => {
                    const isSelected = selectedAddressId === address.id
                    return (
                      <div
                        key={address.id}
                        className={`bg-white border rounded-xl shadow-sm p-6 ${
                          isSelected ? 'border-brand-blue-500' : 'border-brand-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Radio Button */}
                          <button
                            onClick={() => setSelectedAddressId(address.id)}
                            className="mt-1 flex-shrink-0"
                          >
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'border-brand-blue-500'
                                  : 'border-brand-gray-300'
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-brand-blue-500" />
                              )}
                            </div>
                          </button>

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
                            {!address.deliveryInstructions && <div className="mb-4"></div>}

                            {/* Authorized Pickup People */}
                            <div className="mb-4 p-3 bg-brand-gray-50 border border-brand-gray-200 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-brand-gray-700">Authorized Pickup People</p>
                                <button className="text-xs text-brand-blue-500 hover:text-brand-blue-600 hover:underline">
                                  Manage
                                </button>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-brand-gray-600">• {address.firstName} {address.lastName} (You)</p>
                                <p className="text-xs text-brand-gray-500">No additional authorized people</p>
                              </div>
                            </div>

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
                                onClick={() => handleRemoveAddress(address.id)}
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

            {/* Passkeys Section */}
            {activeSection === 'passkeys' && (
              <div className="space-y-5">
                {/* Passkeys Header */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-brand-black mb-1.5">Passkeys</h2>
                      <p className="text-sm text-brand-gray-600">Sign in securely without passwords using your device</p>
                    </div>
                    <button 
                      onClick={() => {
                        // In a real app, this would trigger WebAuthn API
                        if (typeof window !== 'undefined' && 'PublicKeyCredential' in window) {
                          alert('Passkey setup would be initiated here using WebAuthn API')
                        } else {
                          alert('Passkeys are not supported in this browser')
                        }
                      }}
                      className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors whitespace-nowrap shadow-sm"
                    >
                      Add passkey
                    </button>
                  </div>
                </div>

                {/* Passkeys Content */}
                <div className="bg-white border border-brand-gray-200 rounded-xl shadow-sm">
                  <div className="p-6">
                    {passkeys.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="w-16 h-16 text-brand-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <p className="text-base font-medium text-brand-black mb-2">No passkeys set up</p>
                        <p className="text-sm text-brand-gray-600 mb-6">Add a passkey to sign in faster and more securely</p>
                        <button 
                          onClick={() => {
                            if (typeof window !== 'undefined' && 'PublicKeyCredential' in window) {
                              alert('Passkey setup would be initiated here using WebAuthn API')
                            } else {
                              alert('Passkeys are not supported in this browser')
                            }
                          }}
                          className="px-6 py-2.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                        >
                          Get Started
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {passkeys.map((passkey) => (
                          <div key={passkey.id} className="flex items-center justify-between p-4 border border-brand-gray-200 rounded-lg">
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
                              <div>
                                <p className="text-base font-medium text-brand-black">{passkey.name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <p className="text-sm text-brand-gray-600">Created {new Date(passkey.createdAt).toLocaleDateString()}</p>
                                  {passkey.lastUsed && (
                                    <>
                                      <span className="text-sm text-brand-gray-400">•</span>
                                      <p className="text-sm text-brand-gray-600">Last used {new Date(passkey.lastUsed).toLocaleDateString()}</p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to remove the passkey "${passkey.name}"?`)) {
                                  setPasskeys(passkeys.filter(p => p.id !== passkey.id))
                                }
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
                    <div className="mt-6 p-4 bg-brand-blue-50 border border-brand-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-brand-blue-800 mb-2">About Passkeys</p>
                      <p className="text-sm text-brand-blue-700 mb-3">
                        Passkeys use biometric authentication (Face ID, Touch ID, or Windows Hello) or your device PIN to sign in securely without passwords.
                      </p>
                      <div className="space-y-2 text-sm text-brand-blue-700">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-brand-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <p>More secure than passwords</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-brand-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <p>Faster sign-in experience</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-brand-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <p>Works across all your devices</p>
                        </div>
                      </div>
                    </div>
                  </div>
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
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-brand-blue-50 to-brand-blue-100 border border-brand-blue-200 rounded-lg">
                    <div className="w-16 h-16 bg-brand-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-semibold text-brand-black">{loyaltyStatus} Member</span>
                        <span className="px-2 py-0.5 bg-brand-blue-500 text-white text-xs font-semibold rounded">Active</span>
                      </div>
                      <p className="text-sm text-brand-gray-600 mb-2">{loyaltyPoints.toLocaleString()} points</p>
                      <div className="w-full bg-brand-gray-200 rounded-full h-2">
                        <div 
                          className="bg-brand-blue-500 h-2 rounded-full transition-all duration-300"
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
                  <div className="grid grid-cols-3 gap-3">
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

            {/* Other sections placeholder */}
            {activeSection !== 'overview' && activeSection !== 'account-details' && activeSection !== 'order-history' && activeSection !== 'wishlist' && activeSection !== 'payment' && activeSection !== 'addresses' && activeSection !== 'passkeys' && activeSection !== 'loyalty' && (
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
                    window.location.href = 'mailto:support@marketstreet.com?subject=Account Deletion Request'
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
      {showInterestsModal && interestsModalCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => {
            setShowInterestsModal(false)
            setInterestsModalCategory(null)
          }} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-brand-gray-200">
                <h2 className="text-xl font-semibold text-brand-black">Select Your Interests</h2>
                <button
                  onClick={() => {
                    setShowInterestsModal(false)
                    setInterestsModalCategory(null)
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
                    setInterestsModalCategory(null)
                  }}
                  className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowInterestsModal(false)
                    setInterestsModalCategory(null)
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
          allProducts={getAllProducts()}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleCuratedAddToCart}
          onAddToWishlist={handleCuratedAddToWishlist}
        />
      )}
    </div>
  )
}

