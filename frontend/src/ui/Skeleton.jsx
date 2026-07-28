function Skeleton({ className = '', radius = 'rounded-xl' }) {
  return (
    <div aria-hidden="true" className={`bg-track motion-safe:animate-pulse ${radius} ${className}`} />
  )
}

export function SkeletonLine({ className = '' }) {
  return <Skeleton radius="rounded-full" className={`h-3 ${className}`} />
}

export function SkeletonCircle({ className = '' }) {
  return <Skeleton radius="rounded-full" className={className} />
}

export function LoadingRegion({ className = '', children }) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="sr-only">Loading…</span>
      {children}
    </div>
  )
}

export default Skeleton
