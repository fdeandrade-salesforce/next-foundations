'use client'

import React, { useEffect, useState } from 'react'
import Navigation from '../../../components/Navigation'
import AnnouncementBar from '../../../components/AnnouncementBar'
import ProductListingPage from '../../../components/ProductListingPage'
import Footer from '../../../components/Footer'
import { getProductsBySubcategory } from '../../../lib/products'
import { Product } from '../../../components/ProductListingPage'

interface PageProps {
  params: {
    subcategory: string
  }
}

export default function WomenSubcategoryPage({ params }: PageProps) {
  const subcategory = params.subcategory
  const [products, setProducts] = useState<Product[]>([])
  
  useEffect(() => {
    const loadProducts = async () => {
      const subcategoryProducts = await getProductsBySubcategory('Women', subcategory)
      setProducts(subcategoryProducts)
    }
    loadProducts()
  }, [subcategory])

  // Capitalize first letter of subcategory
  const formattedSubcategory = subcategory.charAt(0).toUpperCase() + subcategory.slice(1)

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navigation />
      <ProductListingPage
        products={products}
        category="Women"
        subcategory={formattedSubcategory}
      />
      <Footer />
    </div>
  )
}

