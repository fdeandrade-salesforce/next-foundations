'use client'

import React from 'react'
import LazyImage from './LazyImage'
import Button from './Button'

export interface PromoBannerItem {
  title: string
  subtitle?: string
  image: string
  ctaText?: string
  ctaLink?: string
  /** Overlay variant - affects text contrast */
  overlayVariant?: 'dark' | 'light'
}

interface PromoBannerGridProps {
  /** Section title (e.g. "New Arrivals") */
  sectionTitle?: string
  /** Two vertical banners */
  banners: [PromoBannerItem, PromoBannerItem]
  className?: string
}

export default function PromoBannerGrid({
  sectionTitle,
  banners,
  className = '',
}: PromoBannerGridProps) {
  return (
    <section className={`py-12 md:py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {sectionTitle && (
          <h2 className="text-2xl md:text-3xl font-light text-brand-black mb-8 tracking-tight">
            {sectionTitle}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {banners.map((banner, index) => {
            const isDark = banner.overlayVariant !== 'light'
            const content = (
              <div className="relative aspect-[3/4] min-h-[320px] md:min-h-[400px] rounded-xl overflow-hidden group">
                <LazyImage
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-105"
                  objectFit="cover"
                />
                <div
                  className="absolute inset-0 flex flex-col justify-end p-6 md:p-8"
                  style={{
                    background: isDark
                      ? 'linear-gradient(to top, oklch(0 0 0 / 70%) 0%, oklch(0 0 0 / 20%) 50%, transparent 100%)'
                      : 'linear-gradient(to top, oklch(1 0 0 / 85%) 0%, oklch(1 0 0 / 30%) 50%, transparent 100%)',
                  }}
                >
                  <div className={isDark ? 'text-white' : 'text-brand-black'}>
                    {banner.subtitle && (
                      <p className="text-xs md:text-sm font-medium uppercase tracking-wide mb-2 opacity-90">
                        {banner.subtitle}
                      </p>
                    )}
                    <h3 className="text-xl md:text-2xl font-semibold mb-4 tracking-tight">
                      {banner.title}
                    </h3>
                    {banner.ctaText && banner.ctaLink && (
                      <Button
                        variant={isDark ? 'secondary' : 'primary'}
                        size="sm"
                        href={banner.ctaLink}
                        className={isDark ? '!bg-white !text-brand-black hover:!bg-brand-gray-100 !border-0' : ''}
                      >
                        {banner.ctaText}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )

            return <div key={index}>{content}</div>
          })}
        </div>
      </div>
    </section>
  )
}
