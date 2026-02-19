'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface AgentOpenOptions {
  searchQuery?: string
}

export interface AgentFilters {
  maxPrice?: number
  colors?: string[]
  sizes?: string[]
  matteFinish?: boolean
  showSimilar?: boolean
}

interface AgentContextValue {
  isOpen: boolean
  openAgent: (initialMessage?: string, options?: AgentOpenOptions) => void
  closeAgent: () => void
  initialMessage: string | null
  searchQuery: string | null
  agentFilters: AgentFilters | null
  setAgentFilters: (filters: AgentFilters | null | ((prev: AgentFilters | null) => AgentFilters | null)) => void
  clearInitialMessage: () => void
  scrollPosition: number
}

const AgentContext = createContext<AgentContextValue | null>(null)

export function AgentProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialMessage, setInitialMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string | null>(null)
  const [agentFilters, setAgentFiltersState] = useState<AgentFilters | null>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const setAgentFilters = useCallback((arg: AgentFilters | null | ((prev: AgentFilters | null) => AgentFilters | null)) => {
    setAgentFiltersState((prev) => typeof arg === 'function' ? arg(prev) : arg)
  }, [])

  const openAgent = useCallback((message?: string, options?: AgentOpenOptions) => {
    if (message) {
      setInitialMessage(message)
    } else {
      setInitialMessage(null)
    }
    setSearchQuery(options?.searchQuery ?? null)
    setScrollPosition(typeof window !== 'undefined' ? window.scrollY : 0)
    setIsOpen(true)
  }, [])

  const closeAgent = useCallback(() => {
    setIsOpen(false)
    setInitialMessage(null)
    setSearchQuery(null)
    setAgentFilters(null)
  }, [])

  const clearInitialMessage = useCallback(() => {
    setInitialMessage(null)
    setSearchQuery(null)
  }, [])

  const value: AgentContextValue = {
    isOpen,
    openAgent,
    closeAgent,
    initialMessage,
    searchQuery,
    agentFilters,
    setAgentFilters,
    clearInitialMessage,
    scrollPosition,
  }

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  )
}

export function useAgent() {
  const ctx = useContext(AgentContext)
  if (!ctx) {
    throw new Error('useAgent must be used within AgentProvider')
  }
  return ctx
}
