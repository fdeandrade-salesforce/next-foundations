'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Debug instrumentation: logs CSS loading state on each page.
 * Remove after resolving "some pages isn't loading the css" issue.
 */
export default function CssDiagnostics() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const sheetCount = document.styleSheets.length
    const brandBlue = getComputedStyle(document.documentElement).getPropertyValue('--brand-blue-500').trim()
    const hasBrandTokens = brandBlue.length > 0
    const stylesheetLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    const linkHrefs = stylesheetLinks.map((l) => (l as HTMLLinkElement).href)

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/610e4bcb-c133-4b52-9c63-4d949bfe5268', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'CssDiagnostics.tsx:useEffect',
        message: 'CSS diagnostics on page load',
        data: {
          pathname: pathname ?? 'unknown',
          styleSheetCount: sheetCount,
          hasBrandTokens,
          brandBlueSample: brandBlue.slice(0, 30),
          stylesheetLinkCount: linkHrefs.length,
          firstLinkHref: linkHrefs[0] ?? null,
        },
        timestamp: Date.now(),
        hypothesisId: 'H1',
      }),
    }).catch(() => {})
    // #endregion
  }, [pathname])

  return null
}
