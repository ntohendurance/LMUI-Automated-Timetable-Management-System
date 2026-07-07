import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  Bell,
  LogOut,
  ChevronDown,
  PencilLine,
  Upload,
  AlarmClock,
  Info,
  UserPlus,
  CheckCheck,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { NOTIFICATIONS } from '../../data/mockData.js'
import { formatDateTime } from '../../utils/format.js'

const NOTIF_ICONS = {
  publish: { icon: Upload, color: 'bg-emerald-100 text-emerald-600' },
  edit: { icon: PencilLine, color: 'bg-navy-100 text-navy-600' },
  reminder: { icon: AlarmClock, color: 'bg-gold-100 text-gold-700' },
  add: { icon: UserPlus, color: 'bg-gold-100 text-gold-700' },
  info: { icon: Info, color: 'bg-navy-100 text-navy-600' },
}

export default function Topbar({ onMenuClick, title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState(
    () => NOTIFICATIONS[user?.role] || []
  )
  const ref = useRef(null)
  const notifRef = useRef(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  const markRead = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = (user?.name || 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-navy-100 bg-white/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-navy-600 transition hover:bg-navy-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        {title && (
          <h1 className="hidden font-display text-xl text-navy-900 sm:block">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative rounded-lg p-2 text-navy-500 transition hover:bg-navy-100"
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold-400 px-1 text-[10px] font-bold text-navy-900 ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="fixed right-3 top-16 z-40 w-[calc(100vw-1.5rem)] animate-scale-in overflow-hidden rounded-xl border border-navy-100 bg-white shadow-xl sm:absolute sm:right-0 sm:top-auto sm:z-auto sm:mt-2 sm:w-80">
              <div className="flex items-center justify-between border-b border-navy-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-navy-900">Notifications</p>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-gold-100 px-1.5 py-0.5 text-[10px] font-bold text-gold-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs font-medium text-navy-500 transition hover:text-navy-800"
                  >
                    <CheckCheck size={13} /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[22rem] overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <p className="px-4 py-10 text-center text-sm text-navy-400">
                    You have no notifications.
                  </p>
                ) : (
                  notifications.map((n) => {
                    const conf = NOTIF_ICONS[n.type] || NOTIF_ICONS.info
                    const Icon = conf.icon
                    return (
                      <button
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={`flex w-full items-start gap-3 border-b border-navy-50 px-4 py-3 text-left transition hover:bg-navy-50 ${
                          n.read ? '' : 'bg-gold-50/40'
                        }`}
                      >
                        <span className={`mt-0.5 shrink-0 rounded-lg p-2 ${conf.color}`}>
                          <Icon size={14} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-navy-800">{n.title}</span>
                            {!n.read && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                            )}
                          </span>
                          <span className="mt-0.5 block text-xs leading-snug text-navy-500">
                            {n.body}
                          </span>
                          <span className="mt-1 block text-[11px] text-navy-400">
                            {formatDateTime(n.timestamp)}
                          </span>
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-lg py-1.5 pl-1.5 pr-2.5 transition hover:bg-navy-100"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 text-sm font-bold text-gold-300">
              {initials}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold leading-tight text-navy-900">
                {user?.name}
              </span>
              <span className="block text-[11px] capitalize text-navy-400">{user?.role}</span>
            </span>
            <ChevronDown size={15} className="hidden text-navy-400 sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 animate-scale-in overflow-hidden rounded-xl border border-navy-100 bg-white shadow-xl">
              <div className="border-b border-navy-50 px-4 py-3">
                <p className="text-sm font-semibold text-navy-900">{user?.name}</p>
                <p className="truncate text-xs text-navy-400">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
