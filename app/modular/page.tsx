'use client'

import React, { useEffect, useState } from 'react'
import Navigation from '../../components/Navigation'
import ProductListingPage from '../../components/ProductListingPage'
import Footer from '../../components/Footer'
import { getAllProducts } from '../../lib/products'
import { Product } from '../../components/ProductListingPage'

export default function ModularPage() {
  const [products, setProducts] = useState<Product[]>([])
  
  useEffect(() => {
    const loadProducts = async () => {
      const allProds = await getAllProducts()
      const modularProducts = allProds.filter(p => p.category === 'Modular')
      setProducts(modularProducts)
    }
    loadProducts()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <ProductListingPage 
        products={products} 
        category="Modular"
        headerImage="/images/products/base-module-1.png"
      />
      <Footer />
    </div>
  )
}

