/**
 * Preview page for 404 UI.
 * Visit /404 to see the 404 error page design.
 * Real 404s (broken URLs) are handled by app/not-found.tsx.
 */
import ErrorPageWithCrossSell from '../../components/ErrorPageWithCrossSell'

export default function NotFoundPreviewPage() {
  return (
    <ErrorPageWithCrossSell
      code={404}
      title="Page not found"
      message="We couldn't find the page you're looking for. It may have been moved or the link might be incorrect."
      secondaryMessage="Don't worry—you can still explore our collection or head back home."
    />
  )
}
