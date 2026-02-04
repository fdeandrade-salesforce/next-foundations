'use client'

import React from 'react'

interface RemoveConfirmationModalProps {
  isOpen: boolean
  productName: string
  onConfirm: () => void
  onCancel: () => void
}

export default function RemoveConfirmationModal({
  isOpen,
  productName,
  onConfirm,
  onCancel,
}: RemoveConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 backdrop-default transition-opacity"
        onClick={onCancel}
      />

      {/* Modal Container */}
      <div className="relative bg-card rounded-modal shadow-modal max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-brand-black mb-2">
          Confirm Remove Item
        </h2>
        <p className="text-sm text-brand-gray-600 mb-6">
          Are you sure you want to remove this item from your cart?
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-brand-blue-500 text-brand-blue-500 text-sm font-medium rounded-lg hover:bg-brand-blue-50 transition-colors"
          >
            No, keep item
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors"
          >
            Yes, remove item
          </button>
        </div>
      </div>
    </div>
  )
}
