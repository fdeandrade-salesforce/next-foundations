'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Product } from './ProductListingPage'
import { addToCart } from '../lib/cart'
import LazyImage from './LazyImage'
import Model3DViewer from './Model3DViewer'

// Media item type for gallery
interface MediaItem {
  type: 'image' | 'model3d'
  src: string
  alt?: string
  thumbnail?: string
}

interface QuickViewModalProps {
  product: Product
  allProducts?: Product[] // All products to find color variants
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product, size?: string, color?: string) => void
  onAddToWishlist: (product: Product) => void
}

export default function QuickViewModal({
  product,
  allProducts = [],
  isOpen,
  onClose,
  onAddToCart,
  onAddToWishlist,
}: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product.size?.[0] || '')
  const [selectedColor, setSelectedColor] = useState<string>(product.color || product.colors?.[0] || '')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Find variant products by matching product name
  const variantProducts = useMemo(() => {
    if (!allProducts.length || !product.colors || product.colors.length <= 1) {
      return {}
    }
    
    const variants: Record<string, Product> = {}
    
    // Find products with the same name but different colors
    allProducts.forEach((p) => {
      if (p.name === product.name && p.color) {
        variants[p.color] = p
      }
    })
    
    return variants
  }, [allProducts, product.name, product.colors])

  // Get current variant based on selected color
  const currentVariant = useMemo(() => {
    if (selectedColor && variantProducts[selectedColor]) {
      return variantProducts[selectedColor]
    }
    return product
  }, [selectedColor, variantProducts, product])

  // Mapping of product IDs to their 3D model GLB files
  const product3DModels: Record<string, string> = {
    'pure-cube-white': 'Pure Cube White.glb',
    'pure-cube-black': 'Black Pure Box.glb',
    'pure-cube-gray': 'Gray Pure Box.glb',
    'steady-prism': 'Steady Prism.glb',
    'spiral-accent': 'Spiral Accent.glb',
    'vertical-set': 'Vertical Set.glb',
  }

  // Get images for current variant
  const images = useMemo(() => {
    return currentVariant.images || [currentVariant.image]
  }, [currentVariant])

  // Check if this variant has a 3D model
  const has3DModel = product3DModels[currentVariant.id] !== undefined
  const model3DFile = has3DModel ? product3DModels[currentVariant.id] : null

  // Combine images and 3D model into media items
  const mediaItems: MediaItem[] = useMemo(() => {
    const items: MediaItem[] = [
      ...images.map((src): MediaItem => ({ type: 'image', src, alt: currentVariant.name })),
    ]
    // Add 3D model last if available
    if (has3DModel && model3DFile) {
      items.push({
        type: 'model3d',
        src: `/models/${model3DFile}`,
        alt: `${currentVariant.name} 3D Model`,
        thumbnail: images[0],
      })
    }
    return items
  }, [images, has3DModel, model3DFile, currentVariant.name])

  // Reset image index when variant changes
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [selectedColor])

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

  // Reset state when product changes
  useEffect(() => {
    setSelectedSize(product.size?.[0] || '')
    setSelectedColor(product.color || product.colors?.[0] || '')
    setCurrentImageIndex(0)
  }, [product])

  if (!isOpen) return null

  const handleAddToCart = () => {
    addToCart(currentVariant, 1, selectedSize, selectedColor)
    onAddToCart(currentVariant, selectedSize, selectedColor)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-none sm:rounded-2xl shadow-xl max-w-5xl w-full h-full sm:h-auto sm:max-h-[90vh] flex flex-col">
        {/* Close Button - Fixed position outside scroll */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors shadow-sm"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                {mediaItems[currentImageIndex]?.type === 'model3d' ? (
                  <Model3DViewer
                    src={mediaItems[currentImageIndex].src}
                    alt={mediaItems[currentImageIndex].alt || currentVariant.name}
                    className="w-full h-full"
                    autoRotate={true}
                    cameraControls={true}
                  />
                ) : (
                  <LazyImage
                    src={mediaItems[currentImageIndex]?.src || images[0]}
                    alt={currentVariant.name}
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
                              alt={media.alt || `${currentVariant.name} 3D Model`}
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
                            alt={media.alt || `${currentVariant.name} view ${idx + 1}`}
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
                {currentVariant.brand && (
                  <p className="text-xs text-brand-gray-500 uppercase tracking-wider mb-1">{currentVariant.brand}</p>
                )}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="text-2xl md:text-3xl font-medium text-brand-black tracking-tight flex-1">
                    {currentVariant.name}
                  </h2>
                  <Link
                    href={`/product/${currentVariant.id}`}
                    onClick={onClose}
                    className="flex-shrink-0 text-sm text-brand-blue-500 hover:text-brand-blue-600 font-medium underline underline-offset-2 transition-colors whitespace-nowrap"
                  >
                    View Details
                  </Link>
                </div>
                {currentVariant.rating !== undefined && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(currentVariant.rating || 0)
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
                    <span className="text-sm text-brand-gray-600 underline decoration-dotted underline-offset-2">
                      {currentVariant.rating?.toFixed(1)} ({currentVariant.reviewCount?.toLocaleString() || 0})
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-semibold text-brand-black">
                    ${currentVariant.price.toFixed(2)}
                  </span>
                  {currentVariant.originalPrice && currentVariant.originalPrice > currentVariant.price && (
                    <span className="text-base text-brand-gray-400 line-through">
                      ${currentVariant.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                {currentVariant.storeAvailable && (
                  <p className="text-sm text-green-600 font-medium mt-1">Available for pickup in store</p>
                )}
              </div>

              {/* Size Selection */}
              {product.size && product.size.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Size: {selectedSize}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.size.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[44px] px-3 py-2 text-sm border transition-colors rounded-lg ${
                          selectedSize === size
                            ? 'bg-brand-blue-500 text-white border-brand-blue-500 shadow-sm'
                            : 'bg-white text-brand-black border-brand-gray-300 hover:border-brand-blue-500'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {(product.colors && product.colors.length > 0) && (
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Color: {selectedColor}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`min-w-[44px] px-3 py-2 text-sm border transition-colors capitalize rounded-lg ${
                          selectedColor === color
                            ? 'bg-brand-blue-500 text-white border-brand-blue-500 shadow-sm'
                            : 'bg-white text-brand-black border-brand-gray-300 hover:border-brand-blue-500'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Status with Progress Bar */}
              <div className="space-y-1.5">
                {currentVariant.inStock && currentVariant.stockQuantity && currentVariant.stockQuantity > 0 ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        currentVariant.stockQuantity <= 10 ? 'bg-orange-500' : 'bg-green-500'
                      }`}></span>
                      <p className={`font-medium text-sm ${
                        currentVariant.stockQuantity <= 10 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {currentVariant.stockQuantity <= 10 
                          ? `Low Stock - Only ${currentVariant.stockQuantity} left` 
                          : 'In Stock'} ({currentVariant.stockQuantity} units) ready to be shipped
                      </p>
                    </div>
                    <div className="w-full bg-brand-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          currentVariant.stockQuantity <= 10 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((currentVariant.stockQuantity / 50) * 100, 100)}%` }}
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
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              className="w-full sm:flex-1 bg-brand-blue-500 text-white px-6 py-3.5 sm:py-3 text-sm font-medium hover:bg-brand-blue-600 active:bg-brand-blue-700 transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500 shadow-sm touch-manipulation"
            >
              Add to cart
            </button>
            <button
              onClick={() => onAddToWishlist(currentVariant)}
              className="w-full sm:flex-1 bg-white text-brand-black border border-brand-gray-300 px-6 py-3.5 sm:py-3 text-sm font-medium hover:bg-brand-gray-50 active:bg-brand-gray-100 transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500 shadow-sm touch-manipulation"
            >
              Buy it now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
