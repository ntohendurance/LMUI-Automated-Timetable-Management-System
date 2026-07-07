import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, X } from 'lucide-react'
import { INSTITUTION } from '../../data/mockData.js'

function NavItem({ item, onNavigate }) {
  const location = useLocation()
  const hasChildren = !!item.children
  const childActive =
    hasChildren && item.children.some((c) => location.pathname.startsWith(c.to))
  const [open, setOpen] = useState(childActive)

  if (!hasChildren) {
    const Icon = item.icon
    return (
      <NavLink
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            isActive
              ? 'bg-gold-400 text-navy-900 shadow-sm'
              : 'text-navy-200 hover:bg-navy-800 hover:text-white'
          }`
        }
      >
        <Icon size={18} className="shrink-0" />
        {item.label}
      </NavLink>
    )
  }

  const Icon = item.icon
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          childActive ? 'text-white' : 'text-navy-200 hover:bg-navy-800 hover:text-white'
        }`}
      >
        <span className="flex items-center gap-3">
          <Icon size={18} className="shrink-0" />
          {item.label}
        </span>
        <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="ml-4 mt-1 space-y-1 border-l border-navy-800 pl-3">
          {item.children.map((child) => {
            const CIcon = child.icon
            return (
              <NavLink
                key={child.to}
                to={child.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition ${
                    isActive
                      ? 'bg-navy-800 text-gold-300'
                      : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                  }`
                }
              >
                <CIcon size={15} className="shrink-0" />
                {child.label}
              </NavLink>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ nav, roleLabel, mobileOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-navy-900 bg-grid-lines bg-grid transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-navy-800 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold-400 font-display text-xl text-navy-900">
              L
            </div>
            <div>
              <p className="font-display text-lg leading-none text-white">{INSTITUTION.shortName}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-gold-400">
                E-Timetable
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-navy-300 hover:bg-navy-800 lg:hidden">
            <X size={20} />
          </button>
        </div>

        <div className="px-5 py-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold-300">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
            {roleLabel} Portal
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin px-4 pb-6">
          {nav.map((item, i) => (
            <NavItem key={item.to || item.label || i} item={item} onNavigate={onClose} />
          ))}
        </nav>

        <div className="border-t border-navy-800 px-5 py-4">
          <p className="text-[11px] leading-relaxed text-navy-400">
            {INSTITUTION.name}
            <br />
            <span className="text-navy-500">{INSTITUTION.location}</span>
          </p>
        </div>
      </aside>
    </>
  )
}
