'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import ProductCard from './ProductCard'
import { Product } from './ProductListingPage'

export interface ProductCarouselProps {
  id?: string
  title: string
  /** Link for "Shop all" / "See all" - if omitted, the link is hidden */
  shopAllLink?: string
  /** Optional link label - defaults to "Shop all →" */
  shopAllLabel?: string
  /** Optional subtitle below the title */
  subtitle?: string
  products: Product[]
  onUnifiedAction: (product: Product) => void
  onAddToWishlist: (product: Product, size?: string, color?: string) => void
  wishlistIds: string[]
  allProducts: Product[]
  /** Optional section wrapper class (e.g. bg-brand-gray-50 for alternating backgrounds) */
  sectionClassName?: string
}

export default function ProductCarousel({
  id,
  title,
  shopAllLink,
  shopAllLabel = 'Shop all →',
  subtitle,
  products,
  onUnifiedAction,
  onAddToWishlist,
  wishlistIds,
  allProducts,
  sectionClassName = '',
}: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const arrowTopPosition = '30%'

  const checkScrollability = () => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const { scrollLeft: sl, scrollWidth, clientWidth } = container
    const threshold = 1

    setCanScrollLeft(sl > threshold)
    setCanScrollRight(sl < scrollWidth - clientWidth - threshold)
  }

  useEffect(() => {
    checkScrollability()

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollability)
      window.addEventListener('resize', checkScrollability)

      return () => {
        container.removeEventListener('scroll', checkScrollability)
        window.removeEventListener('resize', checkScrollability)
      }
    }
  }, [products])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const { scrollLeft: sl, scrollWidth, clientWidth } = container
    const scrollAmount = container.clientWidth * 0.8
    let targetScroll = sl + (direction === 'left' ? -scrollAmount : scrollAmount)
    const maxScroll = scrollWidth - clientWidth
    targetScroll = Math.max(0, Math.min(targetScroll, maxScroll))

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    const target = e.target as HTMLElement
    if (target.closest('a') || target.closest('button')) return

    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
    scrollContainerRef.current.style.cursor = 'grabbing'
    scrollContainerRef.current.style.userSelect = 'none'
  }

  const handleMouseLeave = () => {
    if (!scrollContainerRef.current) return
    setIsDragging(false)
    scrollContainerRef.current.style.cursor = 'grab'
    scrollContainerRef.current.style.userSelect = 'auto'
  }

  const handleMouseUp = () => {
    if (!scrollContainerRef.current) return
    setIsDragging(false)
    scrollContainerRef.current.style.cursor = 'grab'
    scrollContainerRef.current.style.userSelect = 'auto'
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  if (products.length === 0) return null

  return (
    <section
      id={id}
      className={`py-8 md:py-12 scroll-mt-20 ${sectionClassName}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-normal text-brand-black tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-brand-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        {shopAllLink && (
          <Link
            href={shopAllLink}
            className="text-sm font-medium text-brand-blue-500 hover:text-brand-blue-600 transition-colors flex-shrink-0 ml-4"
          >
            {shopAllLabel}
          </Link>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className={`hidden md:flex absolute z-10 bg-white border border-brand-gray-300 rounded-lg p-2 shadow-md hover:bg-brand-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 ${
            canScrollLeft
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
          style={{
            left: '-12px',
            top: arrowTopPosition,
            transform: `translateY(-50%) ${canScrollLeft ? 'translateX(0)' : 'translateX(-8px)'}`,
          }}
          aria-label={`Scroll ${title} left`}
          disabled={!canScrollLeft}
        >
          <svg
            className="w-5 h-5 text-brand-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div
          ref={scrollContainerRef}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth cursor-grab active:cursor-grabbing"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onScroll={checkScrollability}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px]"
            >
              <ProductCard
                product={product}
                onUnifiedAction={onUnifiedAction}
                onAddToWishlist={onAddToWishlist}
                isInWishlist={wishlistIds.includes(product.id)}
                allProducts={allProducts}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className={`hidden md:flex absolute z-10 bg-white border border-brand-gray-300 rounded-lg p-2 shadow-md hover:bg-brand-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 ${
            canScrollRight
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
          style={{
            right: '-12px',
            top: arrowTopPosition,
            transform: `translateY(-50%) ${canScrollRight ? 'translateX(0)' : 'translateX(8px)'}`,
          }}
          aria-label={`Scroll ${title} right`}
          disabled={!canScrollRight}
        >
          <svg
            className="w-5 h-5 text-brand-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </section>
  )
}
