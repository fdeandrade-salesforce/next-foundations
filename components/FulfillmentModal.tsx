'use client'

import React from 'react'
import ModalHeader from './ModalHeader'

interface FulfillmentModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FulfillmentModal({ isOpen, onClose }: FulfillmentModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        data-modal-overlay
        className="fixed inset-0 backdrop-default transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div data-modal-center className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-card rounded-modal shadow-modal max-w-2xl w-full max-h-[90vh] overflow-hidden"
          style={{ animation: 'scale-in 0.2s ease-out forwards' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <ModalHeader title="Fulfillment & Shipping" onClose={onClose} closeAriaLabel="Close" />

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="p-6 space-y-6">
              {/* Estimated Delivery */}
              <div>
                <h3 className="text-lg font-medium text-brand-black mb-3">Estimated Delivery</h3>
                <div className="space-y-2 text-sm text-brand-gray-700">
                  <p>
                    <span className="font-medium">Standard Shipping:</span> 5-7 business days
                  </p>
                  <p>
                    <span className="font-medium">Express Shipping:</span> 2-3 business days
                  </p>
                  <p>
                    <span className="font-medium">Overnight Shipping:</span> Next business day
                  </p>
                  <p className="text-xs text-brand-gray-500 mt-2">
                    Delivery estimates are calculated from the date your order ships. Processing time is typically 1-2 business days.
                  </p>
                </div>
              </div>

              {/* Shipping Options */}
              <div>
                <h3 className="text-lg font-medium text-brand-black mb-3">Shipping Options & Rates</h3>
                <div className="space-y-3">
                  <div className="border border-brand-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-brand-black">Standard Shipping</p>
                        <p className="text-sm text-brand-gray-600">5-7 business days</p>
                      </div>
                      <span className="text-lg font-semibold text-brand-black">$5.99</span>
                    </div>
                    <p className="text-xs text-brand-gray-500">
                      Free on orders over $50
                    </p>
                  </div>
                  
                  <div className="border border-brand-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-brand-black">Express Shipping</p>
                        <p className="text-sm text-brand-gray-600">2-3 business days</p>
                      </div>
                      <span className="text-lg font-semibold text-brand-black">$12.99</span>
                    </div>
                    <p className="text-xs text-brand-gray-500">
                      Free on orders over $100
                    </p>
                  </div>
                  
                  <div className="border border-brand-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-brand-black">Overnight Shipping</p>
                        <p className="text-sm text-brand-gray-600">Next business day</p>
                      </div>
                      <span className="text-lg font-semibold text-brand-black">$24.99</span>
                    </div>
                    <p className="text-xs text-brand-gray-500">
                      Orders placed before 2 PM EST
                    </p>
                  </div>
                </div>
              </div>

              {/* International Shipping */}
              <div>
                <h3 className="text-lg font-medium text-brand-black mb-3">International Shipping</h3>
                <div className="space-y-2 text-sm text-brand-gray-700">
                  <p>
                    We ship to over 50 countries worldwide. International shipping rates and delivery times vary by destination.
                  </p>
                  <p>
                    <span className="font-medium">Customs & Duties:</span> International orders may be subject to customs fees and import duties, which are the responsibility of the customer.
                  </p>
                  <p className="text-xs text-brand-gray-500 mt-2">
                    For specific international shipping rates, please proceed to checkout and enter your shipping address.
                  </p>
                </div>
              </div>

              {/* Order Tracking */}
              <div>
                <h3 className="text-lg font-medium text-brand-black mb-3">Order Tracking</h3>
                <div className="space-y-2 text-sm text-brand-gray-700">
                  <p>
                    Once your order ships, you&apos;ll receive a confirmation email with tracking information. You can track your order status in real-time through our website or mobile app.
                  </p>
                  <p>
                    <span className="font-medium">Need Help?</span> Contact our customer service team if you have questions about your shipment or delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-brand-gray-200 px-6 py-4 bg-brand-gray-50">
            <button
              onClick={onClose}
              className="w-full bg-brand-blue-500 text-white px-6 py-3 text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
