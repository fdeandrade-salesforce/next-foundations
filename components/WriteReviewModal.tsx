'use client'

import React, { useState, useEffect } from 'react'
import ModalHeader from './ModalHeader'
import { createPortal } from 'react-dom'
import { getCurrentUser } from '../lib/auth'

export interface ReviewFormData {
  id: string
  author: string
  rating: number
  date: string
  location?: string
  title: string
  content: string
  verified: boolean
  helpful: number
  images?: string[]
}

// Interactive Star Rating for the form
function StarRating({
  rating,
  size = 'lg',
  onRatingChange,
}: {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  onRatingChange: (rating: number) => void
}) {
  const [hoverRating, setHoverRating] = useState(0)
  const sizeClasses = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-6 h-6' }
  const displayRating = hoverRating || rating

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="hover:scale-110 transition-transform cursor-pointer"
        >
          <svg
            className={`${sizeClasses[size]} ${
              star <= displayRating ? 'text-yellow-400 fill-current' : 'text-brand-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export interface WriteReviewModalProps {
  productId: string
  productName: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: (review: ReviewFormData) => void
}

export default function WriteReviewModal({
  productId,
  productName,
  isOpen,
  onClose,
  onSuccess,
}: WriteReviewModalProps) {
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    content: '',
    name: '',
    email: '',
    location: '',
    recommend: true,
  })
  const [errors, setErrors] = useState<{ rating?: string; content?: string; name?: string; email?: string }>({})
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof getCurrentUser>>(null)

  const isLoggedIn = !!currentUser

  // Sync with logged-in user when modal opens
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const user = getCurrentUser()
      setCurrentUser(user)
      if (user) {
        setNewReview((prev) => ({
          ...prev,
          name: [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || prev.name,
          email: user.email || prev.email,
        }))
      }
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation with inline feedback (alerts can be blocked, inline errors always visible)
    const newErrors: typeof errors = {}
    if (newReview.rating === 0) newErrors.rating = 'Please select a rating'
    if (newReview.content.length < 50) newErrors.content = 'Your review must be at least 50 characters'
    // Name and email only required when not logged in
    if (!isLoggedIn) {
      if (!newReview.name?.trim()) newErrors.name = 'Please enter your name'
      if (!newReview.email?.trim()) newErrors.email = 'Please enter your email address'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      const firstErrorId = Object.keys(newErrors)[0]
      setTimeout(() => {
        document.getElementById(`review-field-${firstErrorId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
      return
    }

    const authorName = isLoggedIn && currentUser
      ? [currentUser.firstName, currentUser.lastName].filter(Boolean).join(' ').trim() || currentUser.email
      : newReview.name
    const authorEmail = isLoggedIn && currentUser ? currentUser.email : newReview.email

    const review: ReviewFormData = {
      id: `new-${Date.now()}`,
      author: authorName,
      rating: newReview.rating,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      location: newReview.location || undefined,
      title: newReview.title,
      content: newReview.content,
      verified: false,
      helpful: 0,
    }
    onSuccess?.(review)
    setNewReview({ rating: 0, title: '', content: '', name: '', email: '', location: '', recommend: true })
    onClose()
  }

  const handleClose = () => {
    setNewReview({ rating: 0, title: '', content: '', name: '', email: '', location: '', recommend: true })
    setErrors({})
    onClose()
  }

  const clearError = (field: keyof typeof errors) => {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  // Render modal in a portal to escape parent stacking contexts (fixes submit not working when nested)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div data-modal-overlay className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} aria-hidden="true" />
      <div data-modal-center className="flex min-h-full items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-white z-10">
            <ModalHeader title="Write a Review" onClose={handleClose} closeAriaLabel="Close" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="p-6 space-y-6">
            {Object.keys(errors).length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
                <p className="text-sm font-medium text-red-800">Please fix the following:</p>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside space-y-0.5">
                  {errors.rating && <li>{errors.rating}</li>}
                  {errors.content && <li>{errors.content}</li>}
                  {errors.name && <li>{errors.name}</li>}
                  {errors.email && <li>{errors.email}</li>}
                </ul>
              </div>
            )}
            <div id="review-field-rating">
              <label className="block text-sm font-medium text-brand-black mb-2">
                Overall Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <StarRating
                  rating={newReview.rating}
                  size="lg"
                  onRatingChange={(rating) => {
                    setNewReview((prev) => ({ ...prev, rating }))
                    clearError('rating')
                  }}
                />
                <span className="text-sm text-brand-gray-600">
                  {newReview.rating > 0 ? `${newReview.rating} out of 5 stars` : 'Select a rating'}
                </span>
              </div>
              {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-black mb-2">Review Title</label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Summarize your experience"
                className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm"
              />
            </div>

            <div id="review-field-content">
              <label className="block text-sm font-medium text-brand-black mb-2">
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                value={newReview.content}
                onChange={(e) => {
                  const value = e.target.value
                  if (value.length <= 2000) {
                    setNewReview((prev) => ({ ...prev, content: value }))
                    clearError('content')
                  }
                }}
                placeholder="What did you like or dislike about this product?"
                rows={4}
                maxLength={2000}
                aria-invalid={!!errors.content}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm resize-none ${errors.content ? 'border-red-500' : 'border-brand-gray-300'}`}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-brand-gray-500">Minimum 50 characters</p>
                <p className={`text-xs ${newReview.content.length >= 2000 ? 'text-red-500' : 'text-brand-gray-500'}`}>
                  {newReview.content.length}/2000
                </p>
              </div>
              {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-black mb-2">
                Would you recommend this product?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="recommend"
                    checked={newReview.recommend === true}
                    onChange={() => setNewReview((prev) => ({ ...prev, recommend: true }))}
                    className="w-4 h-4 text-brand-blue-500"
                  />
                  <span className="text-sm text-brand-black">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="recommend"
                    checked={newReview.recommend === false}
                    onChange={() => setNewReview((prev) => ({ ...prev, recommend: false }))}
                    className="w-4 h-4 text-brand-blue-500"
                  />
                  <span className="text-sm text-brand-black">No</span>
                </label>
              </div>
            </div>

            <div id="review-field-name">
              <label className="block text-sm font-medium text-brand-black mb-2">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newReview.name}
                onChange={(e) => {
                  setNewReview((prev) => ({ ...prev, name: e.target.value }))
                  clearError('name')
                }}
                placeholder="Enter your name"
                disabled={isLoggedIn}
                aria-invalid={!!errors.name}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm disabled:bg-brand-gray-100 disabled:text-brand-gray-600 disabled:cursor-not-allowed ${errors.name ? 'border-red-500' : 'border-brand-gray-300'}`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div id="review-field-email">
              <label className="block text-sm font-medium text-brand-black mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={newReview.email}
                onChange={(e) => {
                  setNewReview((prev) => ({ ...prev, email: e.target.value }))
                  clearError('email')
                }}
                placeholder="your@email.com"
                disabled={isLoggedIn}
                aria-invalid={!!errors.email}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm disabled:bg-brand-gray-100 disabled:text-brand-gray-600 disabled:cursor-not-allowed ${errors.email ? 'border-red-500' : 'border-brand-gray-300'}`}
              />
              <p className="text-xs text-brand-gray-500 mt-1">Your email will not be published</p>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-black mb-2">Location</label>
              <input
                type="text"
                value={newReview.location}
                onChange={(e) => setNewReview((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="City, State or Country (e.g., Los Angeles, CA)"
                className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm"
              />
              <p className="text-xs text-brand-gray-500 mt-1">Optional - helps other customers</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-black mb-2">Add Photos (Optional)</label>
              <div className="border-2 border-dashed border-brand-gray-300 rounded-lg p-6 text-center hover:border-brand-blue-500 transition-colors cursor-pointer">
                <svg
                  className="w-8 h-8 text-brand-gray-400 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm text-brand-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-brand-gray-500 mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>

            <p className="text-xs text-brand-gray-500">
              By submitting this review, you agree to our Terms of Service and Privacy Policy.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 border border-brand-gray-300 text-brand-black font-medium rounded-lg hover:bg-brand-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-brand-blue-500 text-white font-medium rounded-lg hover:bg-brand-blue-600 transition-colors"
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  return mounted && typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null
}
