/**
 * Supabase Data Provider
 * 
 * TODO: Implement real Supabase repository implementations.
 * For now, this file contains skeleton implementations that throw errors.
 */

import { IDataRepositories } from '../repositories/types'
import {
  IProductRepository,
  IOrderRepository,
  IAccountRepository,
  IReviewRepository,
  IStoreRepository,
  IConfigRepository,
} from '../repositories/types'
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
// SUPABASE PRODUCT REPOSITORY (TODO)
// ============================================================================

class SupabaseProductRepository implements IProductRepository {
  // TODO: Implement with real Supabase queries
  // This implementation throws clear errors to prevent silent failures
  async getAllProducts(): Promise<Product[]> {
    throw new Error('[Supabase] getAllProducts() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getProductById(_id: string): Promise<Product | undefined> {
    throw new Error('[Supabase] getProductById() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async listProducts(
    _filters?: ProductFilters,
    _sort?: ProductSortOption,
    _page?: number,
    _pageSize?: number
  ): Promise<PaginatedResult<Product>> {
    throw new Error('[Supabase] listProducts() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getProductsBySubcategory(_category: string, _subcategory?: string): Promise<Product[]> {
    throw new Error('[Supabase] getProductsBySubcategory() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getFeaturedProducts(_limit?: number): Promise<Product[]> {
    throw new Error('[Supabase] getFeaturedProducts() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getNewArrivals(_limit?: number): Promise<Product[]> {
    throw new Error('[Supabase] getNewArrivals() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getNewReleases(_limit?: number): Promise<Product[]> {
    throw new Error('[Supabase] getNewReleases() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getNewReleasesByCategory(_category: string, _limit?: number): Promise<Product[]> {
    throw new Error('[Supabase] getNewReleasesByCategory() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getSaleProducts(): Promise<Product[]> {
    throw new Error('[Supabase] getSaleProducts() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getPriceRange(_productIds?: string[]): Promise<PriceRange> {
    throw new Error('[Supabase] getPriceRange() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getInventory(_productId: string, _variantId?: string): Promise<Inventory> {
    throw new Error('[Supabase] getInventory() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async searchProducts(_query: string, _limit?: number): Promise<Product[]> {
    throw new Error('[Supabase] searchProducts() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }
}

// ============================================================================
// SUPABASE ORDER REPOSITORY (TODO)
// ============================================================================

class SupabaseOrderRepository implements IOrderRepository {
  async listOrders(
    _customerId: string,
    _filters?: Omit<OrderFilters, 'customerId'>,
    _sort?: OrderSortOption,
    _page?: number,
    _pageSize?: number
  ): Promise<PaginatedResult<Order>> {
    throw new Error('[Supabase] listOrders() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getOrderSummaries(_customerId: string): Promise<OrderSummary[]> {
    throw new Error('[Supabase] getOrderSummaries() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getOrder(_orderNumber: string): Promise<Order | undefined> {
    throw new Error('[Supabase] getOrder() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getRecentOrders(_customerId: string, _limit?: number): Promise<Order[]> {
    throw new Error('[Supabase] getRecentOrders() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }
}

// ============================================================================
// SUPABASE ACCOUNT REPOSITORY (TODO)
// ============================================================================

class SupabaseAccountRepository implements IAccountRepository {
  async getCustomer(_customerId: string): Promise<Customer | undefined> {
    throw new Error('[Supabase] getCustomer() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getCustomerByEmail(_email: string): Promise<Customer | undefined> {
    throw new Error('[Supabase] getCustomerByEmail() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getAccountBalances(_customerId: string): Promise<AccountBalances> {
    throw new Error('[Supabase] getAccountBalances() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getProfileCompletion(_customerId: string): Promise<ProfileCompletion> {
    throw new Error('[Supabase] getProfileCompletion() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getAddresses(_customerId: string): Promise<Address[]> {
    throw new Error('[Supabase] getAddresses() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getDefaultAddress(_customerId: string): Promise<Address | undefined> {
    throw new Error('[Supabase] getDefaultAddress() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getAddressById(_addressId: string): Promise<Address | undefined> {
    throw new Error('[Supabase] getAddressById() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getPaymentMethods(_customerId: string): Promise<PaymentMethod[]> {
    throw new Error('[Supabase] getPaymentMethods() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getDefaultPaymentMethod(_customerId: string): Promise<PaymentMethod | undefined> {
    throw new Error('[Supabase] getDefaultPaymentMethod() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getGiftCards(_customerId: string): Promise<GiftCard[]> {
    throw new Error('[Supabase] getGiftCards() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getStoreCredit(_customerId: string): Promise<StoreCredit> {
    throw new Error('[Supabase] getStoreCredit() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getLoyaltyInfo(_customerId: string): Promise<LoyaltyInfo> {
    throw new Error('[Supabase] getLoyaltyInfo() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getWishlists(_customerId: string): Promise<Wishlist[]> {
    throw new Error('[Supabase] getWishlists() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getWishlistById(_wishlistId: string): Promise<Wishlist | undefined> {
    throw new Error('[Supabase] getWishlistById() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getDefaultWishlist(_customerId: string): Promise<Wishlist | undefined> {
    throw new Error('[Supabase] getDefaultWishlist() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getPasskeys(_customerId: string): Promise<Passkey[]> {
    throw new Error('[Supabase] getPasskeys() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getStorePreferences(_customerId: string): Promise<StorePreferences> {
    throw new Error('[Supabase] getStorePreferences() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }
}

// ============================================================================
// SUPABASE REVIEW REPOSITORY (TODO)
// ============================================================================

class SupabaseReviewRepository implements IReviewRepository {
  async listReviews(
    _productId: string,
    _filters?: Omit<ReviewFilters, 'productId'>,
    _sort?: ReviewSortOption,
    _page?: number,
    _pageSize?: number
  ): Promise<PaginatedResult<Review>> {
    throw new Error('[Supabase] listReviews() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getReviewSummary(_productId: string): Promise<ReviewSummary> {
    throw new Error('[Supabase] getReviewSummary() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getProductReviews(_productId: string, _limit?: number): Promise<Review[]> {
    throw new Error('[Supabase] getProductReviews() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }
}

// ============================================================================
// SUPABASE STORE REPOSITORY (TODO)
// ============================================================================

class SupabaseStoreRepository implements IStoreRepository {
  async getAllStores(): Promise<Store[]> {
    throw new Error('[Supabase] getAllStores() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getStoreById(_storeId: string): Promise<Store | undefined> {
    throw new Error('[Supabase] getStoreById() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getStoresByDistance(_latitude?: number, _longitude?: number): Promise<Store[]> {
    throw new Error('[Supabase] getStoresByDistance() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getOpenStores(): Promise<Store[]> {
    throw new Error('[Supabase] getOpenStores() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async searchStores(_query: string): Promise<Store[]> {
    throw new Error('[Supabase] searchStores() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }
}

// ============================================================================
// SUPABASE CONFIG REPOSITORY (TODO)
// ============================================================================

class SupabaseConfigRepository implements IConfigRepository {
  async getAdminSettings(): Promise<AdminSettings> {
    throw new Error('[Supabase] getAdminSettings() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getFeatureFlags(): Promise<FeatureFlags> {
    throw new Error('[Supabase] getFeatureFlags() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getSiteConfig(): Promise<SiteConfig> {
    throw new Error('[Supabase] getSiteConfig() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async getAnnouncementBarConfig(): Promise<AnnouncementBarConfig> {
    throw new Error('[Supabase] getAnnouncementBarConfig() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }

  async isFeatureEnabled(_featureKey: keyof FeatureFlags): Promise<boolean> {
    throw new Error('[Supabase] isFeatureEnabled() not implemented. Set DATA_PROVIDER=mock to use mock data.')
  }
}

// ============================================================================
// CREATE SUPABASE REPOSITORIES
// ============================================================================

export function createSupabaseRepositories(): IDataRepositories {
  return {
    products: new SupabaseProductRepository(),
    orders: new SupabaseOrderRepository(),
    account: new SupabaseAccountRepository(),
    reviews: new SupabaseReviewRepository(),
    stores: new SupabaseStoreRepository(),
    config: new SupabaseConfigRepository(),
  }
}
