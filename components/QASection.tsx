'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import ModalHeader from './ModalHeader'

interface Question {
  id: string
  question: string
  author: string
  date: string
  answers: Answer[]
  helpful: number
}

interface Answer {
  id: string
  content: string
  author: string
  date: string
  isSeller: boolean
  helpful: number
  isPending?: boolean
}

interface QASectionProps {
  productId: string
  productName: string
  productCategory?: string
  productSubcategory?: string
  productBrand?: string
  hasSizes?: boolean
  hasColors?: boolean
  questions?: Question[]
}

// Generate contextual questions based on product
function generateContextualQuestions(
  productId: string,
  productName: string,
  productCategory?: string,
  productSubcategory?: string,
  productBrand?: string,
  hasSizes?: boolean,
  hasColors?: boolean
): Question[] {
  const allQuestions: Question[] = []
  const brand = productBrand || 'Salesforce Foundations'
  const category = productCategory?.toLowerCase() || ''
  const subcategory = productSubcategory?.toLowerCase() || ''

  // Size-related questions
  if (hasSizes) {
    allQuestions.push({
      id: `${productId}-size-1`,
      question: 'What is the sizing like?',
      author: 'Sarah M.',
      date: '3 weeks ago',
      helpful: 0,
      answers: [
        {
          id: `${productId}-size-1-1`,
          content: `The sizing runs true to size. I normally wear a Medium and this fits perfectly. The ${productName} has a great fit that works well for most people.`,
          author: 'John D.',
          date: '3 weeks ago',
          isSeller: false,
          helpful: 5,
        },
        {
          id: `${productId}-size-1-2`,
          content: `We recommend checking our size guide for the most accurate fit. The ${productName} is designed to fit comfortably while maintaining its elegant appearance.`,
          author: `${brand} Team`,
          date: '3 weeks ago',
          isSeller: true,
          helpful: 1,
        },
      ],
    })
  }

  // Color-related questions
  if (hasColors) {
    allQuestions.push({
      id: `${productId}-color-1`,
      question: 'What colors are available?',
      author: 'Alex T.',
      date: '2 weeks ago',
      helpful: 0,
      answers: [
        {
          id: `${productId}-color-1-1`,
          content: `The ${productName} is available in multiple color options. You can see all available colors by selecting different variants on the product page.`,
          author: `${brand} Team`,
          date: '2 weeks ago',
          isSeller: true,
          helpful: 3,
        },
      ],
    })
  }

  // Category-specific questions
  if (category.includes('geometric') || subcategory.includes('cube')) {
    allQuestions.push({
      id: `${productId}-material-1`,
      question: 'What material is this made from?',
      author: 'Michael R.',
      date: 'a month ago',
      helpful: 0,
      answers: [
        {
          id: `${productId}-material-1-1`,
          content: `The ${productName} is crafted from premium materials with a focus on durability and aesthetic appeal. It features a minimalist design that complements any space.`,
          author: `${brand} Team`,
          date: 'a month ago',
          isSeller: true,
          helpful: 2,
        },
      ],
    })
  }

  if (category.includes('geometric') || subcategory.includes('prism')) {
    allQuestions.push({
      id: `${productId}-design-1`,
      question: 'How does this look in person?',
      author: 'Emma L.',
      date: '2 weeks ago',
      helpful: 0,
      answers: [
        {
          id: `${productId}-design-1-1`,
          content: `The ${productName} looks even better in person! The geometric design is very striking and the quality is excellent. It's a beautiful piece that adds elegance to any room.`,
          author: 'David K.',
          date: '2 weeks ago',
          isSeller: false,
          helpful: 4,
        },
      ],
    })
  }

  // General questions
  allQuestions.push({
    id: `${productId}-shipping-1`,
    question: 'What is the shipping time?',
    author: 'Lisa P.',
    date: '1 week ago',
    helpful: 0,
    answers: [
      {
        id: `${productId}-shipping-1-1`,
        content: `Standard shipping typically takes 5-7 business days. Express shipping options are also available at checkout. Free shipping is available on orders over $50.`,
        author: `${brand} Team`,
        date: '1 week ago',
        isSeller: true,
        helpful: 6,
      },
    ],
  })

  allQuestions.push({
    id: `${productId}-care-1`,
    question: 'How do I care for this product?',
    author: 'Robert H.',
    date: '3 weeks ago',
    helpful: 0,
    answers: [
      {
        id: `${productId}-care-1-1`,
        content: `The ${productName} requires minimal maintenance. Simply wipe with a soft, dry cloth to keep it looking its best. Avoid using harsh chemicals or abrasive cleaners.`,
        author: `${brand} Team`,
        date: '3 weeks ago',
        isSeller: true,
        helpful: 3,
      },
    ],
  })

  allQuestions.push({
    id: `${productId}-quality-1`,
    question: 'Is this product durable?',
    author: 'Jennifer W.',
    date: '2 weeks ago',
    helpful: 0,
    answers: [
      {
        id: `${productId}-quality-1-1`,
        content: `Yes, the ${productName} is built to last. I've had mine for several months and it still looks brand new. The quality is excellent and it's very well-made.`,
        author: 'Tom S.',
        date: '2 weeks ago',
        isSeller: false,
        helpful: 7,
      },
    ],
  })

  // Randomly select 0-3 questions
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
  const count = Math.floor(Math.random() * 4) // 0, 1, 2, or 3
  return shuffled.slice(0, count)
}

