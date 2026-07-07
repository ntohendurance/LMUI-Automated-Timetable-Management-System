/**
 * Wraps every page with a consistent header + fade/slide-up entry animation.
 */
export default function PageWrapper({ title, description, actions, children }) {
  return (
    <div className="animate-fade-up">
      {(title || actions) && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title && <h1 className="font-display text-2xl text-navy-900 sm:text-3xl">{title}</h1>}
            {description && <p className="mt-1.5 max-w-2xl text-sm text-navy-500">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
