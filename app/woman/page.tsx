import React from 'react'
import Navigation from '../../components/Navigation'
import ProductListingPage from '../../components/ProductListingPage'
import Footer from '../../components/Footer'
import { getProductsBySubcategory } from '../../lib/products'

export default function WomanPage() {
  const products = getProductsBySubcategory('Woman')

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <ProductListingPage products={products} category="Woman" />
      <Footer />
    </div>
  )
}

