import React from 'react'
import Link from 'next/link'
import { Product } from './ProductListingPage'
import LazyImage from './LazyImage'

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
  onQuickView?: (product: Product) => void
  onAddToWishlist?: (product: Product) => void
  showQuickAdd?: boolean
  isInWishlist?: boolean
}

export default function ProductCard({
  product,
  onAddToCart,
  onQuickView,
  onAddToWishlist,
  showQuickAdd = false,
  isInWishlist = false,
}: ProductCardProps) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : null

  const getBadgeLabel = (badge: string) => {
    const labels: Record<string, string> = {
      'new': 'New',
      'best-seller': 'Best Seller',
      'online-only': 'Online Only',
      'limited-edition': 'Limited Edition',
      'promotion': 'Sale',
    }
    return labels[badge] || badge
  }

  const getBadgeColor = (badge: string) => {
    const colors: Record<string, string> = {
      'new': 'bg-green-600',
      'best-seller': 'bg-brand-blue-500',
      'online-only': 'bg-purple-600',
      'limited-edition': 'bg-orange-600',
      'promotion': 'bg-brand-blue-500',
    }
    return colors[badge] || 'bg-brand-gray-800'
  }

  const badges = product.badges || []
  if (product.isNew) badges.push('new')
  if (product.isBestSeller) badges.push('best-seller')
  if (product.isOnlineOnly) badges.push('online-only')
  if (product.isLimitedEdition) badges.push('limited-edition')
  if (hasDiscount) badges.push('promotion')

  const handleQuickAdd = () => {
    if (onAddToCart && product.inStock) {
      onAddToCart(product)
    }
  }

  return (
    <div className="product-card group">
      <Link href={`/product/${product.id}`} className="product-image relative block">
        <LazyImage
          src={product.image}
          alt={product.name}
          className="w-full h-full"
          objectFit="cover"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1 z-10">
          {badges.slice(0, 2).map((badge, idx) => (
            <span
              key={idx}
              className={`${getBadgeColor(badge)} text-white px-2 py-1 text-xs font-semibold uppercase rounded-md inline-block`}
            >
              {getBadgeLabel(badge)}
            </span>
          ))}
          {hasDiscount && !badges.includes('promotion') && (
            <span className="bg-brand-blue-500 text-white px-2 py-1 text-xs font-semibold rounded-md inline-block">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Top Right Icons Container */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-2 z-10">
          {/* Store Availability Icon - Subtle, always visible */}
          {product.storeAvailable && (
            <div className="group/pickup relative">
              <div className="p-1.5 bg-white/70 hover:bg-white rounded-full transition-all duration-200 cursor-default">
                <svg className="w-4 h-4 text-brand-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              {/* Tooltip on hover */}
              <div className="absolute right-0 top-full mt-1 opacity-0 group-hover/pickup:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-brand-gray-900 text-white text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                  Pickup Available
                </div>
              </div>
            </div>
          )}

          {/* Wishlist Button - Shows on card hover or always if in wishlist */}
          {onAddToWishlist && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onAddToWishlist(product)
              }}
              className={`p-2 rounded-full transition-all ${
                isInWishlist 
                  ? 'bg-red-50 opacity-100' 
                  : 'bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100'
              }`}
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <svg 
                className={`w-5 h-5 transition-colors ${isInWishlist ? 'text-red-500 fill-current' : 'text-brand-black'}`} 
                fill={isInWishlist ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-opacity duration-300" />
        
        {/* Quick Actions - Stacked vertically */}
        <div className="absolute bottom-4 left-0 right-0 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="flex flex-col gap-2">
            {onQuickView && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onQuickView(product)
                }}
                className="w-full bg-white text-brand-black py-2 px-4 text-sm font-medium hover:bg-brand-gray-100 transition-colors rounded-lg shadow-sm"
                aria-label={`Quick view ${product.name}`}
              >
                Quick view
              </button>
            )}
            {showQuickAdd && product.inStock ? (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleQuickAdd()
                }}
                className="w-full bg-brand-blue-500 text-white py-2 px-4 text-sm font-medium hover:bg-brand-blue-600 transition-colors rounded-lg shadow-sm"
                aria-label={`Quick add ${product.name} to cart`}
              >
                Quick add
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onAddToCart?.(product)
                }}
                className="w-full bg-brand-blue-500 text-white py-2 px-4 text-sm font-medium hover:bg-brand-blue-600 transition-colors rounded-lg shadow-sm"
                aria-label={`Add ${product.name} to cart`}
              >
                Add to cart
              </button>
            )}
          </div>
        </div>
      </Link>
      <Link href={`/product/${product.id}`} className="block p-4">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-brand-gray-600 mb-1">
            {product.brand}
          </p>
        )}
        
        {/* Category */}
        {product.category && (
          <p className="text-xs text-brand-gray-600 mb-1">
            {product.category}
          </p>
        )}
        
        {/* Name */}
        <h3 className="text-sm font-medium text-brand-black mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Ratings */}
        {product.rating !== undefined && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-brand-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {product.reviewCount !== undefined && product.reviewCount > 0 && (
              <span className="text-xs text-brand-gray-600">({product.reviewCount})</span>
            )}
          </div>
        )}

        {/* Color Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1 mb-2">
            {product.colors.slice(0, 5).map((color, idx) => (
              <div
                key={idx}
                className="w-4 h-4 rounded-full border border-brand-gray-300"
                style={{
                  backgroundColor: color.toLowerCase() === 'white' ? '#fff' : 
                                  color.toLowerCase() === 'black' ? '#000' :
                                  color.toLowerCase() === 'red' ? '#ef4444' :
                                  color.toLowerCase() === 'blue' ? '#3b82f6' :
                                  color.toLowerCase() === 'green' ? '#22c55e' :
                                  color.toLowerCase() === 'yellow' ? '#eab308' :
                                  color.toLowerCase() === 'pink' ? '#ec4899' :
                                  color.toLowerCase() === 'purple' ? '#a855f7' :
                                  color.toLowerCase() === 'orange' ? '#f97316' :
                                  color.toLowerCase() === 'brown' ? '#a16207' :
                                  color.toLowerCase() === 'gray' ? '#6b7280' :
                                  color.toLowerCase() === 'beige' ? '#f5f5dc' : '#ccc',
                }}
                title={color}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-xs text-brand-gray-600 ml-1">+{product.colors.length - 5}</span>
            )}
            {product.variants && product.variants > 0 && (
              <span className="text-xs text-brand-gray-600 ml-1">+{product.variants} more</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-brand-black">
            ${product.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-brand-gray-500 line-through">
              ${product.originalPrice!.toFixed(2)}
            </span>
          )}
        </div>
      </Link>
    </div>
  )
}

