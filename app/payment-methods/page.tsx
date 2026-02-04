'use client'

import React from 'react'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import AnnouncementBar from '../../components/AnnouncementBar'
import Footer from '../../components/Footer'

export default function PaymentMethodsPage() {
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
            <span className="text-brand-black">Payment Methods</span>
          </nav>

          {/* Page Title */}
          <h1 className="text-h1 md:text-display font-light text-brand-black mb-12 md:mb-16 tracking-tight">
            Payment Methods
          </h1>

          {/* Introduction */}
          <section className="mb-16 md:mb-24">
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
              At Salesforce Foundations, we offer a variety of secure payment options to make your checkout experience convenient and safe. All transactions are processed through encrypted, secure payment gateways to protect your information.
            </p>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed">
              We accept the following payment methods:
            </p>
          </section>

          {/* Accepted Payment Methods */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Accepted Payment Methods
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-brand-gray-200 rounded-lg p-6">
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Credit & Debit Cards
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed mb-4">
                  We accept all major credit and debit cards:
                </p>
                <ul className="list-disc list-inside text-body text-brand-gray-700 space-y-2 ml-4">
                  <li>Visa</li>
                  <li>Mastercard</li>
                  <li>American Express</li>
                  <li>Discover</li>
                </ul>
              </div>
              <div className="border border-brand-gray-200 rounded-lg p-6">
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  PayPal
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  Pay securely with your PayPal account. You can use your PayPal balance, linked bank account, or credit card through PayPal.
                </p>
              </div>
              <div className="border border-brand-gray-200 rounded-lg p-6">
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Apple Pay
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  Check out quickly and securely using Apple Pay on compatible devices. Your payment information is never shared with us.
                </p>
              </div>
              <div className="border border-brand-gray-200 rounded-lg p-6">
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Google Pay
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  Use Google Pay for fast, secure checkout on supported devices and browsers.
                </p>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Payment Security
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Secure Transactions
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  All payment information is encrypted using industry-standard SSL (Secure Socket Layer) technology. We never store your full credit card information on our servers. Payment processing is handled by trusted, PCI-compliant payment processors.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  PCI Compliance
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  We are PCI DSS (Payment Card Industry Data Security Standard) compliant, ensuring that your payment information is handled with the highest level of security.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Fraud Protection
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  Our payment processors use advanced fraud detection systems to protect against unauthorized transactions. If we detect any suspicious activity, we may contact you to verify your order.
                </p>
              </div>
            </div>
          </section>

          {/* Billing Information */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Billing Information
            </h2>
            <div className="space-y-4">
              <p className="text-body-lg text-brand-gray-700 leading-relaxed">
                The billing address you provide must match the address associated with your payment method. This helps prevent fraud and ensures your payment is processed successfully.
              </p>
              <p className="text-body-lg text-brand-gray-700 leading-relaxed">
                You can save payment methods securely in your account for faster checkout in the future. Saved payment information is encrypted and can be removed at any time.
              </p>
            </div>
          </section>

          {/* Currency */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Currency
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-4">
              All prices are displayed in USD (US Dollars). If you&apos;re shopping from outside the United States, your payment method will be charged in USD, and your bank or credit card company will convert the amount to your local currency.
            </p>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed">
              Exchange rates and any foreign transaction fees are determined by your financial institution and may vary.
            </p>
          </section>

          {/* Payment Issues */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Payment Issues
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Declined Payments
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed mb-2">
                  If your payment is declined, please check:
                </p>
                <ul className="list-disc list-inside text-body text-brand-gray-700 space-y-2 ml-4">
                  <li>That your billing address matches your payment method</li>
                  <li>That your card has sufficient funds or credit available</li>
                  <li>That your card hasn&apos;t expired</li>
                  <li>That your bank hasn&apos;t placed any restrictions on the transaction</li>
                </ul>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Multiple Charges
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  If you see multiple charges for a single order, one may be an authorization hold. Authorization holds are temporary and will be released by your bank within a few business days. Only the final charge will be processed.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Need Help with Payment?
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
              If you&apos;re experiencing payment issues or have questions about our payment methods, our customer service team is here to help.
            </p>
            <div className="bg-brand-gray-50 rounded-lg p-6 md:p-8">
              <p className="text-body text-brand-gray-700 mb-4">
                <strong className="text-brand-black">Phone:</strong>{' '}
                <a href="tel:180080506453" className="text-brand-blue-600 hover:text-brand-blue-700 underline">
                  1-800-8050-6453
                </a>
              </p>
              <p className="text-body text-brand-gray-700">
                <strong className="text-brand-black">Email:</strong>{' '}
                <a href="mailto:support@marketstreet.com" className="text-brand-blue-600 hover:text-brand-blue-700 underline">
                  support@marketstreet.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
