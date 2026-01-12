import React from 'react'
import Navigation from '../../../components/Navigation'
import AnnouncementBar from '../../../components/AnnouncementBar'
import ProductListingPage from '../../../components/ProductListingPage'
import Footer from '../../../components/Footer'
import { getProductsBySubcategory } from '../../../lib/products'

interface PageProps {
  params: {
    subcategory: string
  }
}

export default function WomenSubcategoryPage({ params }: PageProps) {
  const subcategory = params.subcategory
  const products = getProductsBySubcategory('Women', subcategory)

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

