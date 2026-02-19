/**
 * Preview page for 503 Service Unavailable UI.
 * Visit /503 to see the 503 error page design.
 */
import ErrorPageWithCrossSell from '../../components/ErrorPageWithCrossSell'

export default function ServiceUnavailablePreviewPage() {
  return (
    <ErrorPageWithCrossSell
      code={503}
      title="Temporarily unavailable"
      message="Our store is taking a short break. We're working to get everything back up and running."
      secondaryMessage="Please check back in a few minutes. We appreciate your patience!"
      announcementMessage="We're experiencing technical difficulties. Thank you for your patience."
    />
  )
}
