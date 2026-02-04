'use client'

import React from 'react'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import AnnouncementBar from '../../components/AnnouncementBar'
import Footer from '../../components/Footer'
import PromoBanner from '../../components/PromoBanner'

export default function SustainabilityPage() {
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
            <span className="text-brand-black">Sustainability</span>
          </nav>

          {/* Page Title */}
          <h1 className="text-h1 md:text-display font-light text-brand-black mb-12 md:mb-16 tracking-tight">
            Sustainability
          </h1>

          {/* Introduction */}
          <section className="mb-16 md:mb-24">
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
              At Salesforce Foundations, sustainability isn&apos;t a trend—it&apos;s a fundamental part of how we operate. We believe that responsible business practices and environmental stewardship go hand in hand with creating exceptional products and experiences.
            </p>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed">
              Our commitment to sustainability extends across every aspect of our business, from material sourcing and manufacturing to packaging, shipping, and beyond. We&apos;re building a brand that not only serves our customers today but protects the planet for future generations.
            </p>
          </section>

          {/* Our Approach */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Our Approach
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Responsible Materials
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  We prioritize sustainable, recycled, and responsibly sourced materials in all our products. Our selection process considers environmental impact, durability, and end-of-life recyclability.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Ethical Manufacturing
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  We partner with manufacturers who share our commitment to fair labor practices, safe working conditions, and environmental responsibility. We conduct regular audits to ensure standards are met.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Sustainable Packaging
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  Our packaging is designed to minimize waste, use recycled materials, and be fully recyclable or compostable. We&apos;re continuously working to reduce packaging volume and improve materials.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Carbon-Neutral Shipping
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  We offset the carbon footprint of our shipping operations through verified carbon offset programs and are working toward more efficient logistics and delivery methods.
                </p>
              </div>
            </div>
          </section>

          {/* Brand Commitment Banner */}
          <div className="mb-16 md:mb-24">
            <PromoBanner
              title="Responsible Design, Sustainable Future"
              subtitle="Our Promise"
              ctaText="Learn More"
              ctaLink="/about"
              variant="gradient"
            />
          </div>

          {/* Our Commitments */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Our Commitments
            </h2>
            <div className="space-y-6">
              <div className="border-l-4 border-brand-blue-500 pl-6">
                <h3 className="text-h5 font-semibold text-brand-black mb-2">
                  Reduce Waste
                </h3>
                <p className="text-body text-brand-gray-700">
                  We&apos;re committed to minimizing waste throughout our supply chain, from production to delivery. Our goal is zero-waste operations by 2030.
                </p>
              </div>
              <div className="border-l-4 border-brand-blue-500 pl-6">
                <h3 className="text-h5 font-semibold text-brand-black mb-2">
                  Support Circular Economy
                </h3>
                <p className="text-body text-brand-gray-700">
                  We design products for longevity and recyclability, supporting a circular economy where materials are reused and repurposed rather than discarded.
                </p>
              </div>
              <div className="border-l-4 border-brand-blue-500 pl-6">
                <h3 className="text-h5 font-semibold text-brand-black mb-2">
                  Transparent Reporting
                </h3>
                <p className="text-body text-brand-gray-700">
                  We believe in transparency about our sustainability efforts. We regularly publish reports on our progress, challenges, and goals.
                </p>
              </div>
              <div className="border-l-4 border-brand-blue-500 pl-6">
                <h3 className="text-h5 font-semibold text-brand-black mb-2">
                  Community Impact
                </h3>
                <p className="text-body text-brand-gray-700">
                  We support environmental initiatives and partner with organizations working to protect our planet and create positive social impact.
                </p>
              </div>
            </div>
          </section>

          {/* Progress & Goals */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Progress & Goals
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Current Achievements
                </h3>
                <ul className="list-disc list-inside text-body text-brand-gray-700 space-y-2 ml-4">
                  <li>100% of our packaging is recyclable or compostable</li>
                  <li>Carbon-neutral shipping for all orders</li>
                  <li>Partnerships with certified sustainable suppliers</li>
                  <li>Regular sustainability audits and reporting</li>
                </ul>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Goals for 2025
                </h3>
                <ul className="list-disc list-inside text-body text-brand-gray-700 space-y-2 ml-4">
                  <li>Increase use of recycled materials to 75% across all products</li>
                  <li>Reduce packaging volume by 30%</li>
                  <li>Achieve carbon-neutral operations</li>
                  <li>Launch product take-back and recycling program</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How You Can Help */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              How You Can Help
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
              Sustainability is a collective effort. Here are ways you can join us in creating a more sustainable future:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-brand-gray-50 rounded-lg p-6">
                <h4 className="text-h6 font-semibold text-brand-black mb-2">
                  Choose Quality Over Quantity
                </h4>
                <p className="text-body text-brand-gray-700">
                  Invest in well-designed, durable products that last. Quality items reduce the need for frequent replacements and minimize waste.
                </p>
              </div>
              <div className="bg-brand-gray-50 rounded-lg p-6">
                <h4 className="text-h6 font-semibold text-brand-black mb-2">
                  Recycle Packaging
                </h4>
                <p className="text-body text-brand-gray-700">
                  All our packaging is designed to be recycled or composted. Please dispose of it responsibly according to local recycling guidelines.
                </p>
              </div>
              <div className="bg-brand-gray-50 rounded-lg p-6">
                <h4 className="text-h6 font-semibold text-brand-black mb-2">
                  Share Feedback
                </h4>
                <p className="text-body text-brand-gray-700">
                  Your input helps us improve. If you have suggestions for how we can be more sustainable, we want to hear from you.
                </p>
              </div>
              <div className="bg-brand-gray-50 rounded-lg p-6">
                <h4 className="text-h6 font-semibold text-brand-black mb-2">
                  Spread the Word
                </h4>
                <p className="text-body text-brand-gray-700">
                  Help us build a community of conscious consumers. Share your experiences and encourage others to make thoughtful choices.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Questions About Our Sustainability Efforts?
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
              We&apos;re committed to transparency and welcome your questions about our sustainability practices and goals.
            </p>
            <div className="bg-brand-gray-50 rounded-lg p-6 md:p-8">
              <p className="text-body text-brand-gray-700 mb-4">
                <strong className="text-brand-black">Email:</strong>{' '}
                <a href="mailto:sustainability@marketstreet.com" className="text-brand-blue-600 hover:text-brand-blue-700 underline">
                  sustainability@marketstreet.com
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
        </div>
      </main>

      <Footer />
    </div>
  )
}
