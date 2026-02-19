'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navigation from '../../components/Navigation'
import ProductListingPage from '../../components/ProductListingPage'
import Footer from '../../components/Footer'
import { searchProducts } from '../../lib/products'
import { Product } from '../../components/ProductListingPage'
import { useAgent } from '../../context/AgentContext'

function SearchContent() {
  const searchParams = useSearchParams()
  const q = searchParams?.get('q') ?? ''
  const openWithAgent = searchParams?.get('agent') === '1'
  const { openAgent } = useAgent()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const agentOpenedRef = React.useRef(false)

  // Open agent with search context when agent=1 is in URL
  useEffect(() => {
    if (!openWithAgent || !q.trim() || agentOpenedRef.current) return
    agentOpenedRef.current = true
    openAgent(`I'm looking for ${q}`, { searchQuery: q })
  }, [openWithAgent, q, openAgent])

  useEffect(() => {
    if (!q.trim()) {
      setProducts([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    searchProducts(q.trim(), 100)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false))
  }, [q])

  if (!q.trim()) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-2xl font-semibold text-brand-black mb-4">Search</h1>
          <p className="text-brand-gray-600">Enter a search term to find products.</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 text-brand-gray-500">
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Searching for &quot;{q}&quot;...</span>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <ProductListingPage
        products={products}
        category="Search"
        subcategory={`"${q}"`}
      />
      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-brand-gray-500">
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading...</span>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
