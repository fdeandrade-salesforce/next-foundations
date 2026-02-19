'use client'

import React from 'react'

interface ModalHeaderProps {
  title: string
  onClose: () => void
  /** 'default' for standard modals (brand tokens), 'agentic' for agent sidebar */
  variant?: 'default' | 'agentic'
  /** Optional id for aria-labelledby on the dialog */
  id?: string
  /** Accessible label for close button */
  closeAriaLabel?: string
  /** Extra class names for the container */
  className?: string
  /** Ref forwarded to the close button (e.g. for focus management) */
  closeButtonRef?: React.Ref<HTMLButtonElement>
}

/**
 * Consistent modal/drawer header pattern across the experience.
 * Title: text-lg font-semibold. Close: p-2, 20px icon, gray-500 → black on hover.
 */
export default function ModalHeader({
  title,
  onClose,
  variant = 'default',
  id,
  closeAriaLabel = 'Close',
  className = '',
  closeButtonRef,
}: ModalHeaderProps) {
  const isAgentic = variant === 'agentic'

  return (
    <div
      className={`
        flex items-center justify-between border-b shrink-0
        px-4 sm:px-6 py-4
        ${isAgentic ? 'border-agentic-border' : 'border-brand-gray-200'}
        ${className}
      `}
    >
      <h2
        id={id}
        className={`
          text-lg font-semibold truncate pr-2
          ${isAgentic ? 'text-agentic-foreground' : 'text-brand-black'}
        `}
      >
        {title}
      </h2>
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label={closeAriaLabel}
        className={`
          p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500
          ${isAgentic
            ? 'text-agentic-muted-foreground hover:text-agentic-foreground hover:bg-agentic-accent'
            : 'text-brand-gray-500 hover:text-brand-black hover:bg-brand-gray-100'}
        `}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
