'use client'

import React, { useEffect, useState } from 'react'
import Navigation from '../../components/Navigation'
import ProductListingPage from '../../components/ProductListingPage'
import Footer from '../../components/Footer'
import PromoBanner from '../../components/PromoBanner'
import EditorialCard from '../../components/EditorialCard'
import { getAllProducts } from '../../lib/products'
import { Product } from '../../components/ProductListingPage'

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  
  useEffect(() => {
    const loadProducts = async () => {
      const allProducts = await getAllProducts()
      setProducts(allProducts)
    }
    loadProducts()
  }, [])

  // Example content blocks to insert in the product grid
  const contentSlots = {
    withinGrid: [
      {
        position: 5, // After 4 products
        columns: 'full' as const,
        content: (
          <PromoBanner
            title="Save up to 40% on selected premium suits"
            subtitle="Limited Time Offer"
            ctaText="Shop Sale"
            variant="gradient"
          />
        ),
      },
      {
        position: 13, // After 12 products (complete third row)
        columns: 2 as const,
        content: (
          <EditorialCard
            title="Heritage Line"
            subtitle="Exclusive Collection"
            description="Timeless sophistication meets modern craftsmanship"
            image="/images/hero/hero-collection.png"
            ctaText="Shop Now"
            variant="image-background"
          />
        ),
      },
    ],
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <ProductListingPage 
        products={products} 
        category="Shop"
        headerImage="/images/hero/hero-collection.png"
        contentSlots={contentSlots}
      />
      <Footer />
    </div>
  )
}

