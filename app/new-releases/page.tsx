'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import AnnouncementBar from '../../components/AnnouncementBar'
import ProductCard from '../../components/ProductCard'
import Footer from '../../components/Footer'
import QuickViewModal from '../../components/QuickViewModal'
import NotifyMeModal from '../../components/NotifyMeModal'
import LazyImage from '../../components/LazyImage'
import PromoBanner from '../../components/PromoBanner'
import { getNewReleases, getNewReleasesByCategory, getAllProductsWithVariants } from '../../lib/products'
import { Product } from '../../components/ProductListingPage'
import { toggleWishlist, getWishlistIds } from '../../lib/wishlist'
import { addToCart } from '../../lib/cart'

interface CarouselSectionProps {
  id: string
  title: string
  shopAllLink: string
  products: Product[]
  onUnifiedAction: (product: Product) => void
  onAddToWishlist: (product: Product, size?: string, color?: string) => void
  wishlistIds: string[]
  allProducts: Product[]
}

function CarouselSection({
  id,
  title,
  shopAllLink,
  products,
  onUnifiedAction,
  onAddToWishlist,
  wishlistIds,
  allProducts,
}: CarouselSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Position arrows to center on product image
  // Product cards have square images at the top, so we use ~30% from top to center on image
  const arrowTopPosition = '30%'

  // Check scroll position and update arrow visibility
  const checkScrollability = () => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    const { scrollLeft, scrollWidth, clientWidth } = container
    
    // Use a more precise threshold (1px) to avoid jump
    const threshold = 1
    
    // Can scroll left if not at the start
    setCanScrollLeft(scrollLeft > threshold)
    
    // Can scroll right if not at the end (with precise threshold)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - threshold)
  }

  // Check scrollability on mount and when products change
  useEffect(() => {
    checkScrollability()
    
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollability)
      // Also check on resize
      window.addEventListener('resize', checkScrollability)
      
      return () => {
        container.removeEventListener('scroll', checkScrollability)
        window.removeEventListener('resize', checkScrollability)
      }
    }
  }, [products])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    const { scrollLeft, scrollWidth, clientWidth } = container
    
    // Calculate scroll amount based on viewport: ~2 cards on mobile, ~3 on tablet, ~4 on desktop
    const containerWidth = container.clientWidth
    const scrollAmount = containerWidth * 0.8 // Scroll ~80% of visible width
    
    let targetScroll = scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
    
    // Clamp to valid scroll range to prevent overshooting
    const maxScroll = scrollWidth - clientWidth
    targetScroll = Math.max(0, Math.min(targetScroll, maxScroll))
    
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    })
  }

  // Drag to scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    // Don't start dragging if clicking on a link or button
    const target = e.target as HTMLElement
    if (target.closest('a') || target.closest('button')) return
    
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
    scrollContainerRef.current.style.cursor = 'grabbing'
    scrollContainerRef.current.style.userSelect = 'none'
  }

  const handleMouseLeave = () => {
    if (!scrollContainerRef.current) return
    setIsDragging(false)
    scrollContainerRef.current.style.cursor = 'grab'
    scrollContainerRef.current.style.userSelect = 'auto'
  }

  const handleMouseUp = () => {
    if (!scrollContainerRef.current) return
    setIsDragging(false)
    scrollContainerRef.current.style.cursor = 'grab'
    scrollContainerRef.current.style.userSelect = 'auto'
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2 // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  if (products.length === 0) return null

  return (
    <section id={id} className="py-8 md:py-12 scroll-mt-20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-normal text-brand-black tracking-tight">
          {title}
        </h2>
        <a
          href={shopAllLink}
          className="text-sm font-medium text-brand-blue-500 hover:text-brand-blue-600 transition-colors"
        >
          Shop all →
        </a>
      </div>
      
      <div className="relative">
        {/* Left Arrow - Hidden on mobile, visible on desktop with smooth transition */}
        <button
          onClick={() => scroll('left')}
          className={`hidden md:flex absolute z-10 bg-white border border-brand-gray-300 rounded-lg p-2 shadow-md hover:bg-brand-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 ${
            canScrollLeft 
              ? 'opacity-100 pointer-events-auto' 
              : 'opacity-0 pointer-events-none'
          }`}
          style={{ 
            left: '-12px',
            top: arrowTopPosition, 
            transform: `translateY(-50%) ${canScrollLeft ? 'translateX(0)' : 'translateX(-8px)'}` 
          }}
          aria-label={`Scroll ${title} left`}
          disabled={!canScrollLeft}
        >
          <svg className="w-5 h-5 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth cursor-grab active:cursor-grabbing"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onScroll={checkScrollability}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px]"
            >
              <ProductCard
                product={product}
                onUnifiedAction={onUnifiedAction}
                onAddToWishlist={onAddToWishlist}
                isInWishlist={wishlistIds.includes(product.id)}
                allProducts={allProducts}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow - Hidden on mobile, visible on desktop with smooth transition */}
        <button
          onClick={() => scroll('right')}
          className={`hidden md:flex absolute z-10 bg-white border border-brand-gray-300 rounded-lg p-2 shadow-md hover:bg-brand-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 ${
            canScrollRight 
              ? 'opacity-100 pointer-events-auto' 
              : 'opacity-0 pointer-events-none'
          }`}
          style={{ 
            right: '-12px',
            top: arrowTopPosition, 
            transform: `translateY(-50%) ${canScrollRight ? 'translateX(0)' : 'translateX(8px)'}` 
          }}
          aria-label={`Scroll ${title} right`}
          disabled={!canScrollRight}
        >
          <svg className="w-5 h-5 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  )
}

