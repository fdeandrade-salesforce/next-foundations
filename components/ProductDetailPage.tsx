'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Product } from './ProductListingPage'
import ProductCard from './ProductCard'
import Navigation from './Navigation'
import Footer from './Footer'
import AnnouncementBar from './AnnouncementBar'
import ImageZoom from './ImageZoom'
import ReviewSection from './ReviewSection'
import StoreLocatorModal from './StoreLocatorModal'
import LazyImage from './LazyImage'
import Model3DViewer from './Model3DViewer'
import FulfillmentModal from './FulfillmentModal'
import ReturnsWarrantyModal from './ReturnsWarrantyModal'
import PayPalModal from './PayPalModal'
import SizeGuideModal from './SizeGuideModal'
import { addToCart } from '../lib/cart'

// Media item type for gallery
interface MediaItem {
  type: 'image' | 'video' | 'model3d'
  src: string
  thumbnail?: string
  alt?: string
}

// Extended product type for PDP
interface PDPProduct extends Product {
  description?: string
  keyBenefits?: string[]
  ingredients?: string[]
  usageInstructions?: string[]
  careInstructions?: string[]
  technicalSpecs?: Record<string, string>
  scents?: string[]
  capacities?: string[]
  deliveryEstimate?: string
  returnsPolicy?: string
  warranty?: string
  videos?: string[]
}

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

interface ProductDetailPageProps {
  product: PDPProduct
  suggestedProducts?: Product[]
  recentlyViewed?: Product[]
  reviews?: Review[]
  allProducts?: Product[]
}

// Mock reviews data
const mockReviews: Review[] = [
  {
    id: '1',
    author: 'Name A.',
    rating: 5,
    date: 'June 2022',
    title: 'Excellent quality',
    content: 'Absolutely love this product! The quality is outstanding and it looks even better in person. Highly recommend to anyone looking for premium design.',
    verified: true,
    helpful: 24,
  },
  {
    id: '2',
    author: 'Sarah M.',
    rating: 4,
    date: 'May 2022',
    title: 'Great design',
    content: 'Beautiful geometric form that fits perfectly in my living space. The craftsmanship is impeccable. Only giving 4 stars because shipping took a bit longer than expected.',
    verified: true,
    helpful: 18,
  },
  {
    id: '3',
    author: 'John D.',
    rating: 5,
    date: 'April 2022',
    title: 'Perfect addition',
    content: 'Exactly what I was looking for. The minimalist design adds elegance to any room. Worth every penny!',
    verified: false,
    helpful: 12,
  },
  {
    id: '4',
    author: 'Emily R.',
    rating: 5,
    date: 'March 2022',
    title: 'Stunning piece',
    content: 'This exceeded my expectations. The attention to detail is remarkable and it photographs beautifully. Already planning to buy more from this collection.',
    verified: true,
    helpful: 31,
  },
  {
    id: '5',
    author: 'Michael T.',
    rating: 3,
    date: 'February 2022',
    title: 'Good but pricey',
    content: 'Nice quality overall but I expected more for the price. The finish could be smoother in some areas.',
    verified: true,
    helpful: 8,
  },
  {
    id: '6',
    author: 'Lisa K.',
    rating: 5,
    date: 'January 2022',
    title: 'Love it!',
    content: 'Perfect for my modern apartment. Gets compliments from everyone who visits. The size is just right.',
    verified: true,
    helpful: 15,
  },
  {
    id: '7',
    author: 'David W.',
    rating: 4,
    date: 'December 2021',
    title: 'Solid purchase',
    content: 'Well made and looks great. Packaging was excellent and it arrived without any damage.',
    verified: false,
    helpful: 6,
  },
  {
    id: '8',
    author: 'Anna P.',
    rating: 2,
    date: 'November 2021',
    title: 'Not as expected',
    content: 'The color was slightly different from the photos. Otherwise the quality is decent.',
    verified: true,
    helpful: 4,
  },
]

