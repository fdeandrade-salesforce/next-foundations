'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import LazyImage from './LazyImage'

/** Card for category variant - image-based promotional cards */
export interface CategoryCard {
  title: string
  image: string
  link?: string
  /** Optional subtitle or description */
  description?: string
}

/** Card for value variant - text-based with accent border */
export interface ValueCard {
  title: string
  description: string
}

interface ProductCategoriesGridProps {
  /** Section title (e.g. "Step into Elegance") */
  title?: string
  /** Section subtitle/description */
  subtitle?: string
  /** Layout variant */
  variant: 'category' | 'value'
  /** Cards - category variant supports any number (carousel), value variant uses 4 */
  cards: (CategoryCard | ValueCard)[]
  className?: string
}

export default function ProductCategoriesGrid({
  title,
  subtitle,
  variant,
  cards,
  className = '',
}: ProductCategoriesGridProps) {
  const isCategoryVariant = variant === 'category'
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const arrowTopPosition = '50%'

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
  }, [cards, isCategoryVariant])

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

  return (
    <section className={`py-12 md:py-16 lg:py-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-10 md:mb-12">
            {title && (
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-brand-black mb-4 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-body-lg text-brand-gray-700 leading-relaxed max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {isCategoryVariant ? (
          <div className="relative">
            {/* Left arrow */}
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
              aria-label={`Scroll ${title || 'categories'} left`}
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
              className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {(cards as CategoryCard[]).map((catCard, index) => {
                const cardWidthClasses = 'flex-shrink-0 w-[240px] sm:w-[260px] md:w-[280px] lg:w-[300px]'
                const content = (
                  <div className="group relative overflow-hidden rounded-xl bg-brand-gray-100 h-full">
                    <div className="aspect-square overflow-hidden">
                      <LazyImage
                        src={catCard.image}
                        alt={catCard.title}
                        className="w-full h-full transition-transform duration-slow group-hover:scale-105"
                        objectFit="cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                      <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-12 flex flex-col justify-end">
                        <div>
                          <h3 className="text-xl md:text-2xl font-semibold text-white mb-1 tracking-tight">
                            {catCard.title}
                          </h3>
                          {catCard.description && (
                            <p className="text-sm text-white/90">{catCard.description}</p>
                          )}
                        </div>
                        {catCard.link && (
                          <div className="overflow-hidden max-h-0 transition-[max-height] duration-300 ease-out group-hover:max-h-8 mt-1">
                            <span className="inline-block text-sm font-medium text-white">
                              Shop Now
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )

                return catCard.link ? (
                  <Link
                    key={index}
                    href={catCard.link}
                    className={`block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 focus-visible:ring-offset-2 rounded-xl ${cardWidthClasses}`}
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={index} className={cardWidthClasses}>
                    {content}
                  </div>
                )
              })}
            </div>

            {/* Right arrow */}
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
              aria-label={`Scroll ${title || 'categories'} right`}
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {(cards as ValueCard[]).map((valueCard, index) => (
              <div
                key={index}
                className="border-l-4 border-brand-blue-500 pl-6 md:pl-8 py-1"
              >
                <h4 className="text-h6 font-semibold text-brand-black mb-2">
                  {valueCard.title}
                </h4>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  {valueCard.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
