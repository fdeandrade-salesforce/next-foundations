/**
 * Domain Types for Salesforce Foundations E-commerce
 * 
 * This file contains all shared domain types used across the application.
 * These types are database-agnostic and can be used with any data provider.
 */

// ============================================================================
// PRODUCT DOMAIN
// ============================================================================

export interface Product {
  id: string
  name: string
  brand?: string
  price: number
  originalPrice?: number
  image: string
  images?: string[] // Multiple images for variants
  category: string
  subcategory: string
  size?: string[]
  color?: string
  colors?: string[] // Available color variants
  inStock: boolean
  stockQuantity?: number // Number of units in stock (0-50)
  storeAvailable?: boolean // For pickup availability
  rating?: number // 0-5
  reviewCount?: number
  badges?: ProductBadge[]
  isNew?: boolean
  isBestSeller?: boolean
  isOnlineOnly?: boolean
  isLimitedEdition?: boolean
  variants?: number // Number of additional variants
  sku?: string
  shortDescription?: string
  discountPercentage?: number
  percentOff?: number
  promotionalMessage?: string
  // Extended PDP fields
  description?: string
  keyBenefits?: string[]
  ingredients?: string[]
  usageInstructions?: string[]
  careInstructions?: string[]
  technicalSpecs?: Record<string, string>
  scents?: string[]
  capacities?: string[]
  deliveryEstimate?: string
  returnsPolicy?: string
  warranty?: string
  videos?: string[]
}

export type ProductBadge = 'new' | 'best-seller' | 'online-only' | 'limited-edition' | 'promotion'

export interface ProductVariant {
  productId: string
  color?: string
  size?: string
  sku: string
  price: number
  originalPrice?: number
  stockQuantity: number
  inStock: boolean
  image: string
  images?: string[]
}

export interface PriceRange {
  min: number
  max: number
}

export interface Inventory {
  productId: string
  variantId?: string
  quantity: number
  lowStockThreshold?: number
  inStock: boolean
}

// ============================================================================
// PROMOTION DOMAIN
// ============================================================================

export interface Promotion {
  id: string
  code: string
  type: 'percentage' | 'fixed' | 'bogo' | 'free-shipping'
  value: number
  description: string
  message?: string // Display message (e.g., "Extra 20% Off with code WELCOME20")
  minPurchase?: number
  maxDiscount?: number
  startDate?: string
  endDate?: string
  applicableProductIds?: string[]
  applicableCategories?: string[]
  isActive: boolean
}

// ============================================================================
// ORDER DOMAIN
// ============================================================================

export type OrderStatus = 
  | 'Delivered' 
  | 'In Transit' 
  | 'Processing' 
  | 'Cancelled' 
  | 'Partially Delivered' 
  | 'Ready for Pickup' 
  | 'Picked Up'

export interface OrderItem {
  id: string
  productId: string
  image: string
  name: string
  quantity: number
  color?: string
  size?: string
  price: number
  originalPrice?: number
  store?: string
  shippingGroup?: string
}

