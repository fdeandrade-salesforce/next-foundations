import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import TrackingConsentBanner from '../components/TrackingConsentBanner'

export const metadata: Metadata = {
  title: 'Salesforce Foundations | The React PWA Starter Store for Retail',
  description: 'Discover the latest trends in fashion and retail. Shop the new season collection at Salesforce Foundations.',
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
        {children}
        <TrackingConsentBanner />
      </body>
    </html>
  )
}

