/**
 * Mock Configuration Data
 * 
 * This file contains all site configuration, feature flags, and admin settings.
 * In production, this would be fetched from Supabase.
 */

import {
  SiteConfig,
  FeatureFlags,
  AnnouncementBarConfig,
  AdminSettings,
} from '../../types'

// ============================================================================
// SITE CONFIGURATION
// ============================================================================

export const mockSiteConfig: SiteConfig = {
  siteName: 'Salesforce Foundations',
  siteDescription: 'Premium geometric design objects for modern spaces',
  logoUrl: '/images/logo.svg',
  contactEmail: 'support@marketstreet.com',
  supportPhone: '+1 (800) 555-0123',
  socialLinks: {
    facebook: 'https://facebook.com/marketstreet',
    instagram: 'https://instagram.com/marketstreet',
    twitter: 'https://twitter.com/marketstreet',
    pinterest: 'https://pinterest.com/marketstreet',
    youtube: 'https://youtube.com/marketstreet',
  },
  shippingThreshold: 50, // Free shipping over $50
  defaultCurrency: 'USD',
  taxRate: 0.0875, // 8.75% tax rate
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const mockFeatureFlags: FeatureFlags = {
  // Checkout features
  enablePayPal: true,
  enableApplePay: true,
  enableGooglePay: true,
  enableAffirm: false,
  enableKlarna: false,

  // Account features
  enablePasskeys: true,
  enableLoyalty: true,
  enableGiftCards: true,
  enableStoreCredit: true,
  enableWishlist: true,

  // Product features
  enable3DViewer: true,
  enableVirtualTryOn: true,
  enableQuickView: true,
  enableNotifyMe: true,
  enableReviews: true,
  enableQA: true,

  // Fulfillment features
  enableBOPIS: true, // Buy Online Pick Up In Store
  enableCurbsidePickup: true,
  enableSameDayDelivery: false,
  enableShipToStore: false,

  // Marketing features
  enableAnnouncementBar: true,
  enablePromoBanner: true,
  enableRecommendations: true,
  enableRecentlyViewed: true,

  // Profile features
  showProfileVisibility: false,

  // UI features
  enableDarkMode: false,
  enableChatSupport: false,
}

// ============================================================================
// ANNOUNCEMENT BAR CONFIGURATION
// ============================================================================

export const mockAnnouncementBarConfig: AnnouncementBarConfig = {
  enabled: true,
  message: 'FREE WORLDWIDE SHIPPING from $90',
  dismissible: true,
  backgroundColor: '#E8F4FE',
  textColor: '#1E3A5F',
}

// ============================================================================
// ADMIN SETTINGS (Combined)
// ============================================================================

export const mockAdminSettings: AdminSettings = {
  siteConfig: mockSiteConfig,
  featureFlags: mockFeatureFlags,
  announcementBar: mockAnnouncementBarConfig,
  maintenanceMode: false,
  maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back soon.',
}
