/**
 * One-time script to import orders into Supabase
 * Imports: orders, order_items, shipping_groups
 * 
 * Usage:
 *   npm run import:supabase:orders
 * 
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local (required)
 */

import { getSupabaseClient } from './supabaseClient'
import { mockOrders } from '../src/data/mock/orders'
import { Order } from '../src/types'

const supabase = getSupabaseClient()

async function importOrders() {
  console.log('🚀 Starting orders import...\n')

  const failures: Array<{ table: string; id: string; error: string }> = []
  let attempted = 0
  let upserted = 0

  // 1. Import orders
  console.log('📤 Upserting orders...')
  const orderRows = mockOrders.map(order => ({
    order_number: order.orderNumber,
    customer_id: order.customerId,
    status: order.status,
    method: order.method,
    amount: order.amount,
    order_date: order.orderDate,
    subtotal: order.subtotal,
    promotions: order.promotions || 0,
    shipping: order.shipping || 0,
    tax: order.tax || 0,
    total: order.total,
    payment_info: order.paymentInfo || null,
    shipping_address: order.shippingAddress || null,
    shipping_method: order.shippingMethod || null,
    delivery_date: order.deliveryDate || null,
    tracking_number: order.trackingNumber || null,
    carrier: order.carrier || null,
    carrier_tracking_url: order.carrierTrackingUrl || null,
    is_bopis: order.isBOPIS || false,
    pickup_location: order.pickupLocation || null,
    pickup_address: order.pickupAddress || null,
    pickup_date: order.pickupDate || null,
    pickup_ready_date: order.pickupReadyDate || null,
    can_return: order.canReturn || false,
    can_cancel: order.canCancel || false,
    return_deadline: order.returnDeadline || null,
    customer_name: order.customerName || null,
    customer_email: order.customerEmail || null,
  }))

  attempted += orderRows.length
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .upsert(orderRows, {
      onConflict: 'order_number',
      ignoreDuplicates: false,
    })
    .select('order_number')

  if (ordersError) {
    console.error('❌ Error upserting orders:', ordersError.message)
    failures.push({ table: 'orders', id: 'bulk', error: ordersError.message })
  } else {
    upserted += ordersData?.length || 0
    console.log(`✅ Upserted ${ordersData?.length || 0} order(s)`)
  }

  // 2. Import shipping_groups
  console.log('\n📤 Upserting shipping groups...')
  const shippingGroupRows: Array<any> = []

  for (const order of mockOrders) {
    if (order.shippingGroups && order.shippingGroups.length > 0) {
      for (const group of order.shippingGroups) {
        shippingGroupRows.push({
          order_number: order.orderNumber,
          group_id: group.groupId,
          store: group.store || null,
          status: group.status,
          tracking_number: group.trackingNumber || null,
          carrier: group.carrier || null,
          carrier_tracking_url: group.carrierTrackingUrl || null,
          delivery_date: group.deliveryDate || null,
          shipping_method: group.shippingMethod || null,
          shipping_address: group.shippingAddress || null,
          pickup_location: group.pickupLocation || null,
          pickup_address: group.pickupAddress || null,
          pickup_date: group.pickupDate || null,
          pickup_ready_date: group.pickupReadyDate || null,
          is_bopis: group.isBOPIS || false,
        })
      }
    }
  }

  // Delete existing shipping groups for these orders first
  if (shippingGroupRows.length > 0) {
    const orderNumbers = Array.from(new Set(shippingGroupRows.map(g => g.order_number)))
    await supabase
      .from('shipping_groups')
      .delete()
      .in('order_number', orderNumbers)
  }

  attempted += shippingGroupRows.length
  let groupsUpserted = 0

  if (shippingGroupRows.length > 0) {
    const chunkSize = 100
    for (let i = 0; i < shippingGroupRows.length; i += chunkSize) {
      const chunk = shippingGroupRows.slice(i, i + chunkSize)
      const { data, error } = await supabase
        .from('shipping_groups')
        .insert(chunk)
        .select('id')

      if (error) {
        console.error(`❌ Error inserting shipping groups chunk ${Math.floor(i / chunkSize) + 1}:`, error.message)
        failures.push({ table: 'shipping_groups', id: `chunk-${Math.floor(i / chunkSize) + 1}`, error: error.message })
      } else {
        groupsUpserted += data?.length || 0
      }
    }
  }

  upserted += groupsUpserted
  console.log(`✅ Upserted ${groupsUpserted} shipping group(s)`)

  // 3. Import order_items
  console.log('\n📤 Upserting order items...')
  const orderItemRows: Array<any> = []

  for (const order of mockOrders) {
    for (const item of order.items) {
      orderItemRows.push({
        order_number: order.orderNumber,
        product_id: item.productId,
        product_name: item.name,
        product_image: item.image,
        quantity: item.quantity,
        color: item.color || null,
        size: item.size || null,
        price: item.price,
        original_price: item.originalPrice || null,
        store: item.store || null,
        shipping_group: item.shippingGroup || null,
      })
    }
  }

  // Delete existing order items for these orders first
  if (orderItemRows.length > 0) {
    const orderNumbers = Array.from(new Set(orderItemRows.map(item => item.order_number)))
    await supabase
      .from('order_items')
      .delete()
      .in('order_number', orderNumbers)
  }

  attempted += orderItemRows.length
  let itemsUpserted = 0

  if (orderItemRows.length > 0) {
    const chunkSize = 100
    for (let i = 0; i < orderItemRows.length; i += chunkSize) {
      const chunk = orderItemRows.slice(i, i + chunkSize)
      const { data, error } = await supabase
        .from('order_items')
        .insert(chunk)
        .select('id')

      if (error) {
        console.error(`❌ Error inserting order items chunk ${Math.floor(i / chunkSize) + 1}:`, error.message)
        failures.push({ table: 'order_items', id: `chunk-${Math.floor(i / chunkSize) + 1}`, error: error.message })
      } else {
        itemsUpserted += data?.length || 0
      }
    }
  }

  upserted += itemsUpserted
  console.log(`✅ Upserted ${itemsUpserted} order item(s)`)

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 IMPORT SUMMARY')
  console.log('='.repeat(60))
  console.log(`Attempted:             ${attempted}`)
  console.log(`Upserted:              ${upserted}`)
  console.log(`Failed:                ${failures.length}`)
  
  if (failures.length > 0) {
    console.log('\n❌ Failures:')
    failures.forEach(f => {
      console.log(`   - ${f.table} (${f.id}): ${f.error}`)
    })
  } else {
    console.log('\n✅ All orders imported successfully!')
  }
  console.log('='.repeat(60))
}

importOrders()
  .then(() => {
    console.log('\n✨ Import complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
