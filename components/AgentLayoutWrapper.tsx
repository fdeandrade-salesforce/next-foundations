'use client'

import React, { useEffect, useRef } from 'react'
import { useAgent } from '../context/AgentContext'
import AgentSidebar from './AgentSidebar'

export default function AgentLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isOpen, closeAgent, initialMessage, searchQuery, setAgentFilters, clearInitialMessage, scrollPosition } = useAgent()
  const mainScrollRef = useRef<HTMLDivElement>(null)

  // Restore scroll position after the new scroll container mounts (captured in openAgent before state update)
  useEffect(() => {
    if (!isOpen || !mainScrollRef.current || scrollPosition <= 0) return
    const el = mainScrollRef.current
    requestAnimationFrame(() => { el.scrollTop = scrollPosition })
    const t = setTimeout(() => { el.scrollTop = scrollPosition }, 0)
    return () => clearTimeout(t)
  }, [isOpen, scrollPosition])

  // When agent sidebar is open on desktop, constrain modals to main content area (left of sidebar)
  useEffect(() => {
    const isDesktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
    const shouldConstrain = isOpen && isDesktop()
    const html = document.documentElement
    if (shouldConstrain) {
      html.classList.add('agent-modal-constrain')
    } else {
      html.classList.remove('agent-modal-constrain')
    }
    return () => {
      html.classList.remove('agent-modal-constrain')
    }
  }, [isOpen])

  if (!isOpen) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen w-full overflow-hidden relative">
      {/* Main content - shrinks when agent is open on desktop, full screen on mobile */}
      <div ref={mainScrollRef} className="flex-1 min-w-0 min-h-0 overflow-auto">
        {children}
      </div>
      {/* Mobile: dimmed overlay - shows background content with shadow, tappable to close */}
      <div
        className="fixed inset-0 bg-black/40 z-[60] lg:hidden"
        onClick={closeAgent}
        aria-hidden="true"
      />
      {/* Agent panel - bottom sheet on mobile, side layout on desktop */}
      <AgentSidebar
        isOpen={isOpen}
        onClose={closeAgent}
        initialMessage={initialMessage ?? undefined}
        searchQuery={searchQuery ?? undefined}
        onSetAgentFilters={setAgentFilters}
        onInitialMessageConsumed={clearInitialMessage}
      />
    </div>
  )
}
