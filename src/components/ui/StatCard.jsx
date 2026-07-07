export default function StatCard({
  icon: Icon,
  label,
  value,
  accent = 'navy',
  sub,
  delay = 0,
  valueClassName = 'text-3xl',
}) {
  const accents = {
    navy: 'bg-navy-800 text-gold-300',
    gold: 'bg-gold-400 text-navy-900',
    emerald: 'bg-emerald-600 text-white',
  }
  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-navy-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gold-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">
        {Icon && (
          <span className={`mb-3 inline-flex rounded-lg p-2.5 ${accents[accent]}`}>
            <Icon size={20} />
          </span>
        )}
        <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">{label}</p>
        <p className={`mt-1.5 font-display leading-tight text-navy-900 break-words ${valueClassName}`}>
          {value}
        </p>
        {sub && <p className="mt-1 text-xs text-navy-500">{sub}</p>}
      </div>
    </div>
  )
}
