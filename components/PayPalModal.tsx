'use client'

import React from 'react'

interface PayPalModalProps {
  isOpen: boolean
  onClose: () => void
  price: number
}

export default function PayPalModal({ isOpen, onClose, price }: PayPalModalProps) {
  if (!isOpen) return null

  const paymentAmount = (price / 4).toFixed(2)
  const labels = ['Today', '2 weeks', '4 weeks', '6 weeks']

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
            <div className="flex items-center gap-3 mb-3">
              {/* PayPal Logo */}
              <div>
                <svg className="h-8" viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.5 6H7.5C7.1 6 6.8 6.3 6.7 6.6L4 23.6C4 23.9 4.2 24.1 4.5 24.1H7C7.4 24.1 7.7 23.8 7.8 23.5L8.5 19.1C8.6 18.8 8.9 18.5 9.3 18.5H11.1C14.7 18.5 16.8 16.7 17.4 13.3C17.7 11.8 17.4 10.6 16.7 9.7C15.9 8.6 14.4 6 12.5 6Z" fill="#003087"/>
                  <path d="M25.9 13.2C25.6 15.3 24 18.5 20.5 18.5H18.5L17.5 24.7C17.5 24.9 17.3 25.1 17.1 25.1H14.5C14.2 25.1 14 24.9 14.1 24.6L14.3 23.5L16.8 8.5C16.9 8.2 17.2 7.9 17.6 7.9H22.2C24.8 7.9 26.3 9.6 25.9 13.2Z" fill="#0070BA"/>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-brand-black">
              Pay in 4 interest-free payments
            </h2>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <p className="text-sm text-brand-gray-700">
                  Split your purchase of <span className="font-semibold text-brand-black">${price.toFixed(2)}</span> into 4 with no impact on credit score and no late fees.
                </p>
              </div>

              {/* Payment Timeline */}
              <div>
                <h3 className="text-lg font-medium text-brand-black mb-4">Payment Schedule</h3>
                <div className="space-y-4">
                  {/* Timeline with dots and connecting lines */}
                  <div className="relative flex items-center">
                    {[0, 1, 2, 3].map((index) => (
                      <React.Fragment key={index}>
                        <div className="flex flex-col items-center flex-1">
                          <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-[#0070BA]' : 'bg-brand-gray-400'}`} />
                        </div>
                        {index < 3 && (
                          <div className="flex-1 h-0 border-t-2 border-dashed border-brand-gray-300 mx-2" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  
                  {/* Payment amounts and labels - matching exact spacing */}
                  <div className="flex items-start">
                    {[0, 1, 2, 3].map((index) => (
                      <React.Fragment key={index}>
                        <div className="flex flex-col items-center flex-1">
                          <p className="text-sm font-semibold text-brand-black">${paymentAmount}</p>
                          <p className="text-xs text-brand-gray-500 mt-1">{labels[index]}</p>
                        </div>
                        {index < 3 && (
                          <div className="flex-1 mx-2" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div>
                <h3 className="text-lg font-medium text-brand-black mb-3">How it works</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="text-brand-gray-600 font-medium flex-shrink-0">1.</span>
                    <p className="text-sm text-brand-gray-700">
                      Choose PayPal at checkout to pay later with <span className="font-semibold text-brand-black">Pay in 4</span>.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-brand-gray-600 font-medium flex-shrink-0">2.</span>
                    <p className="text-sm text-brand-gray-700">
                      Complete your purchase with a 25% down payment.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-brand-gray-600 font-medium flex-shrink-0">3.</span>
                    <p className="text-sm text-brand-gray-700">
                      Use autopay for the rest of your payments. It&apos;s easy!
                    </p>
                  </div>
                </div>
              </div>

              {/* Legal Text */}
              <div className="bg-brand-gray-50 rounded-lg p-4 space-y-3">
                <p className="text-xs text-brand-gray-600 leading-relaxed">
                  Pay in 4 is available to consumers upon approval for purchases of $30 to $1,500. Pay in 4 is currently not available to residents of MO. Offer availability depends on the merchant and also may not be available for certain recurring, subscription services. When applying, a soft credit check may be needed, but will not affect your credit score. You must be 18 years old or older to apply.
                </p>
                <div className="space-y-2">
                  <button className="text-xs text-brand-blue-500 hover:underline text-left">
                    Find more disclosures related to Pay in 4
                  </button>
                  <div>
                    <button className="text-xs text-brand-blue-500 hover:underline text-left">
                      See other ways to pay over time
                    </button>
                  </div>
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
