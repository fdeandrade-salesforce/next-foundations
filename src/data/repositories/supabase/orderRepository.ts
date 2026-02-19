/**
 * Supabase Order Repository Implementation
 */

import { IOrderRepository } from '../types'
import {
  Order,
  OrderSummary,
  OrderFilters,
  OrderSortOption,
  PaginatedResult,
} from '../../../types'
import { getSupabaseClient } from '../../../lib/supabaseClient'

export class SupabaseOrderRepository implements IOrderRepository {
  async listOrders(
    customerId: string,
    filters?: Omit<OrderFilters, 'customerId'>,
    sort: OrderSortOption = 'date-desc',
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResult<Order>> {
    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          shipping_groups(*)
        `, { count: 'exact' })
        .eq('customer_id', customerId)

      // Apply filters
      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status)
        }
        if (filters.year) {
          // Extract year from order_date (format: "Sep 10, 2024")
          query = query.ilike('order_date', `%${filters.year}%`)
        }
        if (filters.searchTerm) {
          const termPattern = `%${filters.searchTerm.trim()}%`
          query = query.ilike('order_number', termPattern)
        }
      }

      // Apply sorting
      switch (sort) {
        case 'date-asc':
          query = query.order('order_date', { ascending: true })
          break
        case 'amount-desc':
          query = query.order('total', { ascending: false })
          break
        case 'amount-asc':
          query = query.order('total', { ascending: true })
          break
        case 'date-desc':
        default:
          query = query.order('order_date', { ascending: false })
      }

      // Apply pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      const total = count || 0
      const totalPages = Math.ceil(total / pageSize)

      return {
        items: this.mapOrders(data || []),
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      }
    } catch (error) {
      console.error('Error listing orders:', error)
      return {
        items: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      }
    }
  }

  async getOrderSummaries(customerId: string): Promise<OrderSummary[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('orders')
        .select(`
          order_number,
          status,
          method,
          amount,
          order_date,
          order_items(id)
        `)
        .eq('customer_id', customerId)
        .order('order_date', { ascending: false })

      if (error) throw error

      return (data || []).map((order: any) => ({
        orderNumber: order.order_number,
        status: order.status,
        method: order.method,
        amount: order.amount,
        orderDate: order.order_date,
        itemCount: order.order_items?.length || 0,
      }))
    } catch (error) {
      console.error('Error fetching order summaries:', error)
      return []
    }
  }

  async getOrder(orderNumber: string): Promise<Order | undefined> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          shipping_groups(*)
        `)
        .eq('order_number', orderNumber)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return undefined
        throw error
      }

      return data ? this.mapOrder(data) : undefined
    } catch (error) {
      console.error('Error fetching order:', error)
      return undefined
    }
  }

  async getRecentOrders(customerId: string, limit: number = 5): Promise<Order[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          shipping_groups(*)
        `)
        .eq('customer_id', customerId)
        .order('order_date', { ascending: false })
        .limit(limit)

      if (error) throw error

      return this.mapOrders(data || [])
    } catch (error) {
      console.error('Error fetching recent orders:', error)
      return []
    }
  }

  private mapOrders(rows: any[]): Order[] {
    return rows.map(row => this.mapOrder(row))
  }

  private mapOrder(row: any): Order {
    return {
      orderNumber: row.order_number,
      customerId: row.customer_id,
      status: row.status,
      method: row.method,
      amount: row.amount,
      orderDate: row.order_date,
      items: (row.order_items || []).map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        image: item.product_image,
        name: item.product_name,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        price: parseFloat(item.price),
        originalPrice: item.original_price ? parseFloat(item.original_price) : undefined,
        store: item.store,
        shippingGroup: item.shipping_group,
      })),
      subtotal: parseFloat(row.subtotal),
      promotions: parseFloat(row.promotions || 0),
      shipping: parseFloat(row.shipping || 0),
      tax: parseFloat(row.tax || 0),
      total: parseFloat(row.total),
      paymentInfo: row.payment_info,
      shippingAddress: row.shipping_address,
      shippingMethod: row.shipping_method,
      deliveryDate: row.delivery_date,
      trackingNumber: row.tracking_number,
      carrier: row.carrier,
      carrierTrackingUrl: row.carrier_tracking_url,
      shippingGroups: (row.shipping_groups || []).map((sg: any) => ({
        groupId: sg.group_id,
        store: sg.store,
        status: sg.status,
        trackingNumber: sg.tracking_number,
        carrier: sg.carrier,
        carrierTrackingUrl: sg.carrier_tracking_url,
        deliveryDate: sg.delivery_date,
        shippingMethod: sg.shipping_method,
        shippingAddress: sg.shipping_address,
        pickupLocation: sg.pickup_location,
        pickupAddress: sg.pickup_address,
        pickupDate: sg.pickup_date,
        pickupReadyDate: sg.pickup_ready_date,
        isBOPIS: sg.is_bopis,
      })),
      isBOPIS: row.is_bopis,
      pickupLocation: row.pickup_location,
      pickupAddress: row.pickup_address,
      pickupDate: row.pickup_date,
      pickupReadyDate: row.pickup_ready_date,
      canReturn: row.can_return,
      canCancel: row.can_cancel,
      returnDeadline: row.return_deadline,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
    }
  }
}
