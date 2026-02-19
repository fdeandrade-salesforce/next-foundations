'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import ProductDetailPage from '../../../components/ProductDetailPage'
import { getProductById, getAllProducts } from '../../../lib/products'
import { Product } from '../../../components/ProductListingPage'
import { addToRecentlyViewed, getRecentlyViewedExcluding } from '../../../lib/recentlyViewed'
import ErrorBoundary from '../../../components/ErrorBoundary'
import { getProductRepo } from '../../../src/data'

export default function ProductPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const productId = (params?.id ?? '') as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [productVariants, setProductVariants] = useState<Product[]>([])
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const productRepo = getProductRepo()
        
        // Check if this is a variant and find the base product
        const baseProductId = await productRepo.getBaseProductId(productId)
        const actualBaseProductId = baseProductId || productId
        
        // If we found a different base product, redirect with query params to preserve selection
        if (baseProductId && baseProductId !== productId) {
          const variantProduct = await productRepo.getProductById(productId)
          if (variantProduct) {
            // Build query params from variant's attributes
            const queryParams = new URLSearchParams()
            if (variantProduct.color) queryParams.set('color', variantProduct.color)
            if (variantProduct.size && variantProduct.size.length > 0) {
              queryParams.set('size', variantProduct.size[0])
            }
            if (variantProduct.capacities && variantProduct.capacities.length > 0) {
              queryParams.set('capacity', variantProduct.capacities[0])
            }
            if (variantProduct.scents && variantProduct.scents.length > 0) {
              queryParams.set('scent', variantProduct.scents[0])
            }
            
            const queryString = queryParams.toString()
            const redirectUrl = `/product/${baseProductId}${queryString ? `?${queryString}` : ''}`
            router.replace(redirectUrl)
            return
          }
        }
        
        // Load base product
        const foundProduct = await productRepo.getProductById(actualBaseProductId)
        if (!foundProduct) {
          setLoading(false)
          return
        }
        
        // Load all variants for this base product
        const variants = await productRepo.getProductVariants(actualBaseProductId)
        setProductVariants(variants.length > 0 ? variants : [foundProduct])
        
        // Get all products for suggested products
        const allProducts = await getAllProducts()
        
        setProduct(foundProduct)
        
        // Get suggested products (same category, different product name)
        const suggested = allProducts
          .filter(p => p.category === foundProduct.category && p.name !== foundProduct.name)
          .slice(0, 16)
        setSuggestedProducts(suggested)
        
        // Get recently viewed products (excluding current product)
        const recentProducts = getRecentlyViewedExcluding(actualBaseProductId).slice(0, 5)
        
        // If not enough recently viewed, add some random products to fill
        if (recentProducts.length < 5) {
          const additionalProducts = allProducts
            .filter(p => p.id !== foundProduct.id && !recentProducts.find(rp => rp.id === p.id))
            .slice(0, 5 - recentProducts.length)
          recentProducts.push(...additionalProducts)
        }
        setRecentlyViewed(recentProducts)
        
        // Add current product to recently viewed list
        addToRecentlyViewed(foundProduct)
      } catch (error) {
        console.error('Error loading product:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProduct()
  }, [productId, router])

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
        productVariants={productVariants}
        suggestedProducts={suggestedProducts}
        recentlyViewed={recentlyViewed}
        initialSelection={Object.fromEntries(
          Array.from(searchParams?.entries() ?? []).map(([key, value]) => [key, value])
        )}
      />
    </ErrorBoundary>
  )
}

