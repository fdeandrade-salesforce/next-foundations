import ErrorPageWithCrossSell from '../components/ErrorPageWithCrossSell'

export default function NotFound() {
  return (
    <ErrorPageWithCrossSell
      code={404}
      title="Page not found"
      message="We couldn't find the page you're looking for. It may have been moved or the link might be incorrect."
      secondaryMessage="Don't worry—you can still explore our collection or head back home."
    />
  )
}
