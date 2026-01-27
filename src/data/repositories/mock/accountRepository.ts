/**
 * Mock Account Repository Implementation
 */

import { IAccountRepository } from '../types'
import {
  Customer,
  Address,
  PaymentMethod,
  GiftCard,
  StoreCredit,
  LoyaltyInfo,
  AccountBalances,
  ProfileCompletion,
  Wishlist,
  Passkey,
  StorePreferences,
} from '../../../types'
import {
  mockCustomer,
  mockAddresses,
  mockPaymentMethods,
  mockGiftCards,
  mockStoreCredit,
  mockLoyaltyInfo,
  mockAccountBalances,
  mockProfileCompletion,
  mockWishlists,
  mockPasskeys,
  mockStorePreferences,
} from '../../mock'

export class MockAccountRepository implements IAccountRepository {
  async getCustomer(customerId: string): Promise<Customer | undefined> {
    if (mockCustomer.id === customerId) {
      return mockCustomer
    }
    return undefined
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    if (mockCustomer.email === email) {
      return mockCustomer
    }
    return undefined
  }

  async getAccountBalances(customerId: string): Promise<AccountBalances> {
    // In real implementation, would calculate from actual data
    if (customerId === mockCustomer.id) {
      return mockAccountBalances
    }
    return {
      giftCardTotal: 0,
      storeCreditBalance: 0,
      loyaltyPoints: 0,
    }
  }

  async getProfileCompletion(customerId: string): Promise<ProfileCompletion> {
    if (customerId === mockCustomer.id) {
      return mockProfileCompletion
    }
    return {
      hasEmail: false,
      emailVerified: false,
      hasPhone: false,
      phoneVerified: false,
      hasAddress: false,
      hasPaymentMethod: false,
      hasPassword: false,
    }
  }

  // Addresses
  async getAddresses(customerId: string): Promise<Address[]> {
    return mockAddresses.filter((a) => a.customerId === customerId)
  }

  async getDefaultAddress(customerId: string): Promise<Address | undefined> {
    return mockAddresses.find((a) => a.customerId === customerId && a.isDefault)
  }

  async getAddressById(addressId: string): Promise<Address | undefined> {
    return mockAddresses.find((a) => a.id === addressId)
  }

  // Payment Methods
  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    return mockPaymentMethods.filter((p) => p.customerId === customerId)
  }

  async getDefaultPaymentMethod(customerId: string): Promise<PaymentMethod | undefined> {
    return mockPaymentMethods.find((p) => p.customerId === customerId && p.isDefault)
  }

  // Gift Cards
  async getGiftCards(customerId: string): Promise<GiftCard[]> {
    return mockGiftCards.filter((g) => g.customerId === customerId)
  }

  // Store Credit
  async getStoreCredit(customerId: string): Promise<StoreCredit> {
    if (customerId === mockStoreCredit.customerId) {
      return mockStoreCredit
    }
    return {
      customerId,
      balance: 0,
      transactions: [],
    }
  }

  // Loyalty
  async getLoyaltyInfo(customerId: string): Promise<LoyaltyInfo> {
    if (customerId === mockLoyaltyInfo.customerId) {
      return mockLoyaltyInfo
    }
    return {
      customerId,
      status: 'Bronze',
      points: 0,
      pointsToNextTier: 500,
      nextTier: 'Silver',
      lifetimePoints: 0,
      memberSince: new Date().toLocaleDateString(),
    }
  }

  // Wishlists
  async getWishlists(customerId: string): Promise<Wishlist[]> {
    return mockWishlists.filter((w) => w.customerId === customerId)
  }

  async getWishlistById(wishlistId: string): Promise<Wishlist | undefined> {
    return mockWishlists.find((w) => w.id === wishlistId)
  }

  async getDefaultWishlist(customerId: string): Promise<Wishlist | undefined> {
    return mockWishlists.find((w) => w.customerId === customerId && w.isDefault)
  }

  // Passkeys
  async getPasskeys(customerId: string): Promise<Passkey[]> {
    return mockPasskeys.filter((p) => p.customerId === customerId)
  }

  // Store Preferences
  async getStorePreferences(customerId: string): Promise<StorePreferences> {
    if (mockStorePreferences.customerId === customerId) {
      return mockStorePreferences
    }
    return {
      customerId,
      autoSelectStore: true,
      pickupNotifications: true,
      storeEventsPromotions: false,
    }
  }
}
