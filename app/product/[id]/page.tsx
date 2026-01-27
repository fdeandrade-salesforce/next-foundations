'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ProductDetailPage from '../../../components/ProductDetailPage'
import { getProductById, getAllProducts } from '../../../lib/products'
import { Product } from '../../../components/ProductListingPage'
import { addToRecentlyViewed, getRecentlyViewedExcluding } from '../../../lib/recentlyViewed'
import ErrorBoundary from '../../../components/ErrorBoundary'

export default function ProductPage() {
  const params = useParams()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const foundProduct = await getProductById(productId)
        const products = await getAllProducts()
        setAllProducts(products)
        
        if (foundProduct) {
          setProduct(foundProduct)
          
          // Get suggested products (same category, different product)
          const suggested = products
            .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
            .slice(0, 8)
          setSuggestedProducts(suggested)
          
          // Get recently viewed products (excluding current product)
          const recentProducts = getRecentlyViewedExcluding(productId).slice(0, 5)
          
          // If not enough recently viewed, add some random products to fill
          if (recentProducts.length < 5) {
            const additionalProducts = products
              .filter(p => p.id !== foundProduct.id && !recentProducts.find(rp => rp.id === p.id))
              .slice(0, 5 - recentProducts.length)
            recentProducts.push(...additionalProducts)
          }
          setRecentlyViewed(recentProducts)
          
          // Add current product to recently viewed list
          addToRecentlyViewed(foundProduct)
        }
      } catch (error) {
        console.error('Error loading product:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProduct()
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue-500"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-brand-black mb-4">Product Not Found</h1>
          <p className="text-brand-gray-600 mb-6">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <a href="/" className="text-brand-blue-500 hover:underline">Return to Home</a>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <ProductDetailPage
        product={product}
        suggestedProducts={suggestedProducts}
        recentlyViewed={recentlyViewed}
        allProducts={allProducts}
      />
    </ErrorBoundary>
  )
}

