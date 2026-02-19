'use client'

import React from 'react'
import ModalHeader from './ModalHeader'

interface SizeGuideModalProps {
  isOpen: boolean
  onClose: () => void
}

const sizeData = [
  { size: 'XS', us: '4', eu: '34', uk: '6', cm: '22' },
  { size: 'S', us: '6', eu: '36', uk: '8', cm: '23' },
  { size: 'M', us: '8', eu: '38', uk: '10', cm: '24' },
  { size: 'L', us: '10', eu: '40', uk: '12', cm: '25' },
  { size: 'XL', us: '12', eu: '42', uk: '14', cm: '26' },
]

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        data-modal-overlay
        className="fixed inset-0 backdrop-default transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div data-modal-center className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-card rounded-modal shadow-modal max-w-2xl w-full max-h-[90vh] overflow-hidden"
          style={{ animation: 'scale-in 0.2s ease-out forwards' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <ModalHeader title="Size Guide" onClose={onClose} closeAriaLabel="Close" />
          <div className="px-6 pb-4 border-b border-brand-gray-200">
            <p className="text-sm text-brand-gray-600">Find your perfect fit</p>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="p-6 space-y-6">
              {/* Size Conversion Table */}
              <div>
                <h3 className="text-lg font-medium text-brand-black mb-4">Size Conversion Chart</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-brand-gray-200">
                        <th className="py-3 px-4 text-left font-semibold text-brand-black">Size</th>
                        <th className="py-3 px-4 text-left font-semibold text-brand-black">US</th>
                        <th className="py-3 px-4 text-left font-semibold text-brand-black">EU</th>
                        <th className="py-3 px-4 text-left font-semibold text-brand-black">UK</th>
                        <th className="py-3 px-4 text-left font-semibold text-brand-black">CM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizeData.map((row, index) => (
                        <tr 
                          key={row.size} 
                          className={`border-b border-brand-gray-100 transition-colors hover:bg-brand-gray-50 ${
                            index === sizeData.length - 1 ? 'border-b-0' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-medium text-brand-black">{row.size}</td>
                          <td className="py-3 px-4 text-brand-gray-700">{row.us}</td>
                          <td className="py-3 px-4 text-brand-gray-700">{row.eu}</td>
                          <td className="py-3 px-4 text-brand-gray-700">{row.uk}</td>
                          <td className="py-3 px-4 text-brand-gray-700">{row.cm}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* How to Measure Section */}
              <div>
                <h3 className="text-lg font-medium text-brand-black mb-3">How to Measure</h3>
                <div className="space-y-3 text-sm text-brand-gray-700">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-brand-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-brand-blue-600 font-semibold text-xs">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-brand-black mb-1">Measure Your Body</p>
                      <p>Use a flexible measuring tape to measure around the fullest part of your body where the garment will sit.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-brand-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-brand-blue-600 font-semibold text-xs">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-brand-black mb-1">Check the Chart</p>
                      <p>Compare your measurements to our size chart above to find your perfect size match.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-brand-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-brand-blue-600 font-semibold text-xs">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-brand-black mb-1">Consider Fit Preference</p>
                      <p>If you prefer a looser fit, consider sizing up. For a tighter fit, consider sizing down.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips Section */}
              <div className="bg-brand-blue-50 border border-brand-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-brand-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-brand-black">Size Tips</p>
                    <ul className="list-disc list-inside space-y-1 text-brand-gray-700">
                      <li>Measurements are in centimeters (CM)</li>
                      <li>Sizes may vary slightly between different products</li>
                      <li>If you&apos;re between sizes, we recommend sizing up</li>
                      <li>For questions about fit, contact our customer service team</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-brand-gray-200 px-6 py-4 bg-brand-gray-50">
            <button
              onClick={onClose}
              className="w-full bg-brand-blue-500 text-white px-6 py-3 text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
