import { useState, useRef, useEffect } from 'react'
import { ChevronDown, CalendarRange, Check } from 'lucide-react'
import Badge from './Badge.jsx'

/**
 * Reusable semester selector — used across Admin, Lecturer and Student views.
 * props:
 *  - semesters: array of semester objects
 *  - value: selected semester id
 *  - onChange(id)
 *  - filter: optional predicate to limit selectable semesters (e.g. published only)
 *  - showStatus: render status badge per option (default true)
 */
export default function SemesterSelector({
  semesters,
  value,
  onChange,
  filter,
  showStatus = true,
  label = 'Semester',
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const options = filter ? semesters.filter(filter) : semesters
  const selected = semesters.find((s) => s.id === value)

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full min-w-[240px] items-center justify-between gap-3 rounded-lg border border-navy-200 bg-white px-3.5 py-2.5 text-left text-sm font-medium text-navy-800 shadow-sm transition hover:border-navy-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
      >
        <span className="flex items-center gap-2.5">
          <CalendarRange size={17} className="text-gold-500" />
          <span className="flex flex-col leading-tight">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-navy-400">
              {label}
            </span>
            <span>{selected ? selected.label : 'Select semester'}</span>
          </span>
        </span>
        <span className="flex items-center gap-2">
          {showStatus && selected && <Badge variant={selected.status}>{selected.status}</Badge>}
          <ChevronDown
            size={16}
            className={`text-navy-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full min-w-[280px] animate-scale-in overflow-hidden rounded-xl border border-navy-100 bg-white shadow-xl">
          {options.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onChange(s.id)
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition hover:bg-gold-50 ${
                s.id === value ? 'bg-navy-50' : ''
              }`}
            >
              <span className="flex items-center gap-2 font-medium text-navy-800">
                {s.id === value ? (
                  <Check size={15} className="text-gold-500" />
                ) : (
                  <span className="w-[15px]" />
                )}
                {s.label}
              </span>
              {showStatus && <Badge variant={s.status}>{s.status}</Badge>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
