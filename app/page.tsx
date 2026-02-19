'use client'

import React, { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import AnnouncementBar from '../components/AnnouncementBar'
import Hero from '../components/Hero'
import ProductCarousel from '../components/ProductCarousel'
import ProductGrid from '../components/ProductGrid'
import PromoBannerGrid from '../components/PromoBannerGrid'
import ProductCategoriesGrid from '../components/ProductCategoriesGrid'
import Footer from '../components/Footer'
import QuickViewModal from '../components/QuickViewModal'
import NotifyMeModal from '../components/NotifyMeModal'
import { getFeaturedProducts, getNewArrivals, getAllProductsWithVariants } from '../lib/products'
import { Product } from '../components/ProductListingPage'
import { toggleWishlist, getWishlistIds } from '../lib/wishlist'
import { getRecentlyViewed } from '../lib/recentlyViewed'
import { addToCart } from '../lib/cart'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [notifyMeProduct, setNotifyMeProduct] = useState<Product | null>(null)
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      const [featured, newArr, all] = await Promise.all([
        getFeaturedProducts(),
        getNewArrivals(20),
        getAllProductsWithVariants(),
      ])
      setFeaturedProducts(featured)
      setNewArrivals(newArr)
      setAllProducts(all)
    }
    loadProducts()
  }, [])

  // Load recently viewed on mount and when page becomes visible (e.g. returning from product page)
  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed())

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setRecentlyViewed(getRecentlyViewed())
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Load wishlist on mount and listen for updates
  useEffect(() => {
    setWishlistIds(getWishlistIds())
    
    const handleWishlistUpdate = (e: CustomEvent<Product[]>) => {
      setWishlistIds(e.detail.map((p) => p.id))
    }
    
    window.addEventListener('wishlistUpdated', handleWishlistUpdate as EventListener)
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate as EventListener)
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

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Featured Products */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductCarousel
            id="featured"
            title="Featured Collection"
            shopAllLink="/shop"
            products={featuredProducts}
            onUnifiedAction={handleUnifiedAction}
            onAddToWishlist={handleAddToWishlist}
            wishlistIds={wishlistIds}
            allProducts={allProducts}
          />
        </div>

        {/* Step Into Elegance - Product Categories Carousel */}
        <ProductCategoriesGrid
          title="Step into Elegance"
          subtitle="At Salesforce Foundations, we believe design should be accessible, innovative, and timeless. Our collections are crafted for the modern individual who values quality, form, and lasting beauty."
          variant="category"
          cards={[
            {
              title: 'Furniture',
              image: '/images/hero/hero-collection.png',
              link: '/shop',
              description: 'Timeless pieces for modern living',
            },
            {
              title: 'Lighting',
              image: '/images/products/pure-cube-white-1.png',
              link: '/shop',
              description: 'Sculptural forms that illuminate',
            },
            {
              title: 'Accessories',
              image: '/images/products/spiral-accent-1.png',
              link: '/accessories',
              description: 'Thoughtful details for your space',
            },
            {
              title: 'New Releases',
              image: '/images/hero/hero-main.png',
              link: '/new-releases',
              description: 'Latest additions to the collection',
            },
            {
              title: 'Women',
              image: '/images/hero/hero-collection.png',
              link: '/women',
              description: 'Curated for her',
            },
            {
              title: 'Men',
              image: '/images/products/fusion-block-1.png',
              link: '/men',
              description: 'Designed for him',
            },
            {
              title: 'Geometric',
              image: '/images/products/pure-cube-white-1.png',
              link: '/shop',
              description: 'Clean lines, bold shapes',
            },
            {
              title: 'Modular',
              image: '/images/products/base-module-1.png',
              link: '/modular',
              description: 'Customize your space',
            },
            {
              title: 'Premium',
              image: '/images/products/signature-form-white-1.png',
              link: '/premium',
              description: 'Exceptional craftsmanship',
            },
          ]}
          className="bg-brand-gray-50"
        />

        {/* Promo Banner Grid */}
        <PromoBannerGrid
          banners={[
            {
              title: 'Curated Collections',
              subtitle: 'Discover',
              image: '/images/hero/hero-collection.png',
              ctaText: 'Shop Now',
              ctaLink: '/shop',
              overlayVariant: 'dark',
            },
            {
              title: 'Limited Editions',
              subtitle: 'Exclusive',
              image: '/images/hero/hero-main.png',
              ctaText: 'Explore',
              ctaLink: '/new-releases',
              overlayVariant: 'dark',
            },
          ]}
          className="bg-white"
        />

        {/* New Arrivals Section */}
        <div className="bg-brand-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductCarousel
              id="new-arrivals"
              title="New Arrivals"
              shopAllLink="/new-releases"
              products={newArrivals}
              onUnifiedAction={handleUnifiedAction}
              onAddToWishlist={handleAddToWishlist}
              wishlistIds={wishlistIds}
              allProducts={allProducts}
            />
          </div>
        </div>

        {/* New Arrivals Promo Banner Grid (Repeat) */}
        <PromoBannerGrid
          banners={[
            {
              title: 'Bestsellers',
              subtitle: 'Customer Favorites',
              image: '/images/products/signature-form-white-1.png',
              ctaText: 'Shop Best Sellers',
              ctaLink: '/shop',
              overlayVariant: 'dark',
            },
            {
              title: 'Bundle & Save',
              subtitle: 'Special Offer',
              image: '/images/products/bundle-1.png',
              ctaText: 'View Bundles',
              ctaLink: '/shop',
              overlayVariant: 'dark',
            },
          ]}
          className="bg-white"
        />

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="bg-brand-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ProductGrid
                title="Recently Viewed"
                products={recentlyViewed}
                columns={4}
                onUnifiedAction={handleUnifiedAction}
                onAddToWishlist={handleAddToWishlist}
                wishlistIds={wishlistIds}
                allProducts={allProducts}
              />
            </div>
          </div>
        )}

        {/* Newsletter Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-brand-blue-500 text-white py-12 md:py-16 px-8 rounded-3xl">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-semibold mb-3 tracking-tight">
                Stay Updated
              </h2>
              <p className="text-white/80 mb-8 font-normal text-sm">
                Be the first to know about new collections and exclusive offers.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto justify-center">
                <input
                  type="email"
                  placeholder="your.email@email.com"
                  className="flex-1 px-5 py-3 bg-white text-brand-black placeholder-brand-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-300 text-sm"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-brand-blue-600 font-medium hover:bg-brand-gray-100 transition-colors rounded-lg text-sm"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          </div>
        </section>
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
