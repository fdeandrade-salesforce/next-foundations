'use client'

import React from 'react'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import AnnouncementBar from '../../components/AnnouncementBar'
import Footer from '../../components/Footer'

export default function CareersPage() {
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
            <span className="text-brand-black">Careers</span>
          </nav>

          {/* Page Title */}
          <h1 className="text-h1 md:text-display font-light text-brand-black mb-12 md:mb-16 tracking-tight">
            Careers
          </h1>

          {/* Introduction */}
          <section className="mb-16 md:mb-24">
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
              At Salesforce Foundations, we&apos;re building a team of passionate individuals who share our commitment to thoughtful design, exceptional customer experience, and sustainable business practices. We believe great products come from great teams, and we&apos;re always looking for talented people to join us.
            </p>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed">
              If you&apos;re driven by purpose, inspired by design, and excited about creating meaningful experiences, we&apos;d love to hear from you.
            </p>
          </section>

          {/* Why Work With Us */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Why Work With Us
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Purpose-Driven Work
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  Every project we take on serves our mission to make commerce feel natural and accessible. You&apos;ll work on meaningful initiatives that impact how people discover and experience well-designed products.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Growth & Development
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  We invest in our team&apos;s growth through learning opportunities, mentorship programs, and clear career progression paths. Your development is our priority.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Collaborative Culture
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  We believe the best ideas come from diverse perspectives. Our team culture encourages open communication, creative problem-solving, and mutual respect.
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Work-Life Balance
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  We understand that great work happens when people feel supported. We offer flexible work arrangements and prioritize your well-being.
                </p>
              </div>
            </div>
          </section>

          {/* Open Positions */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Open Positions
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-8">
              We&apos;re always looking for talented individuals to join our team. Check back regularly for new opportunities, or send us your resume to be considered for future openings.
            </p>
            <div className="bg-brand-gray-50 rounded-lg p-6 md:p-8">
              <p className="text-body text-brand-gray-700 mb-4">
                Currently, we don&apos;t have any open positions listed. However, we&apos;re always interested in connecting with exceptional talent.
              </p>
              <p className="text-body text-brand-gray-700">
                If you&apos;re passionate about what we do and think you&apos;d be a great fit, we encourage you to reach out. We keep all applications on file and review them when new opportunities arise.
              </p>
            </div>
          </section>

          {/* How to Apply */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              How to Apply
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Submit Your Application
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed mb-4">
                  Send your resume and a cover letter explaining why you&apos;re interested in joining Salesforce Foundations and how your experience aligns with our mission.
                </p>
                <p className="text-body text-brand-gray-700 leading-relaxed">
                  <strong className="text-brand-black">Email:</strong>{' '}
                  <a href="mailto:careers@marketstreet.com" className="text-brand-blue-600 hover:text-brand-blue-700 underline">
                    careers@marketstreet.com
                  </a>
                </p>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  What We Look For
                </h3>
                <ul className="list-disc list-inside text-body text-brand-gray-700 space-y-2 ml-4">
                  <li>Passion for design, technology, and customer experience</li>
                  <li>Strong problem-solving and communication skills</li>
                  <li>Collaborative mindset and team-oriented approach</li>
                  <li>Commitment to continuous learning and growth</li>
                  <li>Alignment with our values and mission</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Benefits & Perks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-l-4 border-brand-blue-500 pl-6">
                <h4 className="text-h6 font-semibold text-brand-black mb-2">
                  Health & Wellness
                </h4>
                <p className="text-body text-brand-gray-700">
                  Comprehensive health, dental, and vision insurance plans for you and your family.
                </p>
              </div>
              <div className="border-l-4 border-brand-blue-500 pl-6">
                <h4 className="text-h6 font-semibold text-brand-black mb-2">
                  Flexible Time Off
                </h4>
                <p className="text-body text-brand-gray-700">
                  Generous paid time off and flexible scheduling to support work-life balance.
                </p>
              </div>
              <div className="border-l-4 border-brand-blue-500 pl-6">
                <h4 className="text-h6 font-semibold text-brand-black mb-2">
                  Professional Development
                </h4>
                <p className="text-body text-brand-gray-700">
                  Budget for conferences, courses, and learning resources to support your growth.
                </p>
              </div>
              <div className="border-l-4 border-brand-blue-500 pl-6">
                <h4 className="text-h6 font-semibold text-brand-black mb-2">
                  Team Culture
                </h4>
                <p className="text-body text-brand-gray-700">
                  Regular team events, collaborative workspaces, and a supportive, inclusive environment.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Questions?
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
              If you have questions about working at Salesforce Foundations or want to learn more about our team culture, we&apos;re here to help.
            </p>
            <div className="bg-brand-gray-50 rounded-lg p-6 md:p-8">
              <p className="text-body text-brand-gray-700 mb-4">
                <strong className="text-brand-black">Email:</strong>{' '}
                <a href="mailto:careers@marketstreet.com" className="text-brand-blue-600 hover:text-brand-blue-700 underline">
                  careers@marketstreet.com
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
