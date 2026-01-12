import React from 'react'
import Navigation from '../../../components/Navigation'
import ProductListingPage from '../../../components/ProductListingPage'
import Footer from '../../../components/Footer'
import { getProductsBySubcategory } from '../../../lib/products'

interface PageProps {
  params: {
    subcategory: string
  }
}

export default function WomanSubcategoryPage({ params }: PageProps) {
  const subcategory = params.subcategory
  const products = getProductsBySubcategory('Woman', subcategory)

  // Capitalize first letter of subcategory
  const formattedSubcategory = subcategory.charAt(0).toUpperCase() + subcategory.slice(1)

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <ProductListingPage
        products={products}
        category="Woman"
        subcategory={formattedSubcategory}
      />
      <Footer />
    </div>
  )
}

