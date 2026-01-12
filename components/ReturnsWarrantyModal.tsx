'use client'

import React from 'react'

interface ReturnsWarrantyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ReturnsWarrantyModal({ isOpen, onClose }: ReturnsWarrantyModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          style={{ animation: 'scale-in 0.2s ease-out forwards' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-brand-gray-400 hover:text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors z-10"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="pt-8 pb-4 px-6 border-b border-brand-gray-200">
            <h2 className="text-2xl font-semibold text-brand-black">Returns & Warranty</h2>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="p-6 space-y-6">
              {/* Returns Policy */}
              <div>
                <h3 className="text-lg font-medium text-brand-black mb-3">30-Day Returns Policy</h3>
                <div className="space-y-3 text-sm text-brand-gray-700">
                  <p>
                    We want you to love your purchase. If you&apos;re not completely satisfied, you can return most items within 30 days of delivery for a full refund or exchange.
                  </p>
                  
                  <div className="bg-brand-gray-50 rounded-lg p-4 space-y-2">
                    <p className="font-medium text-brand-black">Return Conditions:</p>
                    <ul className="list-disc list-inside space-y-1 text-brand-gray-700">
                      <li>Items must be in original, unworn condition</li>
                      <li>Original tags and packaging must be included</li>
                      <li>Items must not show signs of use or damage</li>
                      <li>Proof of purchase required</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-brand-black mb-2">How to Return:</p>
                    <ol className="list-decimal list-inside space-y-1 text-brand-gray-700">
                      <li>Log into your account and go to Order History</li>
                      <li>Select the item(s) you wish to return</li>
                      <li>Print the prepaid return label</li>
                      <li>Package the item(s) securely and attach the label</li>
                      <li>Drop off at any authorized carrier location</li>
                    </ol>
                  </div>

                  <p className="text-xs text-brand-gray-500">
                    <span className="font-medium">Note:</span> Return shipping costs are the responsibility of the customer unless the item is defective or incorrect.
                  </p>
                </div>
              </div>

              {/* Warranty Information */}
              <div>
                <h3 className="text-lg font-medium text-brand-black mb-3">1-Year Warranty</h3>
                <div className="space-y-3 text-sm text-brand-gray-700">
                  <p>
                    All products come with a comprehensive 1-year manufacturer&apos;s warranty covering defects in materials and workmanship.
                  </p>
                  
                  <div className="bg-brand-gray-50 rounded-lg p-4 space-y-2">
                    <p className="font-medium text-brand-black">What&apos;s Covered:</p>
                    <ul className="list-disc list-inside space-y-1 text-brand-gray-700">
                      <li>Manufacturing defects</li>
                      <li>Material defects</li>
                      <li>Workmanship issues</li>
                      <li>Premature wear under normal use</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-brand-black mb-2">What&apos;s Not Covered:</p>
                    <ul className="list-disc list-inside space-y-1 text-brand-gray-700">
                      <li>Normal wear and tear</li>
                      <li>Damage from misuse or accidents</li>
                      <li>Damage from improper care or cleaning</li>
                      <li>Modifications or alterations</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-brand-black mb-2">Warranty Claims:</p>
                    <p className="text-brand-gray-700">
                      To file a warranty claim, contact our customer service team with your order number, photos of the defect, and a description of the issue. We&apos;ll review your claim and provide a resolution within 5-7 business days.
                    </p>
                  </div>
                </div>
              </div>

              {/* Exchanges */}
              <div>
                <h3 className="text-lg font-medium text-brand-black mb-3">Exchanges</h3>
                <div className="space-y-2 text-sm text-brand-gray-700">
                  <p>
                    Need a different size or color? We offer hassle-free exchanges within 30 days of purchase. Exchanges are subject to product availability.
                  </p>
                  <p>
                    <span className="font-medium">Exchange Process:</span> Follow the same return process and specify that you&apos;d like an exchange. We&apos;ll process your exchange once we receive your original item.
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-brand-blue-50 border border-brand-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-brand-black mb-2">Need Help?</p>
                <p className="text-sm text-brand-gray-700">
                  Our customer service team is here to assist you. Contact us at{' '}
                  <a href="mailto:support@marketstreet.com" className="text-brand-blue-600 hover:underline">
                    support@marketstreet.com
                  </a>
                  {' '}or call{' '}
                  <a href="tel:+18001234567" className="text-brand-blue-600 hover:underline">
                    1-800-123-4567
                  </a>
                  .
                </p>
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
