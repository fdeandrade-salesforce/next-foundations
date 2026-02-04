'use client'

import React from 'react'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import AnnouncementBar from '../../components/AnnouncementBar'
import Footer from '../../components/Footer'
import ContactSection from '../../components/ContactSection'

export default function CustomerServicePage() {
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
            <span className="text-brand-black">Customer Service</span>
          </nav>

          {/* Page Title */}
          <h1 className="text-h1 md:text-display font-light text-brand-black mb-12 md:mb-16 tracking-tight">
            Customer Service
          </h1>

          {/* Introduction */}
          <section className="mb-16 md:mb-24">
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
              At Salesforce Foundations, exceptional customer service is at the heart of everything we do. We&apos;re here to help you with any questions, concerns, or support you need. Our team is committed to providing you with a seamless and enjoyable experience.
            </p>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed">
              Whether you need help with an order, have questions about our products, or want to provide feedback, we&apos;re ready to assist you.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Get in Touch
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-brand-gray-50 rounded-lg p-6 md:p-8">
                <h3 className="text-h5 font-semibold text-brand-black mb-4">
                  Phone Support
                </h3>
                <p className="text-body text-brand-gray-700 mb-4">
                  Speak directly with our customer service team.
                </p>
                <a 
                  href="tel:180080506453" 
                  className="text-brand-blue-600 hover:text-brand-blue-700 text-body-lg font-medium underline"
                >
                  1-800-8050-6453
                </a>
                <p className="text-body-sm text-brand-gray-600 mt-4">
                  Monday - Friday: 9am - 10pm EST<br />
                  Saturday & Sunday: 10am - 7pm EST
                </p>
              </div>
              <div className="bg-brand-gray-50 rounded-lg p-6 md:p-8">
                <h3 className="text-h5 font-semibold text-brand-black mb-4">
                  Email Support
                </h3>
                <p className="text-body text-brand-gray-700 mb-4">
                  Send us an email and we&apos;ll respond within 24 hours.
                </p>
                <a 
                  href="mailto:support@marketstreet.com" 
                  className="text-brand-blue-600 hover:text-brand-blue-700 text-body-lg font-medium underline"
                >
                  support@marketstreet.com
                </a>
                <p className="text-body-sm text-brand-gray-600 mt-4">
                  We typically respond within 24 hours during business days.
                </p>
              </div>
            </div>
          </section>

          {/* Common Questions */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Common Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  How can I track my order?
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  Once your order ships, you&apos;ll receive a tracking number via email. You can use this number to track your package on the carrier&apos;s website or in your account dashboard.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Can I modify or cancel my order?
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  Orders can typically be modified or cancelled within 30 minutes of placement. After that, please contact us immediately and we&apos;ll do our best to accommodate your request.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  What is your return policy?
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  We offer returns within 30 days of delivery for items in original condition. Please visit our Shipping & Returns page for complete details.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  How do I create an account?
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  Click &quot;Account&quot; in the navigation menu and select &quot;Sign Up&quot; or &quot;Create Account.&quot; You can also create an account during checkout.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Form Section */}
          <ContactSection />

          {/* Additional Resources */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Additional Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/shipping-returns" className="border border-brand-gray-200 rounded-lg p-6 hover:border-brand-blue-500 transition-colors">
                <h3 className="text-h5 font-semibold text-brand-black mb-2">
                  Shipping & Returns
                </h3>
                <p className="text-body text-brand-gray-700">
                  Learn about our shipping options and return policy.
                </p>
              </Link>
              <Link href="/size-guide" className="border border-brand-gray-200 rounded-lg p-6 hover:border-brand-blue-500 transition-colors">
                <h3 className="text-h5 font-semibold text-brand-black mb-2">
                  Size Guide
                </h3>
                <p className="text-body text-brand-gray-700">
                  Find the perfect fit with our comprehensive size guide.
                </p>
              </Link>
              <Link href="/payment-methods" className="border border-brand-gray-200 rounded-lg p-6 hover:border-brand-blue-500 transition-colors">
                <h3 className="text-h5 font-semibold text-brand-black mb-2">
                  Payment Methods
                </h3>
                <p className="text-body text-brand-gray-700">
                  Information about accepted payment methods and security.
                </p>
              </Link>
              <Link href="/account" className="border border-brand-gray-200 rounded-lg p-6 hover:border-brand-blue-500 transition-colors">
                <h3 className="text-h5 font-semibold text-brand-black mb-2">
                  My Account
                </h3>
                <p className="text-body text-brand-gray-700">
                  Manage your orders, addresses, and account preferences.
                </p>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
