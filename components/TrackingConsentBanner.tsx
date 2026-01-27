'use client'

import React, { useState, useEffect } from 'react'

export default function TrackingConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Guard for SSR - localStorage not available during server-side rendering
    if (typeof window === 'undefined') return

    // Check if user has already responded to tracking consent
    const hasResponded = localStorage.getItem('trackingConsentResponded')
    
    if (!hasResponded) {
      // Small delay to ensure smooth animation
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('trackingConsentResponded', 'accepted')
      localStorage.setItem('trackingConsent', 'true')
    }
    setIsVisible(false)
  }

  const handleDecline = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('trackingConsentResponded', 'declined')
      localStorage.setItem('trackingConsent', 'false')
    }
    setIsVisible(false)
  }

  const handleClose = () => {
    // Close and mark as dismissed (won't show again)
    if (typeof window !== 'undefined') {
      localStorage.setItem('trackingConsentResponded', 'dismissed')
    }
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white border-t border-brand-gray-200 shadow-2xl animate-slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-0 right-0 p-2 text-brand-gray-400 hover:text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors"
              aria-label="Close tracking consent"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="pr-10">
              <h2 className="text-xl font-semibold text-brand-black mb-3">Tracking Consent</h2>
              <p className="text-sm text-brand-gray-700 mb-6 leading-relaxed">
                We use cookies and similar tracking technologies to improve your browsing experience, 
                analyze site traffic, and personalize content. By clicking &quot;Accept&quot;, you consent 
                to our use of cookies. You can decline or manage your preferences at any time.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={handleDecline}
                  className="px-6 py-2.5 bg-white border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  className="px-6 py-2.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
