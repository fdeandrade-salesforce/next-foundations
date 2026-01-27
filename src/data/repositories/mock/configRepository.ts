/**
 * Mock Config Repository Implementation
 */

import { IConfigRepository } from '../types'
import {
  AdminSettings,
  FeatureFlags,
  SiteConfig,
  AnnouncementBarConfig,
} from '../../../types'
import {
  mockAdminSettings,
  mockFeatureFlags,
  mockSiteConfig,
  mockAnnouncementBarConfig,
} from '../../mock'

export class MockConfigRepository implements IConfigRepository {
  async getAdminSettings(): Promise<AdminSettings> {
    return mockAdminSettings
  }

  async getFeatureFlags(): Promise<FeatureFlags> {
    return mockFeatureFlags
  }

  async getSiteConfig(): Promise<SiteConfig> {
    return mockSiteConfig
  }

  async getAnnouncementBarConfig(): Promise<AnnouncementBarConfig> {
    return mockAnnouncementBarConfig
  }

  async isFeatureEnabled(featureKey: keyof FeatureFlags): Promise<boolean> {
    return mockFeatureFlags[featureKey]
  }
}