export default function QASection({
  productId,
  productName,
  productCategory,
  productSubcategory,
  productBrand,
  hasSizes,
  hasColors,
  questions: initialQuestions,
}: QASectionProps) {
  // Generate contextual questions if not provided
  const generateQuestions = useCallback(() => {
    if (initialQuestions) {
      return initialQuestions
    }
    return generateContextualQuestions(
      productId,
      productName,
      productCategory,
      productSubcategory,
      productBrand,
      hasSizes,
      hasColors
    )
  }, [productId, productName, productCategory, productSubcategory, productBrand, hasSizes, hasColors, initialQuestions])

  const [questions, setQuestions] = useState<Question[]>(generateQuestions)
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'oldest'>('featured')

  // Update questions when product changes
  useEffect(() => {
    setQuestions(generateQuestions())
  }, [generateQuestions])
  const [searchQuery, setSearchQuery] = useState('')
  const [showAskQuestion, setShowAskQuestion] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5
  const [newQuestion, setNewQuestion] = useState('')
  const [newQuestionAuthor, setNewQuestionAuthor] = useState('')
  const [showAnswerModal, setShowAnswerModal] = useState<string | null>(null)
  const [answerForm, setAnswerForm] = useState<{
    answer: string
    nickname: string
    email: string
    location: string
    agreeToTerms: boolean
  }>({
    answer: '',
    nickname: '',
    email: '',
    location: '',
    agreeToTerms: false,
  })
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [answerSubmitSuccess, setAnswerSubmitSuccess] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  // Filter questions based on search
  const filteredQuestions = useMemo(() => {
    let result = [...questions]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (q) =>
          q.question.toLowerCase().includes(query) ||
          q.answers.some((a) => a.content.toLowerCase().includes(query))
      )
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        // Sort by date (newest first) - simplified for demo
        result = result.reverse()
        break
      case 'oldest':
        // Sort by date (oldest first)
        result = result
        break
      case 'featured':
      default:
        // Keep original order (could be based on helpful votes, etc.)
        break
    }

    return result
  }, [questions, sortBy, searchQuery])

  // Pagination logic
  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const visibleQuestions = filteredQuestions.slice(startIndex, endIndex)
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy])

  // Handle helpful vote for questions
  const handleQuestionHelpful = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, helpful: q.helpful + 1 } : q))
    )
  }

  // Handle helpful vote for answers
  const handleAnswerHelpful = (questionId: string, answerId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              answers: q.answers.map((a) =>
                a.id === answerId ? { ...a, helpful: a.helpful + 1 } : a
              ),
            }
          : q
      )
    )
  }

  // Handle submit question
  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newQuestion.trim() || !newQuestionAuthor.trim()) {
      alert('Please enter both your question and name')
      return
    }

    const question: Question = {
      id: `new-${Date.now()}`,
      question: newQuestion,
      author: newQuestionAuthor,
      date: 'just now',
      helpful: 0,
      answers: [],
    }

    setQuestions((prev) => [question, ...prev])
    setNewQuestion('')
    setNewQuestionAuthor('')
    setShowAskQuestion(false)
    setSubmitSuccess(true)

    setTimeout(() => setSubmitSuccess(false), 5000)
  }

  // Handle submit answer
  const handleSubmitAnswer = (e: React.FormEvent, questionId: string) => {
    e.preventDefault()

    if (!answerForm.answer.trim() || !answerForm.nickname.trim() || !answerForm.email.trim()) {
      alert('Please fill in all required fields')
      return
    }

    if (!answerForm.agreeToTerms) {
      alert('Please agree to the terms & conditions')
      return
    }

    if (answerForm.answer.length > 10000) {
      alert('Answer must be 10,000 characters or less')
      return
    }

    if (answerForm.nickname.length > 25) {
      alert('Nickname must be 25 characters or less')
      return
    }

    const answer: Answer = {
      id: `${questionId}-${Date.now()}`,
      content: answerForm.answer,
      author: answerForm.nickname,
      date: 'just now',
      isSeller: false,
      helpful: 0,
      isPending: true, // Mark as pending moderation
    }

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              answers: [...q.answers, answer],
            }
          : q
      )
    )

    // Reset form
    setAnswerForm({
      answer: '',
      nickname: '',
      email: '',
      location: '',
      agreeToTerms: false,
    })
    setShowAnswerModal(null)
    setAnswerSubmitSuccess(true)

    setTimeout(() => setAnswerSubmitSuccess(false), 5000)
  }

  // Handle open answer modal
  const handleOpenAnswerModal = (questionId: string) => {
    setShowAnswerModal(questionId)
    setAnswerForm({
      answer: '',
      nickname: '',
      email: '',
      location: '',
      agreeToTerms: false,
    })
  }

  return (
    <div className="mt-8 sm:mt-16 pt-8 sm:pt-16 border-t border-brand-gray-200">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4 sm:mb-8 hover:opacity-80 transition-opacity"
      >
        <h2 className="text-xl sm:text-2xl font-medium text-brand-black">Questions & Answers</h2>
        <svg
          className={`w-5 h-5 text-brand-gray-500 transition-transform flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <>
          {/* Header - Search, Sort, and Button Layout */}
          <div className="mb-4 sm:mb-8">
            {/* Search Input - Full Width */}
            <div className="relative w-full mb-3">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-brand-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm"
              />
            </div>

            {/* Sort By and Ask Question Button - Stack on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
              {/* Sort By */}
              <div className="flex items-center gap-2">
                <label className="text-xs sm:text-sm text-brand-gray-600 whitespace-nowrap">Sort:</label>
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="appearance-none w-full sm:w-48 px-3 py-2.5 sm:py-2 pr-8 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm bg-white cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 text-brand-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Ask Question Button - Full width on mobile, aligned right on desktop */}
              <button
                onClick={() => setShowAskQuestion(true)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-brand-blue-500 text-white text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors"
              >
                Ask a Question
              </button>
            </div>

          </div>

      {/* Success Message - Ask Question */}
      {submitSuccess && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xs sm:text-sm text-brand-gray-700">Thank you! Your question has been submitted.</p>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4 sm:space-y-8">
        {visibleQuestions.length > 0 ? (
          visibleQuestions.map((question) => (
            <div key={question.id} className="border-b border-brand-gray-200 pb-4 sm:pb-8 last:border-0">
              {/* Question */}
              <div className="mb-3 sm:mb-4">
                <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-medium text-brand-black mb-1">
                      Q: {question.question}
                    </h4>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-micro sm:text-sm text-brand-gray-500 flex-wrap">
                      <span>{question.author}</span>
                      <span>•</span>
                      <span>{question.date}</span>
                    </div>
                  </div>
                  {question.helpful > 0 && (
                    <button
                      onClick={() => handleQuestionHelpful(question.id)}
                      className="flex items-center gap-1 text-xs sm:text-sm text-brand-gray-600 hover:text-brand-blue-500 transition-colors flex-shrink-0"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        />
                      </svg>
                      <span className="hidden sm:inline">Helpful</span> ({question.helpful})
                    </button>
                  )}
                </div>
                {question.answers.length > 0 && (
                  <p className="text-xs sm:text-sm text-brand-gray-600 mb-3 sm:mb-4">
                    {question.answers.length} Answer{question.answers.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Answers */}
              {question.answers.length > 0 && (
                <div className="space-y-3 sm:space-y-4 mb-3 sm:mb-4">
                  {question.answers.map((answer) => (
                    <div key={answer.id} className="pl-3 sm:pl-6 border-l-2 border-brand-gray-200">
                      <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-base text-brand-black mb-1">A: {answer.content}</p>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-micro sm:text-sm text-brand-gray-500 flex-wrap">
                            <span>{answer.author}</span>
                            {answer.isSeller && (
                              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 bg-brand-blue-100 text-brand-blue-700 text-micro sm:text-xs rounded-full">
                                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Seller
                              </span>
                            )}
                            <span>•</span>
                            <span>{answer.date}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Moderation Notice for Pending Answers */}
                      {answer.isPending && (
                        <div className="mt-2 sm:mt-3 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg
                                className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white"
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
                            </div>
                            <p className="text-xs sm:text-sm text-brand-gray-700">
                              Thank you for submitting the answer! Your answer is being moderated.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {!answer.isPending && (
                        <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3">
                          <button
                            onClick={() => handleAnswerHelpful(question.id, answer.id)}
                            className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-brand-gray-600 hover:text-brand-blue-500 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                              />
                            </svg>
                            Helpful ({answer.helpful})
                          </button>
                          <button className="text-xs sm:text-sm text-brand-gray-600 hover:text-brand-blue-500 transition-colors">
                            Report
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Answer This Question Link */}
              <div className="flex justify-end">
                <button
                  onClick={() => handleOpenAnswerModal(question.id)}
                  className="text-xs sm:text-sm text-brand-black hover:underline transition-colors"
                >
                  Answer This Question
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 sm:py-12">
            <svg
              className="w-12 h-12 sm:w-16 sm:h-16 text-brand-gray-300 mx-auto mb-3 sm:mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm sm:text-base text-brand-gray-600 mb-2">No questions found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-brand-blue-500 hover:underline text-xs sm:text-sm"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-brand-gray-200">
          {/* Results info */}
          <p className="text-xs sm:text-sm text-brand-gray-600 order-2 sm:order-1">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredQuestions.length)} of {filteredQuestions.length} questions
          </p>
          
          {/* Pagination controls */}
          <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
            {/* Previous button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                currentPage === 1
                  ? 'text-brand-gray-300 cursor-not-allowed'
                  : 'text-brand-gray-600 hover:bg-brand-gray-100 hover:text-brand-black'
              }`}
              aria-label="Previous page"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                // Show first page, last page, current page, and pages around current
                const showPage = page === 1 || 
                  page === totalPages || 
                  Math.abs(page - currentPage) <= 1
                
                // Show ellipsis
                const showEllipsisBefore = page === currentPage - 2 && currentPage > 3
                const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2
                
                if (showEllipsisBefore || showEllipsisAfter) {
                  return (
                    <span key={page} className="px-1 sm:px-2 text-brand-gray-400 text-sm">...</span>
                  )
                }
                
                if (!showPage) return null
                
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[28px] sm:min-w-[32px] h-7 sm:h-8 px-1.5 sm:px-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-brand-blue-500 text-white'
                        : 'text-brand-gray-600 hover:bg-brand-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>
            
            {/* Next button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                currentPage === totalPages
                  ? 'text-brand-gray-300 cursor-not-allowed'
                  : 'text-brand-gray-600 hover:bg-brand-gray-100 hover:text-brand-black'
              }`}
              aria-label="Next page"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

          </>
      )}

      {/* Ask Question Modal */}
      {showAskQuestion && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div data-modal-overlay className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAskQuestion(false)} />
          <div data-modal-center className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white z-10">
                <ModalHeader
                  title="Ask a Question"
                  onClose={() => setShowAskQuestion(false)}
                  closeAriaLabel="Close"
                />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitQuestion} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Your Question <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Type your question about this product..."
                    rows={4}
                    required
                    className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newQuestionAuthor}
                    onChange={(e) => setNewQuestionAuthor(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm"
                  />
                </div>

                <p className="text-xs text-brand-gray-500">
                  By submitting this question, you agree to our Terms of Service and Privacy Policy.
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAskQuestion(false)}
                    className="flex-1 py-3 border border-brand-gray-300 text-brand-black font-medium rounded-lg hover:bg-brand-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-brand-blue-500 text-white font-medium rounded-lg hover:bg-brand-blue-600 transition-colors"
                  >
                    Submit Question
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Answer Question Modal */}
      {showAnswerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            data-modal-overlay
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowAnswerModal(null)}
          />
          <div data-modal-center className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white z-10">
                <ModalHeader
                  title="My Answer"
                  onClose={() => setShowAnswerModal(null)}
                  closeAriaLabel="Close"
                />
              </div>

              {/* Question Info */}
              {showAnswerModal && (
                <div className="px-6 pt-6 pb-4 border-b border-brand-gray-200">
                  {(() => {
                    const question = questions.find((q) => q.id === showAnswerModal)
                    if (!question) return null
                    return (
                      <>
                        <p className="text-base font-medium text-brand-black mb-2">
                          Q: {question.question}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-brand-gray-600">
                          <span>Asked by: {question.author}</span>
                          <span>•</span>
                          <span>{question.date}</span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={(e) => handleSubmitAnswer(e, showAnswerModal!)}
                className="p-6 space-y-6"
              >
                {/* Answer */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Answer <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={answerForm.answer}
                    onChange={(e) =>
                      setAnswerForm((prev) => ({ ...prev, answer: e.target.value }))
                    }
                    placeholder="Type your answer here..."
                    rows={6}
                    required
                    maxLength={10000}
                    className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm resize-none"
                  />
                  <p className="text-xs text-brand-gray-500 mt-1">
                    {answerForm.answer.length}/10000 maximum
                  </p>
                </div>

                {/* Nickname */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Nickname <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={answerForm.nickname}
                    onChange={(e) =>
                      setAnswerForm((prev) => ({ ...prev, nickname: e.target.value }))
                    }
                    placeholder="Example: bob27"
                    required
                    maxLength={25}
                    className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm"
                  />
                  <p className="text-xs text-brand-gray-500 mt-1">
                    {answerForm.nickname.length}/25 maximum
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={answerForm.email}
                    onChange={(e) =>
                      setAnswerForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="Example: yourname@example.com"
                    required
                    className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={answerForm.location}
                    onChange={(e) =>
                      setAnswerForm((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="Example: New York, NY"
                    className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-500 text-sm"
                  />
                </div>

                {/* Terms & Conditions */}
                <div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={answerForm.agreeToTerms}
                      onChange={(e) =>
                        setAnswerForm((prev) => ({ ...prev, agreeToTerms: e.target.checked }))
                      }
                      required
                      className="mt-1 w-4 h-4 text-brand-blue-500 border-brand-gray-300 rounded focus:ring-brand-blue-500"
                    />
                    <span className="text-sm text-brand-black">
                      I agree to the{' '}
                      <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-blue-500 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        terms & conditions
                      </a>
                    </span>
                  </label>
                </div>

                {/* Email Notice */}
                <p className="text-xs text-brand-gray-600">
                  You may receive emails regarding this submission. Any emails will include the
                  ability to opt-out of future communications.
                </p>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAnswerModal(null)}
                    className="flex-1 py-3 border border-brand-gray-300 text-brand-black font-medium rounded-lg hover:bg-brand-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-brand-blue-500 text-white font-medium rounded-lg hover:bg-brand-blue-600 transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Answer Submit Success Message */}
      {answerSubmitSuccess && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white"
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
            </div>
            <p className="text-xs sm:text-sm text-brand-gray-700">Your answer was submitted!</p>
          </div>
        </div>
      )}
    </div>
  )
}
