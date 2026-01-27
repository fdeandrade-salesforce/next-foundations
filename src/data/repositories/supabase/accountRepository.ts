/**
 * Supabase Account Repository Implementation
 */

import { IAccountRepository } from '../types'
import {
  Customer,
  Address,
  PaymentMethod,
  GiftCard,
  StoreCredit,
  LoyaltyInfo,
  AccountBalances,
  ProfileCompletion,
  Wishlist,
  WishlistItem,
  Passkey,
  StorePreferences,
} from '../../../types'
import { getSupabaseClient } from '../../../lib/supabaseClient'

export class SupabaseAccountRepository implements IAccountRepository {
  async getCustomer(customerId: string): Promise<Customer | undefined> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('account_profiles')
        .select('*')
        .eq('id', customerId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return undefined
        throw error
      }

      return data ? this.mapCustomer(data) : undefined
    } catch (error) {
      console.error('Error fetching customer:', error)
      return undefined
    }
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('account_profiles')
        .select('*')
        .eq('email', email)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return undefined
        throw error
      }

      return data ? this.mapCustomer(data) : undefined
    } catch (error) {
      console.error('Error fetching customer by email:', error)
      return undefined
    }
  }

  async getAccountBalances(customerId: string): Promise<AccountBalances> {
    // For now, return empty balances
    // In production, you'd query gift_cards and store_credit tables
    return {
      giftCardTotal: 0,
      storeCreditBalance: 0,
      loyaltyPoints: 0,
    }
  }

  async getProfileCompletion(customerId: string): Promise<ProfileCompletion> {
    try {
      const customer = await this.getCustomer(customerId)
      const addresses = await this.getAddresses(customerId)
      const paymentMethods = await this.getPaymentMethods(customerId)

      return {
        hasEmail: !!customer?.email,
        emailVerified: customer?.emailVerified || false,
        hasPhone: !!customer?.phone,
        phoneVerified: customer?.phoneVerified || false,
        hasAddress: addresses.length > 0,
        hasPaymentMethod: paymentMethods.length > 0,
        hasPassword: true, // Assume password exists if customer exists
      }
    } catch (error) {
      console.error('Error fetching profile completion:', error)
      return {
        hasEmail: false,
        emailVerified: false,
        hasPhone: false,
        phoneVerified: false,
        hasAddress: false,
        hasPaymentMethod: false,
        hasPassword: false,
      }
    }
  }

  async getAddresses(customerId: string): Promise<Address[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('customer_id', customerId)
        .order('is_default', { ascending: false })

      if (error) throw error

      return (data || []).map((row: any) => ({
        id: row.id,
        customerId: row.customer_id,
        firstName: row.first_name,
        lastName: row.last_name,
        addressLine1: row.address_line1,
        addressLine2: row.address_line2,
        city: row.city,
        state: row.state,
        zipCode: row.zip,
        country: row.country || 'US',
        isDefault: row.is_default,
      }))
    } catch (error) {
      console.error('Error fetching addresses:', error)
      return []
    }
  }

  async getDefaultAddress(customerId: string): Promise<Address | undefined> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('customer_id', customerId)
        .eq('is_default', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return undefined
        throw error
      }

      if (!data) return undefined

      return {
        id: (data as any).id,
        customerId: (data as any).customer_id,
        firstName: (data as any).first_name,
        lastName: (data as any).last_name,
        addressLine1: (data as any).address_line1,
        addressLine2: (data as any).address_line2,
        city: (data as any).city,
        state: (data as any).state,
        zipCode: (data as any).zip,
        country: (data as any).country || 'US',
        isDefault: (data as any).is_default,
      }
    } catch (error) {
      console.error('Error fetching default address:', error)
      return undefined
    }
  }

  async getAddressById(addressId: string): Promise<Address | undefined> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', addressId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return undefined
        throw error
      }

      if (!data) return undefined

      return {
        id: (data as any).id,
        customerId: (data as any).customer_id,
        firstName: (data as any).first_name,
        lastName: (data as any).last_name,
        addressLine1: (data as any).address_line1,
        addressLine2: (data as any).address_line2,
        city: (data as any).city,
        state: (data as any).state,
        zipCode: (data as any).zip,
        country: (data as any).country || 'US',
        isDefault: (data as any).is_default,
      }
    } catch (error) {
      console.error('Error fetching address by id:', error)
      return undefined
    }
  }

  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('customer_id', customerId)
        .order('is_default', { ascending: false })

      if (error) throw error

      return (data || []).map((row: any) => ({
        id: row.id,
        customerId: row.customer_id,
        type: row.type as any,
        last4: row.last_four,
        bankName: row.brand,
        expiryMonth: row.expiry_month,
        expiryYear: row.expiry_year,
        cardholderName: `${row.last_four}`, // Simplified
        isDefault: row.is_default,
      }))
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      return []
    }
  }

  async getDefaultPaymentMethod(customerId: string): Promise<PaymentMethod | undefined> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('customer_id', customerId)
        .eq('is_default', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return undefined
        throw error
      }

      if (!data) return undefined

      return {
        id: (data as any).id,
        customerId: (data as any).customer_id,
        type: (data as any).type as any,
        last4: (data as any).last_four,
        bankName: (data as any).brand,
        expiryMonth: (data as any).expiry_month,
        expiryYear: (data as any).expiry_year,
        cardholderName: `${(data as any).last_four}`,
        isDefault: (data as any).is_default,
      }
    } catch (error) {
      console.error('Error fetching default payment method:', error)
      return undefined
    }
  }

  async getGiftCards(customerId: string): Promise<GiftCard[]> {
    // Not implemented in schema yet
    return []
  }

  async getStoreCredit(customerId: string): Promise<StoreCredit> {
    // Not implemented in schema yet
    return {
      customerId,
      balance: 0,
    }
  }

  async getLoyaltyInfo(customerId: string): Promise<LoyaltyInfo> {
    // Simplified implementation
    return {
      customerId,
      status: 'Bronze',
      points: 0,
      pointsToNextTier: 100,
      nextTier: 'Silver',
      lifetimePoints: 0,
      memberSince: new Date().toISOString(),
    }
  }

  async getWishlists(customerId: string): Promise<Wishlist[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          wishlist_items(product_id)
        `)
        .eq('customer_id', customerId)
        .order('is_default', { ascending: false })

      if (error) throw error

      return (data || []).map((row: any) => ({
        id: (row as any).id,
        customerId: (row as any).customer_id,
        name: (row as any).name,
        isDefault: (row as any).is_default,
        itemCount: ((row as any).wishlist_items?.length || 0),
        items: [], // Will be populated separately if needed
        createdAt: (row as any).created_at,
        updatedAt: (row as any).updated_at,
      }))
    } catch (error) {
      console.error('Error fetching wishlists:', error)
      return []
    }
  }

  async getWishlistById(wishlistId: string): Promise<Wishlist | undefined> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          wishlist_items(product_id)
        `)
        .eq('id', wishlistId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return undefined
        throw error
      }

      if (!data) return undefined

      return {
        id: (data as any).id,
        customerId: (data as any).customer_id,
        name: (data as any).name,
        isDefault: (data as any).is_default,
        itemCount: ((data as any).wishlist_items?.length || 0),
        items: [], // Will be populated separately if needed
        createdAt: (data as any).created_at,
        updatedAt: (data as any).updated_at,
      }
    } catch (error) {
      console.error('Error fetching wishlist by id:', error)
      return undefined
    }
  }

  async getDefaultWishlist(customerId: string): Promise<Wishlist | undefined> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          wishlist_items(product_id)
        `)
        .eq('customer_id', customerId)
        .eq('is_default', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return undefined
        throw error
      }

      if (!data) return undefined

      return {
        id: (data as any).id,
        customerId: (data as any).customer_id,
        name: (data as any).name,
        isDefault: (data as any).is_default,
        itemCount: ((data as any).wishlist_items?.length || 0),
        items: [], // Will be populated separately if needed
        createdAt: (data as any).created_at,
        updatedAt: (data as any).updated_at,
      }
    } catch (error) {
      console.error('Error fetching default wishlist:', error)
      return undefined
    }
  }

  async getPasskeys(customerId: string): Promise<Passkey[]> {
    // Not implemented in schema yet
    return []
  }

  async getStorePreferences(customerId: string): Promise<StorePreferences> {
    // Return default preferences
    return {
      customerId,
      preferredStoreId: undefined,
      autoSelectStore: false,
      pickupNotifications: true,
      storeEventsPromotions: true,
    }
  }

  private mapCustomer(row: any): Customer {
    return {
      id: row.id,
      firstName: row.first_name || '',
      lastName: row.last_name || '',
      email: row.email,
      phone: row.phone,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      emailVerified: true, // Assume verified if exists
      phoneVerified: !!row.phone,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}
