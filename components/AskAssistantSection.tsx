'use client'

import React, { useState } from 'react'
import { useAgent } from '../context/AgentContext'

interface AskAssistantSectionProps {
  productName: string
  productCategory?: string
  productSubcategory?: string
  hasSizes?: boolean
  hasColors?: boolean
}

// Generate product-contextual AI questions (similar to Figma PDP)
function generateAIQuestions(props: AskAssistantSectionProps): string[] {
  const { productName, productCategory = '', productSubcategory = '', hasSizes, hasColors } = props
  const category = (productCategory + ' ' + productSubcategory).toLowerCase()
  const questions: string[] = []

  if (hasSizes) {
    questions.push('What sizes does this come in?')
  }
  if (hasColors) {
    questions.push('Which color would work best for a minimalist space?')
  }

  if (category.includes('sculpture') || category.includes('decor') || category.includes('object')) {
    questions.push('Will this work in a minimalist living room?')
    questions.push('What material is this made from?')
    questions.push(`How would you style the ${productName}?`)
  } else if (category.includes('backpack') || category.includes('bag')) {
    questions.push('Can I carry a sleeping bag in this?')
    questions.push('Is this suitable for extreme weather?')
    questions.push('How many items can I pack in it?')
  } else {
    questions.push(`What makes the ${productName} special?`)
    questions.push('Would this make a good gift?')
    questions.push('How do I care for this product?')
  }

  return questions.slice(0, 3)
}

export default function AskAssistantSection({
  productName,
  productCategory,
  productSubcategory,
  hasSizes = false,
  hasColors = false,
}: AskAssistantSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { openAgent } = useAgent()

  const questions = generateAIQuestions({
    productName,
    productCategory,
    productSubcategory,
    hasSizes,
    hasColors,
  })

  return (
    <div className="border-b border-brand-gray-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-4 flex items-center justify-between text-left hover:bg-brand-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-base font-medium text-brand-black">Ask assistant</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-blue-100 text-brand-blue-600 uppercase">
            AI
          </span>
        </span>
        <svg
          className={`w-5 h-5 text-brand-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="pb-4 space-y-2">
          {questions.map((question, idx) => (
            <button
              key={idx}
              onClick={() => openAgent(question)}
              className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg border border-brand-gray-200 text-sm text-brand-black hover:border-brand-blue-300 hover:bg-brand-blue-50/50 transition-colors group"
            >
              {/* Sparkle/diamond icon (same as header) */}
              <svg className="w-4 h-4 text-brand-blue-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L9.5 9.5L2 12L9.5 14.5L12 22L14.5 14.5L22 12L14.5 9.5L12 2Z" />
              </svg>
              <span className="flex-1">{question}</span>
              <svg
                className="w-4 h-4 text-brand-gray-400 group-hover:text-brand-blue-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
