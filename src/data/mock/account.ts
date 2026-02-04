/**
 * Mock Account Data
 * 
 * This file contains all account-related mock data including customers,
 * addresses, payment methods, wishlists, loyalty, etc.
 * In production, this would be fetched from Supabase.
 */

import {
  Customer,
  Address,
  PaymentMethod,
  GiftCard,
  StoreCredit,
  StoreCreditTransaction,
  LoyaltyInfo,
  AccountBalances,
  ProfileCompletion,
  Wishlist,
  WishlistItem,
  Passkey,
  StorePreferences,
  AuthorizedPickupPerson,
} from '../../types'
import { mockProducts } from './products'

// ============================================================================
// MOCK CUSTOMER
// ============================================================================

export const mockCustomer: Customer = {
  id: 'customer-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  dateOfBirth: '15/05/1990',
  gender: 'Prefer not to say',
  loyaltyStatus: 'Gold',
  loyaltyPoints: 2450,
  emailVerified: false,
  phoneVerified: false,
  createdAt: '2022-01-15T10:30:00Z',
  updatedAt: '2024-09-15T14:22:00Z',
}

// ============================================================================
// MOCK ADDRESSES
// ============================================================================

export const mockAddresses: Address[] = [
  {
    id: 'address-1',
    customerId: 'customer-1',
    firstName: 'John',
    lastName: 'Doe',
    addressLine1: '415 Mission Street',
    addressLine2: 'Suite 500',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'United States',
    isDefault: true,
    deliveryInstructions: 'Leave at front desk',
  },
  {
    id: 'address-2',
    customerId: 'customer-1',
    firstName: 'John',
    lastName: 'Doe',
    addressLine1: '789 Salesforce Foundations',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'United States',
    isDefault: false,
  },
  {
    id: 'address-3',
    customerId: 'customer-1',
    firstName: 'Jane',
    lastName: 'Doe',
    addressLine1: '123 Broadway',
    addressLine2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
    isDefault: false,
  },
]

// ============================================================================
// MOCK PAYMENT METHODS
// ============================================================================

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'visa-1',
    customerId: 'customer-1',
    type: 'visa',
    last4: '1234',
    expiryMonth: 12,
    expiryYear: 2026,
    cardholderName: 'John Doe',
    isDefault: true,
  },
  {
    id: 'mastercard-1',
    customerId: 'customer-1',
    type: 'mastercard',
    last4: '5678',
    expiryMonth: 6,
    expiryYear: 2025,
    cardholderName: 'John Doe',
    isDefault: false,
  },
  {
    id: 'ach-1',
    customerId: 'customer-1',
    type: 'ach',
    last4: '9012',
    bankName: 'Chase Bank',
    cardholderName: 'John Doe',
    isDefault: false,
  },
  {
    id: 'apple-pay-1',
    customerId: 'customer-1',
    type: 'apple-pay',
    cardholderName: 'John Doe',
    isDefault: false,
  },
  {
    id: 'paypal-1',
    customerId: 'customer-1',
    type: 'paypal',
    cardholderName: 'john.doe@example.com',
    isDefault: false,
  },
]

// ============================================================================
// MOCK GIFT CARDS
// ============================================================================

export const mockGiftCards: GiftCard[] = [
  {
    id: 'gc-1',
    customerId: 'customer-1',
    balance: 75.00,
    last4: '1234',
  },
  {
    id: 'gc-2',
    customerId: 'customer-1',
    balance: 50.00,
    last4: '5678',
  },
]

// ============================================================================
// MOCK STORE CREDIT
// ============================================================================

export const mockStoreCreditTransactions: StoreCreditTransaction[] = [
  {
    id: 'sct-1',
    type: 'credit',
    amount: 25.00,
    description: 'Return refund - Order #INV004',
    date: 'Sep 10, 2024',
    orderNumber: 'INV004',
  },
  {
    id: 'sct-2',
    type: 'credit',
    amount: 10.00,
    description: 'Loyalty reward redemption',
    date: 'Aug 15, 2024',
  },
  {
    id: 'sct-3',
    type: 'debit',
    amount: -15.00,
    description: 'Applied to Order #INV003',
    date: 'Sep 14, 2024',
    orderNumber: 'INV003',
  },
]

export const mockStoreCredit: StoreCredit = {
  customerId: 'customer-1',
  balance: 20.00,
  transactions: mockStoreCreditTransactions,
}

// ============================================================================
// MOCK LOYALTY INFO
// ============================================================================

