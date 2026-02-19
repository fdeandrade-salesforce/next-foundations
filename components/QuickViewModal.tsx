'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Product } from './ProductListingPage'
import { addToCart } from '../lib/cart'
import LazyImage from './LazyImage'
import Model3DViewer from './Model3DViewer'
import {
  PDPProduct,
  VariantGroup,
  VariantOption,
  normalizeOptionValue,
} from '../src/lib/variantResolution'

// Media item type for gallery
interface MediaItem {
  type: 'image' | 'model3d'
  src: string
  alt?: string
  thumbnail?: string
}

interface QuickViewModalProps {
  product: Product
  productVariants?: Product[] // All variants for this product
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product, quantity: number, size?: string, color?: string) => void
  onAddToWishlist: (product: Product, size?: string, color?: string) => void
  onNotify?: (product: Product) => void
}

export default function QuickViewModal({
  product,
  productVariants = [],
  isOpen,
  onClose,
  onAddToCart,
  onAddToWishlist,
  onNotify,
}: QuickViewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  // Reset quantity when modal opens with a new product
  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
    }
  }, [isOpen, product.id])

  // Build all variants list (same as PDP)
  const allVariants = useMemo(() => {
    if (productVariants.length > 0) {
      return productVariants.map(v => v as PDPProduct)
    }
    // Fallback to base product if no variants provided
    return [product as PDPProduct]
  }, [product, productVariants])

  // Build variant groups with variantId mapping (direct ID resolution, no heuristics)
  const variantGroups = useMemo((): VariantGroup[] => {
    const groups: VariantGroup[] = []
    const seenGroupKeys = new Set<string>()

    // Helper to normalize color for comparison (case-insensitive)
    const normalizeColor = (color: string): string => color.trim().toLowerCase()

    // Color group - map each color option to its variant ID
    const colorMap = new Map<string, string>() // color (normalized) -> variantId
    allVariants.forEach((variant) => {
      if (variant.color) {
        const normalizedColor = normalizeColor(variant.color)
        // Use first variant found for this color (prefer in-stock if available)
        if (!colorMap.has(normalizedColor)) {
          colorMap.set(normalizedColor, variant.id)
        } else {
          // Prefer in-stock variant
          const existingVariantId = colorMap.get(normalizedColor)!
          const existingVariant = allVariants.find(v => v.id === existingVariantId)
          if (variant.inStock && !existingVariant?.inStock) {
            colorMap.set(normalizedColor, variant.id)
          }
        }
      }
    })

    if (colorMap.size > 0) {
      const groupKey = 'color'
      seenGroupKeys.add(groupKey)
      const options: VariantOption[] = Array.from(colorMap.entries()).map(([normalizedColor, variantId]) => {
        // Find the original color value from the variant
        const variant = allVariants.find(v => v.id === variantId)
        const originalColor = variant?.color || normalizedColor
        return {
          id: `${groupKey}-${normalizeOptionValue(originalColor)}`,
          value: originalColor, // Use original color for display
          variantId // Direct variant ID for this color
        }
      })
      groups.push({ key: groupKey, label: 'Color', options })
    }

    // Size group - map each size to a variant (use first variant with that size)
    const sizeMap = new Map<string, string>() // size -> variantId
    allVariants.forEach((variant) => {
      if (variant.size) {
        variant.size.forEach((size) => {
          // Use first variant found for this size (prefer in-stock if available)
          if (!sizeMap.has(size)) {
            sizeMap.set(size, variant.id)
          } else {
            // Prefer in-stock variant
            const existingVariantId = sizeMap.get(size)!
            const existingVariant = allVariants.find(v => v.id === existingVariantId)
            if (variant.inStock && !existingVariant?.inStock) {
              sizeMap.set(size, variant.id)
            }
          }
        })
      }
    })

    if (sizeMap.size > 0) {
      const groupKey = 'size'
      if (!seenGroupKeys.has(groupKey)) {
        seenGroupKeys.add(groupKey)
        const options: VariantOption[] = Array.from(sizeMap.entries()).map(([size, variantId]) => ({
          id: `${groupKey}-${normalizeOptionValue(size)}`,
          value: size,
          variantId // Direct variant ID for this size
        }))
        groups.push({ key: groupKey, label: 'Size', options })
      }
    }

    // Capacity group
    const capacityMap = new Map<string, string>()
    allVariants.forEach((variant) => {
      if (variant.capacities) {
        variant.capacities.forEach((capacity) => {
          if (!capacityMap.has(capacity)) {
            capacityMap.set(capacity, variant.id)
          }
        })
      }
    })

    if (capacityMap.size > 0) {
      const groupKey = 'capacity'
      if (!seenGroupKeys.has(groupKey)) {
        seenGroupKeys.add(groupKey)
        const options: VariantOption[] = Array.from(capacityMap.entries()).map(([capacity, variantId]) => ({
          id: `${groupKey}-${normalizeOptionValue(capacity)}`,
          value: capacity,
          variantId
        }))
        groups.push({ key: groupKey, label: 'Capacity', options })
      }
    }

    // Scent group
    const scentMap = new Map<string, string>()
    allVariants.forEach((variant) => {
      if (variant.scents) {
        variant.scents.forEach((scent) => {
          if (!scentMap.has(scent)) {
            scentMap.set(scent, variant.id)
          }
        })
      }
    })

    if (scentMap.size > 0) {
      const groupKey = 'scent'
      if (!seenGroupKeys.has(groupKey)) {
        seenGroupKeys.add(groupKey)
        const options: VariantOption[] = Array.from(scentMap.entries()).map(([scent, variantId]) => ({
          id: `${groupKey}-${normalizeOptionValue(scent)}`,
          value: scent,
          variantId
        }))
        groups.push({ key: groupKey, label: 'Scent', options })
      }
    }

    return groups
  }, [allVariants]) // Variant groups are static - each option has its variantId

  // Initialize currentVariantId from product (direct ID resolution, no heuristics)
  const getInitialVariantId = (): string => {
    // Use product's own ID as default
    return product.id
  }

  // Store current variant ID directly (source of truth)
  const [currentVariantId, setCurrentVariantId] = useState<string>(() => getInitialVariantId())

  // Store selected values for UI display only (not used for variant resolution)
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(() => {
    const selected: Record<string, string> = {}
    if (product.color) selected.color = product.color
    if (product.size && product.size.length > 0) selected.size = product.size[0]
    return selected
  })

  // Get current variant directly by ID (no resolution logic)
  const currentVariant = useMemo(() => {
    const variant = allVariants.find(v => v.id === currentVariantId)
    return variant || (product as PDPProduct)
  }, [allVariants, currentVariantId, product])

  // Create displayProduct - single source of truth for all variant-dependent UI
  const displayProduct = useMemo(() => {
    return currentVariant
  }, [currentVariant])

  // Debug logging when currentVariantId changes (dev only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const variant = allVariants.find(v => v.id === currentVariantId) || product
      console.log('[QuickView] currentVariantId changed:', {
        variantId: currentVariantId,
        variantColor: variant.color,
        imagesCount: variant.images?.length || 0,
        price: variant.price,
        inStock: variant.inStock,
        stockQuantity: variant.stockQuantity,
      })
    }
  }, [currentVariantId, allVariants, product])

  // Mapping of product IDs to their 3D model GLB files
  const product3DModels: Record<string, string> = {
    'pure-cube-white': 'Pure Cube White.glb',
    'pure-cube-black': 'Black Pure Box.glb',
    'pure-cube-gray': 'Gray Pure Box.glb',
    'steady-prism': 'Steady Prism.glb',
    'spiral-accent': 'Spiral Accent.glb',
    'vertical-set': 'Vertical Set.glb',
  }

  // Get images from displayProduct (variant images if available, else base product images)
  const images = useMemo(() => {
    // Prefer variant's own images
    if (displayProduct.images && displayProduct.images.length > 0) {
      return displayProduct.images
    }
    // Fallback to base product images
    if (displayProduct.image) {
      return [displayProduct.image]
    }
    // Final fallback
    return []
  }, [displayProduct.images, displayProduct.image])

  // Check if this variant has a 3D model
  const has3DModel = product3DModels[displayProduct.id] !== undefined
  const model3DFile = has3DModel ? product3DModels[displayProduct.id] : null

  // Combine images and 3D model into media items
  const mediaItems: MediaItem[] = useMemo(() => {
    const items: MediaItem[] = [
      ...images.map((src): MediaItem => ({ type: 'image', src, alt: displayProduct.name })),
    ]
    // Add 3D model last if available
    if (has3DModel && model3DFile) {
      items.push({
        type: 'model3d',
        src: `/models/${model3DFile}`,
        alt: `${displayProduct.name} 3D Model`,
        thumbnail: images[0],
      })
    }
    return items
  }, [images, has3DModel, model3DFile, displayProduct.name])

  // Reset image index when variant changes
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [displayProduct.id])

  // Discount calculation (same as ProductCard and PDP) - use displayProduct
  const hasDiscount = useMemo(() => {
    return displayProduct.discountPercentage !== undefined 
      ? displayProduct.discountPercentage > 0
      : displayProduct.originalPrice && displayProduct.originalPrice > displayProduct.price
  }, [displayProduct.discountPercentage, displayProduct.originalPrice, displayProduct.price])
  
  const discountPercentage = useMemo(() => {
    return displayProduct.discountPercentage !== undefined
      ? displayProduct.discountPercentage
      : hasDiscount && displayProduct.originalPrice
        ? Math.round(((displayProduct.originalPrice - displayProduct.price) / displayProduct.originalPrice) * 100)
      : null
  }, [displayProduct.discountPercentage, displayProduct.originalPrice, displayProduct.price, hasDiscount])
  
  // Percent-off badge value (can be different from calculated discount)
  const percentOffBadge = useMemo(() => {
    return displayProduct.percentOff !== undefined ? displayProduct.percentOff : discountPercentage
  }, [displayProduct.percentOff, discountPercentage])

  // Badge logic (same as ProductCard and PDP)
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

  const badges = useMemo(() => {
    const badgeList = displayProduct.badges || []
    if (displayProduct.isNew) badgeList.push('new')
    if (displayProduct.isBestSeller) badgeList.push('best-seller')
    if (displayProduct.isOnlineOnly) badgeList.push('online-only')
    if (displayProduct.isLimitedEdition) badgeList.push('limited-edition')
    if (hasDiscount) badgeList.push('promotion')
    return badgeList
  }, [displayProduct.badges, displayProduct.isNew, displayProduct.isBestSeller, displayProduct.isOnlineOnly, displayProduct.isLimitedEdition, hasDiscount])

  // Carousel navigation
  const thumbnailContainerRef = useRef<HTMLDivElement>(null)
  const mainImageRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  
  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (!thumbnailContainerRef.current) return
    
    const container = thumbnailContainerRef.current
    const scrollAmount = 100 // pixels to scroll
    const currentScroll = container.scrollLeft
    
    container.scrollTo({
      left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
      behavior: 'smooth',
    })
  }

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % mediaItems.length)
  }

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }

  // Touch swipe handlers for main image
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const distance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50 // minimum distance for a swipe
    
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swiped left - go to next
        goToNext()
      } else {
        // Swiped right - go to previous
        goToPrevious()
      }
    }
    
    // Reset
    touchStartX.current = 0
    touchEndX.current = 0
  }

  // Handle option selection - resolve by variantId directly (no heuristics)
  const handleOptionSelect = (groupKey: string, value: string) => {
    // Find the option that was clicked
    const group = variantGroups.find(g => g.key === groupKey)
    const option = group?.options.find(opt => opt.value === value)
    
    if (!option) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[QuickView] Option not found:', { groupKey, value })
      }
      return
    }

    // Update selectedValues for UI display
    setSelectedValues((prev) => ({
      ...prev,
      [groupKey]: value,
    }))

    // If option has variantId, use it directly (source of truth)
    if (option.variantId) {
      const resolvedVariantId = option.variantId
      
      // Debug logging (dev only)
      if (process.env.NODE_ENV === 'development') {
        console.log('[QuickView] option clicked:', {
          groupKey,
          value,
          resolvedVariantId,
          optionId: option.id,
        })
      }

      // Set currentVariantId directly - this is the source of truth
      setCurrentVariantId(resolvedVariantId)

      // Debug logging when variant changes (dev only)
      if (process.env.NODE_ENV === 'development') {
        const variant = allVariants.find(v => v.id === resolvedVariantId)
        console.log('[QuickView] currentVariantId changed:', {
          variantId: resolvedVariantId,
          variantColor: variant?.color,
          variantPrice: variant?.price,
          variantInStock: variant?.inStock,
        })
      }
    } else {
      // Fallback: if no variantId, try to find variant by value (shouldn't happen with proper mapping)
      if (process.env.NODE_ENV === 'development') {
        console.warn('[QuickView] Option has no variantId, falling back to value matching:', {
          groupKey,
          value,
        })
      }
      
      // For color, find variant where variant.color matches (case-insensitive)
      if (groupKey === 'color') {
        const normalizeColor = (c: string) => c.trim().toLowerCase()
        const matchingVariant = allVariants.find(v => 
          v.color && normalizeColor(v.color) === normalizeColor(value)
        )
        if (matchingVariant) {
          setCurrentVariantId(matchingVariant.id)
        }
      }
    }
  }

  if (!isOpen) return null

  const handleAddToCart = () => {
    const size = selectedValues.size
    const color = selectedValues.color
    // Only call the parent callback - don't call addToCart directly here
    // The parent component handles adding to cart via onAddToCart
    onAddToCart(displayProduct, quantity, size, color)
    onClose() // Close the modal after adding to cart
  }

  return (
    <div data-modal-center className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        data-modal-overlay
        className="fixed inset-0 backdrop-default transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-card rounded-none sm:rounded-modal shadow-modal max-w-5xl w-full h-full sm:h-auto sm:max-h-[90vh] flex flex-col">
        {/* Close Button - matches modal-header__close pattern */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 modal-header__close"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 md:p-8">
            {/* Image Gallery */}
            <div className="space-y-3">
              {/* Main Image/3D Model - Smaller aspect ratio to ensure carousel is visible */}
              <div 
                ref={mainImageRef}
                className="relative aspect-square bg-brand-gray-100 overflow-hidden rounded-lg touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Badges - positioned like product cards */}
                <div className="absolute top-2 left-2 flex flex-col items-start gap-1 z-20">
                  {/* Out of Stock Badge - Show first if product is out of stock */}
                  {!displayProduct.inStock && (
                    <span className="badge-out-of-stock px-2 py-1 text-xs font-semibold uppercase rounded-badge inline-block shadow-lg">
                      Out of Stock
                    </span>
                  )}
                  {badges.filter(badge => badge !== 'promotion').slice(0, 2).map((badge, idx) => (
                    <span
                      key={idx}
                      className={`${getBadgeColor(badge)} px-2 py-1 text-xs font-semibold uppercase rounded-badge inline-block shadow-lg`}
                    >
                      {getBadgeLabel(badge)}
                    </span>
                  ))}
                  {/* Percent-off badge - show if there's a discount (prioritize this over promotion badge) */}
                  {percentOffBadge !== null && percentOffBadge !== undefined && (
                    <span className="badge-sale px-2 py-1 text-xs font-semibold rounded-badge inline-block shadow-lg">
                      -{percentOffBadge}%
                    </span>
                  )}
                </div>

                {mediaItems[currentImageIndex]?.type === 'model3d' ? (
                  <Model3DViewer
                    src={mediaItems[currentImageIndex].src}
                    alt={mediaItems[currentImageIndex].alt || displayProduct.name}
                    className="w-full h-full"
                    autoRotate={true}
                    cameraControls={true}
                  />
                ) : (
                  <LazyImage
                    src={mediaItems[currentImageIndex]?.src || images[0]}
                    alt={displayProduct.name}
                    className="w-full h-full"
                    objectFit="cover"
                  />
                )}
                
                {/* Navigation arrows for main image - larger touch targets on mobile */}
                {mediaItems.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute left-2 sm:left-2 top-1/2 -translate-y-1/2 p-2 sm:p-2 bg-white/90 hover:bg-white active:bg-white rounded-lg shadow-md transition-all z-10 touch-manipulation"
                      aria-label="Previous image"
                    >
                      <svg className="w-5 h-5 sm:w-5 sm:h-5 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-2 sm:right-2 top-1/2 -translate-y-1/2 p-2 sm:p-2 bg-white/90 hover:bg-white active:bg-white rounded-lg shadow-md transition-all z-10 touch-manipulation"
                      aria-label="Next image"
                    >
                      <svg className="w-5 h-5 sm:w-5 sm:h-5 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnail Carousel with scroll */}
              {mediaItems.length > 1 && (
                <div className="flex items-center gap-2">
                  {/* Scroll left button - outside carousel (hidden on mobile, show on larger screens when needed) */}
                  {mediaItems.length > 4 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        scrollThumbnails('left')
                      }}
                      className="hidden sm:flex flex-shrink-0 w-8 h-8 items-center justify-center bg-white hover:bg-brand-gray-50 rounded-lg shadow-md transition-all border border-brand-gray-200"
                      aria-label="Scroll thumbnails left"
                    >
                      <svg className="w-4 h-4 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Scrollable thumbnail container - touch scrollable on mobile */}
                  <div
                    ref={thumbnailContainerRef}
                    className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x"
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      WebkitOverflowScrolling: 'touch',
                    }}
                  >
                    {mediaItems.map((media, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-lg border-2 transition-colors snap-start touch-manipulation ${
                          currentImageIndex === idx
                            ? 'border-brand-blue-500'
                            : 'border-transparent hover:border-brand-gray-300 active:border-brand-gray-300'
                        }`}
                      >
                        {media.type === 'model3d' ? (
                          <>
                            <LazyImage
                              src={media.thumbnail || images[0]}
                              alt={media.alt || `${displayProduct.name} 3D Model`}
                              className="w-full h-full"
                              objectFit="cover"
                            />
                            {/* 3D Badge */}
                            <div className="absolute top-1 right-1 bg-brand-blue-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded z-10">
                              3D
                            </div>
                          </>
                        ) : (
                          <LazyImage
                            src={media.src}
                            alt={media.alt || `${displayProduct.name} view ${idx + 1}`}
                            className="w-full h-full"
                            objectFit="cover"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {/* Scroll right button - outside carousel (hidden on mobile, show on larger screens when needed) */}
                  {mediaItems.length > 4 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        scrollThumbnails('right')
                      }}
                      className="hidden sm:flex flex-shrink-0 w-8 h-8 items-center justify-center bg-white hover:bg-brand-gray-50 rounded-lg shadow-md transition-all border border-brand-gray-200"
                      aria-label="Scroll thumbnails right"
                    >
                      <svg className="w-4 h-4 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              {/* Brand & Name */}
              <div>
                {displayProduct.brand && (
                  <p className="text-xs text-brand-gray-500 uppercase tracking-wider mb-1">{displayProduct.brand}</p>
                )}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="text-2xl md:text-3xl font-medium text-brand-black tracking-tight flex-1">
                    {displayProduct.name}
                  </h2>
                  <Link
                    href={`/product/${displayProduct.id}`}
                    onClick={onClose}
                    className="flex-shrink-0 text-sm text-brand-blue-500 hover:text-brand-blue-600 font-medium underline underline-offset-2 transition-colors whitespace-nowrap"
                  >
                    View Details
                  </Link>
                </div>
                {/* SKU */}
                {displayProduct.sku && (
                  <p className="text-xs text-brand-gray-500 mb-2">
                    SKU: {displayProduct.sku}
                  </p>
                )}
                {/* Short Description */}
                {displayProduct.shortDescription && (
                  <p className="text-sm text-brand-gray-600 mb-3 leading-relaxed">
                    {displayProduct.shortDescription}
                  </p>
                )}
                {displayProduct.rating !== undefined && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                          <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(displayProduct.rating || 0)
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
                    <span className="text-sm text-brand-gray-600 underline decoration-dotted underline-offset-2">
                      {displayProduct.rating?.toFixed(1)} ({displayProduct.reviewCount?.toLocaleString() || 0})
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-semibold text-brand-black">
                    ${displayProduct.price.toFixed(2)}
                  </span>
                  {hasDiscount && displayProduct.originalPrice && (
                    <span className="text-base text-brand-gray-400 line-through">
                      ${displayProduct.originalPrice.toFixed(2)}
                    </span>
                  )}
                  {percentOffBadge !== null && percentOffBadge !== undefined && (
                    <span className="px-2 py-0.5 bg-brand-blue-100 text-brand-blue-700 text-xs font-medium rounded-md">
                      Save {percentOffBadge}%
                    </span>
                  )}
                </div>
                {displayProduct.storeAvailable && (
                  <p className="text-sm text-green-600 font-medium mt-1">Available for pickup in store</p>
                )}
                {/* Promotional Message */}
                {displayProduct.promotionalMessage && (
                  <p className="text-sm text-green-600 font-medium mt-2">
                    {displayProduct.promotionalMessage}
                  </p>
                )}
              </div>

              {/* Variant Selection - Size, Color, Capacity, Scent */}
              {variantGroups.map((group) => {
                const selectedValue = selectedValues[group.key]
                return (
                  <div key={group.key}>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                      {group.label}: {selectedValue || 'Select'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                      {group.options.map((option) => {
                        const isSelected = selectedValue === option.value
                        return (
                      <button
                            key={option.id}
                            onClick={() => handleOptionSelect(group.key, option.value)}
                            className={`min-w-[44px] px-3 py-2 text-sm border transition-colors capitalize rounded-lg ${
                              isSelected
                            ? 'bg-brand-blue-500 text-white border-brand-blue-500 shadow-sm'
                            : 'bg-white text-brand-black border-brand-gray-300 hover:border-brand-blue-500'
                        }`}
                      >
                            {option.value}
                      </button>
                        )
                      })}
                </div>
                  </div>
                )
              })}

              {/* Stock Status with Progress Bar */}
              <div className="space-y-1.5">
                {displayProduct.inStock && displayProduct.stockQuantity && displayProduct.stockQuantity > 0 ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        displayProduct.stockQuantity <= 10 ? 'bg-orange-500' : 'bg-green-500'
                      }`}></span>
                      <p className={`font-medium text-sm ${
                        displayProduct.stockQuantity <= 10 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {displayProduct.stockQuantity <= 10 
                          ? `Low Stock - Only ${displayProduct.stockQuantity} left` 
                          : 'In Stock'} ({displayProduct.stockQuantity} units) ready to be shipped
                      </p>
                    </div>
                    <div className="w-full bg-brand-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          displayProduct.stockQuantity <= 10 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((displayProduct.stockQuantity / 50) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <p className="text-red-500 font-medium text-sm">Out of Stock</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Actions */}
        <div className="flex-shrink-0 border-t border-brand-gray-200 p-4 sm:p-4 md:p-6 bg-white rounded-b-none sm:rounded-b-2xl safe-area-inset-bottom">
          {/* Quantity Selector */}
          {displayProduct.inStock && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-brand-black mb-2">Quantity</label>
              <div className="flex items-center border border-brand-gray-300 rounded-lg w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-brand-gray-600 hover:text-brand-black transition-colors"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="px-4 py-2 text-brand-black font-medium min-w-[2.5rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-brand-gray-600 hover:text-brand-black transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {!displayProduct.inStock ? (
              onNotify ? (
                <button
                  onClick={() => {
                    onNotify(displayProduct)
                    onClose()
                  }}
                  className="w-full sm:flex-1 bg-white text-brand-black border border-brand-gray-300 px-6 py-3.5 sm:py-3 text-sm font-medium hover:bg-brand-gray-50 active:bg-brand-gray-100 transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500 shadow-sm touch-manipulation"
                >
                  Notify me
                </button>
              ) : (
                <button
                  disabled
                  className="w-full sm:flex-1 bg-brand-gray-300 text-brand-gray-500 px-6 py-3.5 sm:py-3 text-sm font-medium rounded-lg cursor-not-allowed"
                >
                  Out of Stock
                </button>
              )
            ) : (
              <>
                <button
                  onClick={handleAddToCart}
                  className="w-full sm:flex-1 bg-brand-blue-500 text-white px-6 py-3.5 sm:py-3 text-sm font-medium hover:bg-brand-blue-600 active:bg-brand-blue-700 transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500 shadow-sm touch-manipulation"
                >
                  Add to cart
                </button>
                <button
                  onClick={() => onAddToWishlist(displayProduct, selectedValues.size, selectedValues.color)}
                  className="w-full sm:flex-1 bg-white text-brand-black border border-brand-gray-300 px-6 py-3.5 sm:py-3 text-sm font-medium hover:bg-brand-gray-50 active:bg-brand-gray-100 transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500 shadow-sm touch-manipulation"
                >
                  Buy it now
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
