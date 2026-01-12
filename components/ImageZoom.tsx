'use client'

import React, { useState, useRef, useCallback } from 'react'
import LazyImage from './LazyImage'

interface ImageZoomProps {
  src: string
  alt: string
  className?: string
}

export default function ImageZoom({ src, alt, className = '' }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setPosition({ x, y })
  }, [isZoomed])

  const handleMouseLeave = useCallback(() => {
    if (isZoomed) {
      setPosition({ x: 50, y: 50 })
    }
  }, [isZoomed])

  const toggleZoom = useCallback(() => {
    setIsZoomed(!isZoomed)
    setPosition({ x: 50, y: 50 })
  }, [isZoomed])

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className={`aspect-square bg-brand-gray-100 rounded-2xl overflow-hidden relative ${
          isZoomed ? 'cursor-move' : 'cursor-zoom-in'
        }`}
        onClick={!isZoomed ? toggleZoom : undefined}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="w-full h-full transition-transform duration-100 ease-out"
          style={{
            transformOrigin: `${position.x}% ${position.y}%`,
            transform: isZoomed ? 'scale(2.5)' : 'scale(1)',
          }}
        >
          <LazyImage
            src={src}
            alt={alt}
            className="w-full h-full"
            objectFit="cover"
          />
        </div>

        {/* Zoom indicator overlay when zoomed */}
        {isZoomed && (
          <div className="absolute top-4 left-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none">
            Move cursor to pan • Click to exit
          </div>
        )}
      </div>

      {/* Zoom button */}
      <button
        onClick={toggleZoom}
        className={`absolute bottom-4 right-4 p-2 rounded-lg shadow-md transition-all z-10 ${
          isZoomed
            ? 'bg-brand-blue-500 text-white hover:bg-brand-blue-600'
            : 'bg-white/90 hover:bg-white text-brand-gray-600'
        }`}
        aria-label={isZoomed ? 'Exit zoom' : 'Zoom in'}
      >
        {isZoomed ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        )}
      </button>

      {/* Click overlay to exit zoom */}
      {isZoomed && (
        <button
          onClick={toggleZoom}
          className="absolute bottom-4 left-4 px-3 py-1.5 bg-white/90 hover:bg-white text-brand-gray-700 text-sm font-medium rounded-lg shadow-md transition-colors z-10"
        >
          Exit Zoom
        </button>
      )}
    </div>
  )
}
