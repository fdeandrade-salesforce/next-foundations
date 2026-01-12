'use client'

import React, { useState } from 'react'

interface AnnouncementBarProps {
  message?: string
  dismissible?: boolean
}

export default function AnnouncementBar({ 
  message = 'FREE WORLDWIDE SHIPPING from $90',
  dismissible = true 
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="announcement-bar relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <p className="text-center flex-1">{message}</p>
        {dismissible && (
          <button
            onClick={() => setIsVisible(false)}
            className="ml-4 text-brand-blue-900 hover:text-brand-blue-700 transition-colors"
            aria-label="Close announcement"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

