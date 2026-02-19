'use client'

import React, { useEffect } from 'react'

interface LogoutConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function LogoutConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm 
}: LogoutConfirmationModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

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
          className="relative bg-card rounded-modal shadow-modal max-w-md w-full"
          style={{ animation: 'scale-in 0.2s ease-out forwards' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-brand-black mb-2">
              Sign Out
            </h2>
            <p className="text-sm text-brand-gray-600 mb-6">
              Are you sure you want to sign out? You&apos;ll need to sign in again to access your account.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 border border-brand-gray-300 text-brand-black text-sm font-medium rounded-lg hover:bg-brand-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 px-4 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
