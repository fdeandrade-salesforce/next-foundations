'use client'

import React, { useState, useRef, useEffect } from 'react'

interface AccountDropdownProps {
  onOpenLogin: () => void
}

export default function AccountDropdown({ onOpenLogin }: AccountDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 150)
  }

  const handleClick = () => {
    setIsOpen(false)
    onOpenLogin()
  }

  const menuItems = [
    {
      section: 'Your Lists',
      items: [
        { label: 'Wishlist', href: '/account/wishlist', icon: 'heart' },
        { label: 'Saved Items', href: '/account/wishlist', icon: 'bookmark' },
      ],
    },
    {
      section: 'Your Account',
      items: [
        { label: 'Overview', href: '/account/overview', icon: 'overview' },
        { label: 'Orders', href: '/account/order-history', icon: 'package' },
        { label: 'Account Details', href: '/account/account-details', icon: 'settings' },
        { label: 'Address Book', href: '/account/addresses', icon: 'map-pin' },
        { label: 'Payment Methods', href: '/account/payment', icon: 'payment' },
      ],
    },
  ]

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'heart':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )
      case 'bookmark':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        )
      case 'package':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      case 'settings':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      case 'map-pin':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      case 'overview':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )
      case 'payment':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Account Button */}
      <button
        onClick={handleClick}
        className="p-2 text-brand-black hover:text-brand-gray-600 transition-colors"
        aria-label="Account"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-brand-gray-200 overflow-hidden z-50"
          style={{
            animation: 'menuSlideDown 0.15s ease-out forwards'
          }}
        >
          {/* Header - Sign In CTA */}
          <div className="p-4 bg-brand-gray-50 border-b border-brand-gray-200">
            <p className="text-sm text-brand-gray-600 mb-3">
              Sign in for the best experience
            </p>
            <button
              onClick={handleClick}
              className="w-full py-2.5 px-4 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
            >
              Sign In
            </button>
            <p className="text-xs text-brand-gray-500 mt-2 text-center">
              New customer?{' '}
              <button 
                onClick={handleClick}
                className="text-brand-blue-500 hover:underline"
              >
                Create account
              </button>
            </p>
          </div>

          {/* Menu Sections */}
          <div className="py-2">
            {menuItems.map((section, idx) => (
              <div key={section.section}>
                <p className="px-4 py-2 text-xs font-semibold text-brand-gray-400 uppercase tracking-wider">
                  {section.section}
                </p>
                {section.items.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-black hover:bg-brand-gray-50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-brand-gray-500">{getIcon(item.icon)}</span>
                    {item.label}
                  </a>
                ))}
                {idx < menuItems.length - 1 && (
                  <div className="my-2 border-t border-brand-gray-100" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

