'use client'

import React, { useState, useEffect } from 'react'

type DeliveryStatus = 'default' | 'invalid' | 'loading' | 'error' | 'success'

interface DeliveryResult {
  deliveryText: string
  shippingCostText: string
}

export interface DeliveryEstimateState {
  status: DeliveryStatus
  result: DeliveryResult | null
  zip: string
}

interface DeliveryEstimatesProps {
  initialZip?: string
  onZipChange?: (zip: string) => void
  onResultChange?: (state: DeliveryEstimateState) => void
}

// Validation function - enforces 5 digits only
export function validateZip(zip: string): boolean {
  return /^\d{5}$/.test(zip)
}

// API fetch function with mock mode support and ZIP-specific scenarios
async function fetchDeliveryEstimates(
  zip: string,
  mockMode?: 'error' | 'success'
): Promise<DeliveryResult> {
  // Check for mock mode via query param or direct parameter
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const shippingState = mockMode || urlParams?.get('shippingState')

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // ZIP-specific scenarios
  const zipScenarios: Record<string, { type: 'error' | 'success'; businessDays?: number; shippingCost?: number }> = {
    '94121': { type: 'error' }, // Always returns error
    '94122': { type: 'success', businessDays: 5, shippingCost: 5.99 }, // 5 days, $5.99
    '94123': { type: 'success', businessDays: 3, shippingCost: 0 }, // 3 days, Free
    '94124': { type: 'error' }, // Always returns error
    '94125': { type: 'success', businessDays: 4, shippingCost: 0 }, // 4 days, Free
  }

  // Check if we have a specific scenario for this ZIP
  const scenario = zipScenarios[zip]

  // If query param forces error, use that
  if (shippingState === 'error') {
    throw new Error('API_ERROR')
  }

  // If we have a scenario and it's an error, throw
  if (scenario && scenario.type === 'error') {
    throw new Error('API_ERROR')
  }

  // If we have a scenario and it's success, use the scenario values
  if (scenario && scenario.type === 'success') {
    return {
      deliveryText: `${scenario.businessDays} business days`,
      shippingCostText: scenario.shippingCost === 0 ? 'Free' : `$${scenario.shippingCost.toFixed(2)}`,
    }
  }

  // Default: random success response for other ZIPs
  const businessDays = Math.floor(Math.random() * 5) + 3 // 3-7 days
  const shippingCost = Math.random() > 0.5 ? 0 : 5.99 // Free or $5.99

  return {
    deliveryText: `${businessDays} business days`,
    shippingCostText: shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`,
  }
}

export default function DeliveryEstimates({ initialZip = '', onZipChange, onResultChange }: DeliveryEstimatesProps) {
  const [zip, setZip] = useState<string>(initialZip)
  const [status, setStatus] = useState<DeliveryStatus>('default')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [result, setResult] = useState<DeliveryResult | null>(null)

  // Update zip when initialZip changes
  useEffect(() => {
    if (initialZip !== zip) {
      setZip(initialZip)
      // Reset to default if initialZip is empty
      if (!initialZip) {
        setStatus('default')
        setResult(null)
        setErrorMessage(null)
        onResultChange?.({ status: 'default', result: null, zip: '' })
      }
    }
  }, [initialZip])

  // Handle ZIP input change - strip non-digits and limit to 5
  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5)
    setZip(value)
    onZipChange?.(value)

    // Reset status if user is typing
    if (status === 'invalid' || status === 'error') {
      setStatus('default')
      setErrorMessage(null)
      onResultChange?.({ status: 'default', result: null, zip: value })
    }
    if (status === 'success' && value.length !== 5) {
      setStatus('default')
      setResult(null)
      onResultChange?.({ status: 'default', result: null, zip: value })
    }
  }

  // Handle input blur - validate if not empty
  const handleBlur = () => {
    if (zip.length > 0 && zip.length !== 5) {
      setStatus('invalid')
      setErrorMessage('Please enter a valid 5-digit ZIP code.')
      setResult(null)
      onResultChange?.({ status: 'invalid', result: null, zip })
    }
  }

  // Handle Calculate button click
  const handleCalculate = async () => {
    // Validate ZIP
    if (!validateZip(zip)) {
      setStatus('invalid')
      setErrorMessage('Please enter a valid 5-digit ZIP code.')
      setResult(null)
      onResultChange?.({ status: 'invalid', result: null, zip })
      return
    }

    // Set loading state
    setStatus('loading')
    setErrorMessage(null)

    try {
      const deliveryData = await fetchDeliveryEstimates(zip)
      setResult(deliveryData)
      setStatus('success')
      onResultChange?.({ status: 'success', result: deliveryData, zip })
    } catch (error) {
      setStatus('error')
      setErrorMessage("We couldn't fetch delivery estimates right now. Please try again.")
      setResult(null)
      onResultChange?.({ status: 'error', result: null, zip })
    }
  }

  // Handle Enter key in input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && zip.length === 5 && status !== 'loading') {
      handleCalculate()
    }
  }

  const isInputDisabled = status === 'loading'
  const isButtonDisabled = zip.length === 0 || status === 'loading'

  return (
    <div className="space-y-3">
      {/* Title/Label */}
      <div>
        <label htmlFor="delivery-zip-input" className="text-sm font-medium text-brand-black">
          Calculate Shipping
        </label>
      </div>

      {/* Input and Button Row */}
      <div className="flex gap-2 mb-2">
        <div className="flex-1">
          <input
            id="delivery-zip-input"
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={zip}
            onChange={handleZipChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={isInputDisabled}
            placeholder="Enter ZIP code"
            aria-label="ZIP code for delivery estimates"
            aria-invalid={status === 'invalid' || status === 'error'}
            aria-describedby={
              status === 'invalid' || status === 'error' || status === 'default'
                ? 'delivery-message'
                : status === 'success'
                ? 'delivery-result'
                : undefined
            }
            className={`w-full px-3 py-2 text-sm border rounded-lg transition-colors ${
              status === 'invalid' || status === 'error'
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-brand-gray-300 focus:border-brand-blue-500 focus:ring-brand-blue-500'
            } ${
              isInputDisabled ? 'bg-brand-gray-100 cursor-not-allowed' : 'bg-white'
            } focus:outline-none focus:ring-2`}
          />
        </div>
        <button
          onClick={handleCalculate}
          disabled={isButtonDisabled}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            isButtonDisabled
              ? 'bg-brand-gray-300 text-brand-gray-500 cursor-not-allowed'
              : 'bg-brand-blue-500 text-white hover:bg-brand-blue-600'
          }`}
          aria-label="Calculate delivery estimates"
        >
          {status === 'loading' ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Calculating...
            </span>
          ) : (
            'Calculate'
          )}
        </button>
      </div>

      {/* Message Area - for validation, errors, and helper text */}
      <div
        id="delivery-message"
        role="alert"
        aria-live="polite"
        className={status === 'success' ? '' : 'min-h-[1.5rem]'}
      >
        {status === 'default' && (
          <p className="text-xs text-brand-gray-600">
            Enter a 5-digit ZIP code to see delivery estimates.
          </p>
        )}
        {status === 'invalid' && (
          <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
        )}
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">{errorMessage}</p>
                <button
                  onClick={handleCalculate}
                  disabled={isButtonDisabled}
                  className="mt-2 text-sm text-red-700 hover:text-red-800 underline font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Result Area */}
      {status === 'success' && result && (
        <div
          id="delivery-result"
          role="status"
          aria-live="polite"
          className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3"
        >
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-green-800">
                Estimated delivery: <span className="font-semibold">{result.deliveryText}</span>
              </p>
              <p className="text-sm font-medium text-green-800">
                Shipping cost: <span className="font-semibold">{result.shippingCostText}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
