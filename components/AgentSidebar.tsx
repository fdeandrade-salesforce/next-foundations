'use client'

import React, { useState, useRef, useEffect } from 'react'
import ModalHeader from './ModalHeader'

interface AgentSidebarProps {
  isOpen: boolean
  onClose: () => void
  initialMessage?: string
  searchQuery?: string
  onSetAgentFilters?: (filters: import('../context/AgentContext').AgentFilters | null) => void
  onInitialMessageConsumed?: () => void
}

// Conversation starter pills (welcome screen)
const quickActions = [
  'Best sellers under $100',
  'Top rated sculptures',
  'Suggest pieces for minimalist living room',
]

// Conversation context pills - guide initial choices when in search flow
const conversationContextPills = [
  'White',
  'Black',
  'Gray',
  'Small',
  'Medium',
  'Large',
  'Under $50',
  'Under $100',
  'Matte finish',
]

// Attribute selector pills - refine results (filters/attributes)
const attributeSelectorPills = [
  'Under $50',
  'Under $100',
  'Matte finish',
  'Show similar pieces',
]

const PRICE_PILL_MAP: Record<string, number> = {
  'Under $50': 50,
  'Under $100': 100,
}

const COLOR_PILL_MAP: Record<string, string> = {
  'White': 'White',
  'Black': 'Black',
  'Gray': 'Gray',
}

const SIZE_PILL_MAP: Record<string, string> = {
  'Small': 'S',
  'Medium': 'M',
  'Large': 'L',
}

type PillFilterAction =
  | { type: 'maxPrice'; value: number }
  | { type: 'color'; value: string }
  | { type: 'size'; value: string }
  | { type: 'matteFinish' }
  | { type: 'showSimilar' }

function getPillFilterAction(pill: string): PillFilterAction | null {
  if (PRICE_PILL_MAP[pill] != null) return { type: 'maxPrice', value: PRICE_PILL_MAP[pill] }
  if (COLOR_PILL_MAP[pill]) return { type: 'color', value: COLOR_PILL_MAP[pill] }
  if (SIZE_PILL_MAP[pill]) return { type: 'size', value: SIZE_PILL_MAP[pill] }
  if (pill === 'Matte finish') return { type: 'matteFinish' }
  if (pill === 'Show similar pieces') return { type: 'showSimilar' }
  return null
}

