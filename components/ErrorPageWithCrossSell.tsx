'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Navigation from './Navigation'
import Footer from './Footer'
import AnnouncementBar from './AnnouncementBar'
import ProductCarousel from './ProductCarousel'
import QuickViewModal from './QuickViewModal'
import NotifyMeModal from './NotifyMeModal'
import { addToCart } from '../lib/cart'
import { toggleWishlist, getWishlistIds } from '../lib/wishlist'
import { getFeaturedProducts } from '../lib/products'
import { Product } from './ProductListingPage'

interface ErrorPageWithCrossSellProps {
  code: number
  title: string
  message: string
  /** Optional secondary message for more context */
  secondaryMessage?: string
  /** Optional custom announcement bar message (e.g. for 503) */
  announcementMessage?: string
}

const hasVariants = (product: Product): boolean => {
  if (product.size && product.size.length > 1) return true
  if (product.colors && product.colors.length > 1) return true
  if (product.variants && product.variants > 0) return true
  return false
}

export default function ErrorPageWithCrossSell({
  code,
  title,
  message,
  secondaryMessage,
  announcementMessage,
}: ErrorPageWithCrossSellProps) {
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [notifyMeProduct, setNotifyMeProduct] = useState<Product | null>(null)

  useEffect(() => {
    getFeaturedProducts(12).then(setSuggestedProducts)
  }, [])

  useEffect(() => {
    setWishlist(getWishlistIds())
    const handler = () => setWishlist(getWishlistIds())
    window.addEventListener('wishlistUpdated', handler)
    return () => window.removeEventListener('wishlistUpdated', handler)
  }, [])

  const handleUnifiedAction = (product: Product) => {
    if (!product.inStock) {
      setNotifyMeProduct(product)
      return
    }
    if (hasVariants(product)) {
      setQuickViewProduct(product)
    } else {
      addToCart(product, 1)
    }
  }

  const handleAddToWishlist = (product: Product, size?: string, color?: string) => {
    toggleWishlist(product, size, color, size || color ? 'pdp' : 'card')
  }

  const handleNotifyMe = (email: string) => {
    console.log(`Notify ${email} when ${notifyMeProduct?.name} is available`)
    setNotifyMeProduct(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar
        message={announcementMessage ?? 'FREE WORLDWIDE SHIPPING from $90'}
        dismissible={!announcementMessage}
      />
      <Navigation />
      
      <main className="flex-1 flex flex-col px-4 sm:px-6 lg:px-8">
        {/* Error content - centered */}
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-9xl md:text-[12rem] font-bold text-brand-blue-500 mb-4 leading-none">
              {code}
            </h1>
            
            <h2 className="text-3xl md:text-4xl font-semibold text-brand-black mb-4 tracking-tight">
              {title}
            </h2>
            
            <p className="text-lg text-brand-gray-600 mb-2 leading-relaxed">
              {message}
            </p>
            {secondaryMessage && (
              <p className="text-base text-brand-gray-500 mb-8">{secondaryMessage}</p>
            )}
            {!secondaryMessage && <div className="mb-8" />}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="px-6 py-3 bg-brand-blue-500 text-white font-medium rounded-lg hover:bg-brand-blue-600 transition-colors"
              >
                Go to Homepage
              </Link>
              <Link
                href="/shop"
                className="px-6 py-3 bg-white text-brand-blue-500 font-medium border-2 border-brand-blue-500 rounded-lg hover:bg-brand-blue-50 transition-colors"
              >
                Browse Shop
              </Link>
            </div>
          </div>
        </div>

        {/* Cross-sell carousel */}
        {suggestedProducts.length > 0 && (
          <div className="max-w-7xl mx-auto w-full pb-16 pt-8 border-t border-brand-gray-200">
            <ProductCarousel
              id="error-cross-sell"
              title="You might also like"
              subtitle="Explore our bestsellers"
              shopAllLink="/shop"
              products={suggestedProducts}
              onUnifiedAction={handleUnifiedAction}
              onAddToWishlist={handleAddToWishlist}
              wishlistIds={wishlist}
              allProducts={suggestedProducts}
            />
          </div>
        )}
      </main>
      
      <Footer />

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          productVariants={[]}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={(product, quantity, size, color) => addToCart(product, quantity, size, color)}
          onAddToWishlist={handleAddToWishlist}
          onNotify={(product) => setNotifyMeProduct(product)}
        />
      )}

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
