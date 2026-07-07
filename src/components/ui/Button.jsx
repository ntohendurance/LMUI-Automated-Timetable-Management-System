const VARIANTS = {
  primary:
    'bg-navy-800 text-white hover:bg-navy-700 focus-visible:ring-navy-500 disabled:bg-navy-300',
  gold: 'bg-gold-400 text-navy-900 hover:bg-gold-300 focus-visible:ring-gold-400 disabled:bg-gold-200 disabled:text-navy-400',
  outline:
    'border border-navy-200 bg-white text-navy-800 hover:bg-navy-50 focus-visible:ring-navy-400 disabled:opacity-50',
  ghost: 'text-navy-700 hover:bg-navy-100 focus-visible:ring-navy-300 disabled:opacity-50',
  danger:
    'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500 disabled:bg-red-300',
  subtle: 'bg-navy-100 text-navy-800 hover:bg-navy-200 focus-visible:ring-navy-300',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  as: Comp = 'button',
  children,
  ...props
}) {
  return (
    <Comp
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </Comp>
  )
}
