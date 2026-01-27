'use client'

import React, { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import AnnouncementBar from '../components/AnnouncementBar'
import Hero from '../components/Hero'
import ProductGrid from '../components/ProductGrid'
import Footer from '../components/Footer'
import QuickViewModal from '../components/QuickViewModal'
import NotifyMeModal from '../components/NotifyMeModal'
import { getFeaturedProducts, getNewArrivals, getAllProducts } from '../lib/products'
import { Product } from '../components/ProductListingPage'
import { toggleWishlist, getWishlistIds } from '../lib/wishlist'
import { addToCart } from '../lib/cart'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [notifyMeProduct, setNotifyMeProduct] = useState<Product | null>(null)
  const [wishlistIds, setWishlistIds] = useState<string[]>([])

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      const [featured, newArr, all] = await Promise.all([
        getFeaturedProducts(),
        getNewArrivals(),
        getAllProducts(),
      ])
      setFeaturedProducts(featured)
      setNewArrivals(newArr)
      setAllProducts(all)
    }
    loadProducts()
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

  const handleAddToCart = (product: Product, size?: string, color?: string) => {
    addToCart(product, 1, size, color)
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

  const handleAddToWishlist = (product: Product) => {
    const inWishlist = toggleWishlist(product)
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
          <ProductGrid
            title="Featured Collection"
            products={featuredProducts}
            columns={4}
            onUnifiedAction={handleUnifiedAction}
            onAddToWishlist={handleAddToWishlist}
            wishlistIds={wishlistIds}
          />
        </div>

        {/* New Arrivals Section */}
        <div className="bg-brand-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductGrid
              title="New Arrivals"
              products={newArrivals}
              columns={4}
              onUnifiedAction={handleUnifiedAction}
              onAddToWishlist={handleAddToWishlist}
              wishlistIds={wishlistIds}
            />
          </div>
        </div>

        {/* Brand Story Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-normal text-brand-black mb-6 tracking-tight">
              Step into Elegance
            </h2>
            <p className="text-lg text-brand-gray-700 leading-relaxed mb-8 font-normal">
              At Market Street, we believe design should be accessible, innovative, and timeless. 
              Our collections are crafted for the modern individual who values quality, 
              form, and lasting beauty.
            </p>
            <p className="text-base text-brand-gray-600 leading-relaxed font-normal">
              Discover our commitment to creating objects that inspire, 
              adapt to your space, and stand the test of time.
            </p>
          </div>
        </section>

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
          allProducts={allProducts}
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
