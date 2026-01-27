/**
 * Mock Data Index
 * 
 * This file exports all mock data for easy import.
 * In production, these would be replaced with Supabase queries.
 */

// Products
export { mockProducts, categoryMappings } from './products'

// Orders
export { mockOrders, getOrderSummaries } from './orders'

// Account data
export {
  mockCustomer,
  mockAddresses,
  mockPaymentMethods,
  mockGiftCards,
  mockStoreCredit,
  mockStoreCreditTransactions,
  mockLoyaltyInfo,
  mockAccountBalances,
  mockProfileCompletion,
  mockWishlists,
  mockPasskeys,
  mockStorePreferences,
  mockAuthorizedPickupPersons,
} from './account'

// Config/Settings
export {
  mockSiteConfig,
  mockFeatureFlags,
  mockAnnouncementBarConfig,
  mockAdminSettings,
} from './config'

// Reviews
export {
  mockReviews,
  mockReviewSummaries,
  generateReviewSummary,
} from './reviews'

// Stores
export {
  mockStores,
  getStoreById,
  getStoresByDistance,
  getOpenStores,
} from './stores'
