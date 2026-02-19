/**
 * Preview page for 500 Internal Server Error UI.
 * Visit /500 to see the 500 error page design.
 */
import ErrorPageWithCrossSell from '../../components/ErrorPageWithCrossSell'

export default function ServerErrorPreviewPage() {
  return (
    <ErrorPageWithCrossSell
      code={500}
      title="Something went wrong"
      message="We're sorry, but something unexpected happened on our end. Our team has been notified and is working to fix it."
      secondaryMessage="Please try again in a few moments, or browse our shop while we sort things out."
    />
  )
}
