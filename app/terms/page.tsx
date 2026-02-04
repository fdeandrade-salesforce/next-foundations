'use client'

import React from 'react'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import AnnouncementBar from '../../components/AnnouncementBar'
import Footer from '../../components/Footer'

export default function TermsPage() {
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
            <span className="text-brand-black">Terms of Use</span>
          </nav>

          {/* Page Title */}
          <h1 className="text-h1 md:text-display font-light text-brand-black mb-12 md:mb-16 tracking-tight">
            Terms of Use
          </h1>

          {/* Introduction */}
          <section className="mb-16 md:mb-24">
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
              Welcome to Salesforce Foundations. These Terms of Use govern your access to and use of our website, products, and services. By accessing or using our website, you agree to be bound by these terms and conditions.
            </p>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed">
              Please read these terms carefully. If you do not agree with any part of these terms, you may not access or use our services.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Acceptance of Terms
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-4">
              By accessing, browsing, or using this website, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use and to comply with all applicable laws and regulations.
            </p>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed">
              If you do not agree to these terms, you are not authorized to access or use this website. We reserve the right to update, change, or replace any part of these Terms of Use at any time without prior notice.
            </p>
          </section>

          {/* Use of Website */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Use of Website
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Permitted Use
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed mb-2">
                  You may use our website for lawful purposes only. You agree to use the website in accordance with these terms and all applicable laws and regulations. You may:
                </p>
                <ul className="list-disc list-inside text-body text-brand-gray-700 space-y-2 ml-4">
                  <li>Browse and view our products and content</li>
                  <li>Make purchases through our website</li>
                  <li>Create an account and manage your profile</li>
                  <li>Contact us for customer service inquiries</li>
                </ul>
              </div>
              <div>
                <h3 className="text-h5 font-semibold text-brand-black mb-3">
                  Prohibited Activities
                </h3>
                <p className="text-body text-brand-gray-700 leading-relaxed mb-2">
                  You agree not to:
                </p>
                <ul className="list-disc list-inside text-body text-brand-gray-700 space-y-2 ml-4">
                  <li>Use the website for any illegal or unauthorized purpose</li>
                  <li>Violate any laws in your jurisdiction</li>
                  <li>Transmit any viruses, malware, or harmful code</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the website or servers</li>
                  <li>Copy, reproduce, or resell any content without permission</li>
                  <li>Use automated systems to access the website without authorization</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Account Registration */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Account Registration
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-4">
              To access certain features of our website, you may be required to create an account. When you create an account, you agree to:
            </p>
            <ul className="list-disc list-inside text-body text-brand-gray-700 space-y-2 ml-4 mb-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent, abusive, or illegal activity.
            </p>
          </section>

          {/* Products and Pricing */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Products and Pricing
            </h2>
            <div className="space-y-4">
              <p className="text-body-lg text-brand-gray-700 leading-relaxed">
                We strive to provide accurate product descriptions, images, and pricing information. However, we do not warrant that product descriptions, images, or other content on our website is accurate, complete, reliable, current, or error-free.
              </p>
              <p className="text-body-lg text-brand-gray-700 leading-relaxed">
                Prices are subject to change without notice. We reserve the right to modify or discontinue products at any time. We are not obligated to honor prices that are incorrect due to typographical or other errors.
              </p>
              <p className="text-body-lg text-brand-gray-700 leading-relaxed">
                All prices are in the currency displayed and do not include applicable taxes, shipping, or handling fees unless otherwise stated.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Intellectual Property
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-4">
              All content on this website, including but not limited to text, graphics, logos, images, audio clips, digital downloads, and software, is the property of Salesforce Foundations or its content suppliers and is protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed">
              You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our website without our prior written consent, except as necessary to view the content for your personal, non-commercial use.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Limitation of Liability
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-4">
              To the fullest extent permitted by law, Salesforce Foundations shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our website or services.
            </p>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed">
              Our total liability to you for all claims arising from or related to the use of our website or services shall not exceed the amount you paid to us in the twelve months preceding the claim.
            </p>
          </section>

          {/* Indemnification */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Indemnification
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Salesforce Foundations, its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including attorney&apos;s fees) arising from your use of the website, violation of these Terms of Use, or violation of any third-party rights.
            </p>
          </section>

          {/* Termination */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Termination
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-4">
              We reserve the right to terminate or suspend your access to our website immediately, without prior notice or liability, for any reason, including if you breach these Terms of Use.
            </p>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed">
              Upon termination, your right to use the website will cease immediately. All provisions of these Terms of Use that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Governing Law
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed">
              These Terms of Use shall be governed by and construed in accordance with the laws of the Province of British Columbia, Canada, without regard to its conflict of law provisions. Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of British Columbia.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Changes to Terms
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-4">
              We reserve the right to modify these Terms of Use at any time. We will notify users of any material changes by posting the new Terms of Use on this page and updating the &quot;Last updated&quot; date below.
            </p>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed">
              Your continued use of the website after any changes constitutes your acceptance of the new Terms of Use. If you do not agree to the updated terms, you should discontinue use of the website.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-h3 md:text-h2 font-medium text-brand-black mb-6 tracking-tight">
              Questions About These Terms?
            </h2>
            <p className="text-body-lg text-brand-gray-700 leading-relaxed mb-6">
              If you have questions about these Terms of Use, please contact us.
            </p>
            <div className="bg-brand-gray-50 rounded-lg p-6 md:p-8">
              <p className="text-body text-brand-gray-700 mb-4">
                <strong className="text-brand-black">Email:</strong>{' '}
                <a href="mailto:legal@marketstreet.com" className="text-brand-blue-600 hover:text-brand-blue-700 underline">
                  legal@marketstreet.com
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

          {/* Last Updated */}
          <section className="mb-16 md:mb-24">
            <p className="text-body text-brand-gray-600">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