// Accordion Component
function Accordion({ 
  title, 
  children, 
  defaultOpen = false 
}: { 
  title: string
  children: React.ReactNode
  defaultOpen?: boolean 
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-brand-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left hover:bg-brand-gray-50 transition-colors"
      >
        <span className="text-base font-medium text-brand-black">{title}</span>
        <svg
          className={`w-5 h-5 text-brand-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-brand-gray-600 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  )
}

// Star Rating Component
function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`${sizeClasses[size]} ${
            i < Math.floor(rating)
              ? 'text-yellow-400 fill-current'
              : i < rating
              ? 'text-yellow-400 fill-current opacity-50'
              : 'text-brand-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function ProductDetailPage({
  product,
  suggestedProducts = [],
  recentlyViewed = [],
  reviews = mockReviews,
  allProducts = [],
}: ProductDetailPageProps) {
  const router = useRouter()
  const [selectedSize, setSelectedSize] = useState<string>(product.size?.[0] || '')
  const [selectedColor, setSelectedColor] = useState<string>(product.color || product.colors?.[0] || '')
  const [selectedScent, setSelectedScent] = useState<string>(product.scents?.[0] || '')
  const [selectedCapacity, setSelectedCapacity] = useState<string>(product.capacities?.[0] || 'Standard')
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Find variant products by matching product name (same logic as QuickViewModal)
  const variantProducts = useMemo(() => {
    if (!allProducts.length || !product.colors || product.colors.length <= 1) {
      return {}
    }
    
    const variants: Record<string, Product> = {}
    
    // Find products with the same base name but different colors
    const baseName = product.name.replace(/\s+(White|Black|Gray|Charcoal|Silver|Ivory|Natural|Ware)$/i, '')
    
    allProducts.forEach((p) => {
      if (p.color && p.name.startsWith(baseName)) {
        variants[p.color] = p
      }
    })
    
    return variants
  }, [allProducts, product])
  
  // Get current variant based on selected color
  const currentVariant = useMemo(() => {
    if (selectedColor && variantProducts[selectedColor]) {
      return variantProducts[selectedColor] as PDPProduct
    }
    return product
  }, [selectedColor, variantProducts, product])
  
  // Reset image index when variant changes
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [selectedColor])
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [showVirtualTryOn, setShowVirtualTryOn] = useState(false)
  const [showStoreLocator, setShowStoreLocator] = useState(false)
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'delivery' | 'pickup'>('delivery')
  const [deliveryZipCode, setDeliveryZipCode] = useState('94123')
  const [shareSuccess, setShareSuccess] = useState(false)
  const [showPayPalModal, setShowPayPalModal] = useState(false)
  const [showFulfillmentModal, setShowFulfillmentModal] = useState(false)
  const [showReturnsWarrantyModal, setShowReturnsWarrantyModal] = useState(false)

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} - $${product.price.toFixed(2)}`,
      url: window.location.href,
    }

    try {
      // Try native Web Share API first
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
      } else {
        // Fallback: Copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href)
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 2000)
      }
    } catch (error) {
      // If share was cancelled or failed, try clipboard
      if ((error as Error).name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(window.location.href)
          setShareSuccess(true)
          setTimeout(() => setShareSuccess(false), 2000)
        } catch {
          console.error('Failed to share or copy:', error)
        }
      }
    }
  }
  const [selectedStore, setSelectedStore] = useState<{
    id: string
    name: string
    address: string
    pickupTime: string | null
  } | null>(null)

  // Use currentVariant for images and pricing
  const images = currentVariant.images || [currentVariant.image]
  const videos = (currentVariant as PDPProduct).videos || []
  
  // Mapping of product IDs to their 3D model GLB files
  const product3DModels: Record<string, string> = {
    'pure-cube-white': 'Pure Cube White.glb',
    'pure-cube-black': 'Black Pure Box.glb', // File name: "Black Pure Box.glb"
    'pure-cube-gray': 'Gray Pure Box.glb', // File name: "Gray Pure Box.glb"
    'steady-prism': 'Steady Prism.glb',
    'spiral-accent': 'Spiral Accent.glb',
    'vertical-set': 'Vertical Set.glb',
  }
  
  // Check if this product has a 3D model - use currentVariant.id to get the correct 3D model for the variant
  const has3DModel = product3DModels[currentVariant.id] !== undefined
  const model3DFile = has3DModel ? product3DModels[currentVariant.id] : null
  
  // Combine images, videos, and 3D model into a single media array
  // 3D model is added last
  const mediaItems: MediaItem[] = [
    ...images.map((src): MediaItem => ({ type: 'image', src, alt: currentVariant.name })),
    ...videos.map((src): MediaItem => ({ type: 'video', src, thumbnail: src })),
    // Add 3D model last if available
    ...(has3DModel && model3DFile ? [{ 
      type: 'model3d' as const, 
      src: `/models/${model3DFile}`, 
      alt: `${currentVariant.name} 3D Model`,
      thumbnail: images[0] // Use first product image as thumbnail
    }] : []),
  ]
  
  const hasDiscount = currentVariant.originalPrice && currentVariant.originalPrice > currentVariant.price
  const discountPercentage = hasDiscount
    ? Math.round(((currentVariant.originalPrice! - currentVariant.price) / currentVariant.originalPrice!) * 100)
    : null
  
  // State for video playback
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  // Stock status - use currentVariant for accurate stock info
  const getStockStatus = () => {
    if (!currentVariant.inStock || currentVariant.stockQuantity === 0) {
      return { label: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-50', dotColor: 'bg-red-500' }
    }
    if (currentVariant.stockQuantity && currentVariant.stockQuantity <= 10) {
      return { label: `Low Stock - Only ${currentVariant.stockQuantity} left`, color: 'text-orange-600', bgColor: 'bg-orange-50', dotColor: 'bg-orange-500' }
    }
    return { label: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-50', dotColor: 'bg-green-500' }
  }

  const stockStatus = getStockStatus()

  // Generate breadcrumbs
  const breadcrumbs = [
    { label: 'Breadcrumbs', href: '/' },
    { label: product.category, href: `/${product.category.toLowerCase()}` },
    { label: product.subcategory, href: `/${product.category.toLowerCase()}/${product.subcategory.toLowerCase()}` },
    { label: product.name, href: '#' },
  ]

  // Default product details
  const description = product.description || `Crafted from premium leather with a modern twist on the classic contrast boot silhouette. These ankle boots feature a sleek profile with functional lace-up closure and side zip for easy wear. Perfect for both casual and elevated looks.`

  const keyBenefits = product.keyBenefits || [
    'Hydration',
    'Anti-aging',
    'Brightening',
  ]

  const features = [
    'Premium full-grain leather upper',
    'Cushioned leather insole',
    'Anti-aging and ceratontier tight crthenis',
    'Durable rubber outsole',
    'Lace-up front',
    "1.5\" heel height",
  ]

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-brand-gray-500 mb-6">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span>&gt;</span>}
              <a href={crumb.href} className="hover:text-brand-blue-500 transition-colors">
                {crumb.label}
              </a>
            </React.Fragment>
          ))}
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Image Gallery (Sticky) */}
          <div className="lg:self-start lg:sticky lg:top-4">
            <div className="space-y-4">
              {/* Main Image/Video/3D Model Display */}
              <div className="relative">
                {mediaItems[currentImageIndex]?.type === 'model3d' ? (
                  <div className="relative aspect-square bg-brand-gray-100 rounded-2xl overflow-hidden">
                    <Model3DViewer
                      src={mediaItems[currentImageIndex].src}
                      alt={mediaItems[currentImageIndex].alt || product.name}
                      className="w-full h-full"
                      autoRotate={true}
                      cameraControls={true}
                    />
                  </div>
                ) : mediaItems[currentImageIndex]?.type === 'video' ? (
                  <div className="relative aspect-square bg-brand-gray-100 rounded-2xl overflow-hidden">
                    <video
                      ref={videoRef}
                      src={mediaItems[currentImageIndex].src}
                      className="w-full h-full object-cover"
                      controls={isVideoPlaying}
                      loop
                      playsInline
                      onClick={() => {
                        if (videoRef.current) {
                          if (isVideoPlaying) {
                            videoRef.current.pause()
                          } else {
                            videoRef.current.play()
                          }
                          setIsVideoPlaying(!isVideoPlaying)
                        }
                      }}
                    />
                    {!isVideoPlaying && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer transition-opacity hover:bg-black/30"
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.play()
                            setIsVideoPlaying(true)
                          }
                        }}
                      >
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-8 h-8 text-brand-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <ImageZoom
                    src={mediaItems[currentImageIndex]?.src || images[0]}
                    alt={product.name}
                  />
                )}
                
                {/* Navigation arrows for main image */}
                {mediaItems.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all z-10"
                      aria-label="Previous image"
                    >
                      <svg className="w-6 h-6 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev + 1) % mediaItems.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all z-10"
                      aria-label="Next image"
                    >
                      <svg className="w-6 h-6 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {mediaItems.map((media, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentImageIndex(idx)
                      setIsVideoPlaying(false)
                    }}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all relative ${
                      currentImageIndex === idx
                        ? 'border-brand-blue-500'
                        : 'border-transparent hover:border-brand-gray-300'
                    }`}
                  >
                    {media.type === 'model3d' ? (
                      <>
                        {/* Use product image as thumbnail with 3D badge */}
                        <LazyImage
                          src={media.thumbnail || images[0]}
                          alt={media.alt || `${product.name} 3D Model`}
                          className="w-full h-full"
                          objectFit="cover"
                        />
                        {/* 3D Badge overlay */}
                        <div className="absolute top-1 right-1 bg-brand-blue-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                          3D
                        </div>
                      </>
                    ) : media.type === 'video' ? (
                      <>
                        <video src={media.src} className="w-full h-full object-cover" muted />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </>
                    ) : (
                      <LazyImage
                        src={media.src}
                        alt={media.alt || `${product.name} view ${idx + 1}`}
                        className="w-full h-full"
                        objectFit="cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-5">
            {/* Brand & Title Group */}
            <div>
              {product.brand && (
                <p className="text-xs text-brand-gray-500 uppercase tracking-wider mb-1">{product.brand}</p>
              )}
              <h1 className="text-2xl lg:text-3xl font-medium text-brand-black tracking-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating with Hover Tooltip */}
            {currentVariant.rating !== undefined && (
              <div className="relative group">
                <button 
                  onClick={() => {
                    const reviewsSection = document.getElementById('reviews-section')
                    if (reviewsSection) {
                      reviewsSection.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <StarRating rating={currentVariant.rating} size="md" />
                  <span className="text-sm text-brand-gray-600 underline decoration-dotted underline-offset-2">
                    {currentVariant.rating.toFixed(1)} ({currentVariant.reviewCount?.toLocaleString() || 0})
                  </span>
                </button>
                
                {/* Rating Breakdown Tooltip */}
                <div className="absolute left-0 top-full mt-2 bg-white border border-brand-gray-200 rounded-xl shadow-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 w-64">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-brand-black">
                      {currentVariant.rating.toFixed(1)} out of 5 stars
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        const reviewsSection = document.getElementById('reviews-section')
                        if (reviewsSection) {
                          reviewsSection.scrollIntoView({ behavior: 'smooth' })
                        }
                      }}
                      className="text-brand-gray-400 hover:text-brand-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-2">
                    <StarRating rating={currentVariant.rating} size="sm" />
                    <span className="text-lg font-semibold text-brand-black ml-1">
                      {currentVariant.rating.toFixed(1)} out of 5
                    </span>
                  </div>
                  
                  <p className="text-xs text-brand-gray-500 mb-4">
                    Based on {(currentVariant.reviewCount || 0).toLocaleString()} reviews
                  </p>
                  
                  {/* Rating Bars */}
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      // Simulated distribution based on average rating
                      const distributions: Record<number, number[]> = {
                        5: [73, 11, 4, 3, 9],
                        4: [45, 35, 10, 5, 5],
                        3: [20, 25, 30, 15, 10],
                      }
                      const ratingFloor = Math.floor(currentVariant.rating || 4)
                      const dist = distributions[Math.min(5, Math.max(3, ratingFloor))] || distributions[4]
                      const percentage = dist[5 - star]
                      // Calculate count based on percentage
                      const totalReviews = currentVariant.reviewCount || 0
                      const count = Math.round((percentage / 100) * totalReviews)
                      
                      return (
                        <div key={star} className="flex items-center gap-2 text-sm">
                          <span className="w-3 text-brand-gray-600">{star}</span>
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
                    })}
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      const reviewsSection = document.getElementById('reviews-section')
                      if (reviewsSection) {
                        reviewsSection.scrollIntoView({ behavior: 'smooth' })
                      }
                    }}
                    className="mt-4 text-sm text-brand-blue-600 hover:text-brand-blue-700 hover:underline"
                  >
                    See customer reviews &gt;
                  </button>
                </div>
              </div>
            )}

            {/* Price & Stock Group */}
            <div className="space-y-3">
              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-2xl font-semibold text-brand-black">
                  ${currentVariant.price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-brand-gray-400 line-through">
                      ${currentVariant.originalPrice!.toFixed(2)}
                    </span>
                    <span className="px-2 py-0.5 bg-brand-blue-100 text-brand-blue-700 text-xs font-medium rounded-md">
                      Save {discountPercentage}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status with Progress Bar */}
              <div className="space-y-1.5">
                {currentVariant.inStock && currentVariant.stockQuantity && currentVariant.stockQuantity > 0 ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${stockStatus.dotColor}`}></span>
                      <p className={`${stockStatus.color} font-medium text-sm`}>
                        {stockStatus.label} ({currentVariant.stockQuantity} units) ready to be shipped
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

            {/* Divider */}
            <hr className="border-brand-gray-200" />

            {/* Variant Selection Group */}
            <div className="space-y-4">
              {/* Size Selection */}
              {product.size && product.size.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-brand-black">Size: {selectedSize}</label>
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      className="text-sm text-brand-blue-500 hover:text-brand-blue-600"
                    >
                      EU Size Guide
                    </button>
                  </div>
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
              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Color: {selectedColor}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => {
                      const variantProduct = variantProducts[color]
                      return (
                      <button
                        key={color}
                        onClick={() => {
                          // Navigate to the variant's URL if it exists
                          if (variantProduct && variantProduct.id !== product.id) {
                            router.push(`/product/${variantProduct.id}`)
                          } else {
                            setSelectedColor(color)
                          }
                        }}
                        className={`px-3 py-2 text-sm border transition-colors rounded-lg capitalize ${
                          selectedColor === color
                            ? 'bg-brand-blue-500 text-white border-brand-blue-500 shadow-sm'
                            : 'bg-white text-brand-black border-brand-gray-300 hover:border-brand-blue-500'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-brand-gray-300"
                            style={{
                              backgroundColor:
                                color.toLowerCase() === 'white' ? '#fff' :
                                color.toLowerCase() === 'black' ? '#000' :
                                color.toLowerCase() === 'gray' ? '#6b7280' :
                                color.toLowerCase() === 'charcoal' ? '#36454F' :
                                color.toLowerCase() === 'silver' ? '#C0C0C0' :
                                color.toLowerCase() === 'ivory' ? '#FFFFF0' :
                                color.toLowerCase() === 'natural' ? '#FAF0E6' :
                                color.toLowerCase() === 'ware' ? '#D2B48C' : '#ccc',
                            }}
                          />
                          {color}
                        </span>
                      </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Virtual Try-On */}
              <button
                onClick={() => setShowVirtualTryOn(true)}
                className="w-full border border-dashed border-brand-blue-300 bg-brand-blue-50/50 rounded-lg p-3 flex items-center gap-3 hover:border-brand-blue-500 hover:bg-brand-blue-50 transition-colors text-left"
              >
                <div className="w-8 h-8 bg-brand-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-brand-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-blue-700">Try it on virtually</p>
                  <p className="text-xs text-brand-blue-500">See how this color looks in your space</p>
                </div>
                <svg className="w-4 h-4 text-brand-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Capacity Selection */}
              {product.capacities && product.capacities.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">Capacity</label>
                  <div className="flex items-center gap-4">
                    {['Standard', 'Plus', 'Family Pack'].map((cap) => (
                      <label key={cap} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="capacity"
                          checked={selectedCapacity === cap}
                          onChange={() => setSelectedCapacity(cap)}
                          className="w-4 h-4 text-brand-blue-500 focus:ring-brand-blue-500"
                        />
                        <span className="text-sm text-brand-black">{cap}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation Message */}
              {(!selectedSize || !selectedColor) && (
                <p className="text-sm text-brand-gray-400 italic">
                  Please select all your options above
                </p>
              )}
            </div>

            {/* Fulfillment Options - Delivery or Pickup */}
            <div className="space-y-2">
              {/* Delivery Option */}
              <button
                onClick={() => setFulfillmentMethod('delivery')}
                className={`w-full flex items-start gap-3 p-4 rounded-lg border transition-colors text-left ${
                  fulfillmentMethod === 'delivery'
                    ? 'border-brand-blue-500 bg-brand-blue-50/30'
                    : 'border-brand-gray-200 hover:border-brand-gray-300'
                }`}
              >
                {/* Radio Circle */}
                <div className="mt-0.5 shrink-0">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      fulfillmentMethod === 'delivery'
                        ? 'border-brand-blue-500'
                        : 'border-brand-gray-300'
                    }`}
                  >
                    {fulfillmentMethod === 'delivery' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-blue-500" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-brand-black">Deliver to</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // In real app, this would open a zip code modal
                        const newZip = prompt('Enter zip code:', deliveryZipCode)
                        if (newZip) setDeliveryZipCode(newZip)
                      }}
                      className="text-sm text-brand-blue-500 underline hover:text-brand-blue-600"
                    >
                      {deliveryZipCode}
                    </button>
                  </div>
                  <p className="text-sm text-brand-gray-600 mt-0.5">Shipping in 3-7 Business days</p>
                </div>
              </button>

              {/* Pickup Option */}
              <button
                onClick={() => {
                  setFulfillmentMethod('pickup')
                  if (!selectedStore) {
                    setShowStoreLocator(true)
                  }
                }}
                className={`w-full flex items-start gap-3 p-4 rounded-lg border transition-colors text-left ${
                  fulfillmentMethod === 'pickup'
                    ? 'border-brand-blue-500 bg-brand-blue-50/30'
                    : 'border-brand-gray-200 hover:border-brand-gray-300'
                }`}
              >
                {/* Radio Circle */}
                <div className="mt-0.5 shrink-0">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      fulfillmentMethod === 'pickup'
                        ? 'border-brand-blue-500'
                        : 'border-brand-gray-300'
                    }`}
                  >
                    {fulfillmentMethod === 'pickup' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-blue-500" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  {selectedStore ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-brand-black">Pickup at</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowStoreLocator(true)
                          }}
                          className="text-sm text-brand-blue-500 underline hover:text-brand-blue-600"
                        >
                          {selectedStore.name}
                        </button>
                      </div>
                      {selectedStore.pickupTime && (
                        <p className="text-sm text-brand-gray-600 mt-0.5">{selectedStore.pickupTime}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-brand-gray-600">Pickup unavailable at</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowStoreLocator(true)
                          }}
                          className="text-sm text-brand-blue-500 underline hover:text-brand-blue-600"
                        >
                          Burlington Mall
                        </button>
                      </div>
                      <p className="text-sm text-brand-blue-500 mt-0.5">Try another store or select delivery.</p>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Quantity Selector */}
            <div>
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

            {/* Add to Cart Button */}
            <button
              onClick={() => {
                if (currentVariant.inStock) {
                  addToCart(currentVariant, quantity, selectedSize, selectedColor)
                }
              }}
              disabled={!currentVariant.inStock}
              className={`w-full py-3.5 px-6 font-medium text-base rounded-lg transition-colors ${
                currentVariant.inStock
                  ? 'bg-brand-blue-500 text-white hover:bg-brand-blue-600'
                  : 'bg-brand-gray-300 text-brand-gray-500 cursor-not-allowed'
              }`}
            >
              Add to cart
            </button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button className="py-3 px-4 border border-brand-gray-300 text-brand-black font-medium rounded-lg hover:bg-brand-gray-50 transition-colors flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Wishlist
              </button>
              <button 
                onClick={handleShare}
                className={`py-3 px-4 border font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  shareSuccess 
                    ? 'border-green-500 text-green-600 bg-green-50' 
                    : 'border-brand-gray-300 text-brand-black hover:bg-brand-gray-50'
                }`}
              >
                {shareSuccess ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </>
                )}
              </button>
            </div>

            {/* PayPal Pay in 4 */}
            <div className="text-sm text-brand-gray-600">
              <span>Pay in 4 interest-free payments of </span>
              <span className="font-semibold text-brand-black">${(currentVariant.price / 4).toFixed(2)}</span>
              <span> with </span>
              <span className="font-bold text-[#003087]">Pay</span>
              <span className="font-bold text-[#0070ba]">Pal</span>
              <span>. </span>
              <button 
                onClick={() => setShowPayPalModal(true)}
                className="text-brand-blue-500 hover:underline"
              >
                Learn more
              </button>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-12">
          {/* Left - Description & Features */}
          <div className="space-y-6">
            <Accordion title="Description" defaultOpen>
              <p className="mb-4">{description}</p>
              <ul className="list-disc list-inside space-y-1 text-brand-gray-600">
                {features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </Accordion>

            {/* Key Benefits */}
            <div className="py-4">
              <h3 className="text-base font-medium text-brand-black mb-4">Key Benefits</h3>
              <div className="flex items-center gap-8">
                {keyBenefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-brand-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-brand-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Free Shipping Banner */}
            <div className="bg-brand-blue-50 border border-brand-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-brand-blue-800">Free Shipping</p>
              <p className="text-xs text-brand-blue-600">Orders over $50 ship free worldwide.</p>
              <p className="text-xs text-brand-blue-600">Returns accepted within 30 days.</p>
            </div>

            {/* Fulfillment Info */}
            <div className="grid grid-cols-2 gap-6 py-4 border-t border-brand-gray-200">
              <div>
                <h4 className="text-sm font-medium text-brand-black mb-1">Fulfillment</h4>
                <p className="text-xs text-brand-gray-600">Estimated delivery: Sep 15-16</p>
                <p className="text-xs text-brand-gray-600">Shipping options: $5.99</p>
                <button 
                  onClick={() => setShowFulfillmentModal(true)}
                  className="text-xs text-brand-blue-500 hover:underline"
                >
                  Learn More
                </button>
              </div>
              <div>
                <h4 className="text-sm font-medium text-brand-black mb-1">Returns & Warranty</h4>
                <p className="text-xs text-brand-gray-600">30-Day Returns</p>
                <p className="text-xs text-brand-gray-600">Warranty: 1 year</p>
                <button 
                  onClick={() => setShowReturnsWarrantyModal(true)}
                  className="text-xs text-brand-blue-500 hover:underline"
                >
                  View Policies
                </button>
              </div>
            </div>
          </div>

          {/* Right - Structured Content Accordions (Sticky) */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <Accordion title="Ingredients & Materials">
              <ul className="list-disc list-inside space-y-1">
                <li>Premium full-grain leather upper</li>
                <li>Cushioned leather insole</li>
                <li>Durable rubber outsole</li>
                <li>Metal hardware accents</li>
              </ul>
            </Accordion>
            <Accordion title="Usage Instructions">
              <p>For best results, condition leather regularly with a quality leather conditioner. Avoid prolonged exposure to water and direct sunlight.</p>
            </Accordion>
            <Accordion title="Care Instructions">
              <ul className="list-disc list-inside space-y-1">
                <li>Clean with a soft, dry cloth</li>
                <li>Use leather conditioner monthly</li>
                <li>Store in a cool, dry place</li>
                <li>Use shoe trees to maintain shape</li>
              </ul>
            </Accordion>
            <Accordion title="Technical Specs">
              <div className="grid grid-cols-2 gap-2">
                <p>Heel Height:</p><p>1.5 inches</p>
                <p>Material:</p><p>Full-grain leather</p>
                <p>Sole:</p><p>Rubber</p>
                <p>Closure:</p><p>Lace-up with side zip</p>
              </div>
            </Accordion>
          </div>
        </div>

        {/* Reviews Section */}
        <div id="reviews-section">
          <ReviewSection
            productId={currentVariant.id}
            productName={currentVariant.name}
            reviews={reviews}
            averageRating={currentVariant.rating || 4.5}
            totalReviews={currentVariant.reviewCount || reviews.length}
          />
        </div>

        {/* Complete the Look */}
        {suggestedProducts.length > 0 && (
          <section className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-medium text-brand-black">Complete the look</h2>
              <p className="text-sm text-brand-gray-600 mt-1">Description</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {suggestedProducts.slice(0, 4).map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onAddToCart={(product) => addToCart(product, 1)}
                  showQuickAdd
                />
              ))}
            </div>
          </section>
        )}

        {/* You May Also Like */}
        {suggestedProducts.length > 4 && (
          <section className="mt-16 bg-brand-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-medium text-brand-black">You may also like</h2>
              <p className="text-sm text-brand-gray-600 mt-1">Description</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {suggestedProducts.slice(4, 8).map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onAddToCart={(product) => addToCart(product, 1)}
                  showQuickAdd
                />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-medium text-brand-black">Recently viewed</h2>
              <p className="text-sm text-brand-gray-600 mt-1">Description</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {recentlyViewed.slice(0, 5).map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onAddToCart={(product) => addToCart(product, 1)}
                  showQuickAdd
                />
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
      />

      {/* Store Locator Modal */}
      <StoreLocatorModal
        isOpen={showStoreLocator}
        onClose={() => setShowStoreLocator(false)}
        onSelectStore={(store) => {
          setSelectedStore({
            id: store.id,
            name: store.name,
            address: store.address,
            pickupTime: store.pickupTime,
          })
          setShowStoreLocator(false)
        }}
        productName={product.name}
        selectedStoreId={selectedStore?.id}
      />

      {/* Fulfillment Modal */}
      <FulfillmentModal
        isOpen={showFulfillmentModal}
        onClose={() => setShowFulfillmentModal(false)}
      />

      {/* Returns & Warranty Modal */}
      <ReturnsWarrantyModal
        isOpen={showReturnsWarrantyModal}
        onClose={() => setShowReturnsWarrantyModal(false)}
      />

      {/* PayPal Pay in 4 Modal */}
      <PayPalModal
        isOpen={showPayPalModal}
        onClose={() => setShowPayPalModal(false)}
        price={currentVariant.price}
      />

      {/* Virtual Try-On Modal */}
      {showVirtualTryOn && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowVirtualTryOn(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-brand-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-brand-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-brand-black">Virtual Try-On</h2>
                    <p className="text-sm text-brand-gray-600">See how {product.name} looks in your space</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowVirtualTryOn(false)}
                  className="p-2 text-brand-gray-500 hover:text-brand-black hover:bg-brand-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Camera/AR View */}
                <div className="lg:col-span-2 bg-brand-gray-900 relative aspect-video lg:aspect-auto lg:min-h-[500px]">
                  {/* Simulated AR View */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      {/* Camera permission prompt simulation */}
                      <div className="w-24 h-24 mx-auto mb-6 bg-brand-gray-800 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="text-white text-lg font-medium mb-2">Enable Camera Access</h3>
                      <p className="text-brand-gray-400 text-sm mb-6 max-w-xs mx-auto">
                        Allow camera access to see how this product looks in your environment
                      </p>
                      <button className="px-6 py-3 bg-brand-blue-500 text-white font-medium rounded-lg hover:bg-brand-blue-600 transition-colors">
                        Enable Camera
                      </button>
                    </div>
                  </div>

                  {/* AR Controls Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </button>
                    </div>
                    <button className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Product Info Panel */}
                <div className="p-6 bg-white border-l border-brand-gray-200">
                  {/* Product Preview */}
                  <div className="mb-6">
                    <div className="aspect-square bg-brand-gray-100 rounded-xl overflow-hidden mb-4">
                      <LazyImage
                        src={images[currentImageIndex]}
                        alt={product.name}
                        className="w-full h-full"
                        objectFit="cover"
                      />
                    </div>
                    <h3 className="text-lg font-medium text-brand-black">{product.name}</h3>
                    <p className="text-sm text-brand-gray-600">{product.brand}</p>
                    <p className="text-lg font-semibold text-brand-black mt-2">${product.price.toFixed(2)}</p>
                  </div>

                  {/* Selected Options */}
                  <div className="space-y-4 mb-6">
                    {selectedSize && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-brand-gray-600">Size</span>
                        <span className="font-medium text-brand-black">{selectedSize}</span>
                      </div>
                    )}
                    {selectedColor && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-brand-gray-600">Color</span>
                        <span className="font-medium text-brand-black">{selectedColor}</span>
                      </div>
                    )}
                  </div>

                  {/* Color Options */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-medium text-brand-black mb-3">Try Different Colors</p>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((color) => {
                          const variantProduct = variantProducts[color]
                          return (
                          <button
                            key={color}
                            onClick={() => {
                              // Navigate to the variant's URL if it exists
                              if (variantProduct && variantProduct.id !== product.id) {
                                router.push(`/product/${variantProduct.id}`)
                              } else {
                                setSelectedColor(color)
                              }
                            }}
                            className={`w-10 h-10 rounded-full border-2 transition-all ${
                              selectedColor === color
                                ? 'border-brand-blue-500 ring-2 ring-brand-blue-200'
                                : 'border-brand-gray-200 hover:border-brand-gray-400'
                            }`}
                            style={{
                              backgroundColor:
                                color.toLowerCase() === 'white' ? '#fff' :
                                color.toLowerCase() === 'black' ? '#000' :
                                color.toLowerCase() === 'gray' ? '#6b7280' :
                                color.toLowerCase() === 'charcoal' ? '#36454F' :
                                color.toLowerCase() === 'silver' ? '#C0C0C0' : '#ccc',
                            }}
                            title={color}
                          />
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="bg-brand-blue-50 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-medium text-brand-blue-800 mb-2">How to use</h4>
                    <ul className="text-xs text-brand-blue-700 space-y-1">
                      <li>• Point your camera at a flat surface</li>
                      <li>• Tap to place the product</li>
                      <li>• Pinch to resize, drag to move</li>
                      <li>• Walk around to view from all angles</li>
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button 
                      onClick={() => addToCart(currentVariant, quantity, selectedSize, selectedColor)}
                      className="w-full py-3 bg-brand-blue-500 text-white font-medium rounded-lg hover:bg-brand-blue-600 transition-colors shadow-sm"
                    >
                      Add to cart
                    </button>
                    <button className="w-full py-3 border border-brand-gray-300 text-brand-black font-medium rounded-lg hover:bg-brand-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share AR View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

