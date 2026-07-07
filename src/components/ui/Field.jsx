export function Label({ children, required, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-500">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  )
}

const baseInput =
  'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-navy-800 shadow-sm transition placeholder:text-navy-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400'

export function Input({ error, className = '', ...props }) {
  return (
    <input
      className={`${baseInput} ${error ? 'border-red-400 focus-visible:ring-red-400' : 'border-navy-200 focus:border-navy-300'} ${className}`}
      {...props}
    />
  )
}

export function Select({ error, className = '', children, ...props }) {
  return (
    <select
      className={`${baseInput} appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9 ${error ? 'border-red-400' : 'border-navy-200'} ${className}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2316243f' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  )
}

export function FieldError({ children }) {
  if (!children) return null
  return <p className="mt-1 text-xs font-medium text-red-500">{children}</p>
}

export function FormField({ label, required, error, children, htmlFor, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <Label required={required} htmlFor={htmlFor}>
          {label}
        </Label>
      )}
      {children}
      <FieldError>{error}</FieldError>
    </div>
  )
}
