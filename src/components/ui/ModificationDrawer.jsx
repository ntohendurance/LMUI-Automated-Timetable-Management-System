import { useEffect } from 'react'
import { X, History, PencilLine, Upload, Archive, Sparkles } from 'lucide-react'
import { formatDateTime } from '../../data/mockData.js'

const ICONS = {
  edit: PencilLine,
  publish: Upload,
  archive: Archive,
  generate: Sparkles,
  default: History,
}

function pickIcon(action) {
  const a = action.toLowerCase()
  if (a.includes('publish')) return ICONS.publish
  if (a.includes('archiv')) return ICONS.archive
  if (a.includes('generat')) return ICONS.generate
  if (a.includes('mov') || a.includes('reassign') || a.includes('edit') || a.includes('updat'))
    return ICONS.edit
  return ICONS.default
}

export default function ModificationDrawer({ open, onClose, logs, semesterLabel }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-navy-100 bg-navy-900 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-navy-800 p-2 text-gold-300">
              <History size={18} />
            </span>
            <div>
              <h3 className="font-display text-lg">Modification History</h3>
              <p className="text-xs text-navy-300">{semesterLabel}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-navy-300 transition hover:bg-navy-800 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6">
          {logs.length === 0 ? (
            <p className="mt-10 text-center text-sm text-navy-400">
              No modifications recorded for this semester yet.
            </p>
          ) : (
            <ol className="relative space-y-6 border-l border-navy-100 pl-6">
              {logs.map((log) => {
                const Icon = pickIcon(log.action)
                return (
                  <li key={log.id} className="relative">
                    <span className="absolute -left-[34px] flex h-7 w-7 items-center justify-center rounded-full border border-navy-100 bg-white text-navy-600 shadow-sm">
                      <Icon size={13} />
                    </span>
                    <p className="text-sm font-medium leading-snug text-navy-800">{log.action}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-navy-400">
                      <span className="font-semibold text-gold-600">{log.by}</span>
                      <span>•</span>
                      <span>{formatDateTime(log.timestamp)}</span>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </aside>
    </div>
  )
}
