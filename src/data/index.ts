/**
 * Data Layer Entry Point
 * 
 * This file provides the data access layer for the application.
 * It switches between mock and real database providers based on environment variables.
 * 
 * Usage:
 *   import { getRepositories, productRepo, orderRepo } from '@/src/data'
 * 
 * Environment Variable:
 *   DATA_PROVIDER=mock|supabase (default: mock)
 */

import { IDataRepositories } from './repositories/types'
import { createMockRepositories } from './providers/mock'
import { createSupabaseRepositories } from './providers/supabase'

// ============================================================================
// PROVIDER CONFIGURATION
// ============================================================================

type DataProvider = 'mock' | 'supabase'

/**
 * Get the current data provider from environment
 */
function getDataProvider(): DataProvider {
  const provider = process.env.DATA_PROVIDER || process.env.NEXT_PUBLIC_DATA_PROVIDER || 'mock'
  
  if (provider === 'supabase') {
    return 'supabase'
  }
  
  return 'mock'
}

// ============================================================================
// REPOSITORY INSTANCES (Singleton Pattern)
// ============================================================================

let _repositories: IDataRepositories | null = null

/**
 * Get all repositories
 * Uses singleton pattern to avoid recreating repositories on every call
 */
export function getRepositories(): IDataRepositories {
  if (_repositories === null) {
    const provider = getDataProvider()
    
    switch (provider) {
      case 'supabase':
        console.log('[Data Layer] Using Supabase provider')
        _repositories = createSupabaseRepositories()
        break
      case 'mock':
      default:
        console.log('[Data Layer] Using Mock provider')
        _repositories = createMockRepositories()
        break
    }
  }
  
  return _repositories
}

/**
 * Reset repositories (useful for testing)
 */
export function resetRepositories(): void {
  _repositories = null
}

// ============================================================================
// CONVENIENCE EXPORTS (Lazy-initialized)
// ============================================================================

// These are getter functions that return the repository when called
// This allows for lazy initialization and avoids circular dependency issues

export function getProductRepo() {
  return getRepositories().products
}

export function getOrderRepo() {
  return getRepositories().orders
}

export function getAccountRepo() {
  return getRepositories().account
}

export function getReviewRepo() {
  return getRepositories().reviews
}

export function getStoreRepo() {
  return getRepositories().stores
}

export function getConfigRepo() {
  return getRepositories().config
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

// Re-export types for convenience
export type {
  IProductRepository,
  IOrderRepository,
  IAccountRepository,
  IReviewRepository,
  IStoreRepository,
  IConfigRepository,
  IDataRepositories,
} from './repositories/types'

// Re-export domain types
export * from '../types'
