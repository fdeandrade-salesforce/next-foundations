import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Product } from './ProductListingPage'
import LazyImage from './LazyImage'
import { getColorHex } from '../lib/color-utils'

interface ProductCardProps {
  product: Product
  onUnifiedAction?: (product: Product) => void
  onAddToCart?: (product: Product) => void
  onQuickView?: (product: Product) => void
  onAddToWishlist?: (product: Product, size?: string, color?: string) => void
  showQuickAdd?: boolean
  isInWishlist?: boolean
  allProducts?: Product[]
}

export default function ProductCard({
  product,
  onUnifiedAction,
  onAddToCart,
  onQuickView,
  onAddToWishlist,
  showQuickAdd = false,
  isInWishlist = false,
  allProducts = [],
}: ProductCardProps) {
  const router = useRouter()
  const [hoveredColor, setHoveredColor] = useState<string | null>(null)
  const [isCardHovered, setIsCardHovered] = useState(false)

  // Find variant products by matching product name, category, and subcategory
  const variantProducts = useMemo(() => {
    if (!product.colors || product.colors.length <= 1 || allProducts.length === 0) {
      return {}
    }
    
    const variants: Record<string, Product> = {}
    
    // Find products with the same name, category, subcategory, but different colors
    allProducts.forEach((p) => {
      if (
        p.name === product.name && 
        p.category === product.category &&
        p.subcategory === product.subcategory &&
        p.color && 
        product.colors?.includes(p.color)
      ) {
        variants[p.color] = p
      }
    })
    
    return variants
  }, [allProducts, product.name, product.category, product.subcategory, product.colors])

  // Get current variant based on hovered color
  const currentDisplayVariant = useMemo(() => {
    if (hoveredColor && variantProducts[hoveredColor]) {
      return variantProducts[hoveredColor]
    }
    return product
  }, [hoveredColor, variantProducts, product])

  // Get current image based on hovered color and card hover state
  const currentImage = useMemo(() => {
    const images = currentDisplayVariant.images
    const primaryImage = images?.[0] || currentDisplayVariant.image
    
    // If card is hovered and there's a second image, show it
    if (isCardHovered && images && images.length >= 2) {
      return images[1]
    }
    
    return primaryImage
  }, [currentDisplayVariant, isCardHovered])

  // Check if current display variant (hovered or default) is out of stock
  const isCurrentlyOutOfStock = !currentDisplayVariant.inStock

  // Use current display variant's discount if provided, otherwise calculate from price difference
  const hasDiscount = currentDisplayVariant.discountPercentage !== undefined 
    ? currentDisplayVariant.discountPercentage > 0
    : currentDisplayVariant.originalPrice && currentDisplayVariant.originalPrice > currentDisplayVariant.price
  
  const discountPercentage = currentDisplayVariant.discountPercentage !== undefined
    ? currentDisplayVariant.discountPercentage
    : hasDiscount && currentDisplayVariant.originalPrice
      ? Math.round(((currentDisplayVariant.originalPrice - currentDisplayVariant.price) / currentDisplayVariant.originalPrice) * 100)
      : null
  
  // Percent-off badge value (can be different from calculated discount)
  const percentOffBadge = currentDisplayVariant.percentOff !== undefined ? currentDisplayVariant.percentOff : discountPercentage

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
      'new': 'badge-new',
      'best-seller': 'badge-bestseller',
      'online-only': 'badge-online-only',
      'limited-edition': 'badge-limited',
      'promotion': 'badge-sale',
    }
    return colors[badge] || 'bg-muted text-muted-foreground'
  }

  // Calculate badges based on current display variant (hovered or default)
  const badges = currentDisplayVariant.badges || []
  if (currentDisplayVariant.isNew) badges.push('new')
  if (currentDisplayVariant.isBestSeller) badges.push('best-seller')
  if (currentDisplayVariant.isOnlineOnly) badges.push('online-only')
  if (currentDisplayVariant.isLimitedEdition) badges.push('limited-edition')
  if (hasDiscount) badges.push('promotion')

  const handleQuickAdd = () => {
    if (onAddToCart && product.inStock) {
      onAddToCart(product)
    }
  }

  // Helper function to check if product has variants
  const hasVariants = (): boolean => {
    if (product.size && product.size.length > 1) return true
    if (product.colors && product.colors.length > 1) return true
    if (product.variants && product.variants > 0) return true
    return false
  }

  const productHasVariants = hasVariants()

  // Calculate price range across all variants
  const priceRange = useMemo(() => {
    if (!product.colors || product.colors.length <= 1) {
      return null
    }

    // Collect all variant prices
    const prices: Set<number> = new Set()
    
    // Add price for each color variant
    product.colors.forEach((color) => {
      const variantProduct = variantProducts[color]
      if (variantProduct && variantProduct.price) {
        prices.add(variantProduct.price)
      } else {
        // If no variant product exists for this color, use base product price
        prices.add(product.price)
      }
    })

    const priceArray = Array.from(prices)
    const minPrice = Math.min(...priceArray)
    const maxPrice = Math.max(...priceArray)

    // Return range only if prices differ
    if (minPrice !== maxPrice) {
      return { min: minPrice, max: maxPrice }
    }

    return null
  }, [product, variantProducts])

  return (
    <div 
      className="product-card group"
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
    >
      <div className="product-image relative">
        <div className="relative w-full h-full">
          <LazyImage
            src={currentImage}
            alt={product.name}
            className={`transition-opacity duration-300 ${
              isCurrentlyOutOfStock ? 'opacity-50' : ''
            }`}
            objectFit="cover"
          />
        </div>
        <Link 
          href={`/product/${product.id}`} 
          className="absolute inset-0 z-[1] cursor-pointer" 
          aria-label={`View ${product.name}`}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1 z-20">
          {/* Out of Stock Badge - Show first if current display variant (hovered or default) is out of stock */}
          {isCurrentlyOutOfStock && (
            <span className="badge-out-of-stock px-2 py-1 text-xs font-semibold uppercase rounded-badge inline-block">
              Out of Stock
            </span>
          )}
          {badges.filter(badge => badge !== 'promotion').slice(0, 2).map((badge, idx) => (
            <span
              key={idx}
              className={`${getBadgeColor(badge)} px-2 py-1 text-xs font-semibold uppercase rounded-badge inline-block`}
            >
              {getBadgeLabel(badge)}
            </span>
          ))}
          {/* Percent-off badge - show if there's a discount (prioritize this over promotion badge) */}
          {percentOffBadge !== null && percentOffBadge !== undefined && (
            <span className="badge-sale px-2 py-1 text-xs font-semibold rounded-badge inline-block">
              -{percentOffBadge}%
            </span>
          )}
        </div>

        {/* Top Right Icons Container */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-2 z-20">
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
              className={`p-1.5 rounded-full transition-all ${
                isInWishlist 
                  ? 'bg-red-50 opacity-100' 
                  : 'bg-white/70 hover:bg-white opacity-0 group-hover:opacity-100'
              }`}
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <svg 
                className={`w-4 h-4 transition-colors ${isInWishlist ? 'text-red-500 fill-current' : 'text-brand-gray-500'}`} 
                fill={isInWishlist ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-opacity duration-300 pointer-events-none" />
        
        {/* Quick Actions - Unified entry point */}
        <div className="absolute bottom-4 left-0 right-0 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <div className="flex flex-col gap-2">
            {onUnifiedAction ? (
              !product.inStock ? (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onUnifiedAction(product)
                  }}
                  className="w-full bg-white text-brand-black py-2 px-4 text-sm font-medium hover:bg-brand-gray-100 transition-colors rounded-lg shadow-sm"
                  aria-label={`Notify me when ${product.name} is available`}
                >
                  Notify me
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onUnifiedAction(product)
                  }}
                  className={`w-full py-2 px-4 text-sm font-medium transition-colors rounded-lg shadow-sm ${
                    productHasVariants
                      ? 'bg-white text-brand-black hover:bg-brand-gray-100'
                      : 'bg-brand-blue-500 text-white hover:bg-brand-blue-600'
                  }`}
                  aria-label={productHasVariants ? `Quick add ${product.name}` : `Add ${product.name} to cart`}
                >
                  {productHasVariants ? 'Quick Add' : 'Add to cart'}
                </button>
              )
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
      <div className="relative p-4">
        <Link 
          href={`/product/${product.id}`} 
          className="absolute inset-0 z-[1]" 
          aria-label={`View ${product.name}`}
        />
        {/* Color Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1 mb-2 relative z-20">
            {product.colors.slice(0, 5).map((color, idx) => {
              const isCurrentColor = product.color === color
              const variantProduct = variantProducts[color]
              // Link to the variant product if it exists, otherwise current product with color param
              const href = variantProduct 
                ? `/product/${variantProduct.id}`
                : `/product/${product.id}?color=${encodeURIComponent(color)}`
              
              return (
                <Link
                  key={idx}
                  href={href}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  onMouseEnter={(e) => {
                    e.stopPropagation()
                    setHoveredColor(color)
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation()
                    setHoveredColor(null)
                  }}
                  className={`w-4 h-4 rounded-full border transition-all cursor-pointer relative z-20 ${
                    isCurrentColor 
                      ? 'border-brand-blue-500 ring-2 ring-brand-blue-200' 
                      : hoveredColor === color
                        ? 'border-brand-gray-500 ring-1 ring-brand-gray-300'
                        : 'border-brand-gray-300 hover:border-brand-gray-400'
                  }`}
                  style={{
                    backgroundColor: getColorHex(color),
                  }}
                  title={color}
                  aria-label={`View ${product.name} in ${color}`}
                />
              )
            })}
            {product.colors.length > 5 && (
              <span className="text-xs text-brand-gray-600 ml-1">+{product.colors.length - 5}</span>
            )}
            {product.variants && product.variants > 0 && (
              <span className="text-xs text-brand-gray-600 ml-1">+{product.variants} more</span>
            )}
          </div>
        )}

        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-brand-gray-600 mb-1 relative z-20">
            {product.brand}
          </p>
        )}
        
        {/* Category */}
        {product.category && (
          <p className="text-xs text-brand-gray-600 mb-1 relative z-20">
            {product.category}
          </p>
        )}
        
        {/* Name */}
        <h3 className="text-sm font-medium text-brand-black mb-2 line-clamp-2 relative z-20">
          {product.name}
        </h3>

        {/* SKU */}
        {product.sku && (
          <p className="text-xs text-brand-gray-500 mb-1 relative z-20">
            SKU: {product.sku}
          </p>
        )}

        {/* Short Description */}
        {product.shortDescription && (
          <p className="text-xs text-brand-gray-600 mb-2 line-clamp-2 relative z-20">
            {product.shortDescription}
          </p>
        )}

        {/* Ratings */}
        {product.rating !== undefined && (
          <div className="flex items-center gap-2 mb-2 relative z-20">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating || 0)
                      ? 'text-star-filled fill-current'
                      : 'text-star-empty'
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

        {/* Price */}
        <div className="flex items-center gap-2 relative z-20">
          {priceRange ? (
            <span className="text-base font-semibold text-brand-black">
              ${priceRange.min.toFixed(2)} - ${priceRange.max.toFixed(2)}
            </span>
          ) : (
            <>
              <span className="text-base font-semibold text-brand-black">
                ${currentDisplayVariant.price.toFixed(2)}
              </span>
              {hasDiscount && currentDisplayVariant.originalPrice && (
                <span className="text-sm text-brand-gray-500 line-through">
                  ${currentDisplayVariant.originalPrice.toFixed(2)}
                </span>
              )}
            </>
          )}
        </div>

        {/* Promotional Message */}
        {currentDisplayVariant.promotionalMessage && (
          <p className="text-xs text-success font-medium mt-2 relative z-20">
            {currentDisplayVariant.promotionalMessage}
          </p>
        )}
      </div>
    </div>
  )
}

