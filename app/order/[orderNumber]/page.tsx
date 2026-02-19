'use client'

import { useSearchParams } from 'next/navigation'
import MyAccountPage from '../../../components/MyAccountPage'
import OrderConfirmationPage from '../../../components/OrderConfirmationPage'
import ErrorBoundary from '../../../components/ErrorBoundary'

// Order pages handle two scenarios:
// 1. Order confirmation after successful checkout (with ?success=true query param)
// 2. Order detail view from order history
export default function OrderPage({ params }: { params: { orderNumber: string } }) {
  const searchParams = useSearchParams()
  const isSuccessfulCheckout = searchParams?.get('success') === 'true'
  
  // If this is a successful checkout, show the confirmation page
  if (isSuccessfulCheckout) {
    return (
      <ErrorBoundary>
        <OrderConfirmationPage orderNumber={params.orderNumber} />
      </ErrorBoundary>
    )
  }
  
  // Otherwise, show the order detail within MyAccountPage
  return (
    <ErrorBoundary>
      <MyAccountPage />
    </ErrorBoundary>
  )
}
