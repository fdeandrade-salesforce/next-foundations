/**
 * Repositories Index
 * 
 * Exports repository interfaces and implementations.
 */

// Types/Interfaces
export type {
  IProductRepository,
  IOrderRepository,
  IAccountRepository,
  IReviewRepository,
  IStoreRepository,
  IConfigRepository,
  IDataRepositories,
} from './types'

// Mock implementations
export {
  MockProductRepository,
  MockOrderRepository,
  MockAccountRepository,
  MockReviewRepository,
  MockStoreRepository,
  MockConfigRepository,
} from './mock'
