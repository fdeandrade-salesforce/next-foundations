import React from 'react'
import Link from 'next/link'
import LazyImage from './LazyImage'

interface EditorialCardProps {
  title: string
  subtitle?: string
  description?: string
  image?: string
  imageAlt?: string
  ctaText?: string
  ctaLink?: string
  variant?: 'image-left' | 'image-right' | 'image-top' | 'image-background'
  onCtaClick?: () => void
}

export default function EditorialCard({
  title,
  subtitle,
  description,
  image,
  imageAlt,
  ctaText = 'Shop Now',
  ctaLink,
  variant = 'image-background',
  onCtaClick,
}: EditorialCardProps) {
  const renderContent = () => {
    if (variant === 'image-background' && image) {
      return (
        <div className="relative rounded-lg overflow-hidden h-full min-h-[300px] md:min-h-[400px]">
          {image && (
            <LazyImage
              src={image}
              alt={imageAlt || title}
              className="w-full h-full"
              objectFit="cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/50 to-foreground/70" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 lg:p-10 text-white">
            {subtitle && (
              <p className="text-xs md:text-sm font-medium uppercase tracking-wide mb-2 opacity-90">
                {subtitle}
              </p>
            )}
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-3">
              {title}
            </h3>
            {description && (
              <p className="text-sm md:text-base mb-4 opacity-90 max-w-2xl">
                {description}
              </p>
            )}
            {ctaText && (
              <button
                onClick={onCtaClick}
                className="inline-block bg-white text-brand-black px-6 py-2.5 md:py-3 text-sm font-medium rounded-lg hover:bg-brand-gray-100 transition-colors w-fit"
              >
                {ctaText}
              </button>
            )}
          </div>
        </div>
      )
    }

    if (variant === 'image-top' && image) {
      return (
        <div className="bg-white border border-brand-gray-200 rounded-lg overflow-hidden h-full flex flex-col">
          <div className="relative aspect-[4/3] overflow-hidden">
            <LazyImage
              src={image}
              alt={imageAlt || title}
              className="w-full h-full"
              objectFit="cover"
            />
          </div>
          <div className="p-6 flex-1 flex flex-col">
            {subtitle && (
              <p className="text-xs font-medium uppercase tracking-wide text-brand-gray-600 mb-2">
                {subtitle}
              </p>
            )}
            <h3 className="text-xl font-semibold text-brand-black mb-2">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-brand-gray-600 mb-4 flex-1">
                {description}
              </p>
            )}
            {ctaText && (
              <button
                onClick={onCtaClick}
                className="text-sm text-brand-blue-500 font-medium hover:text-brand-blue-600 transition-colors w-fit"
              >
                {ctaText} →
              </button>
            )}
          </div>
        </div>
      )
    }

    // Default: image-left or image-right
    return (
      <div className="bg-white border border-brand-gray-200 rounded-lg overflow-hidden h-full">
        <div className={`flex flex-col ${variant === 'image-right' ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
          {image && (
            <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto">
              <LazyImage
                src={image}
                alt={imageAlt || title}
                className="w-full h-full"
                objectFit="cover"
              />
            </div>
          )}
          <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
            {subtitle && (
              <p className="text-xs font-medium uppercase tracking-wide text-brand-gray-600 mb-2">
                {subtitle}
              </p>
            )}
            <h3 className="text-xl md:text-2xl font-semibold text-brand-black mb-3">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-brand-gray-600 mb-4">
                {description}
              </p>
            )}
            {ctaText && (
              <button
                onClick={onCtaClick}
                className="text-sm text-brand-blue-500 font-medium hover:text-brand-blue-600 transition-colors w-fit"
              >
                {ctaText} →
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const content = renderContent()

  if (ctaLink && !onCtaClick) {
    return (
      <div className="h-full relative">
        {content}
        <Link href={ctaLink} className="absolute inset-0 z-10" aria-label={ctaText} />
      </div>
    )
  }

  return <div className="h-full">{content}</div>
}