export const mockLoyaltyInfo: LoyaltyInfo = {
  customerId: 'customer-1',
  status: 'Gold',
  points: 2450,
  pointsToNextTier: 550,
  nextTier: 'Platinum',
  expiringPoints: 200,
  expirationDate: 'Dec 31, 2024',
  lifetimePoints: 12500,
  memberSince: 'Jan 2022',
}

// ============================================================================
// MOCK ACCOUNT BALANCES
// ============================================================================

export const mockAccountBalances: AccountBalances = {
  giftCardTotal: 125.00,
  storeCreditBalance: 20.00,
  loyaltyPoints: 2450,
}

// ============================================================================
// MOCK PROFILE COMPLETION
// ============================================================================

export const mockProfileCompletion: ProfileCompletion = {
  hasEmail: true,
  emailVerified: false,
  hasPhone: true,
  phoneVerified: false,
  hasAddress: true,
  hasPaymentMethod: true,
  hasPassword: true,
}

// ============================================================================
// MOCK WISHLISTS
// ============================================================================

// Create wishlist items from products
function createWishlistItems(
  wishlistId: string,
  productIds: string[]
): WishlistItem[] {
  return productIds
    .map((productId) => {
      const product = mockProducts.find((p) => p.id === productId)
      if (!product) return null
      return {
        id: `${wishlistId}-${productId}`,
        productId,
        wishlistId,
        addedAt: new Date().toISOString(),
        product,
      }
    })
    .filter((item): item is WishlistItem => item !== null)
}

export const mockWishlists: Wishlist[] = [
  {
    id: 'my-favorites',
    customerId: 'customer-1',
    name: 'My Favorites',
    isDefault: true,
    itemCount: 23,
    items: createWishlistItems('my-favorites', [
      'pure-cube-white',
      'steady-prism',
      'soft-sphere',
      'vertical-set',
      'signature-form-white',
      'fusion-block',
      'spiral-accent',
      'flow-form-i',
    ]),
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-09-15T14:22:00Z',
  },
  {
    id: 'living-room',
    customerId: 'customer-1',
    name: 'Living Room Ideas',
    isDefault: false,
    itemCount: 8,
    items: createWishlistItems('living-room', [
      'pure-cube-gray',
      'fusion-prism-charcoal',
      'twin-towers-large',
      'core-assembly',
    ]),
    createdAt: '2024-03-20T15:30:00Z',
    updatedAt: '2024-08-10T09:15:00Z',
  },
  {
    id: 'office',
    customerId: 'customer-1',
    name: 'Office Setup',
    isDefault: false,
    itemCount: 5,
    items: createWishlistItems('office', [
      'base-module',
      'compact-layer',
      'layer-grid',
    ]),
    createdAt: '2024-05-01T11:00:00Z',
    updatedAt: '2024-07-22T16:45:00Z',
  },
  {
    id: 'gift-ideas',
    customerId: 'customer-1',
    name: 'Gift Ideas',
    isDefault: false,
    itemCount: 12,
    items: createWishlistItems('gift-ideas', [
      'micro-spiral',
      'floating-disk-white',
      'fine-cone',
      'polished-fold',
    ]),
    createdAt: '2024-06-15T09:00:00Z',
    updatedAt: '2024-09-01T12:00:00Z',
  },
]

// ============================================================================
// MOCK PASSKEYS
// ============================================================================

export const mockPasskeys: Passkey[] = [
  {
    id: 'passkey-1',
    customerId: 'customer-1',
    name: 'MacBook Pro',
    createdAt: 'Sep 1, 2024',
    lastUsed: 'Sep 15, 2024',
    deviceType: 'device',
  },
  {
    id: 'passkey-2',
    customerId: 'customer-1',
    name: 'iPhone 15 Pro',
    createdAt: 'Aug 20, 2024',
    lastUsed: 'Sep 14, 2024',
    deviceType: 'platform',
  },
]

// ============================================================================
// MOCK STORE PREFERENCES
// ============================================================================

export const mockAuthorizedPickupPersons: AuthorizedPickupPerson[] = [
  {
    id: 'person-1',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    relationship: 'Spouse',
  },
  {
    id: 'person-2',
    firstName: 'Mike',
    lastName: 'Smith',
    email: 'mike.smith@example.com',
    relationship: 'Friend',
  },
]

export const mockStorePreferences: StorePreferences = {
  customerId: 'customer-1',
  preferredStoreId: 'store-1',
  autoSelectStore: true,
  pickupNotifications: true,
  storeEventsPromotions: false,
  authorizedPickupPersons: mockAuthorizedPickupPersons,
}
