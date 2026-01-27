/**
 * Mock Store Repository Implementation
 */

import { IStoreRepository } from '../types'
import { Store } from '../../../types'
import { mockStores } from '../../mock'

export class MockStoreRepository implements IStoreRepository {
  async getAllStores(): Promise<Store[]> {
    return mockStores
  }

  async getStoreById(storeId: string): Promise<Store | undefined> {
    return mockStores.find((s) => s.id === storeId)
  }

  async getStoresByDistance(
    _latitude?: number,
    _longitude?: number
  ): Promise<Store[]> {
    // In real implementation, would calculate actual distances
    // For mock, just sort by the pre-set distance values
    return [...mockStores].sort((a, b) => (a.distance || 0) - (b.distance || 0))
  }

  async getOpenStores(): Promise<Store[]> {
    return mockStores.filter((s) => s.isOpen)
  }

  async searchStores(query: string): Promise<Store[]> {
    const lowerQuery = query.toLowerCase()
    return mockStores.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.address.toLowerCase().includes(lowerQuery) ||
        s.city.toLowerCase().includes(lowerQuery) ||
        s.state.toLowerCase().includes(lowerQuery) ||
        s.zipCode.includes(query)
    )
  }
}