export interface ShippingGroup {
  groupId: string
  store: string
  status: OrderStatus
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

export interface Order {
  orderNumber: string
  customerId: string
  status: OrderStatus
  method: string // Payment method description
  amount: string // Formatted amount
  orderDate?: string
  items: OrderItem[]
  subtotal: number
  promotions: number
  shipping: number
  tax: number
  total: number
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

export interface OrderSummary {
  orderNumber: string
  status: OrderStatus
  method: string
  amount: string
  orderDate?: string
  itemCount: number
}

// ============================================================================
// CUSTOMER / ACCOUNT DOMAIN
// ============================================================================

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  anniversary?: string
  weddingDay?: string
  loyaltyStatus?: LoyaltyTier
  loyaltyPoints?: number
  emailVerified?: boolean
  phoneVerified?: boolean
  createdAt?: string
  updatedAt?: string
}

export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum'

export interface Address {
  id: string
  customerId: string
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

export type PaymentMethodType = 'visa' | 'mastercard' | 'ach' | 'apple-pay' | 'paypal'

export interface PaymentMethod {
  id: string
  customerId: string
  type: PaymentMethodType
  last4?: string
  bankName?: string
  expiryMonth?: number
  expiryYear?: number
  cardholderName: string
  isDefault: boolean
  isSelected?: boolean
}

export interface GiftCard {
  id: string
  balance: number
  last4: string
  customerId: string
}

export interface StoreCredit {
  customerId: string
  balance: number
  transactions?: StoreCreditTransaction[]
}

export interface StoreCreditTransaction {
  id: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  date: string
  orderNumber?: string
}

export interface LoyaltyInfo {
  customerId: string
  status: LoyaltyTier
  points: number
  pointsToNextTier: number
  nextTier?: LoyaltyTier
  expiringPoints?: number
  expirationDate?: string
  lifetimePoints: number
  memberSince: string
}

export interface AccountBalances {
  giftCardTotal: number
  storeCreditBalance: number
  loyaltyPoints: number
}

export interface ProfileCompletion {
  hasEmail: boolean
  emailVerified: boolean
  hasPhone: boolean
  phoneVerified: boolean
  hasAddress: boolean
  hasPaymentMethod: boolean
  hasPassword: boolean
}

// ============================================================================
// WISHLIST DOMAIN
// ============================================================================

export interface WishlistItem {
  id: string
  productId: string
  wishlistId: string
  addedAt: string
  selectedColor?: string
  selectedSize?: string
  // Denormalized product data for display
  product: Product
}

export interface Wishlist {
  id: string
  customerId: string
  name: string
  isDefault: boolean
  itemCount: number
  items: WishlistItem[]
  createdAt: string
  updatedAt: string
}

// ============================================================================
// PASSKEY DOMAIN
// ============================================================================

export interface Passkey {
  id: string
  customerId: string
  name: string
  createdAt: string
  lastUsed?: string
  deviceType: 'device' | 'platform'
}

// ============================================================================
// REVIEW DOMAIN
// ============================================================================

export interface Review {
  id: string
  productId: string
  author: string
  customerId?: string
  rating: number // 1-5
  date: string
  location?: string // City, State/Country (e.g., "Los Angeles, CA" or "London, UK")
  title: string
  content: string
  verified: boolean
  helpful: number
  images?: string[]
}

export interface ReviewSummary {
  productId: string
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  aiSummary?: string // Placeholder for AI-generated review summary
}

// ============================================================================
// STORE DOMAIN
// ============================================================================

export interface Store {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
  hours: string
  latitude?: number
  longitude?: number
  isOpen: boolean
  pickupTime?: string
  distance?: number // Distance from user in miles
}

export interface StorePreferences {
  customerId: string
  preferredStoreId?: string
  autoSelectStore: boolean
  pickupNotifications: boolean
  storeEventsPromotions: boolean
  authorizedPickupPersons?: AuthorizedPickupPerson[]
}

export interface AuthorizedPickupPerson {
  id: string
  firstName: string
  lastName: string
  email: string
  relationship: string
}

// ============================================================================
// CONFIGURATION / ADMIN SETTINGS / FEATURE FLAGS
// ============================================================================

export interface SiteConfig {
  siteName: string
  siteDescription: string
  logoUrl: string
  contactEmail: string
  supportPhone: string
  socialLinks: {
    facebook?: string
    instagram?: string
    twitter?: string
    pinterest?: string
    youtube?: string
  }
  shippingThreshold: number // Free shipping threshold
  defaultCurrency: string
  taxRate: number
}

export interface FeatureFlags {
  // Checkout features
  enablePayPal: boolean
  enableApplePay: boolean
  enableGooglePay: boolean
  enableAffirm: boolean
  enableKlarna: boolean
  
  // Account features
  enablePasskeys: boolean
  enableLoyalty: boolean
  enableGiftCards: boolean
  enableStoreCredit: boolean
  enableWishlist: boolean
  
  // Product features
  enable3DViewer: boolean
  enableVirtualTryOn: boolean
  enableQuickView: boolean
  enableNotifyMe: boolean
  enableReviews: boolean
  enableQA: boolean
  
  // Fulfillment features
  enableBOPIS: boolean // Buy Online Pick Up In Store
  enableCurbsidePickup: boolean
  enableSameDayDelivery: boolean
  enableShipToStore: boolean
  
  // Marketing features
  enableAnnouncementBar: boolean
  enablePromoBanner: boolean
  enableRecommendations: boolean
  enableRecentlyViewed: boolean
  
  // Profile features
  showProfileVisibility: boolean
  
  // UI features
  enableDarkMode: boolean
  enableChatSupport: boolean
}

export interface AnnouncementBarConfig {
  enabled: boolean
  message: string
  dismissible: boolean
  backgroundColor?: string
  textColor?: string
  linkUrl?: string
  linkText?: string
}

export interface AdminSettings {
  siteConfig: SiteConfig
  featureFlags: FeatureFlags
  announcementBar: AnnouncementBarConfig
  maintenanceMode: boolean
  maintenanceMessage?: string
}

// ============================================================================
// CART DOMAIN (Client-side, localStorage-based in current implementation)
// ============================================================================

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  size?: string
  color?: string
  price: number
  originalPrice?: number
  fulfillmentMethod?: 'pickup' | 'delivery'
  storeId?: string
  storeName?: string
  storeAddress?: string
  shippingAddress?: string
  isGift?: boolean
  isBOGO?: boolean
  bogoPromotionId?: string
  isAvailableAtStore?: boolean
}

// ============================================================================
// FILTER/SORT TYPES
// ============================================================================

export interface ProductFilters {
  category?: string
  subcategory?: string
  priceRange?: [number, number]
  sizes?: string[]
  colors?: string[]
  inStockOnly?: boolean
  isNew?: boolean
  onSale?: boolean
  brand?: string
}

export type ProductSortOption = 
  | 'relevance' 
  | 'price-asc' 
  | 'price-desc' 
  | 'name-asc' 
  | 'name-desc' 
  | 'newest' 
  | 'rating'

export interface OrderFilters {
  customerId: string
  status?: OrderStatus
  year?: string
  searchTerm?: string
}

export type OrderSortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

export interface ReviewFilters {
  productId: string
  rating?: number
  verified?: boolean
  hasImages?: boolean
  searchQuery?: string
}

export type ReviewSortOption = 'newest' | 'highest' | 'lowest' | 'helpful'

// ============================================================================
// PAGINATION
// ============================================================================

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}
