/**
 * Supabase Store Repository Implementation
 */

import { IStoreRepository } from '../types'
import { Store } from '../../../types'
import { getSupabaseClient } from '../../../lib/supabaseClient'

export class SupabaseStoreRepository implements IStoreRepository {
  async getAllStores(): Promise<Store[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      return this.mapStores(data || [])
    } catch (error) {
      console.error('Error fetching all stores:', error)
      return []
    }
  }

  async getStoreById(storeId: string): Promise<Store | undefined> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return undefined
        throw error
      }

      return data ? this.mapStore(data) : undefined
    } catch (error) {
      console.error('Error fetching store by id:', error)
      return undefined
    }
  }

  async getStoresByDistance(
    latitude?: number,
    longitude?: number
  ): Promise<Store[]> {
    try {
      // For now, just return all stores sorted by name
      // In production, you'd calculate distance using PostGIS or similar
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      return this.mapStores(data || [])
    } catch (error) {
      console.error('Error fetching stores by distance:', error)
      return []
    }
  }

  async getOpenStores(): Promise<Store[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('status', 'open')
        .order('name', { ascending: true })

      if (error) throw error

      return this.mapStores(data || [])
    } catch (error) {
      console.error('Error fetching open stores:', error)
      return []
    }
  }

  async searchStores(query: string): Promise<Store[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .or(`name.ilike.%${query}%,address.ilike.%${query}%,city.ilike.%${query}%`)
        .order('name', { ascending: true })

      if (error) throw error

      return this.mapStores(data || [])
    } catch (error) {
      console.error('Error searching stores:', error)
      return []
    }
  }

  private mapStores(rows: any[]): Store[] {
    return rows.map(row => this.mapStore(row))
  }

  private mapStore(row: any): Store {
    // Convert hours object to string format
    const hoursObj = row.hours || {}
    const hoursStr = typeof hoursObj === 'string' ? hoursObj : JSON.stringify(hoursObj)
    
    return {
      id: row.id,
      name: row.name,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip,
      country: 'US', // Default to US
      phone: row.phone,
      hours: hoursStr,
      latitude: row.latitude ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      isOpen: row.status === 'open',
      pickupTime: row.pickup_time,
      distance: row.distance ? parseFloat(row.distance) : undefined,
    }
  }
}
