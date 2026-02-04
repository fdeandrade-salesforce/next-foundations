'use client'

import React from 'react'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import AnnouncementBar from '../../components/AnnouncementBar'
import Footer from '../../components/Footer'
import ContactSection from '../../components/ContactSection'
import PromoBanner from '../../components/PromoBanner'

export default function AboutPage() {
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
            <span className="text-brand-black">About us</span>
          </nav>

          {/* Page Title */}
          <h1 className="text-h1 md:text-display font-light text-brand-black mb-12 md:mb-16 tracking-tight">
            About us
          </h1>

          {/* Section 1: Built for movement. Designed for everyday life. */}
          <section className="mb-16 md:mb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <h2 className="text-h2 md:text-h1 font-light text-brand-black mb-6 tracking-tight">
                  Built for movement. Designed for everyday life.
                </h2>
                <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-4">
                  Salesforce Foundations was founded on a simple belief: great design should serve your life, not complicate it. We&apos;re inspired by the rhythm of urban living—the way people move through cities, create spaces, and build routines. Our work begins with understanding how objects fit into real lives, not just how they look in isolation.
                </p>
                <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-4">
                  Every decision we make—from material selection to form to function—starts with a question: Does this make life better? We design for versatility, durability, and timelessness because we believe the best objects are the ones you reach for daily, the ones that become part of your story without demanding attention.
                </p>
                <p className="text-body-lg text-brand-gray-700 leading-relaxed">
                  We&apos;re not just creating products. We&apos;re building a philosophy of thoughtful consumption, where quality and intention replace trends and excess. This is how we&apos;ve always worked, and it&apos;s how we&apos;ll continue to grow.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-brand-gray-100 rounded-lg overflow-hidden">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src="/about us resources/video 3 (2).mp4" type="video/mp4" />
                  </video>
                </div>
                <div className="aspect-square bg-brand-gray-100 rounded-lg overflow-hidden">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src="/about us resources/video 4.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
            </div>
          </section>

          {/* Brand Commitment Banner 1 */}
          <div className="mb-16 md:mb-24">
            <PromoBanner
              title="Accessible Design, Thoughtful Delivery"
              subtitle="Our Commitment"
              ctaText="Learn More"
              ctaLink="/shop"
              variant="primary"
            />
          </div>

          {/* Video Section */}
          <section className="mb-16 md:mb-24">
            <div className="w-full max-w-7xl mx-auto">
              <div className="relative aspect-video bg-brand-gray-100 rounded-lg overflow-hidden shadow-sm">
                <video
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                >
                  <source src="/about us resources/player video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </section>

          {/* Section 2: Our Vision & Why We Exist */}
          <section className="mb-16 md:mb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div>
                <div className="aspect-square bg-brand-gray-100 rounded-lg mb-6 overflow-hidden">
                  <img
                    src="/about us resources/About Us Vision Section Image - Realistic.png"
                    alt="Our Vision"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-h4 md:text-h3 font-medium text-brand-black mb-4">
                  Our Vision
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  We envision a future where commerce feels natural, where technology serves people instead of complicating their lives, and where every interaction—from discovery to delivery—feels intentional and human. We&apos;re building a brand that evolves with our community, learns from their needs, and creates value that extends far beyond transactions. Our vision is simple: make the experience of finding and living with well-designed objects as effortless as the objects themselves.
                </p>
              </div>
              <div>
                <div className="aspect-square bg-brand-gray-100 rounded-lg mb-6 overflow-hidden">
                  <img
                    src="/about us resources/About Us Purpose Section Image - Realistic.png"
                    alt="Why We Exist"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-h4 md:text-h3 font-medium text-brand-black mb-4">
                  Why We Exist
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  We exist because we believe people deserve better than the noise of modern commerce. Too many brands prioritize selling over serving, trends over timelessness, and transactions over trust. We&apos;re here to prove there&apos;s another way—one where thoughtful design, honest communication, and genuine care for our community guide every decision. We exist to build something that lasts, both in what we create and how we create it.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: We're Here to Help */}
          <ContactSection />

          {/* Brand Commitment Banner 2 */}
          <div className="mb-16 md:mb-24">
            <PromoBanner
              title="Responsible Design, Sustainable Future"
              subtitle="Our Promise"
              ctaText="See Our Approach"
              ctaLink="/shop"
              variant="gradient"
            />
          </div>

          {/* Section 4: What We Stand For */}
          <section className="mb-16 md:mb-24">
            <h3 className="text-h4 md:text-h3 font-medium text-brand-black mb-8">
              What We Stand For
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="border-l-4 border-brand-blue-500 pl-6">
                <h4 className="text-h6 font-semibold text-brand-black mb-2">
                  Design with purpose
                </h4>
                <p className="text-body text-brand-gray-700">
                  Nothing we create is accidental. Every form, function, and interaction serves a clear purpose in making your life better.
                </p>
              </div>
              <div className="border-l-4 border-brand-blue-500 pl-6">
                <h4 className="text-h6 font-semibold text-brand-black mb-2">
                  Technology that disappears
                </h4>
                <p className="text-body text-brand-gray-700">
                  Innovation should make things easier, not more complex. We build tools that fade into the background so you can focus on what matters.
                </p>
              </div>
              <div className="border-l-4 border-brand-blue-500 pl-6">
                <h4 className="text-h6 font-semibold text-brand-black mb-2">
                  People over profit
                </h4>
                <p className="text-body text-brand-gray-700">
                  Your experience, your needs, and your trust guide every decision we make. We&apos;re building relationships, not just making sales.
                </p>
              </div>
              <div className="border-l-4 border-brand-blue-500 pl-6">
                <h4 className="text-h6 font-semibold text-brand-black mb-2">
                  Sustainability in motion
                </h4>
                <p className="text-body text-brand-gray-700">
                  We&apos;re committed to responsible sourcing, ethical partnerships, and practices that protect our planet for future generations.
                </p>
              </div>
            </div>
          </section>

          {/* Brand Commitment Banner 3 */}
          <div className="mb-16 md:mb-24">
            <PromoBanner
              title="Be Part of Our Story"
              subtitle="Join the Community"
              ctaText="Connect With Us"
              ctaLink="/account"
              variant="primary"
            />
          </div>

          {/* Section 5: A Global Brand, a Street-Level Soul */}
          <section className="mb-16 md:mb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="aspect-square bg-brand-gray-100 rounded-lg overflow-hidden order-2 lg:order-1">
                <img
                  src="/about us resources/About Us Community Section Image - Realistic.png"
                  alt="A Global Brand, a Street-Level Soul"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-h2 md:text-h1 font-light text-brand-black mb-6 tracking-tight">
                  A Global Brand, a Street-Level Soul
                </h2>
                <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
                  Salesforce Foundations draws from global design movements while staying grounded in the real needs of everyday life. We&apos;re inspired by international design excellence, but we build for the person navigating their morning routine, creating their space, and living their life. This balance—between global vision and local understanding—defines who we are.
                </p>
                <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-8">
                  Our guiding principle is simple: <strong className="font-medium text-brand-black">Make commerce feel natural.</strong> We believe the best brands don&apos;t just sell products—they become part of your story, understand your needs, and grow with you. That&apos;s the future we&apos;re building, one thoughtful interaction at a time.
                </p>
                <Link
                  href="/shop"
                  className="inline-block bg-brand-blue-500 text-white px-8 py-3 text-sm font-medium rounded-lg hover:bg-brand-blue-600 transition-colors"
                >
                  EXPLORE OUR WORK
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
