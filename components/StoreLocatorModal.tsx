'use client'

import React, { useState, useEffect } from 'react'
import ModalHeader from './ModalHeader'
import { getStoreRepo } from '../src/data'

// Store data is now loaded from repository
// See /src/data/mock/stores.ts for the store data

interface Store {
  id: string
  name: string
  address: string
  distance: number
  hours: string
  status: 'open' | 'closed' | 'closing-soon'
  hasProduct: boolean
  pickupTime: string | null
}

interface StoreLocatorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectStore: (store: Store) => void
  productName?: string
  selectedStoreId?: string
}

export default function StoreLocatorModal({
  isOpen,
  onClose,
  onSelectStore,
  productName,
  selectedStoreId,
}: StoreLocatorModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStore, setSelectedStore] = useState<string>(selectedStoreId || '')
  const [showStoreHours, setShowStoreHours] = useState<string | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)

  // Load stores from repository
  useEffect(() => {
    const loadStores = async () => {
      try {
        const storeRepo = getStoreRepo()
        const repoStores = await storeRepo.getAllStores()
        
        // Map repository stores to modal's Store format
        const mappedStores: Store[] = repoStores.map((repoStore) => {
          // Determine status from isOpen and hours
          let status: 'open' | 'closed' | 'closing-soon' = 'open'
          if (!repoStore.isOpen) {
            status = 'closed'
          } else if (repoStore.hours?.toLowerCase().includes('closing soon')) {
            status = 'closing-soon'
          }
          
          // Build full address string
          const fullAddress = `${repoStore.address}, ${repoStore.city}, ${repoStore.state} ${repoStore.zipCode}`
          
          return {
            id: repoStore.id,
            name: repoStore.name,
            address: fullAddress,
            distance: repoStore.distance || 0,
            hours: repoStore.hours || 'Hours not available',
            status,
            hasProduct: true, // Default to true - in production this would come from inventory check
            pickupTime: repoStore.pickupTime || 'Ready in 2 hours',
          }
        })
        
        setStores(mappedStores)
      } catch (error) {
        console.error('Error loading stores:', error)
        setStores([])
      } finally {
        setLoading(false)
      }
    }
    
    if (isOpen) {
      loadStores()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSelectStore = (store: Store) => {
    setSelectedStore(store.id)
    onSelectStore(store)
  }

  const handleUseMyLocation = () => {
    // In a real app, this would use the Geolocation API
    console.log('Using current location...')
  }

  const filteredStores = searchQuery
    ? stores.filter(
        (store) =>
          store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : stores

  const availableStores = filteredStores.filter((store) => store.hasProduct)
  const unavailableStores = filteredStores.filter((store) => !store.hasProduct)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div data-modal-overlay className="fixed inset-0 backdrop-light transition-opacity" onClick={onClose} />

      {/* Modal Panel - Slides in from right */}
      <div data-modal-panel className="fixed inset-y-0 right-0 max-w-lg w-full bg-card shadow-modal overflow-hidden flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex-shrink-0">
          <ModalHeader title="Find a Store" onClose={onClose} closeAriaLabel="Close" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Search Section */}
          <div className="p-6 space-y-6">
            {/* Address Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-brand-black">
                Enter your address
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search any Address or Zip Code"
                  className="w-full px-3 py-2 bg-white border border-brand-gray-200 rounded text-sm text-brand-black placeholder-brand-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500 shadow-sm"
                />
              </div>
            </div>

            {/* Or Divider */}
            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-px bg-brand-gray-200" />
              <span className="text-sm text-brand-gray-500">Or</span>
              <div className="flex-1 h-px bg-brand-gray-200" />
            </div>

            {/* Use My Location Button */}
            <button
              onClick={handleUseMyLocation}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-blue-500 text-white font-medium text-sm rounded shadow-sm hover:bg-brand-blue-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Use My Location
            </button>

            {/* Divider */}
            <div className="h-px bg-brand-gray-200" />
          </div>

          {/* Store List */}
          <div className="px-6 pb-6 space-y-8">
            {/* Results Header */}
            <p className="text-base font-semibold text-brand-black text-center tracking-tight">
              Viewing stores within 100 miles
            </p>

            {/* Available Stores */}
            {availableStores.length > 0 && (
              <div className="space-y-0">
                {availableStores.map((store, index) => (
                  <div key={store.id}>
                    <button
                      onClick={() => handleSelectStore(store)}
                      className="w-full flex items-start gap-3 py-4 text-left cursor-pointer hover:bg-brand-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                    >
                      {/* Radio Button */}
                      <div className="mt-0.5 shrink-0">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shadow-sm ${
                            selectedStore === store.id
                              ? 'border-brand-blue-500 bg-white'
                              : 'border-brand-gray-300 bg-white'
                          }`}
                        >
                          {selectedStore === store.id && (
                            <div className="w-2 h-2 rounded-full bg-brand-blue-500" />
                          )}
                        </div>
                      </div>

                      {/* Store Info */}
                      <div className="flex-1 space-y-1.5 pt-px">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-brand-black">{store.name}</p>
                        </div>
                        <p className="text-sm text-brand-gray-500 leading-5">{store.address}</p>
                        
                        {/* Actions Row */}
                        <div className="flex flex-wrap items-center gap-2.5 text-sm">
                          {/* Distance */}
                          <span className="flex items-center gap-2 text-brand-gray-500 font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {store.distance.toFixed(1)} miles away
                          </span>

                          {/* Store Hours Link - no "Open today" inference; hours shown in collapsible */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowStoreHours(showStoreHours === store.id ? null : store.id)
                            }}
                            className="text-brand-blue-500 font-medium underline hover:text-brand-blue-600"
                          >
                            Store Hours
                          </button>
                        </div>

                        {/* Pickup Time */}
                        {store.pickupTime && selectedStore === store.id && (
                          <p className="text-sm text-success font-medium mt-2">
                            ✓ {store.pickupTime}
                          </p>
                        )}

                        {/* Store Hours Dropdown - renders unstructured API text safely, no parsing */}
                        {showStoreHours === store.id && store.hours && (
                          <div className="mt-3 p-3 bg-brand-gray-50 rounded-lg text-xs text-brand-gray-600 whitespace-pre-wrap">
                            {store.hours.replace(/<[^>]*>/g, '').trim() || store.hours}
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Divider */}
                    {index < availableStores.length - 1 && (
                      <div className="h-px bg-brand-gray-200" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Unavailable Stores */}
            {unavailableStores.length > 0 && (
              <div className="space-y-0 mt-6">
                <div className="h-px bg-brand-gray-200 mb-4" />
                <p className="text-sm font-medium text-brand-gray-500 mb-4">
                  {productName ? `Not available for pickup at these stores:` : 'Product unavailable:'}
                </p>
                {unavailableStores.map((store, index) => (
                  <div key={store.id}>
                    <div className="flex items-start gap-3 py-4 opacity-60">
                      {/* Disabled Radio */}
                      <div className="mt-0.5 shrink-0">
                        <div className="w-4 h-4 rounded-full border border-brand-gray-200 bg-brand-gray-100" />
                      </div>

                      {/* Store Info */}
                      <div className="flex-1 space-y-1.5 pt-px">
                        <p className="text-sm font-medium text-brand-gray-500">{store.name}</p>
                        <p className="text-sm text-brand-gray-400">{store.address}</p>
                        <div className="flex items-center gap-2.5 text-sm text-brand-gray-400 font-medium">
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {store.distance.toFixed(1)} miles away
                          </span>
                        </div>
                        <p className="text-xs text-error font-medium">Out of stock at this location</p>
                      </div>
                    </div>
                    {index < unavailableStores.length - 1 && (
                      <div className="h-px bg-brand-gray-200" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-500 mx-auto mb-4"></div>
                <p className="text-brand-gray-600 font-medium">Loading stores...</p>
              </div>
            )}

            {/* No Results */}
            {!loading && filteredStores.length === 0 && (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-brand-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-brand-gray-600 font-medium">No stores found</p>
                <p className="text-sm text-brand-gray-500 mt-1">Try a different search or location</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Confirm Selection */}
        {selectedStore && (
          <div className="border-t border-brand-gray-200 p-6 bg-white">
            <button
              onClick={onClose}
              className="w-full py-3 bg-brand-blue-500 text-white font-medium rounded-lg hover:bg-brand-blue-600 transition-colors"
            >
              Confirm Store Selection
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