export default function AgentSidebar({ isOpen, onClose, initialMessage, searchQuery, onSetAgentFilters, onInitialMessageConsumed }: AgentSidebarProps) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'agent'; text: string }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const initialMessageHandled = useRef(false)

  // Scroll to bottom when new messages arrive (run after DOM update)
  useEffect(() => {
    if (chatScrollRef.current && messages.length > 0) {
      const el = chatScrollRef.current
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight
      })
    }
  }, [messages])

  // When panel opens (welcome state or any), scroll to bottom so input/actions are visible
  useEffect(() => {
    if (!isOpen || !chatScrollRef.current) return
    const el = chatScrollRef.current
    const scrollToBottom = () => {
      el.scrollTop = el.scrollHeight
    }
    // Wait for content (including images) to render
    requestAnimationFrame(scrollToBottom)
    const t = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(t)
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // When initialMessage is provided (e.g. from PDP Ask Assistant or search), inject and simulate response
  useEffect(() => {
    if (!isOpen || !initialMessage || initialMessageHandled.current) return
    initialMessageHandled.current = true

    const isSearchContext = !!searchQuery

    setMessages([
      { role: 'user', text: initialMessage },
      { role: 'agent', text: "I'd be happy to help you with that! Let me look into it..." },
    ])
    setTimeout(() => {
      const contextualResponse = isSearchContext
        ? `I see you're looking for "${searchQuery}"! I found some options for you in the results below. To help me narrow it down, tell me more—what size are you thinking? Any preference on color or finish? I can also suggest pieces that work well together.`
        : "Based on the product you're viewing, I can provide more details. Would you like me to suggest similar pieces or answer any other questions?"

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'agent', text: contextualResponse },
      ])
      onInitialMessageConsumed?.()
    }, 800)
  }, [isOpen, initialMessage, searchQuery, onInitialMessageConsumed])

  const handleSend = () => {
    if (!message.trim()) return

    setMessages((prev) => [...prev, { role: 'user', text: message }])
    setMessage('')

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          text: "I'd be happy to help you find the perfect piece! Based on your interest, I'd recommend checking out our Signature Form collection. Would you like me to show you some options?",
        },
      ])
    }, 1000)
  }

  const handleQuickAction = (action: string) => {
    setMessages((prev) => [...prev, { role: 'user', text: action }])

    const filterAction = getPillFilterAction(action)
    if (filterAction && onSetAgentFilters) {
      if (filterAction.type === 'showSimilar') {
        onSetAgentFilters(null)
      } else {
        onSetAgentFilters((prev) => {
          const base = prev ?? {}
          if (filterAction.type === 'maxPrice') {
            return { ...base, maxPrice: filterAction.value }
          }
          if (filterAction.type === 'color') {
            const colors = [...(base.colors ?? []), filterAction.value]
            return { ...base, colors: [...new Set(colors)] }
          }
          if (filterAction.type === 'size') {
            const sizes = [...(base.sizes ?? []), filterAction.value]
            return { ...base, sizes: [...new Set(sizes)] }
          }
          if (filterAction.type === 'matteFinish') {
            return { ...base, matteFinish: true }
          }
          return base
        })
      }
    }

    let response = "Great choice! Let me find the best options for you. I'm searching our collection now..."
    if (filterAction) {
      if (filterAction.type === 'maxPrice') response = `Here are our picks under $${filterAction.value}. I've filtered the results on the left for you.`
      else if (filterAction.type === 'color') response = `I've filtered by ${filterAction.value}. Check the results on the left.`
      else if (filterAction.type === 'size') response = `I've filtered by ${action} size. Check the results on the left.`
      else if (filterAction.type === 'matteFinish') response = `I've filtered for matte finish. Check the results on the left.`
      else if (filterAction.type === 'showSimilar') response = `I've cleared the filters to show you more options. Browse the full collection on the left.`
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'agent', text: response }])
    }, 1000)
  }

  if (!isOpen) return null

  const showWelcome = messages.length === 0 && !initialMessage
  const lastMessage = messages[messages.length - 1]
  const lastMessageIsAgent = lastMessage?.role === 'agent'

  // Contextual pills: show after agent's response when in search flow (conversation context) or after any agent message (attribute selectors)
  const showConversationPills = searchQuery && lastMessageIsAgent && messages.length >= 2
  const showAttributePills = !searchQuery && lastMessageIsAgent && messages.length >= 2
  const activeContextPills = showConversationPills
    ? conversationContextPills
    : showAttributePills
      ? attributeSelectorPills
      : []

  const pillClass =
    'px-3 py-2 rounded-full text-sm font-medium border border-agentic-border bg-white text-agentic-foreground hover:border-agentic-primary hover:bg-agentic-accent transition-colors whitespace-nowrap'

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[70] flex flex-col bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] h-[85dvh] max-h-[85dvh] agent-sidebar-animation
        lg:static lg:flex-shrink-0 lg:w-[420px] lg:max-h-none lg:h-screen lg:min-h-0 lg:rounded-none lg:shadow-none lg:border-l lg:border-agentic-border"
      role="complementary"
      aria-label="Personal Assistant chat"
    >
      {/* Header */}
      <div className="flex-shrink-0">
        <ModalHeader
          title="Salesforce Foundations Personal Assistant"
          onClose={onClose}
          variant="agentic"
          closeAriaLabel="Close assistant"
        />
      </div>

      {/* Chat Content - fixed height, own scroll, auto-scroll to bottom */}
      <div
        ref={chatScrollRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
      >
        {messages.length > 0 ? (
          <div className="p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-agentic-primary text-agentic-primary-foreground rounded-br-md'
                      : 'bg-agentic-muted text-agentic-foreground rounded-bl-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {/* Contextual fast-answer pills - appear after agent messages */}
            {activeContextPills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {activeContextPills.map((pill, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickAction(pill)}
                    className={pillClass}
                  >
                    {pill}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : showWelcome ? (
          <div className="p-4">
            <div className="aspect-[4/3] bg-agentic-muted rounded-xl overflow-hidden mb-4">
              <img
                src="/images/products/signature-form-white-1.png"
                alt="Personal Assistant"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold text-agentic-foreground mb-2">Hello There!</h3>
            <p className="text-sm text-agentic-muted-foreground mb-4 leading-relaxed">
              Welcome to your personal shopper assistant. I specialize in sculptural objects and minimalist design.
              Whether you need the perfect piece for your space or a gift recommendation, I&apos;ll help you find it.
              What brings you here today?
            </p>
            {/* Conversation starter pills */}
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickAction(action)}
                  className={pillClass}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-agentic-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me something..."
            className="flex-1 px-4 py-3 bg-agentic-input rounded-lg text-sm text-agentic-foreground placeholder-agentic-muted-foreground outline-none focus:ring-2 focus:ring-agentic-ring border border-agentic-border"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="p-3 bg-agentic-primary text-agentic-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
