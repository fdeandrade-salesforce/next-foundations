'use client'

import React, { useState } from 'react'
import { Product } from './ProductListingPage'
import LazyImage from './LazyImage'

interface NotifyMeModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  onNotify: (email: string) => void
}

export default function NotifyMeModal({
  product,
  isOpen,
  onClose,
  onNotify,
}: NotifyMeModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    onNotify(email)
    setIsSubmitting(false)
    setEmail('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 backdrop-default transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-card rounded-modal shadow-modal max-w-md w-full max-h-[90vh] overflow-hidden"
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
          <div className="pt-8 pb-6 px-6">
            <h2 className="text-2xl font-semibold text-brand-black mb-6">Notify Me When Available</h2>

            {/* Product Information */}
            <div className="flex gap-4 mb-6">
              <div className="flex-shrink-0 w-20 h-20 bg-brand-gray-100 rounded-lg overflow-hidden">
                <LazyImage
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full"
                  objectFit="cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-brand-black mb-1 line-clamp-2">
                  {product.name}
                </h3>
                {product.brand && (
                  <p className="text-xs text-brand-gray-600 uppercase tracking-wide mb-2">
                    {product.brand}
                  </p>
                )}
                <p className="text-sm text-error font-medium">Currently Out of Stock</p>
              </div>
            </div>

            {/* Message */}
            <p className="text-sm text-brand-gray-600 mb-6">
              We&apos;ll send you an email as soon as this product becomes available again.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-brand-black mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full px-4 py-2.5 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="w-full bg-brand-blue-500 text-white py-3 px-4 text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Notify Me'}
              </button>
            </form>

            {/* Privacy Statement */}
            <p className="text-xs text-brand-gray-500 mt-4 text-center">
              We respect your privacy. Your email will only be used for stock notifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
