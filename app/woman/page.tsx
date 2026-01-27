'use client'

import React, { useEffect, useState } from 'react'
import Navigation from '../../components/Navigation'
import ProductListingPage from '../../components/ProductListingPage'
import Footer from '../../components/Footer'
import { getProductsBySubcategory } from '../../lib/products'
import { Product } from '../../components/ProductListingPage'

export default function WomanPage() {
  const [products, setProducts] = useState<Product[]>([])
  
  useEffect(() => {
    const loadProducts = async () => {
      const womanProducts = await getProductsBySubcategory('Woman')
      setProducts(womanProducts)
    }
    loadProducts()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <ProductListingPage products={products} category="Woman" />
      <Footer />
    </div>
  )
}

