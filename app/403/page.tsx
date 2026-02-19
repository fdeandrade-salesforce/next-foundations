/**
 * Preview page for 403 Forbidden UI.
 * Visit /403 to see the 403 error page design.
 */
import ErrorPageWithCrossSell from '../../components/ErrorPageWithCrossSell'

export default function ForbiddenPreviewPage() {
  return (
    <ErrorPageWithCrossSell
      code={403}
      title="Access restricted"
      message="You don't have permission to view this page. If you believe this is an error, please contact our support team."
      secondaryMessage="In the meantime, feel free to browse our collection."
    />
  )
}
