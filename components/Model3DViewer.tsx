'use client'

import React, { useEffect, useRef } from 'react'

interface Model3DViewerProps {
  src: string
  alt: string
  className?: string
  autoRotate?: boolean
  cameraControls?: boolean
  interactionPrompt?: boolean
}

export default function Model3DViewer({
  src,
  alt,
  className = '',
  autoRotate = true,
  cameraControls = true,
  interactionPrompt = true,
}: Model3DViewerProps) {
  const modelViewerRef = useRef<any>(null)

  useEffect(() => {
    // Ensure model-viewer is loaded (it's loaded via Next.js Script in layout)
    // This effect ensures the component is ready
  }, [])

  return (
    <div className={`relative ${className} overflow-hidden`}>
      {/* Studio backdrop background - wall */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: '#e5e7eb',
        }}
      />
      
      {/* 3D Floor plane with perspective */}
      <div 
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '50%',
          background: '#f3f4f6',
          transform: 'perspective(800px) rotateX(75deg)',
          transformOrigin: 'bottom center',
          transformStyle: 'preserve-3d',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        }}
      />
      
      <model-viewer
        ref={modelViewerRef}
        src={src}
        alt={alt}
        auto-rotate={autoRotate}
        camera-controls={cameraControls}
        interaction-prompt={interactionPrompt}
        interaction-prompt-threshold="0"
        shadow-intensity="1"
        environment-image="neutral"
        exposure="1"
        ar
        ar-modes="webxr scene-viewer quick-look"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
        }}
        className="w-full h-full relative z-10"
      >
        {/* Loading placeholder */}
        <div
          slot="poster"
          className="absolute inset-0 bg-brand-gray-200 animate-skeleton-shimmer flex items-center justify-center"
        >
          <div className="text-center">
            <svg
              className="w-12 h-12 text-brand-gray-400 mx-auto mb-2 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <p className="text-sm text-brand-gray-600">Loading 3D model...</p>
          </div>
        </div>
      </model-viewer>

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg pointer-events-none z-20">
        <p className="font-medium mb-1">3D View</p>
        <p>Drag to rotate • Scroll to zoom • Right-click to pan</p>
      </div>
    </div>
  )
}
