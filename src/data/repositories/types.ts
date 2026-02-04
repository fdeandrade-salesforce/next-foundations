/**
 * Repository Interfaces
 * 
 * This file defines the interfaces for all data repositories.
 * Implementations can be swapped between mock and real database providers.
 */

import {
  Product,
  ProductFilters,
  ProductSortOption,
  PaginatedResult,
  PriceRange,
  Inventory,
  Order,
  OrderSummary,
  OrderFilters,
  OrderSortOption,
  Customer,
  Address,
  PaymentMethod,
  GiftCard,
  StoreCredit,
  LoyaltyInfo,
  AccountBalances,
  ProfileCompletion,
  Wishlist,
  WishlistItem,
  Passkey,
  StorePreferences,
  Review,
  ReviewSummary,
  ReviewFilters,
  ReviewSortOption,
  Store,
  AdminSettings,
  FeatureFlags,
  SiteConfig,
  AnnouncementBarConfig,
} from '../../types'

// ============================================================================
// PRODUCT REPOSITORY
// ============================================================================

export interface IProductRepository {
  /**
   * Get all products (deduplicated for PLP views - one per product family)
   */
  getAllProducts(): Promise<Product[]>
  
  /**
   * Get all products including color variants (for PDP variant selection)
   */
  getAllProductsWithVariants?(): Promise<Product[]>

  /**
   * Get a product by ID/slug
   */
  getProductById(id: string): Promise<Product | undefined>

  /**
   * List products with filters and pagination
   */
  listProducts(
    filters?: ProductFilters,
    sort?: ProductSortOption,
    page?: number,
    pageSize?: number
  ): Promise<PaginatedResult<Product>>

  /**
   * Get products by subcategory
   */
  getProductsBySubcategory(category: string, subcategory?: string): Promise<Product[]>

  /**
   * Get featured products (bestsellers, new arrivals)
   */
  getFeaturedProducts(limit?: number): Promise<Product[]>

  /**
   * Get new arrivals
   */
  getNewArrivals(limit?: number): Promise<Product[]>

  /**
   * Get new releases
   */
  getNewReleases(limit?: number): Promise<Product[]>

  /**
   * Get new releases by category
   */
  getNewReleasesByCategory(category: string, limit?: number): Promise<Product[]>

  /**
   * Get products on sale
   */
  getSaleProducts(): Promise<Product[]>

  /**
   * Get price range for a set of products
   */
  getPriceRange(productIds?: string[]): Promise<PriceRange>

  /**
   * Get inventory for a product
   */
  getInventory(productId: string, variantId?: string): Promise<Inventory>

  /**
   * Search products by query
   */
  searchProducts(query: string, limit?: number): Promise<Product[]>

  /**
   * Get all variants for a base product (products with the same name)
   */
  getProductVariants(baseProductId: string): Promise<Product[]>

  /**
   * Find the base product ID for a given product ID
   * Returns the first product with the same name (alphabetically by ID)
   */
  getBaseProductId(productId: string): Promise<string | undefined>
}

// ============================================================================
// ORDER REPOSITORY
// ============================================================================

export interface IOrderRepository {
  /**
   * List orders for a customer with optional filters
   */
  listOrders(
    customerId: string,
    filters?: Omit<OrderFilters, 'customerId'>,
    sort?: OrderSortOption,
    page?: number,
    pageSize?: number
  ): Promise<PaginatedResult<Order>>

  /**
   * Get order summaries (lightweight list view)
   */
  getOrderSummaries(customerId: string): Promise<OrderSummary[]>

  /**
   * Get a single order by order number
   */
  getOrder(orderNumber: string): Promise<Order | undefined>

  /**
   * Get recent orders for a customer
   */
  getRecentOrders(customerId: string, limit?: number): Promise<Order[]>
}

// ============================================================================
// ACCOUNT REPOSITORY
// ============================================================================

export interface IAccountRepository {
  /**
   * Get customer by ID
   */
  getCustomer(customerId: string): Promise<Customer | undefined>

  /**
   * Get customer by email
   */
  getCustomerByEmail(email: string): Promise<Customer | undefined>

  /**
   * Get account balances (gift cards, store credit, loyalty points)
   */
  getAccountBalances(customerId: string): Promise<AccountBalances>

  /**
   * Get profile completion status
   */
  getProfileCompletion(customerId: string): Promise<ProfileCompletion>

  // Addresses
  getAddresses(customerId: string): Promise<Address[]>
  getDefaultAddress(customerId: string): Promise<Address | undefined>
  getAddressById(addressId: string): Promise<Address | undefined>

  // Payment Methods
  getPaymentMethods(customerId: string): Promise<PaymentMethod[]>
  getDefaultPaymentMethod(customerId: string): Promise<PaymentMethod | undefined>

  // Gift Cards
  getGiftCards(customerId: string): Promise<GiftCard[]>

  // Store Credit
  getStoreCredit(customerId: string): Promise<StoreCredit>

  // Loyalty
  getLoyaltyInfo(customerId: string): Promise<LoyaltyInfo>

  // Wishlists
  getWishlists(customerId: string): Promise<Wishlist[]>
  getWishlistById(wishlistId: string): Promise<Wishlist | undefined>
  getDefaultWishlist(customerId: string): Promise<Wishlist | undefined>

  // Passkeys
  getPasskeys(customerId: string): Promise<Passkey[]>

  // Store Preferences
  getStorePreferences(customerId: string): Promise<StorePreferences>
}

// ============================================================================
// REVIEW REPOSITORY
// ============================================================================

export interface IReviewRepository {
  /**
   * List reviews for a product with filters
   */
  listReviews(
    productId: string,
    filters?: Omit<ReviewFilters, 'productId'>,
    sort?: ReviewSortOption,
    page?: number,
    pageSize?: number
  ): Promise<PaginatedResult<Review>>

  /**
   * Get review summary for a product
   */
  getReviewSummary(productId: string): Promise<ReviewSummary>

  /**
   * Get reviews for display (with default sorting/pagination)
   */
  getProductReviews(productId: string, limit?: number): Promise<Review[]>
}

// ============================================================================
// STORE REPOSITORY
// ============================================================================

export interface IStoreRepository {
  /**
   * Get all stores
   */
  getAllStores(): Promise<Store[]>

  /**
   * Get store by ID
   */
  getStoreById(storeId: string): Promise<Store | undefined>

  /**
   * Get stores sorted by distance
   */
  getStoresByDistance(latitude?: number, longitude?: number): Promise<Store[]>

  /**
   * Get open stores
   */
  getOpenStores(): Promise<Store[]>

  /**
   * Search stores by location/name
   */
  searchStores(query: string): Promise<Store[]>
}

// ============================================================================
// CONFIG REPOSITORY
// ============================================================================

export interface IConfigRepository {
  /**
   * Get all admin settings
   */
  getAdminSettings(): Promise<AdminSettings>

  /**
   * Get feature flags
   */
  getFeatureFlags(): Promise<FeatureFlags>

  /**
   * Get site configuration
   */
  getSiteConfig(): Promise<SiteConfig>

  /**
   * Get announcement bar configuration
   */
  getAnnouncementBarConfig(): Promise<AnnouncementBarConfig>

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(featureKey: keyof FeatureFlags): Promise<boolean>
}

// ============================================================================
// COMBINED REPOSITORIES INTERFACE
// ============================================================================

export interface IDataRepositories {
  products: IProductRepository
  orders: IOrderRepository
  account: IAccountRepository
  reviews: IReviewRepository
  stores: IStoreRepository
  config: IConfigRepository
}
