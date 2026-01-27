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

export default function AccessoriesPage() {
  const [products, setProducts] = useState<Product[]>([])
  
  useEffect(() => {
    const loadProducts = async () => {
      const accessoriesProducts = await getProductsBySubcategory('Accessories')
      setProducts(accessoriesProducts)
    }
    loadProducts()
  }, [])

  // Content blocks to insert in the product grid
  const contentSlots = {
    withinGrid: [
      {
        position: 5, // After 4 products (complete first row)
        columns: 2 as const,
        content: (
          <EditorialCard
            title="Complete Your Look"
            subtitle="Styling Tips"
            description="Mix and match our accessories to create unique combinations that reflect your personal style."
            image="/images/hero/hero-collection.png"
            ctaText="View Guide"
            variant="image-top"
          />
        ),
      },
      {
        position: 9, // After 8 products (complete second row) - normalized to 9
        columns: 'full' as const,
        content: (
          <PromoBanner
            title="Save up to 30% on Accessories"
            subtitle="Sale Event"
            ctaText="Shop Sale"
            variant="gradient"
          />
        ),
      },
      {
        position: 13, // After 12 products (complete third row) - normalized to 13
        columns: 2 as const,
        content: (
          <EditorialCard
            title="Modular Collection"
            subtitle="Build Your Space"
            description="Create your perfect arrangement with our modular accessories that adapt to any space."
            image="/images/products/base-module-1.png"
            ctaText="Shop Modular"
            variant="image-background"
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
        category="Accessories"
        contentSlots={contentSlots}
      />
      <Footer />
    </div>
  )
}

