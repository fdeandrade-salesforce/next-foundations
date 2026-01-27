'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Product } from './ProductListingPage'
import { getAllProducts } from '../lib/products'
import LazyImage from './LazyImage'
import Model3DViewer from './Model3DViewer'

// Media item type for gallery
interface MediaItem {
  type: 'image' | 'model3d'
  src: string
  alt?: string
  thumbnail?: string
}

interface EditCartItemModalProps {
  product: Product
  currentSize?: string
  currentColor?: string
  currentQuantity: number
  isOpen: boolean
  onClose: () => void
  onUpdate: (product: Product, size?: string, color?: string, quantity?: number) => void
}

export default function EditCartItemModal({
  product,
  currentSize,
  currentColor,
  currentQuantity,
  isOpen,
  onClose,
  onUpdate,
}: EditCartItemModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>(currentSize || product.size?.[0] || '')
  const [selectedColor, setSelectedColor] = useState<string>(currentColor || product.color || product.colors?.[0] || '')
  const [quantity, setQuantity] = useState<number>(currentQuantity)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [allProducts, setAllProducts] = useState<Product[]>([])

  // Load products for variants
  useEffect(() => {
    const loadProducts = async () => {
      const products = await getAllProducts()
      setAllProducts(products)
    }
    loadProducts()
  }, [])

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

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSize(currentSize || product.size?.[0] || '')
      setSelectedColor(currentColor || product.color || product.colors?.[0] || '')
      setQuantity(currentQuantity)
      setCurrentImageIndex(0)
    }
  }, [isOpen, currentSize, currentColor, currentQuantity, product])

  // Carousel navigation
  const thumbnailContainerRef = useRef<HTMLDivElement>(null)
  const mainImageRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  
  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (!thumbnailContainerRef.current) return
    
    const container = thumbnailContainerRef.current
    const scrollAmount = 100
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

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const distance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50
    
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        goToNext()
      } else {
        goToPrevious()
      }
    }
    
    touchStartX.current = 0
    touchEndX.current = 0
  }

  if (!isOpen) return null

  const handleUpdate = () => {
    onUpdate(currentVariant, selectedSize, selectedColor, quantity)
    onClose()
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
        {/* Close Button */}
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
              {/* Main Image/3D Model */}
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
                
                {/* Navigation arrows */}
                {mediaItems.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-lg shadow-md transition-all z-10"
                      aria-label="Previous image"
                    >
                      <svg className="w-5 h-5 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-lg shadow-md transition-all z-10"
                      aria-label="Next image"
                    >
                      <svg className="w-5 h-5 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnail Carousel */}
              {mediaItems.length > 1 && (
                <div className="flex items-center gap-2">
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
                  
                  <div
                    ref={thumbnailContainerRef}
                    className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    }}
                  >
                    {mediaItems.map((media, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-lg border-2 transition-colors ${
                          currentImageIndex === idx
                            ? 'border-brand-blue-500'
                            : 'border-transparent hover:border-brand-gray-300'
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
                <h2 className="text-2xl md:text-3xl font-medium text-brand-black tracking-tight mb-3">
                  {currentVariant.name}
                </h2>
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

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border border-brand-gray-300 rounded-lg hover:bg-brand-gray-50 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10)
                      if (!isNaN(value) && value > 0) {
                        setQuantity(value)
                      }
                    }}
                    className="w-20 text-center text-sm text-brand-black border border-brand-gray-300 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 border border-brand-gray-300 rounded-lg hover:bg-brand-gray-50 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Actions */}
        <div className="flex-shrink-0 border-t border-brand-gray-200 p-4 sm:p-6 bg-white rounded-b-none sm:rounded-b-2xl">
          <button
            onClick={handleUpdate}
            className="w-full bg-brand-blue-500 text-white px-6 py-3.5 text-sm font-medium hover:bg-brand-blue-600 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500 shadow-sm"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  )
}
