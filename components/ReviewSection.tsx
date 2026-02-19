'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import WriteReviewModal from './WriteReviewModal'
import ReportReviewModal from './ReportReviewModal'

interface Review {
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

// AI Summary Generator - Creates contextual summary based on review data
function generateAISummary(reviews: Review[], productName: string, averageRating: number): string {
  if (reviews.length === 0) {
    return `Be the first to share your experience with ${productName}. Your feedback helps others make informed decisions.`
  }

  const positiveReviews = reviews.filter(r => r.rating >= 4)
  const criticalReviews = reviews.filter(r => r.rating <= 2)
  const positivePercentage = Math.round((positiveReviews.length / reviews.length) * 100)
  
  // Extract common themes from review titles and content
  const allText = reviews.map(r => `${r.title} ${r.content}`).join(' ').toLowerCase()
  
  const themes = {
    quality: /quality|craftsmanship|well.made|premium|excellent|impeccable|flawless/i.test(allText),
    design: /design|beautiful|stunning|gorgeous|elegant|minimalist|aesthetic/i.test(allText),
    value: /worth|value|investment|price|worth it/i.test(allText),
    size: /size|smaller|larger|perfect size|proportions/i.test(allText),
    versatile: /versatile|works with|fits|complements|any space/i.test(allText),
  }
  
  // Build the summary based on rating and themes
  let summary = ''
  
  if (averageRating >= 4.5) {
    summary = `Customers love ${productName}! `
  } else if (averageRating >= 4) {
    summary = `${productName} receives excellent feedback from buyers. `
  } else if (averageRating >= 3) {
    summary = `${productName} has mixed reviews. `
  } else {
    summary = `${productName} has room for improvement based on customer feedback. `
  }
  
  // Add theme-based insights
  const themeInsights: string[] = []
  if (themes.quality) themeInsights.push('exceptional craftsmanship')
  if (themes.design) themeInsights.push('beautiful design')
  if (themes.versatile) themeInsights.push('versatility')
  if (themes.value) themeInsights.push('great value')
  
  if (themeInsights.length > 0) {
    summary += `Reviewers highlight ${themeInsights.slice(0, 2).join(' and ')}. `
  }
  
  // Add percentage insight
  if (positivePercentage >= 80) {
    summary += `${positivePercentage}% of customers recommend this product.`
  } else if (positivePercentage >= 60) {
    summary += `Most customers are satisfied with their purchase.`
  } else {
    summary += `Consider reading reviews carefully before purchasing.`
  }
  
  return summary
}

interface ReviewSectionProps {
  productId: string
  productName: string
  reviews: Review[]
  averageRating: number
  totalReviews: number
  /** When true, opens the Write Review modal on mount (e.g. from ?review=true on PDP) */
  openReviewOnMount?: boolean
  /** Increment to trigger expand (e.g. when stars anchor is clicked on PDP) */
  expandFromAnchor?: number
}

// Expandable Review Content Component
function ExpandableReviewContent({ content }: { content: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [needsExpansion, setNeedsExpansion] = useState(false)
  const contentRef = useRef<HTMLParagraphElement>(null)
  
  useEffect(() => {
    if (contentRef.current) {
      // Check if content exceeds 4 lines (approximately 4 * lineHeight)
      const lineHeight = parseFloat(getComputedStyle(contentRef.current).lineHeight) || 20
      const maxHeight = lineHeight * 4
      const actualHeight = contentRef.current.scrollHeight
      setNeedsExpansion(actualHeight > maxHeight + 2) // Add small buffer for precision
    }
  }, [content])
  
  return (
    <div>
      <p 
        ref={contentRef}
        className={`text-xs sm:text-sm text-brand-gray-600 leading-relaxed ${
          !isExpanded && needsExpansion ? 'line-clamp-4' : ''
        }`}
      >
        {content}
      </p>
      {needsExpansion && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs sm:text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline mt-1.5 font-medium transition-colors"
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      )}
    </div>
  )
}

// Star Rating Component
function StarRating({ 
  rating, 
  size = 'md',
  interactive = false,
  onRatingChange,
}: { 
  rating: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRatingChange?: (rating: number) => void
}) {
  const [hoverRating, setHoverRating] = useState(0)
  
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  }

