'use client'

import React from 'react'

export default function InternalDemoBadge() {
  const handleClick = () => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new Event('open-demo-disclaimer'))
  }

  return (
    <div
      className="fixed bottom-4 left-4 z-40 select-none"
      aria-label="Internal Salesforce demo notice"
    >
      <button
        type="button"
        onClick={handleClick}
        title="View demo disclaimer"
        aria-label="Open demo disclaimer"
        className="group inline-flex items-center gap-2 px-3 py-1.5 bg-black/80 hover:bg-black text-white text-xs font-medium rounded-full shadow-lg backdrop-blur-sm transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue-500" />
        </span>
        Internal Salesforce Demo
        <svg
          className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    </div>
  )
}
