'use client'

import React, { useEffect, useState } from 'react'
import Navigation from '../../components/Navigation'
import AnnouncementBar from '../../components/AnnouncementBar'
import ProductListingPage from '../../components/ProductListingPage'
import Footer from '../../components/Footer'
import PromoBanner from '../../components/PromoBanner'
import EditorialCard from '../../components/EditorialCard'
import { getProductsBySubcategory } from '../../lib/products'
import { Product } from '../../components/ProductListingPage'

export default function WomenPage() {
  const [products, setProducts] = useState<Product[]>([])
  
  useEffect(() => {
    const loadProducts = async () => {
      const womenProducts = await getProductsBySubcategory('Women')
      setProducts(womenProducts)
    }
    loadProducts()
  }, [])

  // Content blocks to insert in the product grid
  const contentSlots = {
    withinGrid: [
      {
        position: 5, // After 4 products (complete first row)
        columns: 'full' as const,
        content: (
          <PromoBanner
            title="New Collection: Geometric Forms"
            subtitle="Limited Time Offer"
            ctaText="Shop Collection"
            variant="gradient"
          />
        ),
      },
      {
        position: 9, // After 8 products (complete second row) - normalized to 9
        columns: 2 as const,
        content: (
          <EditorialCard
            title="Premium Collection"
            subtitle="Signature Series"
            description="Discover our curated selection of premium geometric designs crafted for the modern woman."
            image="/images/hero/hero-collection.png"
            ctaText="Explore Premium"
            variant="image-background"
          />
        ),
      },
      {
        position: 17, // After 16 products (complete fourth row) - normalized to 17
        columns: 'full' as const,
        content: (
          <PromoBanner
            title="Free Shipping on Orders Over $100"
            subtitle="Special Offer"
            ctaText="Shop Now"
            variant="primary"
          />
        ),
      },
    ],
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navigation />
      <ProductListingPage 
        products={products} 
        category="Women"
        contentSlots={contentSlots}
      />
      <Footer />
    </div>
  )
}

