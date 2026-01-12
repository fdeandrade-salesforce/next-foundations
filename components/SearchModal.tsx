'use client'

import React, { useState, useRef, useEffect } from 'react'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenAgent: () => void
}

const recentSearches = [
  { type: 'history', text: 'geometric sculptures for living room' },
  { type: 'search', text: 'white minimalist decor' },
  { type: 'search', text: 'abstract art pieces' },
  { type: 'search', text: 'modern cube designs' },
]

const bestsellers = [
  {
    id: '1',
    name: 'Signature Form',
    price: 89.00,
    image: '/images/products/signature-form-white-1.png',
  },
  {
    id: '2',
    name: 'Pure Cube',
    price: 65.00,
    image: '/images/products/pure-cube-white-1.png',
  },
  {
    id: '3',
    name: 'Soft Sphere',
    price: 75.00,
    image: '/images/products/soft-sphere-1.png',
  },
]

export default function SearchModal({ isOpen, onClose, onOpenAgent }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Header */}
          <div className="flex items-center gap-4 py-4 border-b border-brand-gray-200">
            {/* Search Icon */}
            <svg className="w-5 h-5 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            
            {/* Search Input */}
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="flex-1 text-lg text-brand-black placeholder-brand-gray-400 outline-none bg-transparent"
            />
            
            {/* Clear Button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-1.5 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors"
              >
                Clear
              </button>
            )}
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-brand-gray-500 hover:text-brand-black transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Search Content */}
          <div className="py-8">
            <div className="flex gap-12">
              {/* Recent Searches */}
              <div className="w-64 flex-shrink-0">
                <h3 className="text-sm font-semibold text-brand-black mb-4">Recent Searches</h3>
                <ul className="space-y-3">
                  {recentSearches.map((item, idx) => (
                    <li key={idx}>
                      <button className="flex items-center gap-3 text-sm text-brand-gray-600 hover:text-brand-black transition-colors w-full text-left group">
                        {item.type === 'history' ? (
                          <svg className="w-4 h-4 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        )}
                        <span className="flex-1">{item.text}</span>
                        <svg className="w-4 h-4 text-brand-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Bestsellers */}
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-brand-black mb-4">Bestsellers</h3>
                <div className="grid grid-cols-3 gap-6">
                  {bestsellers.map((product) => (
                    <a
                      key={product.id}
                      href={`/product/${product.id}`}
                      className="group"
                      onClick={onClose}
                    >
                      <div className="aspect-square bg-brand-gray-100 rounded-lg overflow-hidden mb-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="text-sm font-medium text-brand-black">{product.name}</p>
                      <p className="text-sm text-brand-gray-600">${product.price.toFixed(2)}</p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Personal Assistant Banner */}
            <button
              onClick={() => {
                onClose()
                onOpenAgent()
              }}
              className="mt-8 w-full border border-brand-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-brand-blue-300 hover:bg-brand-blue-50/50 transition-colors group"
            >
              {/* Sparkle Icon */}
              <div className="w-10 h-10 bg-brand-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L9.5 9.5L2 12L9.5 14.5L12 22L14.5 14.5L22 12L14.5 9.5L12 2Z" />
                </svg>
              </div>
              
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-brand-black">Shop with your Personal Assistant</p>
                <p className="text-sm text-brand-gray-500">I can help you find the perfect piece for your space. Shop with me.</p>
              </div>
              
              <svg className="w-5 h-5 text-brand-gray-400 group-hover:text-brand-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
