'use client'

import React, { useEffect, useState } from 'react'
import Navigation from '../../components/Navigation'
import ProductListingPage from '../../components/ProductListingPage'
import Footer from '../../components/Footer'
import { getSaleProducts } from '../../lib/products'
import { Product } from '../../components/ProductListingPage'

export default function SalePage() {
  const [products, setProducts] = useState<Product[]>([])
  
  useEffect(() => {
    const loadProducts = async () => {
      const saleProducts = await getSaleProducts()
      setProducts(saleProducts)
    }
    loadProducts()
  }, [])

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
