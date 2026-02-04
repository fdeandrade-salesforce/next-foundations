'use client'

import React from 'react'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import AnnouncementBar from '../../components/AnnouncementBar'
import Footer from '../../components/Footer'

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Navigation />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-brand-gray-500 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-blue-500 transition-colors">
              Home
            </Link>
            <span>&gt;</span>
            <span className="text-brand-black">Accessibility Statement</span>
          </nav>

          {/* Page Title */}
          <h1 className="text-h1 md:text-display font-light text-brand-black mb-12 md:mb-16 tracking-tight">
            Accessibility Statement
          </h1>

          {/* Introduction */}
          <section className="mb-16 md:mb-24">
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
              Salesforce Foundations is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to achieve these goals.
            </p>
          </section>

          {/* Our Commitment */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Our Commitment
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-4">
              We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 level AA standards. These guidelines explain how to make web content more accessible for people with disabilities, and user-friendly for everyone.
            </p>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed">
              Our commitment includes regular accessibility audits, user testing with people who have disabilities, and ongoing improvements to our website and digital experiences.
            </p>
          </section>

          {/* Measures We Take */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Measures We Take
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Keyboard Navigation
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  Our website can be navigated using only a keyboard, without requiring a mouse or other pointing device.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Screen Reader Compatibility
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  We use semantic HTML and ARIA labels to ensure our content is accessible to screen readers and other assistive technologies.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Color Contrast
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  We maintain sufficient color contrast ratios to ensure text is readable for users with visual impairments.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Alternative Text
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  Images throughout our website include descriptive alternative text to provide context for users who cannot see them.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Responsive Design
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  Our website is designed to work across a variety of devices and screen sizes, ensuring accessibility on mobile, tablet, and desktop devices.
                </p>
              </div>
            </div>
          </section>

          {/* Feedback */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              We Welcome Your Feedback
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
              We are always working to improve the accessibility of our website. If you encounter any barriers or have suggestions for how we can improve, please contact us.
            </p>
            <div className="bg-brand-gray-50 rounded-lg p-6 md:p-8">
              <p className="text-body text-brand-gray-700 mb-4">
                <strong className="text-brand-black">Email:</strong>{' '}
                <a href="mailto:accessibility@marketstreet.com" className="text-brand-blue-600 hover:text-brand-blue-700 underline">
                  accessibility@marketstreet.com
                </a>
              </p>
              <p className="text-body text-brand-gray-700">
                <strong className="text-brand-black">Phone:</strong>{' '}
                <a href="tel:180080506453" className="text-brand-blue-600 hover:text-brand-blue-700 underline">
                  1-800-8050-6453
                </a>
              </p>
            </div>
          </section>

          {/* Ongoing Efforts */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Ongoing Efforts
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-4">
              Accessibility is an ongoing effort. We regularly review our website and digital properties to identify and address accessibility issues. This statement will be updated as we make improvements and as accessibility standards evolve.
            </p>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
