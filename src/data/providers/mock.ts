/**
 * Mock Data Provider
 * 
 * Creates and returns mock repository implementations.
 */

import { IDataRepositories } from '../repositories/types'
import {
  MockProductRepository,
  MockOrderRepository,
  MockAccountRepository,
  MockReviewRepository,
  MockStoreRepository,
  MockConfigRepository,
} from '../repositories/mock'

export function createMockRepositories(): IDataRepositories {
  return {
    products: new MockProductRepository(),
    orders: new MockOrderRepository(),
    account: new MockAccountRepository(),
    reviews: new MockReviewRepository(),
    stores: new MockStoreRepository(),
    config: new MockConfigRepository(),
  }
}
