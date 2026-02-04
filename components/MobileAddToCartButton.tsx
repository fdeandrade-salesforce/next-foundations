'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Product } from './ProductListingPage'
import { getColorHex } from '../lib/color-utils'

interface MobileAddToCartButtonProps {
  product: Product
  currentVariant: Product
  selectedSize: string
  selectedColor: string
  quantity: number
  onSizeChange: (size: string) => void
  onColorChange: (color: string) => void
  onQuantityChange: (quantity: number) => void
  onAddToCart: () => void
  onNotifyMe: () => void
  variantProducts: Record<string, Product>
  allProducts: Product[]
  isVisible: boolean
}

export default function MobileAddToCartButton({
  product,
  currentVariant,
  selectedSize,
  selectedColor,
  quantity,
  onSizeChange,
  onColorChange,
  onQuantityChange,
  onAddToCart,
  onNotifyMe,
  variantProducts,
  allProducts,
  isVisible,
}: MobileAddToCartButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [localSelectedSize, setLocalSelectedSize] = useState(selectedSize)
  const [localSelectedColor, setLocalSelectedColor] = useState(selectedColor)
  const [localQuantity, setLocalQuantity] = useState(quantity)

  // Update local state when props change
  useEffect(() => {
    setLocalSelectedSize(selectedSize)
    setLocalSelectedColor(selectedColor)
    setLocalQuantity(quantity)
  }, [selectedSize, selectedColor, quantity])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isModalOpen])

  // Get current variant based on selected color
  const currentVariantFromModal = useMemo(() => {
    if (localSelectedColor && variantProducts[localSelectedColor]) {
      return variantProducts[localSelectedColor]
    }
    return product
  }, [localSelectedColor, variantProducts, product])

  const handleAddToCart = () => {
    onSizeChange(localSelectedSize)
    onColorChange(localSelectedColor)
    onQuantityChange(localQuantity)
    onAddToCart()
    setIsModalOpen(false)
  }

  const handleNotifyMe = () => {
    onNotifyMe()
    setIsModalOpen(false)
  }

  // Available sizes
  const availableSizes = currentVariantFromModal.size || product.size || []

  // Available colors
  const availableColors = product.colors || (product.color ? [product.color] : [])

  if (!isVisible) return null

  return (
    <>
      {/* Fixed Mobile Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-brand-gray-200 shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="px-4 py-3">
          {!currentVariant.inStock ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-3.5 px-6 font-medium text-base rounded-lg transition-colors bg-white text-brand-black border border-brand-gray-300 hover:bg-brand-gray-50"
            >
              Notify me
            </button>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-3.5 px-6 font-medium text-base rounded-lg transition-colors bg-brand-blue-500 text-white hover:bg-brand-blue-600"
            >
              Add to cart
            </button>
          )}
        </div>
      </div>

      {/* Variant Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] md:hidden overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl max-h-[90vh] overflow-y-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="sticky top-0 bg-white border-b border-brand-gray-200 px-4 py-3 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-brand-black">Add to cart</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 -mr-2 text-brand-gray-500 hover:text-brand-black transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Product Info */}
              <div className="flex gap-4">
                <div className="w-20 h-20 flex-shrink-0 bg-brand-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={currentVariantFromModal.images?.[0] || currentVariantFromModal.image}
                    alt={currentVariantFromModal.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-brand-black mb-1">{product.name}</h3>
                  <p className="text-sm text-brand-gray-600 mb-2">
                    {currentVariantFromModal.color || product.color}
                  </p>
                  <p className="text-lg font-semibold text-brand-black">
                    ${currentVariantFromModal.price.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Size Selection */}
              {availableSizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-brand-black">Size: {localSelectedSize}</label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setLocalSelectedSize(size)}
                        className={`min-w-[44px] px-3 py-2 text-sm border transition-colors rounded-lg ${
                          localSelectedSize === size
                            ? 'bg-brand-blue-500 text-white border-brand-blue-500 shadow-sm'
                            : 'bg-white text-brand-black border-brand-gray-300 hover:border-brand-blue-500'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {availableColors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Color: {localSelectedColor}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => {
                      return (
                        <button
                          key={color}
                          onClick={() => setLocalSelectedColor(color)}
                          className={`px-3 py-2 text-sm border transition-colors rounded-lg capitalize ${
                            localSelectedColor === color
                              ? 'bg-brand-blue-500 text-white border-brand-blue-500 shadow-sm'
                              : 'bg-white text-brand-black border-brand-gray-300 hover:border-brand-blue-500'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full border border-brand-gray-300"
                              style={{
                                backgroundColor: getColorHex(color),
                              }}
                            />
                            {color}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">Quantity</label>
                <div className="flex items-center border border-brand-gray-300 rounded-lg w-fit">
                  <button
                    onClick={() => setLocalQuantity(Math.max(1, localQuantity - 1))}
                    className="px-3 py-2 text-brand-gray-600 hover:text-brand-black transition-colors"
                    disabled={localQuantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 text-brand-black font-medium min-w-[2.5rem] text-center">
                    {localQuantity}
                  </span>
                  <button
                    onClick={() => setLocalQuantity(localQuantity + 1)}
                    className="px-3 py-2 text-brand-gray-600 hover:text-brand-black transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-brand-gray-200 space-y-3">
                {!currentVariantFromModal.inStock ? (
                  <button
                    onClick={handleNotifyMe}
                    className="w-full py-3.5 px-6 font-medium text-base rounded-lg transition-colors bg-white text-brand-black border border-brand-gray-300 hover:bg-brand-gray-50"
                  >
                    Notify me
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3.5 px-6 font-medium text-base rounded-lg transition-colors bg-brand-blue-500 text-white hover:bg-brand-blue-600"
                  >
                    Add to cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
