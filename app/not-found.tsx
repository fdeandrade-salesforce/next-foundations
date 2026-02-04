'use client'

import React from 'react'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Number */}
          <h1 className="text-9xl md:text-[12rem] font-bold text-brand-blue-500 mb-4 leading-none">
            404
          </h1>
          
          {/* Error Message */}
          <h2 className="text-3xl md:text-4xl font-semibold text-brand-black mb-4 tracking-tight">
            Page Not Found
          </h2>
          
          <p className="text-lg text-brand-gray-600 mb-8 leading-relaxed">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. 
            The page may have been moved, deleted, or the URL might be incorrect.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-brand-blue-500 text-white font-medium rounded-lg hover:bg-brand-blue-600 transition-colors"
            >
              Go to Homepage
            </Link>
            <Link
              href="/shop"
              className="px-6 py-3 bg-white text-brand-blue-500 font-medium border-2 border-brand-blue-500 rounded-lg hover:bg-brand-blue-50 transition-colors"
            >
              Browse Shop
            </Link>
          </div>
          
          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-brand-gray-200">
            <p className="text-sm text-brand-gray-500 mb-4">You might be looking for:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/women" className="text-brand-blue-500 hover:text-brand-blue-600 transition-colors">
                Women
              </Link>
              <Link href="/men" className="text-brand-blue-500 hover:text-brand-blue-600 transition-colors">
                Men
              </Link>
              <Link href="/accessories" className="text-brand-blue-500 hover:text-brand-blue-600 transition-colors">
                Accessories
              </Link>
              <Link href="/sale" className="text-brand-blue-500 hover:text-brand-blue-600 transition-colors">
                Sale
              </Link>
              <Link href="/contact" className="text-brand-blue-500 hover:text-brand-blue-600 transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
