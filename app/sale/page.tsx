import React from 'react'
import Navigation from '../../components/Navigation'
import ProductListingPage from '../../components/ProductListingPage'
import Footer from '../../components/Footer'
import { getSaleProducts } from '../../lib/products'

export default function SalePage() {
  const products = getSaleProducts()

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <ProductListingPage 
        products={products} 
        category="Sale"
        subcategory="Special Offers"
        headerImage="/images/products/twin-towers-large-1.png"
      />
      <Footer />
    </div>
  )
}
