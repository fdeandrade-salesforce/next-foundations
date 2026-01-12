import React from 'react'
import Navigation from '../../components/Navigation'
import AnnouncementBar from '../../components/AnnouncementBar'
import ProductListingPage from '../../components/ProductListingPage'
import Footer from '../../components/Footer'
import { getProductsBySubcategory } from '../../lib/products'

export default function WomenPage() {
  const products = getProductsBySubcategory('Women')

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navigation />
      <ProductListingPage products={products} category="Women" />
      <Footer />
    </div>
  )
}

