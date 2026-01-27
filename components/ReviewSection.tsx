'use client'

import React, { useState, useMemo } from 'react'

interface Review {
  id: string
  author: string
  rating: number
  date: string
  title: string
  content: string
  verified: boolean
  helpful: number
  images?: string[]
}

interface ReviewSectionProps {
  productId: string
  productName: string
  reviews: Review[]
  averageRating: number
  totalReviews: number
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
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('newest')
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [visibleCount, setVisibleCount] = useState(5)
  const [searchQuery, setSearchQuery] = useState('')
  
  // New review form state
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    content: '',
    name: '',
    email: '',
    recommend: true,
  })
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

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

  // Filter and sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews]
    
    // Apply rating filter
    if (filterRating) {
      result = result.filter(r => Math.round(r.rating) === filterRating)
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
  }, [reviews, sortBy, filterRating, searchQuery])

  const visibleReviews = filteredAndSortedReviews.slice(0, visibleCount)
  const hasMore = visibleCount < filteredAndSortedReviews.length

  // Handle helpful vote
  const handleHelpful = (reviewId: string) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
    ))
  }

  // Handle submit review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newReview.rating === 0) {
      alert('Please select a rating')
      return
    }
    
    const review: Review = {
      id: `new-${Date.now()}`,
      author: newReview.name,
      rating: newReview.rating,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      title: newReview.title,
      content: newReview.content,
      verified: false,
      helpful: 0,
    }
    
    setReviews(prev => [review, ...prev])
    setNewReview({ rating: 0, title: '', content: '', name: '', email: '', recommend: true })
    setShowWriteReview(false)
    setSubmitSuccess(true)
    
    setTimeout(() => setSubmitSuccess(false), 5000)
  }

  return (
    <div className="mt-16 pt-16 border-t border-brand-gray-200">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-8 hover:opacity-80 transition-opacity"
      >
        <div className="text-left">
          <h2 className="text-2xl font-medium text-brand-black">Customer Reviews</h2>
          <p className="text-sm text-brand-gray-600 mt-1">
            {totalReviews} reviews for {productName}
          </p>
        </div>
        <svg
          className={`w-5 h-5 text-brand-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <>

      {/* Success Message */}
      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-brand-gray-700">Thank you! Your review has been submitted successfully.</p>
          </div>
        </div>
      )}

      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 p-6 bg-brand-gray-50 rounded-xl">
        {/* Overall Rating */}
        <div className="text-center md:text-left">
          <div className="text-5xl font-semibold text-brand-black mb-2">
            {averageRating.toFixed(1)}
          </div>
          <StarRating rating={averageRating} size="lg" />
          <p className="text-sm text-brand-gray-600 mt-2">Based on {totalReviews} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="md:col-span-2 space-y-2">
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

      {/* Filters & Sort */}
      <div className="mb-6">
        {/* Search, Sort, and Button - Responsive Layout */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
          {/* Search - Full Width on Mobile, Fill on Desktop */}
          <div className="relative flex-1 w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm"
            />
          </div>

          {/* Sort By and Button Row - Second Line on Mobile */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Sort By - Hug */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <label className="text-sm text-brand-gray-600 whitespace-nowrap">Sort by:</label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="appearance-none px-3 py-2 pr-8 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm bg-white cursor-pointer"
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

            {/* Write Review Button - Hug */}
            <button
              onClick={() => setShowWriteReview(true)}
              className="px-6 py-3 bg-brand-blue-500 text-white font-medium rounded-lg hover:bg-brand-blue-600 transition-colors flex-shrink-0 whitespace-nowrap"
            >
              Write a Review
            </button>
          </div>
        </div>

        {/* Filter Tags */}
        <div className="flex items-center gap-2">
          {filterRating && (
            <button
              onClick={() => setFilterRating(null)}
              className="flex items-center gap-1 px-3 py-2 bg-brand-blue-100 text-brand-blue-700 text-sm rounded-lg hover:bg-brand-blue-200 transition-colors"
            >
              {filterRating} stars
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filterRating || searchQuery) && (
        <div className="mb-4 text-sm text-brand-gray-600">
          Showing {filteredAndSortedReviews.length} of {reviews.length} reviews
          {filterRating && ` with ${filterRating} stars`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {visibleReviews.length > 0 ? (
          visibleReviews.map((review) => (
            <div key={review.id} className="border-b border-brand-gray-200 pb-6 last:border-0">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-brand-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-medium text-brand-gray-600">
                    {review.author.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-brand-black">{review.author}</span>
                        {review.verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-xs text-brand-gray-500">{review.date}</span>
                      </div>
                    </div>
                  </div>

                  {review.title && (
                    <h4 className="font-medium text-brand-black mb-2">{review.title}</h4>
                  )}
                  
                  <p className="text-sm text-brand-gray-600 leading-relaxed">{review.content}</p>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {review.images.map((img, idx) => (
                        <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden bg-brand-gray-100">
                          <img src={img} alt={`Review image ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Helpful */}
                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={() => handleHelpful(review.id)}
                      className="flex items-center gap-1.5 text-sm text-brand-gray-600 hover:text-brand-blue-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      Helpful ({review.helpful})
                    </button>
                    <button className="text-sm text-brand-gray-600 hover:text-brand-blue-500 transition-colors">
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
                setSearchQuery('')
              }}
              className="text-brand-blue-500 hover:underline mt-2"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={() => setVisibleCount(prev => prev + 5)}
            className="px-6 py-3 border border-brand-gray-300 text-brand-black font-medium rounded-lg hover:bg-brand-gray-50 transition-colors"
          >
            Load More Reviews ({filteredAndSortedReviews.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* Write Review Modal */}
      {showWriteReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowWriteReview(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-brand-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-brand-black">Write a Review</h3>
                <button
                  onClick={() => setShowWriteReview(false)}
                  className="p-2 text-brand-gray-500 hover:text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitReview} className="p-6 space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Overall Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <StarRating 
                      rating={newReview.rating} 
                      size="lg" 
                      interactive 
                      onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
                    />
                    <span className="text-sm text-brand-gray-600">
                      {newReview.rating > 0 ? `${newReview.rating} out of 5 stars` : 'Select a rating'}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Review Title
                  </label>
                  <input
                    type="text"
                    value={newReview.title}
                    onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Summarize your experience"
                    className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Your Review <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newReview.content}
                    onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="What did you like or dislike about this product?"
                    rows={4}
                    required
                    className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm resize-none"
                  />
                  <p className="text-xs text-brand-gray-500 mt-1">Minimum 50 characters</p>
                </div>

                {/* Recommend */}
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
                        onChange={() => setNewReview(prev => ({ ...prev, recommend: true }))}
                        className="w-4 h-4 text-brand-blue-500"
                      />
                      <span className="text-sm text-brand-black">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="recommend"
                        checked={newReview.recommend === false}
                        onChange={() => setNewReview(prev => ({ ...prev, recommend: false }))}
                        className="w-4 h-4 text-brand-blue-500"
                      />
                      <span className="text-sm text-brand-black">No</span>
                    </label>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newReview.name}
                    onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                    required
                    className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newReview.email}
                    onChange={(e) => setNewReview(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm"
                  />
                  <p className="text-xs text-brand-gray-500 mt-1">Your email will not be published</p>
                </div>

                {/* Photo Upload Placeholder */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Add Photos (Optional)
                  </label>
                  <div className="border-2 border-dashed border-brand-gray-300 rounded-lg p-6 text-center hover:border-brand-blue-500 transition-colors cursor-pointer">
                    <svg className="w-8 h-8 text-brand-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-brand-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-brand-gray-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>

                {/* Terms */}
                <p className="text-xs text-brand-gray-500">
                  By submitting this review, you agree to our Terms of Service and Privacy Policy.
                </p>

                {/* Submit */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowWriteReview(false)}
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
      )}
        </>
      )}
    </div>
  )
}
