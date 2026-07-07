import { useState, useEffect } from 'react'
import { BookOpen, Loader2 } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useSemester } from '../../hooks/useSemester.js'
import { courseApi } from '../../api/endpoints.js'

export default function MyCourses() {
  const { user } = useAuth()
  const { activeSemester } = useSemester()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    courseApi
      .list({ limit: 200 })
      .then(({ items }) => setCourses(items.filter((c) => c.lecturerId === user.profileId)))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [user.profileId])

  return (
    <PageWrapper title="My Courses" description={`Courses assigned to you for ${activeSemester?.label || 'this semester'}.`}>
      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-navy-100 bg-white py-20 text-navy-400">
          <Loader2 className="animate-spin" /> <span className="ml-2 text-sm">Loading courses…</span>
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-navy-100 bg-white p-6 text-center text-sm text-navy-400 shadow-sm">
          You have no courses assigned this semester.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c, i) => (
            <div key={c.id} className="group animate-fade-up rounded-2xl border border-navy-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-md" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between">
                <span className="rounded-lg bg-navy-800 p-2.5 text-gold-300"><BookOpen size={18} /></span>
                <Badge variant="neutral">{c.creditUnits} units</Badge>
              </div>
              <p className="mt-4 font-display text-xl text-navy-900">{c.code}</p>
              <p className="text-sm font-medium text-navy-600">{c.title}</p>
              <div className="mt-4 space-y-1.5 border-t border-navy-50 pt-4 text-xs text-navy-500">
                <p>{c.department}</p>
                <Badge variant="neutral">{c.level}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