  const displayRating = hoverRating || rating

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          disabled={!interactive}
          onClick={() => interactive && onRatingChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
        >
          <svg
            className={`${sizeClasses[size]} ${
              star <= displayRating
                ? 'text-yellow-400 fill-current'
                : 'text-brand-gray-300'
            } ${interactive ? 'hover:scale-110 transition-transform' : ''}`}
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

// Rating Bar Component
function RatingBar({ rating, count, total }: { rating: number; count: number; total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-3 text-brand-gray-600">{rating}</span>
      <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <div className="flex-1 h-2 bg-brand-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-yellow-400 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-right text-brand-gray-500">{count}</span>
    </div>
  )
}

export default function ReviewSection({
  productId,
  productName,
  reviews: initialReviews,
  averageRating,
  totalReviews,
  openReviewOnMount = false,
  expandFromAnchor,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('newest')
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [filterWithPhotos, setFilterWithPhotos] = useState(false)
  const [showWriteReview, setShowWriteReview] = useState(openReviewOnMount)
  const [reportModalReview, setReportModalReview] = useState<Review | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5
  const [searchQuery, setSearchQuery] = useState('')
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  
  // Sync reviews when prop changes (reviews are loaded async in parent)
  React.useEffect(() => {
    setReviews(initialReviews)
  }, [initialReviews])

  // Expand when triggered from PDP stars/anchor click
  React.useEffect(() => {
    if (expandFromAnchor != null && expandFromAnchor > 0) {
      setIsExpanded(true)
    }
  }, [expandFromAnchor])

  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [lastSubmittedReviewId, setLastSubmittedReviewId] = useState<string | null>(null)
  
  // Count reviews with photos
  const reviewsWithPhotosCount = useMemo(() => {
    return reviews.filter(r => r.images && r.images.length > 0).length
  }, [reviews])

  // Calculate rating distribution
  const ratingDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(r => {
      const rounded = Math.round(r.rating)
      if (rounded >= 1 && rounded <= 5) {
        dist[rounded as keyof typeof dist]++
      }
    })
    return dist
  }, [reviews])

  // Generate AI summary from reviews
  const aiSummary = useMemo(() => {
    return generateAISummary(reviews, productName, averageRating)
  }, [reviews, productName, averageRating])

  // Filter and sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews]
    
    // Apply rating filter
    if (filterRating) {
      result = result.filter(r => Math.round(r.rating) === filterRating)
    }
    
    // Apply photos filter
    if (filterWithPhotos) {
      result = result.filter(r => r.images && r.images.length > 0)
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.content.toLowerCase().includes(query) ||
        r.author.toLowerCase().includes(query)
      )
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
      case 'highest':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'lowest':
        result.sort((a, b) => a.rating - b.rating)
        break
      case 'helpful':
        result.sort((a, b) => b.helpful - a.helpful)
        break
    }
    
