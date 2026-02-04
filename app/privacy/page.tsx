'use client'

import React from 'react'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import AnnouncementBar from '../../components/AnnouncementBar'
import Footer from '../../components/Footer'

export default function PrivacyPage() {
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
            <span className="text-brand-black">Privacy Policy</span>
          </nav>

          {/* Page Title */}
          <h1 className="text-h1 md:text-display font-light text-brand-black mb-12 md:mb-16 tracking-tight">
            Privacy Policy
          </h1>

          {/* Introduction */}
          <section className="mb-16 md:mb-24">
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
              At Salesforce Foundations, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed">
              By using our website, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Information We Collect
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Information You Provide
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed mb-2">
                  We collect information that you voluntarily provide to us, including:
                </p>
                <ul className="list-disc list-inside text-body text-brand-gray-700 space-y-2 ml-4">
                  <li>Name and contact information (email address, phone number, mailing address)</li>
                  <li>Payment information (processed securely through our payment partners)</li>
                  <li>Account credentials and preferences</li>
                  <li>Communications with our customer service team</li>
                  <li>Product reviews and feedback</li>
                </ul>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Automatically Collected Information
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed mb-2">
                  When you visit our website, we automatically collect certain information, including:
                </p>
                <ul className="list-disc list-inside text-body text-brand-gray-700 space-y-2 ml-4">
                  <li>Device information (browser type, operating system, device identifiers)</li>
                  <li>Usage data (pages visited, time spent, click patterns)</li>
                  <li>IP address and location data</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              How We Use Your Information
            </h2>
            <div className="space-y-4">
              <p className="text-body-lg text-brand-gray-700 leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-body text-brand-gray-700 space-y-2 ml-4">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your account, orders, and our services</li>
                <li>Improve and personalize your shopping experience</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Detect and prevent fraud and security issues</li>
                <li>Comply with legal obligations</li>
                <li>Conduct analytics and research to improve our services</li>
              </ul>
            </div>
          </section>

          {/* Information Sharing */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Information Sharing and Disclosure
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-4">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-2">
                  Service Providers
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  We share information with trusted third-party service providers who assist us in operating our website, processing payments, shipping orders, and providing customer service.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-2">
                  Legal Requirements
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  We may disclose information when required by law, court order, or to protect our rights, property, or safety.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-2">
                  Business Transfers
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
                </p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Your Rights and Choices
            </h2>
            <div className="space-y-4">
              <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-body text-brand-gray-700 space-y-2 ml-4">
                <li>Access and receive a copy of your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Manage cookie preferences</li>
                <li>Request data portability</li>
              </ul>
              <p className="text-body text-brand-gray-700 leading-relaxed mt-4">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Contact Us
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-brand-gray-50 rounded-lg p-6 md:p-8">
              <p className="text-body text-brand-gray-700 mb-4">
                <strong className="text-brand-black">Email:</strong>{' '}
                <a href="mailto:privacy@marketstreet.com" className="text-brand-blue-600 hover:text-brand-blue-700 underline">
                  privacy@marketstreet.com
                </a>
              </p>
              <p className="text-body text-brand-gray-700 mb-4">
                <strong className="text-brand-black">Phone:</strong>{' '}
                <a href="tel:180080506453" className="text-brand-blue-600 hover:text-brand-blue-700 underline">
                  1-800-8050-6453
                </a>
              </p>
              <p className="text-body text-brand-gray-700">
                <strong className="text-brand-black">Address:</strong> 1818 Cornwall Ave, Vancouver BC V5J 1C7
              </p>
            </div>
          </section>

          {/* Updates */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Policy Updates
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date below.
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
