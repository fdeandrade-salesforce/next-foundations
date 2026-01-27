'use client'

import MyAccountPage from '../../../components/MyAccountPage'
import ErrorBoundary from '../../../components/ErrorBoundary'

// Order detail pages now render within the MyAccountPage layout
// The MyAccountPage component handles order detail display internally
// based on the URL path (/order/[orderNumber])
export default function OrderPage() {
  return (
    <ErrorBoundary>
      <MyAccountPage />
    </ErrorBoundary>
  )
}
