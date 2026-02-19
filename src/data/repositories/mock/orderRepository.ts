/**
 * Mock Order Repository Implementation
 */

import { IOrderRepository } from '../types'
import {
  Order,
  OrderSummary,
  OrderFilters,
  OrderSortOption,
  PaginatedResult,
} from '../../../types'
import { mockOrders, getOrderSummaries } from '../../mock'

export class MockOrderRepository implements IOrderRepository {
  async listOrders(
    customerId: string,
    filters?: Omit<OrderFilters, 'customerId'>,
    sort: OrderSortOption = 'date-desc',
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResult<Order>> {
    let filtered = mockOrders.filter((o) => o.customerId === customerId)

    // Apply filters
    if (filters) {
      if (filters.status) {
        filtered = filtered.filter((o) => o.status === filters.status)
      }

      if (filters.year && filters.year !== 'all') {
        filtered = filtered.filter((o) => {
          if (!o.orderDate) return false
          return o.orderDate.includes(filters.year!)
        })
      }

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase().trim().replace(/^#/, '')
        filtered = filtered.filter((o) => o.orderNumber.toLowerCase().includes(term))
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const parseDate = (dateStr?: string): number => {
        if (!dateStr) return 0
        return new Date(dateStr).getTime()
      }

      const parseAmount = (amountStr: string): number => {
        return parseFloat(amountStr.replace('$', '').replace(',', ''))
      }

      switch (sort) {
        case 'date-asc':
          return parseDate(a.orderDate) - parseDate(b.orderDate)
        case 'date-desc':
          return parseDate(b.orderDate) - parseDate(a.orderDate)
        case 'amount-asc':
          return parseAmount(a.amount) - parseAmount(b.amount)
        case 'amount-desc':
          return parseAmount(b.amount) - parseAmount(a.amount)
        default:
          return parseDate(b.orderDate) - parseDate(a.orderDate)
      }
    })

    // Apply pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const items = filtered.slice(startIndex, endIndex)

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    }
  }

  async getOrderSummaries(customerId: string): Promise<OrderSummary[]> {
    const customerOrders = mockOrders.filter((o) => o.customerId === customerId)
    return getOrderSummaries(customerOrders)
  }

  async getOrder(orderNumber: string): Promise<Order | undefined> {
    return mockOrders.find((o) => o.orderNumber === orderNumber)
  }

  async getRecentOrders(customerId: string, limit: number = 5): Promise<Order[]> {
    return mockOrders
      .filter((o) => o.customerId === customerId)
      .sort((a, b) => {
        const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0
        const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0
        return dateB - dateA
      })
      .slice(0, limit)
  }
}
