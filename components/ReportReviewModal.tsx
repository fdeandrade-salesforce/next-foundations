'use client'

import React, { useState, useEffect } from 'react'
import ModalHeader from './ModalHeader'
import { createPortal } from 'react-dom'

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or fake review' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'offensive', label: 'Offensive language' },
  { value: 'personal-info', label: 'Contains personal information' },
  { value: 'off-topic', label: 'Off-topic or not relevant' },
  { value: 'other', label: 'Other' },
] as const

export interface ReviewToReport {
  id: string
  author: string
  rating: number
  title: string
  content: string
}

export interface ReportReviewModalProps {
  isOpen: boolean
  onClose: () => void
  review: ReviewToReport | null
  productName: string
  onReportSubmitted?: () => void
}

export default function ReportReviewModal({
  isOpen,
  onClose,
  review,
  productName,
  onReportSubmitted,
}: ReportReviewModalProps) {
  const [reason, setReason] = useState<string>('')
  const [details, setDetails] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setReason('')
      setDetails('')
      setError(null)
      setSubmitted(false)
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!reason) {
      setError('Please select a reason for your report')
      return
    }

    setSubmitted(true)
    onReportSubmitted?.()
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  const handleClose = () => {
    setReason('')
    setDetails('')
    setError(null)
    setSubmitted(false)
    onClose()
  }

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div data-modal-overlay className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} aria-hidden="true" />
      <div data-modal-center className="flex min-h-full items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <div
          className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white z-10">
            <ModalHeader title="Report this review" onClose={handleClose} closeAriaLabel="Close" />
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {submitted ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-base font-medium text-brand-black">Thank you for your report</p>
                <p className="text-sm text-brand-gray-600 mt-1">We&apos;ll review it and take action if necessary.</p>
              </div>
            ) : (
              <>
                {review && (
                  <div className="p-4 bg-brand-gray-50 rounded-lg border border-brand-gray-200">
                    <p className="text-xs text-brand-gray-500 mb-1">{productName} • {review.author}</p>
                    <p className="text-sm font-medium text-brand-black line-clamp-1">{review.title || 'Review'}</p>
                    <p className="text-xs text-brand-gray-600 mt-1 line-clamp-2">{review.content}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Why are you reporting this review? <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {REPORT_REASONS.map((r) => (
                      <label
                        key={r.value}
                        className="flex items-center gap-3 p-3 border border-brand-gray-200 rounded-lg cursor-pointer hover:bg-brand-gray-50 transition-colors has-[:checked]:border-brand-blue-500 has-[:checked]:bg-brand-blue-50/50"
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={r.value}
                          checked={reason === r.value}
                          onChange={() => {
                            setReason(r.value)
                            setError(null)
                          }}
                          className="w-4 h-4 text-brand-blue-500"
                        />
                        <span className="text-sm text-brand-black">{r.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">Additional details (optional)</label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Help us understand the issue..."
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm resize-none"
                  />
                  <p className="text-xs text-brand-gray-500 mt-1">{details.length}/500</p>
                </div>

                {error && (
                  <p className="text-sm text-red-600" role="alert">
                    {error}
                  </p>
                )}

                <p className="text-xs text-brand-gray-500">
                  Reports are reviewed by our team. We may remove reviews that violate our community guidelines.
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-3 border border-brand-gray-300 text-brand-black font-medium rounded-lg hover:bg-brand-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-brand-blue-500 text-white font-medium rounded-lg hover:bg-brand-blue-600 transition-colors"
                  >
                    Submit Report
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  )

  return mounted && typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null
}
