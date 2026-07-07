import { useState, useEffect } from 'react'
import { BookOpen, CalendarClock, Building2, GraduationCap, Info } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useSemester } from '../../hooks/useSemester.js'
import { timetableApi, courseApi } from '../../api/endpoints.js'
import { TIME_SLOTS, LEVEL_TO_LABEL } from '../../api/adapters.js'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function StudentDashboard() {
  const { user } = useAuth()
  const { activeSemester } = useSemester()
  const [slots, setSlots] = useState([])
  const [enrolled, setEnrolled] = useState(0)

  const todayName = DAY_NAMES[new Date().getDay()]
  const levelLabel = LEVEL_TO_LABEL[user.level] || user.level || '—'
  const isPublished = activeSemester?.status === 'Published'

  useEffect(() => {
    courseApi
      .list({ department: user.departmentId, level: user.level, limit: 100 })
      .then(({ items }) => setEnrolled(items.length))
      .catch(() => setEnrolled(0))
  }, [user.departmentId, user.level])

  useEffect(() => {
    if (!activeSemester || !isPublished) return
    timetableApi
      .forSemester(activeSemester.id, {
        department: user.departmentId || undefined,
        level: user.level || undefined,
      })
      .then(setSlots)
      .catch(() => setSlots([]))
  }, [activeSemester, isPublished, user.departmentId, user.level])

  const todaySlots = slots
    .filter((s) => s.day === todayName)
    .sort(
      (a, b) =>
        TIME_SLOTS.findIndex((t) => t.id === a.timeSlotId) -
        TIME_SLOTS.findIndex((t) => t.id === b.timeSlotId)
    )
    .slice(0, 2)

  return (
    <PageWrapper>
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-navy-800 bg-navy-900 bg-grid-lines bg-grid p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">Current Semester</p>
          <h2 className="mt-1 font-display text-2xl text-white">{activeSemester?.label || '—'}</h2>
        </div>
        {activeSemester && (
          <Badge variant={activeSemester.status} className="self-start sm:self-auto">{activeSemester.status}</Badge>
        )}
      </div>

      <h1 className="mb-1 font-display text-2xl text-navy-900 sm:text-3xl">Welcome, {user.name}</h1>
      <p className="mb-6 text-sm text-navy-500">{user.department} · {levelLabel}</p>

      {!isPublished ? (
        <div className="flex items-center gap-3 rounded-xl border border-gold-300 bg-gold-50 p-5">
          <Info size={20} className="text-gold-600" />
          <p className="text-sm text-navy-700">The timetable for this semester has not been published yet. Please check back later.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={BookOpen} label="Enrolled Courses" value={enrolled} accent="navy" delay={0} />
            <StatCard icon={CalendarClock} label="Classes Today" value={slots.filter((s) => s.day === todayName).length} sub={todayName} accent="gold" delay={60} />
            <StatCard icon={Building2} label="Department" value={user.department || '—'} valueClassName="text-base" accent="navy" delay={120} />
            <StatCard icon={GraduationCap} label="Level" value={levelLabel} accent="gold" delay={180} />
          </div>

          <div className="mt-6">
            <h3 className="mb-3 font-display text-lg text-navy-900">Next Classes — {todayName}</h3>
            {todaySlots.length === 0 ? (
              <div className="rounded-xl border border-navy-100 bg-white p-6 text-center text-sm text-navy-400 shadow-sm">
                No classes scheduled for today.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {todaySlots.map((slot) => {
                  const ts = TIME_SLOTS.find((t) => t.id === slot.timeSlotId)
                  return (
                    <div key={slot.id} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <Badge variant="neutral">{ts?.label}</Badge>
                        <span className="text-xs font-medium text-gold-700">{slot.roomName}</span>
                      </div>
                      <p className="mt-3 font-bold text-navy-900">{slot.courseTitle}</p>
                      <p className="text-xs text-navy-500">{slot.courseCode} · {slot.lecturerName}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </PageWrapper>
  )
}
