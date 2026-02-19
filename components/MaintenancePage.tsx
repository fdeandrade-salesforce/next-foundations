'use client'

import React from 'react'
import Link from 'next/link'

/**
 * Minimal full-site takeover for scheduled maintenance.
 * No nav/footer - realistic for when the store is closed.
 */
export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
      {/* Minimal header: logo only */}
      <header className="absolute top-0 left-0 right-0 py-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center">
          <img
            src="/images/logo.svg"
            alt="Salesforce Foundations"
            className="h-10 w-auto"
          />
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <svg
            className="w-24 h-24 text-brand-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-semibold text-brand-black mb-4 tracking-tight">
          We&apos;re making things even better
        </h1>

        <p className="text-lg text-brand-gray-600 mb-2 leading-relaxed">
          Our store is temporarily closed for scheduled maintenance. We&apos;re
          working to improve your shopping experience and will be back shortly.
        </p>
        <p className="text-base text-brand-gray-500 mb-8">
          We apologize for any inconvenience. Thank you for your patience!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="px-6 py-3 bg-brand-blue-500 text-white font-medium rounded-lg hover:bg-brand-blue-600 transition-colors"
          >
            Contact Us
          </Link>
          <a
            href="mailto:support@example.com"
            className="px-6 py-3 bg-white text-brand-blue-500 font-medium border-2 border-brand-blue-500 rounded-lg hover:bg-brand-blue-50 transition-colors"
          >
            Email Support
          </a>
        </div>

        <p className="mt-8 text-sm text-brand-gray-500">
          Check back in a few minutes, or follow us for updates.
        </p>
      </main>

      {/* Minimal footer line */}
      <footer className="py-6 text-sm text-brand-gray-500">
        © Salesforce Foundations
      </footer>
    </div>
  )
}
