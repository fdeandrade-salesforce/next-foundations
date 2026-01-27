'use client'

import React, { useEffect, useState } from 'react'
import Navigation from '../../components/Navigation'
import AnnouncementBar from '../../components/AnnouncementBar'
import ProductListingPage from '../../components/ProductListingPage'
import Footer from '../../components/Footer'
import { getProductsBySubcategory } from '../../lib/products'
import { Product } from '../../components/ProductListingPage'

export default function MenPage() {
  const [products, setProducts] = useState<Product[]>([])
  
  useEffect(() => {
    const loadProducts = async () => {
      const menProducts = await getProductsBySubcategory('Men')
      setProducts(menProducts)
    }
    loadProducts()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navigation />
      <ProductListingPage products={products} category="Men" />
      <Footer />
    </div>
  )
}