    return result
  }, [reviews, sortBy, filterRating, filterWithPhotos, searchQuery])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedReviews.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const visibleReviews = filteredAndSortedReviews.slice(startIndex, endIndex)
  
  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [filterRating, filterWithPhotos, searchQuery, sortBy])

  // Handle helpful vote
  const handleHelpful = (reviewId: string) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
    ))
  }

  // Handle review submitted from WriteReviewModal
  const handleReviewSuccess = (review: { id: string; author: string; rating: number; date: string; location?: string; title: string; content: string; verified: boolean; helpful: number }) => {
    const mappedReview: Review = {
      ...review,
      id: review.id,
    }
    setReviews(prev => [mappedReview, ...prev])
    setShowWriteReview(false)
    setSubmitSuccess(true)
    setLastSubmittedReviewId(review.id)
    setIsExpanded(true) // Expand section so user sees their new review
    setTimeout(() => setSubmitSuccess(false), 5000)
    setTimeout(() => setLastSubmittedReviewId(null), 3000) // Clear highlight after animation
  }

  // Scroll to newly submitted review and ensure reviews section is in view
  useEffect(() => {
    if (!lastSubmittedReviewId) return
    
    const scrollToNewReview = () => {
      const el = document.getElementById(`review-${lastSubmittedReviewId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        // Fallback: scroll to reviews section
        document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    
    // Small delay to let React render the new review
    const timer = setTimeout(scrollToNewReview, 150)
    return () => clearTimeout(timer)
  }, [lastSubmittedReviewId])

  return (
    <div className="mt-8 sm:mt-16 pt-8 sm:pt-16 border-t border-brand-gray-200">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4 sm:mb-6 hover:opacity-80 transition-opacity"
      >
        <div className="text-left">
          <h2 className="text-xl sm:text-2xl font-medium text-brand-black">Customer Reviews</h2>
          <p className="text-xs sm:text-sm text-brand-gray-600 mt-0.5 sm:mt-1">
            {totalReviews} reviews for {productName}
          </p>
        </div>
        <svg
          className={`w-5 h-5 text-brand-gray-500 transition-transform flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* AI Review Summary - Always visible */}
      <div className="mb-6 sm:mb-8 border border-brand-gray-200 rounded-xl p-3 sm:p-4 flex items-start gap-3 sm:gap-4 bg-gradient-to-r from-brand-blue-50/50 to-white">
        {/* AI Sparkle Icon */}
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L9.5 9.5L2 12L9.5 14.5L12 22L14.5 14.5L22 12L14.5 9.5L12 2Z" />
          </svg>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs sm:text-sm font-semibold text-brand-black">AI Review Summary</p>
            <span className="px-1.5 py-0.5 bg-brand-blue-100 text-brand-blue-700 text-micro sm:text-xs font-medium rounded">Beta</span>
          </div>
          <p className="text-xs sm:text-sm text-brand-gray-600 leading-relaxed">{aiSummary}</p>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 sm:gap-3 mt-2">
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-micro sm:text-xs font-medium text-brand-gray-700">{averageRating.toFixed(1)}</span>
              </div>
              <span className="text-micro sm:text-xs text-brand-gray-400">•</span>
              <span className="text-micro sm:text-xs text-brand-gray-600">Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <>

      {/* Success Message - Visual confirmation that review was sent */}
      {submitSuccess && (
        <div 
          className="mb-6 p-4 sm:p-5 bg-green-50 border-2 border-green-300 rounded-xl shadow-sm"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-base sm:text-lg font-semibold text-green-800">Thank you for your review!</p>
              <p className="text-sm text-green-700 mt-0.5">Your review has been submitted successfully. Scroll down to see it.</p>
            </div>
          </div>
        </div>
      )}

      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-8 p-4 sm:p-6 bg-brand-gray-50 rounded-xl">
        {/* Overall Rating */}
        <div className="text-center md:text-left">
          <div className="text-4xl sm:text-5xl font-semibold text-brand-black mb-2">
            {averageRating.toFixed(1)}
          </div>
          <StarRating rating={averageRating} size="lg" />
          <p className="text-xs sm:text-sm text-brand-gray-600 mt-2">Based on {totalReviews} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="md:col-span-2 space-y-1.5 sm:space-y-2">
          {[5, 4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              onClick={() => setFilterRating(filterRating === rating ? null : rating)}
              className={`w-full hover:bg-brand-gray-100 rounded-lg p-1 transition-colors ${
                filterRating === rating ? 'bg-brand-blue-50' : ''
              }`}
            >
              <RatingBar 
                rating={rating} 
                count={ratingDistribution[rating as keyof typeof ratingDistribution]} 
                total={reviews.length} 
              />
            </button>
          ))}
        </div>
      </div>

      {/* Quick Filters: Star Rating & Photos */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <span className="text-xs sm:text-sm font-medium text-brand-gray-600">Filter by:</span>
        </div>
        
        {/* Horizontally scrollable on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {/* Star Rating Quick Filters */}
          {[5, 4, 3, 2, 1].map(star => (
            <button
              key={star}
              onClick={() => setFilterRating(filterRating === star ? null : star)}
              className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
                filterRating === star
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  : 'bg-brand-gray-100 text-brand-gray-600 hover:bg-brand-gray-200 border border-transparent'
              }`}
            >
              {star}
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-micro sm:text-xs text-brand-gray-500 hidden sm:inline">({ratingDistribution[star as keyof typeof ratingDistribution]})</span>
            </button>
          ))}
          
          {/* Divider */}
          <div className="w-px h-5 sm:h-6 bg-brand-gray-300 mx-0.5 sm:mx-1 flex-shrink-0" />
          
          {/* With Photos Filter */}
          <button
            onClick={() => setFilterWithPhotos(!filterWithPhotos)}
            className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
              filterWithPhotos
                ? 'bg-brand-blue-100 text-brand-blue-700 border border-brand-blue-300'
                : 'bg-brand-gray-100 text-brand-gray-600 hover:bg-brand-gray-200 border border-transparent'
            }`}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">With Photos</span>
            <span className="sm:hidden">Photos</span>
            <span className="text-micro sm:text-xs text-brand-gray-500 hidden sm:inline">({reviewsWithPhotosCount})</span>
          </button>
          
          {/* Clear All Filters */}
          {(filterRating || filterWithPhotos) && (
            <button
              onClick={() => {
                setFilterRating(null)
                setFilterWithPhotos(false)
              }}
              className="text-xs sm:text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline ml-1 sm:ml-2 flex-shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="mb-4 sm:mb-6">
        {/* Search - Full Width */}
        <div className="relative w-full mb-3">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-2 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm"
          />
        </div>

        {/* Sort By and Write Review Button - Stack on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {/* Sort By */}
          <div className="flex items-center gap-2">
            <label className="text-xs sm:text-sm text-brand-gray-600 whitespace-nowrap">Sort:</label>
            <div className="relative flex-1 sm:flex-none">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none w-full sm:w-48 px-3 py-2.5 sm:py-2 pr-8 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm bg-white cursor-pointer"
              >
                <option value="newest">Most Recent</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
                <option value="helpful">Most Helpful</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-brand-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Write Review Button - Full width on mobile, aligned right on desktop */}
          <button
            onClick={() => setShowWriteReview(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors"
          >
            Write a Review
          </button>
        </div>

        {/* Filter Tags */}
        {(filterRating || filterWithPhotos) && (
          <div className="flex items-center gap-2 flex-wrap mt-3">
            {filterRating && (
              <button
                onClick={() => setFilterRating(null)}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-yellow-100 text-yellow-800 text-xs sm:text-sm rounded-lg hover:bg-yellow-200 transition-colors"
              >
                {filterRating} stars
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {filterWithPhotos && (
              <button
                onClick={() => setFilterWithPhotos(false)}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-brand-blue-100 text-brand-blue-700 text-xs sm:text-sm rounded-lg hover:bg-brand-blue-200 transition-colors"
              >
                With Photos
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {(filterRating || filterWithPhotos || searchQuery) && (
        <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-brand-gray-600">
          Showing {filteredAndSortedReviews.length} of {reviews.length} reviews
          {filterRating && ` with ${filterRating} stars`}
          {filterWithPhotos && ` with photos`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4 sm:space-y-6">
        {visibleReviews.length > 0 ? (
          visibleReviews.map((review) => (
            <div
              key={review.id}
              id={`review-${review.id}`}
              className={`border-b border-brand-gray-200 pb-4 sm:pb-6 last:border-0 transition-all duration-500 ${
                review.id === lastSubmittedReviewId
                  ? 'ring-2 ring-green-400 ring-offset-2 rounded-lg -m-1 p-1 mb-3 bg-green-50/50'
                  : ''
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-base sm:text-lg font-medium text-brand-gray-600">
                    {review.author.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-1 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-medium text-brand-black">{review.author}</span>
                      {review.verified && (
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 bg-green-100 text-green-700 text-micro sm:text-xs rounded-full">
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="hidden sm:inline">Verified Purchase</span>
                          <span className="sm:hidden">Verified</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-micro sm:text-xs text-brand-gray-500">
                        {review.date}
                        {review.location && (
                          <>
                            <span className="mx-0.5 sm:mx-1">•</span>
                            {review.location}
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {review.title && (
                    <h4 className="text-sm sm:text-base font-medium text-brand-black mb-1.5 sm:mb-2">{review.title}</h4>
                  )}
                  
                  <ExpandableReviewContent content={review.content} />

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-2 sm:mt-3 flex-wrap">
                      {review.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setLightboxImage(img)}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-brand-gray-100 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:ring-offset-2"
                        >
                          <img src={img} alt={`Review image ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Helpful */}
                  <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4">
                    <button
                      onClick={() => handleHelpful(review.id)}
                      className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-brand-gray-600 hover:text-brand-blue-500 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      Helpful ({review.helpful})
                    </button>
                    <button
                      onClick={() => setReportModalReview(review)}
                      className="text-xs sm:text-sm text-brand-gray-600 hover:text-brand-blue-500 transition-colors"
                    >
                      Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-brand-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-brand-gray-600">No reviews match your criteria</p>
            <button
              onClick={() => {
                setFilterRating(null)
                setFilterWithPhotos(false)
                setSearchQuery('')
              }}
              className="text-brand-blue-500 hover:underline mt-2"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-brand-gray-200">
          {/* Results info */}
          <p className="text-xs sm:text-sm text-brand-gray-600 order-2 sm:order-1">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedReviews.length)} of {filteredAndSortedReviews.length} reviews
          </p>
          
          {/* Pagination controls */}
          <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
            {/* Previous button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                currentPage === 1
                  ? 'text-brand-gray-300 cursor-not-allowed'
                  : 'text-brand-gray-600 hover:bg-brand-gray-100 hover:text-brand-black'
              }`}
              aria-label="Previous page"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                // Show first page, last page, current page, and pages around current
                const showPage = page === 1 || 
                  page === totalPages || 
                  Math.abs(page - currentPage) <= 1
                
                // Show ellipsis
                const showEllipsisBefore = page === currentPage - 2 && currentPage > 3
                const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2
                
                if (showEllipsisBefore || showEllipsisAfter) {
                  return (
                    <span key={page} className="px-1 sm:px-2 text-brand-gray-400 text-sm">...</span>
                  )
                }
                
                if (!showPage) return null
                
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[28px] sm:min-w-[32px] h-7 sm:h-8 px-1.5 sm:px-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-brand-blue-500 text-white'
                        : 'text-brand-gray-600 hover:bg-brand-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>
            
            {/* Next button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                currentPage === totalPages
                  ? 'text-brand-gray-300 cursor-not-allowed'
                  : 'text-brand-gray-600 hover:bg-brand-gray-100 hover:text-brand-black'
              }`}
              aria-label="Next page"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div data-modal-center className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            data-modal-overlay
            className="fixed inset-0 bg-black bg-opacity-90" 
            onClick={() => setLightboxImage(null)} 
          />
          <div className="relative max-w-4xl max-h-[90vh] z-10">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-brand-gray-300 transition-colors"
              aria-label="Close image"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={lightboxImage} 
              alt="Review image full size" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Write Review Modal - Reused across PDP, My Account, Order Details */}
      <WriteReviewModal
        productId={productId}
        productName={productName}
        isOpen={showWriteReview}
        onClose={() => setShowWriteReview(false)}
        onSuccess={handleReviewSuccess}
      />

      {/* Report Review Modal */}
      <ReportReviewModal
        isOpen={!!reportModalReview}
        onClose={() => setReportModalReview(null)}
        review={reportModalReview ? { id: reportModalReview.id, author: reportModalReview.author, rating: reportModalReview.rating, title: reportModalReview.title, content: reportModalReview.content } : null}
        productName={productName}
      />
        </>
      )}
    </div>
  )
}
