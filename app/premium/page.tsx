import React from 'react'
import Navigation from '../../components/Navigation'
import ProductListingPage from '../../components/ProductListingPage'
import Footer from '../../components/Footer'
import { getAllProducts } from '../../lib/products'

export default function PremiumPage() {
  const allProducts = getAllProducts()
  const products = allProducts.filter(p => p.category === 'Premium')

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <ProductListingPage 
        products={products} 
        category="Premium"
        headerImage="/images/products/signature-form-silver-1.png"
      />
      <Footer />
    </div>
  )
}

