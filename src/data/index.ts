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
 *   NEXT_PUBLIC_DATA_PROVIDER=mock|supabase (default: mock)
 *   Also supports DATA_PROVIDER for backward compatibility
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
 * Prioritizes NEXT_PUBLIC_DATA_PROVIDER for client components
 */
function getDataProvider(): DataProvider {
  // Prioritize NEXT_PUBLIC_* for client-side access
  const provider = (process.env.NEXT_PUBLIC_DATA_PROVIDER || process.env.DATA_PROVIDER || 'mock').toLowerCase()
  
  if (provider === 'supabase') {
    return 'supabase'
  }
  
  return 'mock'
}

/**
 * Extract Supabase project reference from URL (safe for logging)
 * Example: https://xxxxx.supabase.co -> xxxxx
 * Also handles .supabase.in domains
 */
function extractSupabaseProjectRef(url: string | undefined): string | null {
  if (!url) return null
  try {
    // Match both .supabase.co and .supabase.in domains
    const match = url.match(/https?:\/\/([^.]+)\.supabase\.(co|in)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

/**
 * Validate Supabase credentials and throw immediately if missing
 */
function validateSupabaseCredentials(): void {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'NEXT_PUBLIC_DATA_PROVIDER=supabase requires Supabase environment variables.\n\n' +
      'Please set:\n' +
      '  - NEXT_PUBLIC_SUPABASE_URL\n' +
      '  - NEXT_PUBLIC_SUPABASE_ANON_KEY\n\n' +
      'You can find these in your Supabase project settings under API.\n' +
      'Or set NEXT_PUBLIC_DATA_PROVIDER=mock to use mock data instead.'
    )
  }
  
  // Validate URL format
  if (!supabaseUrl.includes('.supabase.co') && !supabaseUrl.includes('.supabase.in')) {
    throw new Error(
      'Invalid NEXT_PUBLIC_SUPABASE_URL format. Expected format: https://xxxxx.supabase.co'
    )
  }
  
  // Validate key format (should start with eyJ for JWT)
  if (!supabaseAnonKey.startsWith('eyJ')) {
    throw new Error(
      'Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY format. Expected a JWT token starting with "eyJ"'
    )
  }
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
        // Validate immediately - no fallback to mock
        validateSupabaseCredentials()
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const projectRef = extractSupabaseProjectRef(supabaseUrl)
        
        // Dev-only startup log
        if (process.env.NODE_ENV === 'development') {
          console.log('[Data Layer] ✅ Using Supabase provider')
          if (projectRef) {
            console.log(`[Data Layer] 📦 Supabase project: ${projectRef}`)
          } else {
            console.log(`[Data Layer] 📦 Supabase URL: ${supabaseUrl}`)
          }
        }
        
        _repositories = createSupabaseRepositories()
        break
      case 'mock':
      default:
        // Dev-only startup log
        if (process.env.NODE_ENV === 'development') {
          console.log('[Data Layer] ✅ Using Mock provider')
        }
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
