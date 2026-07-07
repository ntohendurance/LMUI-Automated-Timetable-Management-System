import { useState, useEffect, useMemo } from 'react'
import { Info, Loader2 } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import SemesterSelector from '../../components/ui/SemesterSelector.jsx'
import TimetableGrid from '../../components/timetable/TimetableGrid.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useSemester } from '../../hooks/useSemester.js'
import { timetableApi } from '../../api/endpoints.js'
import { formatDate } from '../../utils/format.js'

export default function MySchedule() {
  const { user } = useAuth()
  const { semesters, activeSemesterId } = useSemester()
  const visible = useMemo(
    () => semesters.filter((s) => s.statusEnum === 'PUBLISHED' || s.statusEnum === 'ARCHIVED'),
    [semesters]
  )
  const [semId, setSemId] = useState(null)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (semId) return
    const initial = visible.some((s) => s.id === activeSemesterId) ? activeSemesterId : visible[0]?.id
    if (initial) setSemId(initial)
  }, [visible, activeSemesterId, semId])

  useEffect(() => {
    if (!semId) return
    setLoading(true)
    timetableApi
      .forSemester(semId, user.profileId ? { lecturer: user.profileId } : {})
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoading(false))
  }, [semId, user.profileId])

  const selected = semesters.find((s) => s.id === semId)

  return (
    <PageWrapper title="My Schedule" description="Your assigned classes for the selected semester. This view is read-only.">
      <div className="mb-5">
        {semId && (
          <SemesterSelector
            semesters={semesters}
            value={semId}
            onChange={setSemId}
            filter={(s) => s.statusEnum === 'PUBLISHED' || s.statusEnum === 'ARCHIVED'}
          />
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-navy-100 bg-white py-20 text-navy-400">
          <Loader2 className="animate-spin" /> <span className="ml-2 text-sm">Loading schedule…</span>
        </div>
      ) : slots.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-navy-100 bg-white p-6 text-sm text-navy-500 shadow-sm">
          <Info size={20} className="text-gold-500" />
          You have no classes assigned for this semester.
        </div>
      ) : (
        <>
          <TimetableGrid slots={slots} cellFields={['code', 'room', 'level']} />
          <p className="mt-3 text-xs text-navy-400">
            {selected?.publishedAt
              ? `This timetable was published on ${formatDate(selected.publishedAt)}.`
              : 'Read-only view of your published schedule.'}
          </p>
        </>
      )}
    </PageWrapper>
  )
}
