import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import TrackingConsentBanner from '../components/TrackingConsentBanner'
import { AgentProvider } from '../context/AgentContext'
import AgentLayoutWrapper from '../components/AgentLayoutWrapper'
import CssDiagnostics from '../components/CssDiagnostics'

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : process.env.VERCEL_URL
      ? new URL(`https://${process.env.VERCEL_URL}`)
      : undefined,
  title: {
    default: 'Salesforce Foundations | Design Store — Furniture, Lighting & Accessories',
    template: '%s | Salesforce Foundations',
  },
  description:
    'Discover sculptural furniture, lighting, and design accessories. Pure form. Timeless design. Built on Salesforce Foundations.',
  keywords: ['design furniture', 'lighting', 'home accessories', 'modern living', 'Salesforce'],
  authors: [{ name: 'Salesforce Foundations' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Salesforce Foundations',
    title: 'Salesforce Foundations | Design Store — Furniture, Lighting & Accessories',
    description:
      'Discover sculptural furniture, lighting, and design accessories. Pure form. Timeless design.',
    images: [
      {
        url: '/images/hero/hero-main.png',
        width: 1024,
        height: 1024,
        alt: 'Salesforce Foundations — Design furniture and sculptural objects for modern living',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Salesforce Foundations | Design Store',
    description: 'Discover sculptural furniture, lighting, and design accessories.',
    images: ['/images/hero/hero-main.png'],
  },
  robots: {
    index: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"
          strategy="lazyOnload"
        />
        <AgentProvider>
          <CssDiagnostics />
          <AgentLayoutWrapper>
            {children}
            <TrackingConsentBanner />
          </AgentLayoutWrapper>
        </AgentProvider>
      </body>
    </html>
  )
}

