/**
 * Supabase Data Provider
 * 
 * This file provides Supabase implementations of all repositories.
 */

import { IDataRepositories } from '../repositories/types'
import {
  IConfigRepository,
} from '../repositories/types'
import {
  AdminSettings,
  FeatureFlags,
  SiteConfig,
  AnnouncementBarConfig,
} from '../../types'
import {
  SupabaseProductRepository,
  SupabaseReviewRepository,
  SupabaseOrderRepository,
  SupabaseStoreRepository,
  SupabaseAccountRepository,
} from '../repositories/supabase'
import { mockAdminSettings, mockFeatureFlags } from '../../data/mock/config'

// ============================================================================
// SUPABASE CONFIG REPOSITORY
// ============================================================================
// Config remains mock-based for now (admin settings, feature flags)
// In production, you might want to store these in Supabase as well

class SupabaseConfigRepository implements IConfigRepository {
  async getAdminSettings(): Promise<AdminSettings> {
    // For now, return mock settings
    // In production, fetch from Supabase config table
    return mockAdminSettings
  }

  async getFeatureFlags(): Promise<FeatureFlags> {
    // For now, return mock flags
    // In production, fetch from Supabase feature_flags table
    return mockFeatureFlags
  }

  async getSiteConfig(): Promise<SiteConfig> {
    // Return default config
    return {
      siteName: 'Market Street',
      siteDescription: 'Premium design products',
      logoUrl: '/images/logo.svg',
      contactEmail: 'contact@marketstreet.com',
      supportPhone: '+1-555-0100',
      socialLinks: {},
      shippingThreshold: 100,
      defaultCurrency: 'USD',
      taxRate: 0.08,
    }
  }

  async getAnnouncementBarConfig(): Promise<AnnouncementBarConfig> {
    // Return default config
    return {
      enabled: false,
      message: '',
      dismissible: true,
    }
  }

  async isFeatureEnabled(featureKey: keyof FeatureFlags): Promise<boolean> {
    const flags = await this.getFeatureFlags()
    return flags[featureKey] || false
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
