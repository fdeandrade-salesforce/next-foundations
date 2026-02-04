'use client'

import React from 'react'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import AnnouncementBar from '../../components/AnnouncementBar'
import Footer from '../../components/Footer'

export default function PrivacyChoicesPage() {
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
            <span className="text-brand-black">Your Privacy Choices</span>
          </nav>

          {/* Page Title */}
          <h1 className="text-h1 md:text-display font-light text-brand-black mb-12 md:mb-16 tracking-tight">
            Your Privacy Choices
          </h1>

          {/* Introduction */}
          <section className="mb-16 md:mb-24">
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
              At Salesforce Foundations, we believe you should have control over your personal information. This page explains the choices available to you regarding how we collect, use, and share your data.
            </p>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed">
              You can manage your privacy preferences at any time through your account settings or by contacting us directly.
            </p>
          </section>

          {/* Cookie Preferences */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Cookie Preferences
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
              We use cookies and similar technologies to enhance your experience, analyze site usage, and assist in our marketing efforts. You can control which cookies we use through the settings below.
            </p>
            <div className="bg-brand-gray-50 rounded-lg p-6 md:p-8 mb-6">
              <h3 className="text-h5 font-semibold text-brand-black mb-4">
                Manage Your Cookie Preferences
              </h3>
              <p className="text-body text-brand-gray-700 mb-4">
                You can update your cookie preferences at any time. Essential cookies are required for the website to function and cannot be disabled.
              </p>
              <button className="bg-brand-blue-500 text-white px-6 py-3 text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors">
                Manage Cookies
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-2">
                  Essential Cookies
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  These cookies are necessary for the website to function and cannot be switched off. They include session management, security, and basic functionality.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-2">
                  Analytics Cookies
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-2">
                  Marketing Cookies
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  These cookies are used to deliver advertisements and track campaign performance. They may be set by our advertising partners.
                </p>
              </div>
            </div>
          </section>

          {/* Marketing Communications */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Marketing Communications
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
              You can choose whether to receive marketing emails, newsletters, and promotional communications from us.
            </p>
            <div className="space-y-4">
              <div className="bg-brand-gray-50 rounded-lg p-6">
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Email Preferences
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed mb-4">
                  Manage your email subscription preferences in your account settings or by clicking the unsubscribe link in any marketing email.
                </p>
                <Link
                  href="/account"
                  className="inline-block bg-brand-blue-500 text-white px-6 py-3 text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors"
                >
                  Manage Email Preferences
                </Link>
              </div>
              <div className="bg-brand-gray-50 rounded-lg p-6">
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Text Message Preferences
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed mb-4">
                  If you&apos;ve opted in to receive text messages, you can opt out at any time by replying STOP to any message or updating your preferences in your account.
                </p>
              </div>
            </div>
          </section>

          {/* Data Rights */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Your Data Rights
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Access Your Data
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  You have the right to request a copy of the personal information we hold about you. You can access much of this information directly through your account dashboard.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Correct Your Data
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  You can update your personal information at any time through your account settings. If you need help correcting information, please contact us.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Delete Your Data
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  You can request deletion of your personal information, subject to certain legal and business requirements. Account deletion can be requested through your account settings.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Data Portability
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  You can request a copy of your data in a machine-readable format. This allows you to transfer your information to another service if you choose.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Opt-Out of Sale
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  We do not sell your personal information. If this policy changes, we will notify you and provide an opt-out mechanism.
                </p>
              </div>
            </div>
          </section>

          {/* Do Not Track */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Do Not Track Signals
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed">
              Some browsers include a &quot;Do Not Track&quot; (DNT) feature that signals websites you visit that you do not want to have your online activity tracked. Currently, there is no standard for how DNT signals should be interpreted. We do not respond to DNT signals at this time, but we respect your privacy choices through the mechanisms described on this page.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Questions About Your Privacy Choices?
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
              If you have questions or need assistance managing your privacy preferences, we&apos;re here to help.
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
        </div>
      </main>

      <Footer />
    </div>
  )
}