export default function NewReleasesPage() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [notifyMeProduct, setNotifyMeProduct] = useState<Product | null>(null)

  // Load wishlist on mount and listen for updates
  useEffect(() => {
    setWishlistIds(getWishlistIds())
    
    const handleWishlistUpdate = (e: CustomEvent<Product[]>) => {
      setWishlistIds(e.detail.map((p) => p.id))
    }
    
    window.addEventListener('wishlistUpdated', handleWishlistUpdate as EventListener)
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate as EventListener)
  }, [])

  const [allNewReleases, setAllNewReleases] = useState<Product[]>([])
  const [justDropped, setJustDropped] = useState<Product[]>([])
  const [trendingNew, setTrendingNew] = useState<Product[]>([])
  const [newInWomen, setNewInWomen] = useState<Product[]>([])
  const [newInMen, setNewInMen] = useState<Product[]>([])
  const [newInAccessories, setNewInAccessories] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      const [all, just, trending, women, men, accessories, allProds] = await Promise.all([
        getNewReleases(12),
        getNewReleases(12),
        getNewReleases(8),
        getNewReleasesByCategory('Women', 8),
        getNewReleasesByCategory('Men', 8),
        getNewReleasesByCategory('Accessories', 8),
        getAllProductsWithVariants(),
      ])
      setAllNewReleases(all)
      setJustDropped(just)
      setTrendingNew(trending)
      setNewInWomen(women)
      setNewInMen(men)
      setNewInAccessories(accessories)
      setAllProducts(allProds)
    }
    loadProducts()
  }, [])

  // Calculate total products count
  const totalProducts = useMemo(() => {
    return allNewReleases.length
  }, [allNewReleases.length])

  // Generate breadcrumbs
  const breadcrumbs = useMemo(() => {
    return [
      { label: 'Home', href: '/' },
      { label: 'New Releases', href: '/new-releases' },
    ]
  }, [])

  // Helper function to check if product has variants
  const hasVariants = (product: Product): boolean => {
    if (product.size && product.size.length > 1) return true
    if (product.colors && product.colors.length > 1) return true
    if (product.variants && product.variants > 0) return true
    return false
  }

  const handleAddToCart = (product: Product, quantity: number = 1, size?: string, color?: string) => {
    addToCart(product, quantity, size, color)
  }

  const handleAddToCartSimple = (product: Product) => {
    addToCart(product, 1)
  }

  // Unified handler for Quick View/Quick Add
  const handleUnifiedAction = (product: Product) => {
    if (!product.inStock) {
      setNotifyMeProduct(product)
      return
    }

    if (hasVariants(product)) {
      setQuickViewProduct(product)
    } else {
      handleAddToCartSimple(product)
    }
  }

  const handleNotifyMe = (email: string) => {
    console.log(`Notify ${email} when ${notifyMeProduct?.name} is available`)
  }

  const handleAddToWishlist = (product: Product, size?: string, color?: string) => {
    // Only pass size/color if they were explicitly selected (from QuickViewModal)
    const inWishlist = toggleWishlist(product, size, color, size || color ? 'pdp' : 'card')
    console.log(inWishlist ? 'Added to wishlist:' : 'Removed from wishlist:', product.id)
  }

  const navItems = [
    { id: 'all', label: 'All New Releases', href: '/new-releases' },
    { id: 'just-dropped', label: 'Just Dropped', href: '/shop?filter=new' },
    { id: 'trending-new', label: 'Trending New', href: '/shop?filter=new&sort=trending' },
    { id: 'new-in-women', label: 'New in Women', href: '/women?filter=new' },
    { id: 'new-in-men', label: 'New in Men', href: '/men?filter=new' },
    { id: 'new-in-accessories', label: 'New in Accessories', href: '/accessories?filter=new' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navigation />
      
      <main className="flex-1">
        {/* Beautiful Header Section - Matching PLP Style */}
        <div className="relative h-[250px] md:h-[300px] lg:h-[350px] overflow-hidden">
          <div className="absolute inset-0">
            <LazyImage
              src="/images/hero/hero-collection.png"
              alt="New Releases"
              className="w-full h-full"
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60" />
          </div>
          
          <div className="relative h-full flex items-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8 md:pb-10">
              <div className="max-w-2xl">
                <div className="inline-block mb-4">
                  <span className="text-xs md:text-sm text-white/80 uppercase tracking-widest font-medium">
                    New Releases
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-white mb-4 tracking-tight leading-tight">
                  Collection
                </h1>
                <p className="text-base md:text-lg text-white/90 font-light max-w-xl">
                  {totalProducts} {totalProducts === 1 ? 'product' : 'products'} available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout: Left Rail + Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-brand-gray-500 mb-6">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && <span>&gt;</span>}
                  {isLast ? (
                    <span className="text-brand-black">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-brand-blue-500 transition-colors">
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              )
            })}
          </nav>
          <div className="flex flex-col lg:flex-row gap-8 py-8">
            {/* Left Rail Navigation */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <nav className="sticky top-24">
                <h2 className="text-sm font-semibold text-brand-gray-400 uppercase tracking-wider mb-4">
                  Browse
                </h2>
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        className="block px-3 py-2 text-sm rounded-lg transition-colors text-brand-gray-700 hover:bg-brand-gray-50 hover:text-brand-black"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* Main Content Column */}
            <div className="flex-1 min-w-0">
              {/* All New Releases Section */}
              {allNewReleases.length > 0 && (
                <CarouselSection
                  id="all"
                  title="All New Releases"
                  shopAllLink="/shop"
                  products={allNewReleases}
                  onUnifiedAction={handleUnifiedAction}
onAddToWishlist={handleAddToWishlist}
                  wishlistIds={wishlistIds}
                  allProducts={allProducts}
                />
              )}

              {/* Just Dropped Section */}
              {justDropped.length > 0 && (
                <CarouselSection
                  id="just-dropped"
                  title="Just Dropped"
                  shopAllLink="/shop"
                  products={justDropped}
                  onUnifiedAction={handleUnifiedAction}
onAddToWishlist={handleAddToWishlist}
                  wishlistIds={wishlistIds}
                  allProducts={allProducts}
                />
              )}

              {/* Promotional Banner 1 - Limited Time Offer */}
              <div className="py-8 md:py-12">
                <PromoBanner
                  title="New Collection: Latest Releases"
                  subtitle="LIMITED TIME OFFER"
                  ctaText="Shop Collection"
                  ctaLink="/new-releases"
                  variant="gradient"
                  textColor="text-white"
                />
              </div>

              {/* Trending New Section */}
              {trendingNew.length > 0 && (
                <CarouselSection
                  id="trending-new"
                  title="Trending New"
                  shopAllLink="/shop"
                  products={trendingNew}
                  onUnifiedAction={handleUnifiedAction}
onAddToWishlist={handleAddToWishlist}
                  wishlistIds={wishlistIds}
                  allProducts={allProducts}
                />
              )}

              {/* New in Women Section */}
              {newInWomen.length > 0 && (
                <CarouselSection
                  id="new-in-women"
                  title="New in Women"
                  shopAllLink="/women"
                  products={newInWomen}
                  onUnifiedAction={handleUnifiedAction}
onAddToWishlist={handleAddToWishlist}
                  wishlistIds={wishlistIds}
                  allProducts={allProducts}
                />
              )}

              {/* Promotional Banner 2 - Free Shipping Offer */}
              <div className="py-8 md:py-12">
                <PromoBanner
                  title="Free Shipping on Orders Over $100"
                  subtitle="SPECIAL OFFER"
                  ctaText="Shop Now"
                  ctaLink="/shop"
                  variant="primary"
                  textColor="text-white"
                />
              </div>

              {/* New in Men Section */}
              {newInMen.length > 0 && (
                <CarouselSection
                  id="new-in-men"
                  title="New in Men"
                  shopAllLink="/men"
                  products={newInMen}
                  onUnifiedAction={handleUnifiedAction}
onAddToWishlist={handleAddToWishlist}
                  wishlistIds={wishlistIds}
                  allProducts={allProducts}
                />
              )}

              {/* New in Accessories Section */}
              {newInAccessories.length > 0 && (
                <CarouselSection
                  id="new-in-accessories"
                  title="New in Accessories"
                  shopAllLink="/accessories"
                  products={newInAccessories}
                  onUnifiedAction={handleUnifiedAction}
onAddToWishlist={handleAddToWishlist}
                  wishlistIds={wishlistIds}
                  allProducts={allProducts}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          productVariants={[]}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
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
