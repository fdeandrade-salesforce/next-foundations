'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, User } from '../lib/auth'

interface AccountDropdownProps {
  onOpenLogin: () => void
  onLogout: () => void
}

export default function AccountDropdown({ onOpenLogin, onLogout }: AccountDropdownProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load user state on mount and listen for changes
  useEffect(() => {
    const loadUser = () => {
      setUser(getCurrentUser())
    }
    
    loadUser()

    // Listen for login/logout events
    const handleLogin = () => {
      loadUser()
    }
    
    const handleLogout = () => {
      loadUser()
    }

    window.addEventListener('userLoggedIn', handleLogin)
    window.addEventListener('userLoggedOut', handleLogout)

    return () => {
      window.removeEventListener('userLoggedIn', handleLogin)
      window.removeEventListener('userLoggedOut', handleLogout)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleMouseEnter = () => {
    // Only enable hover on desktop (md and up)
    if (window.innerWidth >= 768) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setIsOpen(true)
    }
  }

  const handleMouseLeave = () => {
    // Only enable hover on desktop (md and up)
    if (window.innerWidth >= 768) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false)
      }, 150)
    }
  }

  const handleSignInClick = () => {
    setIsOpen(false)
    onOpenLogin()
  }

  const handleLogoutClick = () => {
    setIsOpen(false)
    onLogout()
  }

  const handleAccountClick = () => {
    if (user) {
      // If user is logged in, navigate to account page
      setIsOpen(false)
      router.push('/account')
    } else {
      // If user is not logged in, open login modal
      setIsOpen(false)
      onOpenLogin()
    }
  }

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getLoyaltyStatusColor = (status?: string) => {
    switch (status) {
      case 'Platinum':
        return 'bg-purple-100 text-purple-700'
      case 'Gold':
        return 'bg-yellow-100 text-yellow-700'
      case 'Silver':
        return 'bg-gray-100 text-gray-700'
      case 'Bronze':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const loggedInMenuItems = [
    {
      section: 'YOUR LISTS',
      items: [
        { label: 'Wishlist', href: '/account/wishlist', icon: 'heart' },
        { label: 'Saved Items', href: '/account/wishlist', icon: 'bookmark' },
      ],
    },
    {
      section: 'YOUR ACCOUNT',
      items: [
        { label: 'Overview', href: '/account/overview', icon: 'overview' },
        { label: 'Order History', href: '/account/order-history', icon: 'package' },
        { label: 'Account Details', href: '/account/account-details', icon: 'settings' },
        { label: 'Address Book', href: '/account/addresses', icon: 'map-pin' },
        { label: 'Payment Methods', href: '/account/payment', icon: 'payment' },
      ],
    },
  ]

  const guestMenuItems: Array<{ section: string; items: Array<{ label: string; href: string; icon: string }> }> = []

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
      case 'help':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'logout':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
        onClick={handleAccountClick}
        onMouseEnter={user ? handleMouseEnter : undefined}
        className="p-2 text-brand-black hover:text-brand-gray-600 md:hover:text-brand-gray-600 transition-colors"
        aria-label="Account"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>

      {/* Dropdown Menu - Only show when user is logged in */}
      {isOpen && user && (
        <div 
          className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-brand-gray-200 overflow-hidden z-50"
          style={{
            animation: 'menuSlideDown 0.15s ease-out forwards'
          }}
        >
          {user ? (
            // Logged In State
            <>
              {/* User Info Header */}
              <div className="p-4 bg-brand-gray-50 border-b border-brand-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-brand-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-brand-black truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                      {user.loyaltyStatus && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${getLoyaltyStatusColor(user.loyaltyStatus)}`}>
                          {user.loyaltyStatus} Member
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-brand-gray-600 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                {(!user.emailVerified || !user.phoneVerified) && (
                  <div className="flex gap-3 text-xs">
                    {!user.emailVerified && (
                      <button className="flex items-center gap-1 text-brand-blue-500 hover:underline">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Verify Email
                      </button>
                    )}
                    {!user.phoneVerified && (
                      <button className="flex items-center gap-1 text-brand-blue-500 hover:underline">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Verify Phone
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Menu Sections */}
              <div className="py-2">
                {loggedInMenuItems.map((section, idx) => (
                  <div key={section.section}>
                    <p className="px-4 py-2 text-xs font-semibold text-brand-gray-400 uppercase tracking-wider">
                      {section.section}
                    </p>
                    {section.items.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-black hover:bg-brand-gray-50 transition-colors"
                        onClick={(e) => {
                          setIsOpen(false)
                          // Allow navigation for logged-in users
                        }}
                      >
                        <span className="text-brand-gray-500">{getIcon(item.icon)}</span>
                        {item.label}
                      </a>
                    ))}
                    {idx < loggedInMenuItems.length - 1 && (
                      <div className="my-2 border-t border-brand-gray-100" />
                    )}
                  </div>
                ))}
                
                {/* Help Center */}
                <div className="my-2 border-t border-brand-gray-100" />
                <a
                  href="/customer-service"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-black hover:bg-brand-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-brand-gray-500">{getIcon('help')}</span>
                  Help Center
                </a>
              </div>

              {/* Log Out Button */}
              <div className="p-4 border-t border-brand-gray-200">
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-brand-blue-500 text-brand-blue-500 text-sm font-medium rounded-lg hover:bg-brand-blue-50 transition-colors"
                >
                  <span className="text-brand-blue-500">{getIcon('logout')}</span>
                  Log Out
                </button>
              </div>
            </>
          ) : (
            // Guest State
            <>
              {/* Sign In CTA Header */}
              <div className="p-4 bg-brand-gray-50 border-b border-brand-gray-200">
                <p className="text-sm text-brand-gray-600 mb-3">
                  Sign in for the best experience
                </p>
                <button
                  onClick={handleSignInClick}
                  className="w-full py-2.5 px-4 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                >
                  Sign In
                </button>
                <p className="text-xs text-brand-gray-500 mt-2 text-center">
                  New customer?{' '}
                  <button 
                    onClick={handleSignInClick}
                    className="text-brand-blue-500 hover:underline"
                  >
                    Create account
                  </button>
                </p>
              </div>

              {/* Help Center */}
              <div className="py-2">
                <a
                  href="/customer-service"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-black hover:bg-brand-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-brand-gray-500">{getIcon('help')}</span>
                  Help Center
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

