import React from 'react'
import Navigation from '../../components/Navigation'
import ProductListingPage from '../../components/ProductListingPage'
import Footer from '../../components/Footer'
import { getAllProducts } from '../../lib/products'

export default function ShopPage() {
  const products = getAllProducts()

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <ProductListingPage 
        products={products} 
        category="Shop"
        headerImage="/images/hero/hero-collection.png"
      />
      <Footer />
    </div>
  )
}

