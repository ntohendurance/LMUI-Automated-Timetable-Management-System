import { useState, useEffect } from 'react'
import { Info, Save, Check, Loader2 } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Button from '../../components/ui/Button.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { lecturerApi } from '../../api/endpoints.js'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SLOT_GROUPS = [
  { key: 'MORNING', label: 'Morning', time: '8 AM – 12 PM' },
  { key: 'AFTERNOON', label: 'Afternoon', time: '12 PM – 4 PM' },
  { key: 'EVENING', label: 'Evening', time: '4 PM – 6 PM' },
]

export default function Availability() {
  const { user } = useAuth()
  const [availableDays, setAvailableDays] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user.profileId) {
      setLoading(false)
      return
    }
    lecturerApi
      .getOne(user.profileId)
      .then((l) => {
        setAvailableDays(l.availableDays || [])
        setSlots(l.preferredTimeSlots || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user.profileId])

  const toggleDay = (d) =>
    setAvailableDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
  const toggleSlot = (s) =>
    setSlots((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      await lecturerApi.update(user.profileId, { availableDays, preferredTimeSlots: slots })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.message || 'Could not save availability')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <PageWrapper title="Availability">
        <div className="flex items-center justify-center rounded-xl border border-navy-100 bg-white py-20 text-navy-400">
          <Loader2 className="animate-spin" /> <span className="ml-2 text-sm">Loading…</span>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="Availability" description="Set the days and time periods when you are available to teach.">
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-navy-100 bg-navy-50/60 p-4">
        <Info size={18} className="mt-0.5 shrink-0 text-gold-500" />
        <p className="text-sm text-navy-600">Your availability is used during timetable generation for each semester.</p>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-display text-lg text-navy-900">Available Days</h3>
          <div className="space-y-2.5">
            {DAYS.map((d) => {
              const on = availableDays.includes(d)
              return (
                <button key={d} type="button" onClick={() => toggleDay(d)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${on ? 'border-emerald-300 bg-emerald-50' : 'border-navy-100 bg-white hover:border-navy-200'}`}>
                  <span className="text-sm font-medium text-navy-800">{d}</span>
                  <span className={`text-xs font-semibold ${on ? 'text-emerald-600' : 'text-navy-400'}`}>{on ? 'Available' : 'Unavailable'}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-display text-lg text-navy-900">Preferred Time Slots</h3>
          <div className="space-y-3">
            {SLOT_GROUPS.map((g) => {
              const on = slots.includes(g.key)
              return (
                <button key={g.key} type="button" onClick={() => toggleSlot(g.key)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition ${on ? 'border-navy-800 bg-navy-50' : 'border-navy-100 bg-white hover:border-navy-200'}`}>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition ${on ? 'border-navy-800 bg-navy-800 text-gold-300' : 'border-navy-300'}`}>
                    {on && <Check size={14} />}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-navy-800">{g.label}</span>
                    <span className="block text-xs text-navy-400">{g.time}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="gold" onClick={save} disabled={saving}>
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saving ? 'Saving…' : saved ? 'Saved' : 'Save Availability'}
        </Button>
        {saved && <span className="text-sm font-medium text-emerald-600">Availability updated.</span>}
      </div>
    </PageWrapper>
  )
}
