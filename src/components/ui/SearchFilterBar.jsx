import { Search } from 'lucide-react'
import { Select } from './Field.jsx'

/**
 * filters: [{ value, onChange, options: [{label,value}], placeholder }]
 */
export default function SearchFilterBar({ search, onSearch, searchPlaceholder = 'Search…', filters = [], action }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-navy-200 bg-white py-2.5 pl-9 pr-3 text-sm text-navy-800 shadow-sm transition placeholder:text-navy-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          />
        </div>
        {filters.map((f, i) => (
          <Select
            key={i}
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            className="sm:w-52"
          >
            <option value="">{f.placeholder}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        ))}
      </div>
      {action}
    </div>
  )
}
