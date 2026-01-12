import React from 'react'
import ProductCard from './ProductCard'
import { Product } from './ProductListingPage'

interface ProductGridProps {
  title?: string
  products: Product[]
  columns?: 2 | 3 | 4
  onAddToCart?: (product: Product) => void
  onQuickView?: (product: Product) => void
  onAddToWishlist?: (product: Product) => void
  showQuickAdd?: boolean
  wishlistIds?: string[]
}

export default function ProductGrid({ 
  title, 
  products, 
  columns = 4,
  onAddToCart,
  onQuickView,
  onAddToWishlist,
  showQuickAdd = true,
  wishlistIds = [],
}: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  }

  return (
    <section className="py-12 md:py-16 lg:py-20">
      {title && (
        <div className="mb-8 md:mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-normal text-brand-black tracking-tight mb-2">
            {title}
          </h2>
        </div>
      )}
      <div className={`grid ${gridCols[columns]} gap-4 md:gap-6 lg:gap-8`}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onQuickView={onQuickView}
            onAddToWishlist={onAddToWishlist}
            showQuickAdd={showQuickAdd}
            isInWishlist={wishlistIds.includes(product.id)}
          />
        ))}
      </div>
    </section>
  )
}

