'use client'

import React, { useState, useRef, useEffect } from 'react'

interface AgentSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const quickActions = [
  'Best sellers under $100',
  'Top rated sculptures',
  'Suggest pieces for minimalist living room',
]

export default function AgentSidebar({ isOpen, onClose }: AgentSidebarProps) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'agent'; text: string }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const handleSend = () => {
    if (!message.trim()) return
    
    setMessages(prev => [...prev, { role: 'user', text: message }])
    setMessage('')
    
    // Simulate agent response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'agent', 
        text: "I'd be happy to help you find the perfect piece! Based on your interest, I'd recommend checking out our Signature Form collection. Would you like me to show you some options?" 
      }])
    }, 1000)
  }

  const handleQuickAction = (action: string) => {
    setMessages(prev => [...prev, { role: 'user', text: action }])
    
    // Simulate agent response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'agent', 
        text: "Great choice! Let me find the best options for you. I'm searching our collection now..." 
      }])
    }, 1000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col"
        style={{ animation: 'slideInRight 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-gray-200">
          <h2 className="text-base font-semibold text-brand-black">Market Street Personal Assistant</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-brand-gray-500 hover:text-brand-black transition-colors rounded-lg hover:bg-brand-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            // Welcome State
            <div className="p-6">
              {/* Hero Image */}
              <div className="aspect-[4/3] bg-brand-gray-100 rounded-xl overflow-hidden mb-6">
                <img
                  src="/images/products/signature-form-white-1.png"
                  alt="Personal Assistant"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Welcome Message */}
              <h3 className="text-xl font-semibold text-brand-black mb-3">Hello There!</h3>
              <p className="text-sm text-brand-gray-600 mb-6 leading-relaxed">
                Welcome to your personal shopper assistant. I specialize in sculptural objects and minimalist design. 
                Whether you need the perfect piece for your space or a gift recommendation, I&apos;ll help you find it. 
                What brings you here today?
              </p>
              
              {/* Quick Actions */}
              <div className="space-y-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action)}
                    className="w-full text-left px-4 py-3 border border-brand-gray-200 rounded-lg text-sm text-brand-black hover:border-brand-blue-300 hover:bg-brand-blue-50/50 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Chat Messages
            <div className="p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-brand-blue-500 text-white rounded-br-md'
                        : 'bg-brand-gray-100 text-brand-black rounded-bl-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="p-4 border-t border-brand-gray-200">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me something..."
              className="flex-1 px-4 py-3 bg-brand-gray-100 rounded-lg text-sm text-brand-black placeholder-brand-gray-400 outline-none focus:ring-2 focus:ring-brand-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="p-3 bg-brand-blue-500 text-white rounded-lg hover:bg-brand-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
