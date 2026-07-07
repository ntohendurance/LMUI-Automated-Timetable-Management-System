import { useState, useEffect } from 'react'
import { BookMarked, Clock4, CalendarClock, Info } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useSemester } from '../../hooks/useSemester.js'
import { timetableApi } from '../../api/endpoints.js'
import { TIME_SLOTS } from '../../api/adapters.js'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function LecturerDashboard() {
  const { user } = useAuth()
  const { activeSemester } = useSemester()
  const [slots, setSlots] = useState([])

  const todayName = DAY_NAMES[new Date().getDay()]
  const isPublished = activeSemester?.status === 'Published'

  useEffect(() => {
    if (!activeSemester || !isPublished || !user.profileId) return
    timetableApi
      .forSemester(activeSemester.id, { lecturer: user.profileId })
      .then(setSlots)
      .catch(() => setSlots([]))
  }, [activeSemester, isPublished, user.profileId])

  const todaySlots = slots.filter((s) => s.day === todayName)
  const weeklyHours = slots.length * 2
  const uniqueCourses = new Set(slots.map((s) => s.courseId)).size

  return (
    <PageWrapper>
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-navy-800 bg-navy-900 bg-grid-lines bg-grid p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">Current Semester</p>
          <h2 className="mt-1 font-display text-2xl text-white">{activeSemester?.label || '—'}</h2>
        </div>
        {activeSemester && (
          <Badge variant={activeSemester.status} className="self-start sm:self-auto">
            {activeSemester.status}
          </Badge>
        )}
      </div>

      <h1 className="mb-1 font-display text-2xl text-navy-900 sm:text-3xl">Welcome back, {user.name}</h1>
      <p className="mb-6 text-sm text-navy-500">Here's your teaching overview for this semester.</p>

      {!isPublished ? (
        <div className="flex items-center gap-3 rounded-xl border border-gold-300 bg-gold-50 p-5">
          <Info size={20} className="text-gold-600" />
          <p className="text-sm text-navy-700">The timetable for this semester has not been published yet. Check back soon.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={BookMarked} label="Courses Assigned" value={uniqueCourses} sub="This semester" accent="navy" delay={0} />
            <StatCard icon={Clock4} label="Weekly Teaching Hours" value={weeklyHours} sub="Across all classes" accent="gold" delay={60} />
            <StatCard icon={CalendarClock} label="Classes Today" value={todaySlots.length} sub={todayName} accent="navy" delay={120} />
          </div>

          <div className="mt-6">
            <h3 className="mb-3 font-display text-lg text-navy-900">Today's Schedule — {todayName}</h3>
            {todaySlots.length === 0 ? (
              <div className="rounded-xl border border-navy-100 bg-white p-6 text-center text-sm text-navy-400 shadow-sm">
                No classes scheduled for today. Enjoy your day!
              </div>
            ) : (
              <div className="space-y-3">
                {TIME_SLOTS.map((ts) => {
                  const slot = todaySlots.find((s) => s.timeSlotId === ts.id)
                  if (!slot) return null
                  return (
                    <div key={ts.id} className="flex items-center gap-4 rounded-xl border border-navy-100 bg-white p-4 shadow-sm">
                      <div className="w-24 shrink-0 border-r border-navy-100 pr-4 text-sm font-semibold text-navy-600">{ts.label}</div>
                      <div className="flex-1">
                        <p className="font-bold text-navy-900">{slot.courseCode} — {slot.courseTitle}</p>
                        <p className="text-xs text-navy-500">{slot.roomName} · {slot.level}</p>
                      </div>
                      <Badge variant="neutral">{slot.roomName}</Badge>
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
