const VARIANTS = {
  Draft: 'bg-gold-100 text-gold-800 ring-gold-300/60',
  Published: 'bg-emerald-100 text-emerald-800 ring-emerald-300/60',
  Archived: 'bg-navy-100 text-navy-600 ring-navy-300/60',
  Conflict: 'bg-red-100 text-red-700 ring-red-300/60',
  Available: 'bg-emerald-100 text-emerald-800 ring-emerald-300/60',
  Unavailable: 'bg-red-100 text-red-700 ring-red-300/60',
  Approved: 'bg-emerald-100 text-emerald-800 ring-emerald-300/60',
  Pending: 'bg-gold-100 text-gold-800 ring-gold-300/60',
  neutral: 'bg-navy-100 text-navy-700 ring-navy-300/50',
}

export default function Badge({ variant = 'neutral', children, className = '', dot = false }) {
  const styles = VARIANTS[variant] || VARIANTS.neutral
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  )
}
