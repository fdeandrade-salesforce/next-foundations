'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login, User } from '../lib/auth'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Sign in:', { email, password, rememberMe })
    
    // Mock login - in production, this would call an API
    // For demo purposes, we'll create a mock user based on email
    const emailParts = email.split('@')
    const firstName = emailParts[0].split('.')[0] || emailParts[0]
    const lastName = emailParts[0].split('.')[1] || 'User'
    
    const mockUser: User = {
      id: `user_${Date.now()}`,
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1),
      email: email,
      loyaltyStatus: 'Gold',
      loyaltyPoints: 2450,
      emailVerified: false,
      phoneVerified: false,
    }
    
    // Save user to localStorage
    login(mockUser, rememberMe)
    
    onClose()
    // Stay on the same page after sign in
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Register:', { firstName, lastName, email, password })
    
    // Mock registration - in production, this would call an API
    const mockUser: User = {
      id: `user_${Date.now()}`,
      firstName: firstName,
      lastName: lastName,
      email: email,
      loyaltyStatus: 'Bronze',
      loyaltyPoints: 0,
      emailVerified: false,
      phoneVerified: false,
    }
    
    // Save user to localStorage
    login(mockUser, false)
    
    onClose()
    // Stay on the same page after registration
  }

  const handleSocialLogin = (provider: string) => {
    console.log('Social login:', provider)
    // TODO: Implement social login
  }

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
          className="relative bg-card rounded-modal shadow-modal max-w-md w-full max-h-[90vh] overflow-hidden"
          style={{ animation: 'scale-in 0.2s ease-out forwards' }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 modal-header__close z-10"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="pt-8 pb-4 px-6 text-center">
            {/* Logo */}
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/images/logo.svg" 
                alt="Salesforce Foundations" 
                className="h-12 w-auto"
              />
            </div>
            <h2 className="text-2xl font-semibold text-brand-black">
              {activeTab === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-brand-gray-600 mt-1">
              {activeTab === 'signin' 
                ? 'Sign in to access your account' 
                : 'Join Salesforce Foundations for exclusive benefits'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-brand-gray-200 mx-6">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'signin'
                  ? 'text-brand-blue-500 border-brand-blue-500'
                  : 'text-brand-gray-500 border-transparent hover:text-brand-black'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'register'
                  ? 'text-brand-blue-500 border-brand-blue-500'
                  : 'text-brand-gray-500 border-transparent hover:text-brand-black'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeTab === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="signin-email" className="block text-sm font-medium text-brand-black mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="signin-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-brand-gray-300 rounded-lg text-brand-black placeholder-brand-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent transition-shadow"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="signin-password" className="block text-sm font-medium text-brand-black mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="signin-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-brand-gray-300 rounded-lg text-brand-black placeholder-brand-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent transition-shadow"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-brand-gray-400 hover:text-brand-black transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-brand-gray-300 text-brand-blue-500 focus:ring-brand-blue-500"
                    />
                    <span className="text-sm text-brand-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-brand-blue-500 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-brand-blue-500 text-white font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                >
                  Sign In
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-brand-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-brand-gray-500">Or continue with</span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-brand-gray-300 rounded-lg hover:bg-brand-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium text-brand-black">Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('apple')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-brand-gray-300 rounded-lg hover:bg-brand-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <span className="text-sm font-medium text-brand-black">Apple</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-brand-black mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 border border-brand-gray-300 rounded-lg text-brand-black placeholder-brand-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent transition-shadow"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-brand-black mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 border border-brand-gray-300 rounded-lg text-brand-black placeholder-brand-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent transition-shadow"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium text-brand-black mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="register-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-brand-gray-300 rounded-lg text-brand-black placeholder-brand-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent transition-shadow"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="register-password" className="block text-sm font-medium text-brand-black mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="register-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-brand-gray-300 rounded-lg text-brand-black placeholder-brand-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent transition-shadow"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-brand-gray-400 hover:text-brand-black transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-brand-gray-500">
                    Must be at least 8 characters with one uppercase and one number
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-black mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-brand-gray-300 rounded-lg text-brand-black placeholder-brand-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent transition-shadow"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    required
                    className="mt-1 w-4 h-4 rounded border-brand-gray-300 text-brand-blue-500 focus:ring-brand-blue-500"
                  />
                  <label htmlFor="terms" className="text-sm text-brand-gray-600">
                    I agree to the{' '}
                    <a href="/terms" className="text-brand-blue-500 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-brand-blue-500 hover:underline">Privacy Policy</a>
                  </label>
                </div>

                {/* Marketing Consent */}
                <div className="bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={marketingConsent}
                      onChange={(e) => setMarketingConsent(e.target.checked)}
                      className="w-5 h-5 mt-0.5 border-brand-gray-300 rounded text-brand-blue-500 focus:ring-brand-blue-500 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-brand-black">
                        I wish to receive product updates, news and promotions from Market Street.
                      </p>
                      <p className="text-xs text-brand-gray-500 mt-1">
                        By clicking below and placing your order, you agree (i) to make your purchase from Salesforce as merchant of record for this transaction, subject to Salesforce&apos;s{' '}
                        <a href="/terms" className="text-brand-blue-500 hover:underline">Terms & Conditions</a>; (ii) that your information will be handled by Salesforce in accordance with the{' '}
                        <a href="/privacy" className="text-brand-blue-500 hover:underline">Salesforce Privacy Policy</a>.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-brand-blue-500 text-white font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                >
                  Create Account
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-brand-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-brand-gray-500">Or sign up with</span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-brand-gray-300 rounded-lg hover:bg-brand-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium text-brand-black">Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('apple')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-brand-gray-300 rounded-lg hover:bg-brand-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <span className="text-sm font-medium text-brand-black">Apple</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

