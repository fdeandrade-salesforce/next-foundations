'use client'

import React, { useState } from 'react'

// Mock store data
const mockStores = [
  {
    id: '1',
    name: 'Dorchester',
    address: '26 District Avenue, Dorchester, MA 02125',
    distance: 0.0,
    hours: 'Open 24 hours',
    status: 'open' as const,
    hasProduct: true,
    pickupTime: 'Ready in 1 hour',
  },
  {
    id: '2',
    name: 'Somerville Square',
    address: '478 Artisan Way, Somerville, MA 02145',
    distance: 3.1,
    hours: 'Closing soon – 11 PM',
    status: 'closing-soon' as const,
    hasProduct: true,
    pickupTime: 'Ready in 2 hours',
  },
  {
    id: '3',
    name: 'The Arsenal',
    address: '550 Arsenal St., Watertown, MA 02472',
    distance: 6.0,
    hours: 'Closed',
    status: 'closed' as const,
    hasProduct: true,
    pickupTime: 'Ready tomorrow at 10 AM',
  },
  {
    id: '4',
    name: 'Store 363 - Somerville Square',
    address: '478 Artisan Way, Somerville, MA 02145',
    distance: 6.0,
    hours: 'Closing soon – 11 PM',
    status: 'closing-soon' as const,
    hasProduct: false,
    pickupTime: null,
  },
  {
    id: '5',
    name: 'Store 408 - The Arsenal',
    address: '26 District Avenue, Dorchester, MA 02125',
    distance: 6.0,
    hours: 'Closing soon – 11 PM',
    status: 'closing-soon' as const,
    hasProduct: true,
    pickupTime: 'Ready in 3 hours',
  },
  {
    id: '6',
    name: 'Cambridge Galleria',
    address: '100 CambridgeSide Place, Cambridge, MA 02141',
    distance: 8.2,
    hours: 'Open until 9 PM',
    status: 'open' as const,
    hasProduct: true,
    pickupTime: 'Ready in 1 hour',
  },
]

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

  if (!isOpen) return null

  const getStatusColor = (status: Store['status']) => {
    switch (status) {
      case 'open':
        return 'text-green-600'
      case 'closing-soon':
        return 'text-orange-500'
      case 'closed':
        return 'text-brand-gray-500'
    }
  }

  const handleSelectStore = (store: Store) => {
    setSelectedStore(store.id)
    onSelectStore(store)
  }

  const handleUseMyLocation = () => {
    // In a real app, this would use the Geolocation API
    console.log('Using current location...')
  }

  const filteredStores = searchQuery
    ? mockStores.filter(
        (store) =>
          store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockStores

  const availableStores = filteredStores.filter((store) => store.hasProduct)
  const unavailableStores = filteredStores.filter((store) => !store.hasProduct)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" onClick={onClose} />

      {/* Modal Panel - Slides in from right */}
      <div className="fixed inset-y-0 right-0 max-w-lg w-full bg-white shadow-xl overflow-hidden flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-start justify-between pt-6 px-6 pb-0">
          <h2 className="text-lg font-semibold text-brand-black tracking-tight">Find a Store</h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-brand-gray-500 hover:text-brand-black transition-colors opacity-70 hover:opacity-100"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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

                          {/* Hours Status */}
                          <span className={`flex items-center gap-2 font-medium ${getStatusColor(store.status)}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {store.hours}
                          </span>

                          {/* Store Hours Link */}
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
                          <p className="text-sm text-green-600 font-medium mt-2">
                            ✓ {store.pickupTime}
                          </p>
                        )}

                        {/* Store Hours Dropdown */}
                        {showStoreHours === store.id && (
                          <div className="mt-3 p-3 bg-brand-gray-50 rounded-lg text-xs text-brand-gray-600">
                            <p className="font-medium text-brand-black mb-2">Store Hours</p>
                            <div className="space-y-1">
                              <div className="flex justify-between"><span>Monday</span><span>9 AM - 9 PM</span></div>
                              <div className="flex justify-between"><span>Tuesday</span><span>9 AM - 9 PM</span></div>
                              <div className="flex justify-between"><span>Wednesday</span><span>9 AM - 9 PM</span></div>
                              <div className="flex justify-between"><span>Thursday</span><span>9 AM - 9 PM</span></div>
                              <div className="flex justify-between"><span>Friday</span><span>9 AM - 10 PM</span></div>
                              <div className="flex justify-between"><span>Saturday</span><span>10 AM - 10 PM</span></div>
                              <div className="flex justify-between"><span>Sunday</span><span>11 AM - 7 PM</span></div>
                            </div>
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
                        <p className="text-xs text-red-500 font-medium">Out of stock at this location</p>
                      </div>
                    </div>
                    {index < unavailableStores.length - 1 && (
                      <div className="h-px bg-brand-gray-200" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {filteredStores.length === 0 && (
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

