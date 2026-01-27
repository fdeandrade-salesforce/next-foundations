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
import QASection from './QASection'
import StoreLocatorModal from './StoreLocatorModal'
import LazyImage from './LazyImage'
import Model3DViewer from './Model3DViewer'
import FulfillmentModal from './FulfillmentModal'
import ReturnsWarrantyModal from './ReturnsWarrantyModal'
import PayPalModal from './PayPalModal'
import SizeGuideModal from './SizeGuideModal'
import { addToCart } from '../lib/cart'
import QuickViewModal from './QuickViewModal'
import NotifyMeModal from './NotifyMeModal'
import DeliveryEstimates, { DeliveryEstimateState } from './DeliveryEstimates'
import { getReviewRepo } from '../src/data'

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

// Reviews are now loaded from the data layer via repository
// The data is centralized in /src/data/mock/reviews.ts
// Reviews are loaded asynchronously via getReviewRepo() when needed

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
  reviews: reviewsProp,
  allProducts = [],
}: ProductDetailPageProps) {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>(reviewsProp || [])
  
  // Load reviews from repository if not provided
  useEffect(() => {
    if (!reviewsProp) {
      const loadReviews = async () => {
        try {
          const reviewRepo = getReviewRepo()
          const productReviews = await reviewRepo.getProductReviews(product.id)
          // Map repository reviews to local Review interface (remove productId for compatibility)
          const mappedReviews: Review[] = productReviews.map((r) => ({
            id: r.id,
            author: r.author,
            rating: r.rating,
            date: r.date,
            title: r.title,
            content: r.content,
            verified: r.verified,
            helpful: r.helpful,
            images: r.images,
          }))
          setReviews(mappedReviews)
        } catch (error) {
          console.error('Error loading reviews:', error)
          setReviews([])
        }
      }
      loadReviews()
    }
  }, [product.id, reviewsProp])
  const [selectedSize, setSelectedSize] = useState<string>(product.size?.[0] || '')
  const [selectedColor, setSelectedColor] = useState<string>(product.color || product.colors?.[0] || '')
  const [selectedScent, setSelectedScent] = useState<string>(product.scents?.[0] || '')
  const [selectedCapacity, setSelectedCapacity] = useState<string>(product.capacities?.[0] || 'Standard')
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Find variant products by matching product name (same logic as ProductCard)
  const variantProducts = useMemo(() => {
    if (!allProducts.length || !product.colors || product.colors.length <= 1) {
      return {}
    }
    
    const variants: Record<string, Product> = {}
    
    // Find products with the same name but different colors
    allProducts.forEach((p) => {
      if (p.name === product.name && p.color && product.colors?.includes(p.color)) {
        variants[p.color] = p
      }
    })
    
    return variants
  }, [allProducts, product.name, product.colors])
  
  // Track if user has explicitly selected a color (different from initial)
  const [hasSelectedColor, setHasSelectedColor] = useState(false)
  
  // Get current variant based on selected color
  const currentVariant = useMemo(() => {
    if (selectedColor && variantProducts[selectedColor]) {
      return variantProducts[selectedColor] as PDPProduct
    }
    return product
  }, [selectedColor, variantProducts, product])
  
  // Track when user selects a color
  useEffect(() => {
    if (selectedColor && selectedColor !== (product.color || product.colors?.[0])) {
      setHasSelectedColor(true)
    }
  }, [selectedColor, product.color, product.colors])
  
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
  
  // Reset image index when variant changes
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [selectedColor])
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [showVirtualTryOn, setShowVirtualTryOn] = useState(false)
  const [showStoreLocator, setShowStoreLocator] = useState(false)
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'delivery' | 'pickup'>('delivery')
  const [deliveryZipCode, setDeliveryZipCode] = useState('94123')
  const [deliveryEstimateState, setDeliveryEstimateState] = useState<DeliveryEstimateState | null>(null)
  const [shareSuccess, setShareSuccess] = useState(false)
  const [showPayPalModal, setShowPayPalModal] = useState(false)
  const [showFulfillmentModal, setShowFulfillmentModal] = useState(false)
  const [showReturnsWarrantyModal, setShowReturnsWarrantyModal] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [notifyMeProduct, setNotifyMeProduct] = useState<Product | null>(null)

  // Helper function to check if product has variants
  const hasVariants = (product: Product): boolean => {
    if (product.size && product.size.length > 1) return true
    if (product.colors && product.colors.length > 1) return true
    if (product.variants && product.variants > 0) return true
    return false
  }

  // Unified handler for Quick View/Quick Add
  const handleUnifiedAction = (product: Product) => {
    // Check if product is out of stock first
    if (!product.inStock) {
      setNotifyMeProduct(product)
      return
    }

    if (hasVariants(product)) {
      // Product has variants - open modal for variant selection
      setQuickViewProduct(product)
    } else {
      // No variants - add to cart directly
      addToCart(product, 1)
    }
  }

  const handleNotifyMe = (email: string) => {
    console.log(`Notify ${email} when ${notifyMeProduct?.name} is available`)
  }

  const handleAddToWishlist = (product: Product) => {
    // Wishlist functionality can be added here
    console.log('Add to wishlist:', product.id)
  }

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
  
  // Use product-level discount if provided, otherwise calculate from price difference
  const hasDiscount = currentVariant.discountPercentage !== undefined 
    ? currentVariant.discountPercentage > 0
    : currentVariant.originalPrice && currentVariant.originalPrice > currentVariant.price
  
  const discountPercentage = currentVariant.discountPercentage !== undefined
    ? currentVariant.discountPercentage
    : hasDiscount && currentVariant.originalPrice
      ? Math.round(((currentVariant.originalPrice - currentVariant.price) / currentVariant.originalPrice) * 100)
      : null
  
  // Percent-off badge value (can be different from calculated discount)
  const percentOffBadge = currentVariant.percentOff !== undefined ? currentVariant.percentOff : discountPercentage

  // Badge logic (same as ProductCard)
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

  const badges = currentVariant.badges || []
  if (currentVariant.isNew) badges.push('new')
  if (currentVariant.isBestSeller) badges.push('best-seller')
  if (currentVariant.isOnlineOnly) badges.push('online-only')
  if (currentVariant.isLimitedEdition) badges.push('limited-edition')
  if (hasDiscount) badges.push('promotion')
  
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
                {/* Badges - positioned like product cards */}
                <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-20">
                  {/* Out of Stock Badge - Show first if product is out of stock */}
                  {!currentVariant.inStock && (
                    <span className="bg-red-600 text-white px-2.5 py-1.5 text-xs font-semibold uppercase rounded-md inline-block shadow-lg">
                      Out of Stock
                    </span>
                  )}
                  {badges.filter(badge => badge !== 'promotion').slice(0, 2).map((badge, idx) => (
                    <span
                      key={idx}
                      className={`${getBadgeColor(badge)} text-white px-2.5 py-1.5 text-xs font-semibold uppercase rounded-md inline-block shadow-lg`}
                    >
                      {getBadgeLabel(badge)}
                    </span>
                  ))}
                  {/* Percent-off badge - show if there's a discount (prioritize this over promotion badge) */}
                  {percentOffBadge !== null && percentOffBadge !== undefined && (
                    <span className="bg-brand-blue-500 text-white px-2.5 py-1.5 text-xs font-semibold rounded-md inline-block shadow-lg">
                      -{percentOffBadge}%
                    </span>
                  )}
                </div>

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
            <div className="relative">
              {product.brand && (
                <p className="text-xs text-brand-gray-500 uppercase tracking-wider mb-1">{product.brand}</p>
              )}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl lg:text-3xl font-medium text-brand-black tracking-tight flex-1">
                  {product.name}
                </h1>
                {/* Wishlist and Share Icons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAddToWishlist(currentVariant)}
                    className="p-2 rounded-full bg-white/90 hover:bg-white border border-brand-gray-200 hover:border-brand-gray-300 transition-all"
                    aria-label="Add to wishlist"
                  >
                    <svg 
                      className="w-5 h-5 text-brand-black transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleShare}
                    className={`p-2 rounded-full border transition-all ${
                      shareSuccess 
                        ? 'bg-green-50 border-green-300' 
                        : 'bg-white/90 hover:bg-white border-brand-gray-200 hover:border-brand-gray-300'
                    }`}
                    aria-label="Share product"
                  >
                    {shareSuccess ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {/* SKU - Accessible placement */}
              {currentVariant.sku && (
                <p className="text-xs text-brand-gray-500 mt-2" aria-label={`Product SKU: ${currentVariant.sku}`}>
                  <span className="font-medium">SKU:</span> {currentVariant.sku}
                </p>
              )}
              {/* Short Description */}
              {currentVariant.shortDescription && (
                <p className="text-sm text-brand-gray-600 mt-2 leading-relaxed">
                  {currentVariant.shortDescription}
                </p>
              )}
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
                {/* Show price range only on initial load (no color selection made yet) */}
                {/* Show individual variant price when any color is selected */}
                {priceRange && !hasSelectedColor ? (
                  <span className="text-2xl font-semibold text-brand-black">
                    ${priceRange.min.toFixed(2)} - ${priceRange.max.toFixed(2)}
                  </span>
                ) : (
                  <>
                    <span className="text-2xl font-semibold text-brand-black">
                      ${currentVariant.price.toFixed(2)}
                    </span>
                    {hasDiscount && currentVariant.originalPrice && (
                      <>
                        <span className="text-base text-brand-gray-400 line-through">
                          ${currentVariant.originalPrice.toFixed(2)}
                        </span>
                        {percentOffBadge !== null && percentOffBadge !== undefined && (
                          <span className="px-2 py-0.5 bg-brand-blue-100 text-brand-blue-700 text-xs font-medium rounded-md">
                            Save {percentOffBadge}%
                          </span>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Promotional Message */}
              {currentVariant.promotionalMessage && (
                <p className="text-sm text-green-600 font-medium">
                  {currentVariant.promotionalMessage}
                </p>
              )}

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
                            setHasSelectedColor(true)
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
            <div className="grid grid-cols-2 gap-2">
              {/* Delivery Option */}
              <button
                onClick={() => setFulfillmentMethod('delivery')}
                className={`flex items-start gap-2 p-3 rounded-lg border transition-colors text-left ${
                  fulfillmentMethod === 'delivery'
                    ? 'border-brand-blue-500 bg-brand-blue-50/30'
                    : 'border-brand-gray-200 hover:border-brand-gray-300'
                }`}
              >
                {/* Radio Circle */}
                <div className="mt-0.5 shrink-0">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      fulfillmentMethod === 'delivery'
                        ? 'border-brand-blue-500'
                        : 'border-brand-gray-300'
                    }`}
                  >
                    {fulfillmentMethod === 'delivery' && (
                      <div className="w-2 h-2 rounded-full bg-brand-blue-500" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-medium text-brand-black">Deliver to</span>
                    </div>
                    <p className="text-xs text-brand-gray-600 mt-0.5">
                      {deliveryEstimateState?.status === 'success' && deliveryEstimateState.result
                        ? `Delivery in ${deliveryEstimateState.result.deliveryText}`
                        : 'Enter ZIP code to see delivery estimate'}
                    </p>
                  </div>
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
                className={`flex items-start gap-2 p-3 rounded-lg border transition-colors text-left ${
                  fulfillmentMethod === 'pickup'
                    ? 'border-brand-blue-500 bg-brand-blue-50/30'
                    : 'border-brand-gray-200 hover:border-brand-gray-300'
                }`}
              >
                {/* Radio Circle */}
                <div className="mt-0.5 shrink-0">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      fulfillmentMethod === 'pickup'
                        ? 'border-brand-blue-500'
                        : 'border-brand-gray-300'
                    }`}
                  >
                    {fulfillmentMethod === 'pickup' && (
                      <div className="w-2 h-2 rounded-full bg-brand-blue-500" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {selectedStore ? (
                    <>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-medium text-brand-black">Pickup at</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowStoreLocator(true)
                            }}
                            className="text-xs text-brand-blue-500 underline hover:text-brand-blue-600"
                          >
                            {selectedStore.name}
                          </button>
                        </div>
                        {selectedStore.pickupTime && (
                          <p className="text-xs text-brand-gray-600 mt-0.5">{selectedStore.pickupTime}</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs text-brand-gray-600">Pickup unavailable</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowStoreLocator(true)
                          }}
                          className="text-xs text-brand-blue-500 underline hover:text-brand-blue-600 mt-0.5 text-left"
                        >
                          Try another store
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Calculate Shipping - Separate Block (only when delivery is selected) */}
            {fulfillmentMethod === 'delivery' && (
              <div className="mt-3 p-4 border border-brand-gray-200 rounded-lg bg-white">
                <DeliveryEstimates
                  initialZip={deliveryZipCode}
                  onZipChange={(newZip) => {
                    setDeliveryZipCode(newZip)
                  }}
                  onResultChange={(state) => {
                    setDeliveryEstimateState(state)
                  }}
                />
              </div>
            )}

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

            {/* Add to Cart / Notify Me Button */}
            {!currentVariant.inStock ? (
              <button
                onClick={() => setNotifyMeProduct(currentVariant)}
                className="w-full py-3.5 px-6 font-medium text-base rounded-lg transition-colors bg-white text-brand-black border border-brand-gray-300 hover:bg-brand-gray-50"
              >
                Notify me
              </button>
            ) : (
              <button
                onClick={() => {
                  addToCart(currentVariant, quantity, selectedSize, selectedColor)
                }}
                className="w-full py-3.5 px-6 font-medium text-base rounded-lg transition-colors bg-brand-blue-500 text-white hover:bg-brand-blue-600"
              >
                Add to cart
              </button>
            )}

            {/* Express Checkout Buttons */}
            {currentVariant.inStock && (
              <div className="space-y-3 mt-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-brand-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-brand-gray-500">Or buy with</span>
                  </div>
                </div>
                
                {/* Apple Pay */}
                <button
                  onClick={() => {
                    // Express checkout - Buy Now flow
                    console.log('Apple Pay checkout initiated')
                  }}
                  className="w-full py-3.5 px-6 font-medium text-base rounded-lg transition-colors bg-black text-white hover:bg-gray-900 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.08-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span>Buy with Apple Pay</span>
                </button>

                {/* Google Pay */}
                <button
                  onClick={() => {
                    // Express checkout - Buy Now flow
                    console.log('Google Pay checkout initiated')
                  }}
                  className="w-full py-3.5 px-6 font-medium text-base rounded-lg transition-colors bg-white text-brand-black border border-brand-gray-300 hover:bg-brand-gray-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Buy with Google Pay</span>
                </button>

                {/* PayPal Express */}
                <button
                  onClick={() => {
                    // Express checkout - Buy Now flow
                    console.log('PayPal Express checkout initiated')
                  }}
                  className="w-full py-3.5 px-6 font-medium text-base rounded-lg transition-colors bg-white text-brand-black border border-brand-gray-300 hover:bg-brand-gray-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a.805.805 0 0 0-.777-.637h-3.855c-.663 0-1.226.493-1.333 1.136l-.02.123-.09.571-.056.359c-.09.57.33 1.097.9 1.097h2.78c.73 0 1.33-.558 1.412-1.283.011-.09.018-.18.02-.27.04-.617-.05-1.13-.281-1.442z" fill="#003087"/>
                    <path d="M9.557 8.218a.805.805 0 0 0-.777-.637H4.925c-.663 0-1.226.493-1.333 1.136l-.02.123-.09.571-.056.359c-.09.57.33 1.097.9 1.097h2.78c.73 0 1.33-.558 1.412-1.283.011-.09.018-.18.02-.27.04-.617-.05-1.13-.281-1.442z" fill="#009CDE"/>
                  </svg>
                  <span>Buy with PayPal</span>
                </button>
              </div>
            )}

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

            {/* Free Shipping, Returns & Warranty Info */}
            <div className="space-y-3 pt-4 border-t border-brand-gray-200">
              {/* Free Shipping Notice */}
              <div className="bg-brand-blue-50 border border-brand-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-brand-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brand-blue-800">Free Shipping</p>
                    <p className="text-xs text-brand-blue-600 mt-0.5">Orders over $50 ship free worldwide</p>
                  </div>
                </div>
              </div>

              {/* Returns & Warranty Notice */}
              <div className="bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-brand-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brand-black">30-Day Returns & 1 Year Warranty</p>
                    <p className="text-xs text-brand-gray-600 mt-0.5">Returns accepted within 30 days. Full warranty coverage included.</p>
                    <button 
                      onClick={() => setShowReturnsWarrantyModal(true)}
                      className="text-xs text-brand-blue-500 hover:underline mt-1"
                    >
                      View Policies
                    </button>
                  </div>
                </div>
              </div>

              {/* Fulfillment Info */}
              <div className="bg-brand-gray-50 border border-brand-gray-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-brand-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brand-black">Estimated Delivery</p>
                    <p className="text-xs text-brand-gray-600 mt-0.5">Sep 15-16 • Shipping options available</p>
                    <button 
                      onClick={() => setShowFulfillmentModal(true)}
                      className="text-xs text-brand-blue-500 hover:underline mt-1"
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
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

        {/* Q&A Section */}
        <div id="qa-section">
          <QASection
            productId={currentVariant.id}
            productName={currentVariant.name}
            productCategory={product.category}
            productSubcategory={product.subcategory}
            productBrand={product.brand}
            hasSizes={!!(product.size && product.size.length > 0)}
            hasColors={!!(product.colors && product.colors.length > 0)}
          />
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
                  onUnifiedAction={handleUnifiedAction}
                  onAddToWishlist={handleAddToWishlist}
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
                  onUnifiedAction={handleUnifiedAction}
                  onAddToWishlist={handleAddToWishlist}
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
                  onUnifiedAction={handleUnifiedAction}
                  onAddToWishlist={handleAddToWishlist}
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

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          allProducts={allProducts}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={(product, size, color) => addToCart(product, 1, size, color)}
          onAddToWishlist={handleAddToWishlist}
          onNotify={(product) => setNotifyMeProduct(product)}
        />
      )}

      {/* Notify Me Modal */}
      {notifyMeProduct && (
        <NotifyMeModal
          product={notifyMeProduct}
          isOpen={!!notifyMeProduct}
          onClose={() => setNotifyMeProduct(null)}
          onNotify={handleNotifyMe}
        />
      )}
    </div>
  )
}

