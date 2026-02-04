'use client'

import React from 'react'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import AnnouncementBar from '../../components/AnnouncementBar'
import Footer from '../../components/Footer'

export default function PressPage() {
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
            <span className="text-brand-black">Press</span>
          </nav>

          {/* Page Title */}
          <h1 className="text-h1 md:text-display font-light text-brand-black mb-12 md:mb-16 tracking-tight">
            Press
          </h1>

          {/* Introduction */}
          <section className="mb-16 md:mb-24">
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
              Welcome to the Salesforce Foundations press center. Here you&apos;ll find the latest news, press releases, media resources, and information about our brand, products, and initiatives.
            </p>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed">
              For media inquiries, interview requests, or access to high-resolution images and brand assets, please contact our press team.
            </p>
          </section>

          {/* Press Contact */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Press Contact
            </h2>
            <div className="bg-brand-gray-50 rounded-lg p-6 md:p-8 mb-8">
              <p className="text-body text-brand-gray-700 mb-4">
                <strong className="text-brand-black">Email:</strong>{' '}
                <a href="mailto:press@marketstreet.com" className="text-brand-blue-600 hover:text-brand-blue-700 underline">
                  press@marketstreet.com
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
            <p className="text-body-lg text-brand-gray-700 leading-relaxed">
              Our press team is available to assist with media inquiries, provide product information, arrange interviews with company leadership, and facilitate access to brand assets and photography.
            </p>
          </section>

          {/* Press Releases */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Press Releases
            </h2>
            <div className="space-y-6">
              <div className="border-b border-brand-gray-200 pb-6">
                <h3 className="text-h5 font-semibold text-brand-black mb-2">
                  Salesforce Foundations Launches New Collection
                </h3>
                <p className="text-body-sm text-brand-gray-500 mb-3">
                  January 15, 2024
                </p>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  Salesforce Foundations announces the launch of its latest collection, featuring sustainable materials and thoughtful design. The new line represents our continued commitment to creating products that balance form, function, and environmental responsibility.
                </p>
              </div>
              <div className="border-b border-brand-gray-200 pb-6">
                <h3 className="text-h5 font-semibold text-brand-black mb-2">
                  Salesforce Foundations Achieves Carbon-Neutral Shipping
                </h3>
                <p className="text-body-sm text-brand-gray-500 mb-3">
                  December 10, 2023
                </p>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  Salesforce Foundations announces that all shipping operations are now carbon-neutral, marking a significant milestone in the company&apos;s sustainability journey. This achievement supports our commitment to responsible business practices.
                </p>
              </div>
              <div className="border-b border-brand-gray-200 pb-6">
                <h3 className="text-h5 font-semibold text-brand-black mb-2">
                  Salesforce Foundations Opens New Headquarters
                </h3>
                <p className="text-body-sm text-brand-gray-500 mb-3">
                  November 5, 2023
                </p>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  Salesforce Foundations celebrates the opening of its new headquarters in Vancouver, designed with sustainability and collaboration in mind. The space reflects our brand values and provides an inspiring environment for our growing team.
                </p>
              </div>
            </div>
          </section>

          {/* Brand Assets */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Brand Assets
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
              We provide media professionals with access to high-resolution images, logos, product photography, and brand guidelines. All assets are available for editorial use with proper attribution.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-brand-gray-50 rounded-lg p-6">
                <h4 className="text-h6 font-semibold text-brand-black mb-2">
                  Logo & Brand Guidelines
                </h4>
                <p className="text-body text-brand-gray-700 mb-4">
                  Download our logo files and brand guidelines to ensure accurate representation of Salesforce Foundations in your coverage.
                </p>
                <button className="bg-brand-blue-500 text-white px-6 py-3 text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors">
                  Request Assets
                </button>
              </div>
              <div className="bg-brand-gray-50 rounded-lg p-6">
                <h4 className="text-h6 font-semibold text-brand-black mb-2">
                  Product Photography
                </h4>
                <p className="text-body text-brand-gray-700 mb-4">
                  Access high-resolution product images, lifestyle photography, and other visual assets for your editorial needs.
                </p>
                <button className="bg-brand-blue-500 text-white px-6 py-3 text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors">
                  Request Assets
                </button>
              </div>
            </div>
          </section>

          {/* Company Information */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Company Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  About Salesforce Foundations
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  Salesforce Foundations is a modern retail brand committed to creating well-designed products that seamlessly integrate into everyday life. Founded on principles of thoughtful design, sustainability, and exceptional customer experience, we&apos;re building a brand that makes commerce feel natural.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Key Facts
                </h3>
                <ul className="list-disc list-inside text-body text-brand-gray-700 space-y-2 ml-4">
                  <li>Founded: 2020</li>
                  <li>Headquarters: Vancouver, BC, Canada</li>
                  <li>Focus: Design-forward products for modern living</li>
                  <li>Values: Sustainability, quality, customer-first approach</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Media Kit Request */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Request Media Kit
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
              For comprehensive media kits including company background, executive bios, high-resolution images, and recent press releases, please contact our press team.
            </p>
            <div className="bg-brand-gray-50 rounded-lg p-6 md:p-8">
              <p className="text-body text-brand-gray-700 mb-4">
                <strong className="text-brand-black">Email:</strong>{' '}
                <a href="mailto:press@marketstreet.com" className="text-brand-blue-600 hover:text-brand-blue-700 underline">
                  press@marketstreet.com
                </a>
              </p>
              <p className="text-body text-brand-gray-700">
                Please include your name, publication, and specific assets or information you need. We typically respond to media inquiries within 24-48 hours.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
