import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Users,
  GraduationCap,
  Building2,
  CalendarCheck2,
  Sparkles,
  ArrowUpRight,
  PencilLine,
  Upload,
  Settings2,
} from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import SemesterSelector from '../../components/ui/SemesterSelector.jsx'
import { useSemester } from '../../hooks/useSemester.js'
import { courseApi, studentApi, lecturerApi, roomApi, modificationApi } from '../../api/endpoints.js'
import { formatDateTime } from '../../utils/format.js'

const QUICK_LINKS = [
  { to: '/admin/courses', label: 'Courses', icon: BookOpen },
  { to: '/admin/lecturers', label: 'Lecturers', icon: Users },
  { to: '/admin/students', label: 'Students', icon: GraduationCap },
  { to: '/admin/rooms', label: 'Rooms', icon: Building2 },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { semesters, activeSemester } = useSemester()
  const [bannerSemesterId, setBannerSemesterId] = useState(null)
  const [counts, setCounts] = useState({ courses: 0, lecturers: 0, students: 0, rooms: 0 })
  const [activity, setActivity] = useState([])

  const bannerSemester = semesters.find((s) => s.id === bannerSemesterId) || activeSemester
  const draftExists = semesters.some((s) => s.statusEnum === 'DRAFT')

  useEffect(() => {
    if (activeSemester && !bannerSemesterId) setBannerSemesterId(activeSemester.id)
  }, [activeSemester, bannerSemesterId])

  useEffect(() => {
    Promise.all([
      courseApi.list({ limit: 1 }).then((r) => r.pagination?.total ?? 0).catch(() => 0),
      lecturerApi.list().then((r) => r.length).catch(() => 0),
      studentApi.list({ limit: 1 }).then((r) => r.pagination?.total ?? 0).catch(() => 0),
      roomApi.list().then((r) => r.length).catch(() => 0),
    ]).then(([courses, lecturers, students, rooms]) =>
      setCounts({ courses, lecturers, students, rooms })
    )
  }, [])

  useEffect(() => {
    if (!activeSemester) return
    modificationApi
      .forSemester(activeSemester.id, { limit: 6 })
      .then(setActivity)
      .catch(() => setActivity([]))
  }, [activeSemester])

  const stats = [
    { label: 'Total Courses', value: counts.courses, icon: BookOpen, accent: 'navy' },
    { label: 'Total Lecturers', value: counts.lecturers, icon: Users, accent: 'gold' },
    { label: 'Total Students', value: counts.students, icon: GraduationCap, accent: 'navy' },
    { label: 'Total Rooms', value: counts.rooms, icon: Building2, accent: 'gold' },
    { label: 'Timetables Generated', value: semesters.length, icon: CalendarCheck2, accent: 'navy' },
  ]

  return (
    <PageWrapper title="Admin Dashboard" description="Overview of your institution's scheduling at a glance.">
      {/* Active Semester Banner */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-navy-800 bg-navy-900 bg-grid-lines bg-grid">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">Active Semester</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl text-white">{bannerSemester?.label || '—'}</h2>
              {bannerSemester && <Badge variant={bannerSemester.status}>{bannerSemester.status}</Badge>}
            </div>
            <p className="mt-1 text-sm text-navy-300">
              The system displays this semester's timetable by default everywhere.
            </p>
          </div>
          {semesters.length > 0 && bannerSemesterId && (
            <div className="shrink-0">
              <SemesterSelector semesters={semesters} value={bannerSemesterId} onChange={setBannerSemesterId} label="Quick switch" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 60} />
        ))}
      </div>

      <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-gold-300/60 bg-gradient-to-br from-gold-50 to-white p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          <span className="rounded-xl bg-gold-400 p-3 text-navy-900"><Sparkles size={22} /></span>
          <div>
            <h3 className="font-display text-lg text-navy-900">Generate a New Timetable</h3>
            <p className="mt-0.5 text-sm text-navy-500">Generate a conflict-free timetable for a new academic semester.</p>
          </div>
        </div>
        <div className="group relative">
          <Button variant="gold" size="lg" disabled={draftExists} onClick={() => navigate('/admin/timetable/generate')}>
            <Sparkles size={16} /> Generate New Timetable
          </Button>
          {draftExists && (
            <div className="pointer-events-none absolute -top-10 left-1/2 z-10 w-56 -translate-x-1/2 rounded-lg bg-navy-900 px-3 py-2 text-center text-[11px] text-white opacity-0 shadow-lg transition group-hover:opacity-100">
              A draft already exists for this semester
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg text-navy-900">Recent Activity</h3>
              <Badge variant="neutral">{bannerSemester?.label || 'Active semester'}</Badge>
            </div>
            {activity.length === 0 ? (
              <p className="py-8 text-center text-sm text-navy-400">No recent modifications recorded.</p>
            ) : (
              <ul className="space-y-1">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition hover:bg-navy-50">
                    <span className="mt-0.5 rounded-lg bg-navy-100 p-2 text-navy-600">
                      {/published|publish/i.test(a.action) ? <Upload size={15} /> : <PencilLine size={15} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-navy-800">{a.action}</p>
                      <p className="text-xs text-navy-400">{formatDateTime(a.timestamp)} · {a.by}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-display text-lg text-navy-900">Quick Links</h3>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_LINKS.map((q) => {
                const Icon = q.icon
                return (
                  <Link key={q.to} to={q.to} className="group flex flex-col items-start gap-2 rounded-xl border border-navy-100 bg-navy-50/50 p-3.5 transition hover:border-gold-300 hover:bg-gold-50">
                    <span className="rounded-lg bg-white p-2 text-navy-700 shadow-sm"><Icon size={18} /></span>
                    <span className="flex items-center gap-1 text-sm font-semibold text-navy-800">
                      {q.label}
                      <ArrowUpRight size={13} className="opacity-0 transition group-hover:opacity-100" />
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          <Link to="/admin/settings" className="flex items-center justify-between rounded-2xl border border-navy-100 bg-white p-5 shadow-sm transition hover:border-navy-200">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-navy-100 p-2 text-navy-700"><Settings2 size={18} /></span>
              <div>
                <p className="text-sm font-semibold text-navy-800">System Settings</p>
                <p className="text-xs text-navy-400">Academic year &amp; preferences</p>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-navy-400" />
          </Link>
        </div>
      </div>
    </PageWrapper>
  )
}
