import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarRange, ClipboardList, SlidersHorizontal, Sparkles, Check, AlertTriangle,
  Loader2, Eye, Upload, BookOpen, Users, Building2, GraduationCap,
} from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { FormField, Input, Select } from '../../components/ui/Field.jsx'
import { useSemester } from '../../hooks/useSemester.js'
import { useCatalog } from '../../hooks/useCatalog.js'
import { semesterApi, timetableApi, studentApi } from '../../api/endpoints.js'

const ACADEMIC_YEARS = ['2025/2026', '2026/2027']
const SEMS = [
  { value: 'SEMESTER_1', label: 'Semester 1' },
  { value: 'SEMESTER_2', label: 'Semester 2' },
]
const CONSTRAINTS = [
  { key: 'avoidBackToBack', label: 'Avoid back-to-back lectures' },
  { key: 'balanceWorkload', label: 'Balance lecturer workload' },
  { key: 'respectCapacity', label: 'Respect room capacity' },
  { key: 'groupByLevelAndDept', label: 'Group students by level and department' },
]
const STEPS = [
  { n: 1, label: 'Semester', icon: CalendarRange },
  { n: 2, label: 'Inputs', icon: ClipboardList },
  { n: 3, label: 'Constraints', icon: SlidersHorizontal },
  { n: 4, label: 'Generate', icon: Sparkles },
]
const PROGRESS_MESSAGES = [
  'Analyzing constraints…',
  'Mapping lecturer availability…',
  'Resolving conflicts…',
  'Optimizing room allocation…',
]

export default function GenerateTimetable() {
  const navigate = useNavigate()
  const { semesters, reload, setSelectedSemesterId, publish } = useSemester()
  const { courses, lecturers, rooms } = useCatalog()

  const [step, setStep] = useState(1)
  const [year, setYear] = useState('2025/2026')
  const [term, setTerm] = useState('SEMESTER_2')
  const [startDate, setStartDate] = useState('2026-02-09')
  const [endDate, setEndDate] = useState('2026-06-26')
  const [constraints, setConstraints] = useState({
    avoidBackToBack: true, balanceWorkload: true, respectCapacity: true, groupByLevelAndDept: true,
  })
  const [generating, setGenerating] = useState(false)
  const [progressIdx, setProgressIdx] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [studentGroups, setStudentGroups] = useState(0)

  const selectedLabel = `${year} — ${SEMS.find((s) => s.value === term)?.label}`
  const existing = semesters.find((s) => s.academicYear === year && s.semesterEnum === term)

  useEffect(() => {
    studentApi
      .list({ limit: 500 })
      .then(({ items }) => {
        const groups = new Set(items.map((s) => `${s.departmentId}__${s.levelEnum}`))
        setStudentGroups(groups.size)
      })
      .catch(() => setStudentGroups(0))
  }, [])

  const toggleConstraint = (k) => setConstraints((c) => ({ ...c, [k]: !c[k] }))

  const runGeneration = async () => {
    setError('')
    setGenerating(true)
    setProgressIdx(0)
    const ticker = setInterval(
      () => setProgressIdx((i) => Math.min(i + 1, PROGRESS_MESSAGES.length - 1)),
      900
    )
    try {
      // Ensure a DRAFT semester exists for this year+term.
      let semesterId = existing?.id
      if (!semesterId) {
        const created = await semesterApi.create({ academicYear: year, semester: term, startDate, endDate })
        semesterId = created.id
      } else if (existing.statusEnum !== 'DRAFT') {
        throw new Error('A non-draft timetable already exists for this semester. Archive it first.')
      }
      const res = await timetableApi.generate(semesterId, constraints)
      clearInterval(ticker)
      await reload()
      setResult({ semesterId, ...res })
    } catch (err) {
      clearInterval(ticker)
      setError(err.message || 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const goPreview = () => {
    setSelectedSemesterId(result.semesterId)
    navigate('/admin/timetable/view')
  }
  const goPublish = async () => {
    await publish(result.semesterId)
    setSelectedSemesterId(result.semesterId)
    navigate('/admin/timetable/view')
  }

  return (
    <PageWrapper title="Generate Timetable" description="Build a conflict-free timetable for a semester using the constraint-based scheduler.">
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-navy-100 bg-white p-4 shadow-sm">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const active = step === s.n
          const complete = step > s.n
          return (
            <div key={s.n} className="flex flex-1 items-center">
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition ${
                  complete ? 'bg-emerald-500 text-white' : active ? 'bg-navy-900 text-gold-300' : 'bg-navy-100 text-navy-400'
                }`}>
                  {complete ? <Check size={18} /> : <Icon size={18} />}
                </span>
                <div className="hidden sm:block">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-navy-400">Step {s.n}</p>
                  <p className={`text-sm font-semibold ${active ? 'text-navy-900' : 'text-navy-500'}`}>{s.label}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && <div className={`mx-3 h-0.5 flex-1 rounded ${step > s.n ? 'bg-emerald-400' : 'bg-navy-100'}`} />}
            </div>
          )
        })}
      </div>

      {existing && !result && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-gold-300 bg-gold-50 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-gold-600" />
          <p className="text-sm text-navy-700">
            A timetable already exists for <strong>{selectedLabel}</strong> (
            <Badge variant={existing.status}>{existing.status}</Badge>). Generating again will replace its Draft slots.
          </p>
        </div>
      )}

      {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
        {step === 1 && (
          <div className="animate-fade-up space-y-5">
            <h3 className="font-display text-xl text-navy-900">Step 1 — Semester Confirmation</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Academic Year" required>
                <Select value={year} onChange={(e) => setYear(e.target.value)}>
                  {ACADEMIC_YEARS.map((y) => <option key={y}>{y}</option>)}
                </Select>
              </FormField>
              <FormField label="Semester" required>
                <Select value={term} onChange={(e) => setTerm(e.target.value)}>
                  {SEMS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </FormField>
              <FormField label="Start Date" required>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </FormField>
              <FormField label="End Date" required>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </FormField>
            </div>
            <div className="rounded-xl bg-navy-900 p-4 text-white">
              <p className="text-[11px] uppercase tracking-wider text-gold-400">Generating for</p>
              <p className="font-display text-2xl">{selectedLabel}</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-up space-y-5">
            <h3 className="font-display text-xl text-navy-900">Step 2 — Input Summary</h3>
            <p className="text-sm text-navy-500">These resources are confirmed and will be used to build {selectedLabel}.</p>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: 'Courses', value: courses.length, icon: BookOpen },
                { label: 'Lecturers', value: lecturers.length, icon: Users },
                { label: 'Rooms', value: rooms.length, icon: Building2 },
                { label: 'Student Groups', value: studentGroups, icon: GraduationCap },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="rounded-xl border border-navy-100 bg-navy-50/50 p-4">
                    <Icon size={20} className="text-gold-500" />
                    <p className="mt-3 font-display text-3xl text-navy-900">{item.value}</p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">{item.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-up space-y-5">
            <h3 className="font-display text-xl text-navy-900">Step 3 — Set Constraints</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {CONSTRAINTS.map((c) => {
                const on = constraints[c.key]
                return (
                  <button key={c.key} type="button" onClick={() => toggleConstraint(c.key)}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${on ? 'border-navy-800 bg-navy-50' : 'border-navy-100 bg-white hover:border-navy-200'}`}>
                    <span className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition ${on ? 'border-navy-800 bg-navy-800 text-gold-300' : 'border-navy-300'}`}>
                      {on && <Check size={14} />}
                    </span>
                    <span className="text-sm font-medium text-navy-800">{c.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-up space-y-5">
            <h3 className="font-display text-xl text-navy-900">Step 4 — Generate Timetable</h3>

            {!generating && !result && (
              <>
                <div className="rounded-xl border border-navy-100 bg-navy-50/50 p-5">
                  <p className="text-sm text-navy-600">
                    Ready to generate the timetable for <strong className="text-navy-900">{selectedLabel}</strong> using{' '}
                    {Object.values(constraints).filter(Boolean).length} active constraints.
                  </p>
                </div>
                <Button variant="gold" size="lg" onClick={runGeneration}>
                  <Sparkles size={18} /> Generate Timetable
                </Button>
              </>
            )}

            {generating && (
              <div className="flex flex-col items-center gap-5 py-10">
                <Loader2 size={48} className="animate-spin text-gold-500" />
                <div className="w-full max-w-md">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-navy-700">{PROGRESS_MESSAGES[progressIdx]}</span>
                    <span className="text-navy-400">{Math.round(((progressIdx + 1) / PROGRESS_MESSAGES.length) * 100)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-navy-100">
                    <div className="h-full rounded-full bg-gold-400 transition-all duration-500" style={{ width: `${((progressIdx + 1) / PROGRESS_MESSAGES.length) * 100}%` }} />
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="animate-scale-in space-y-5">
                <div className="flex items-start gap-4 rounded-xl border border-emerald-300 bg-emerald-50 p-5">
                  <span className="rounded-full bg-emerald-500 p-2 text-white"><Check size={20} /></span>
                  <div>
                    <p className="font-semibold text-navy-900">
                      Timetable for {selectedLabel} generated successfully.
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-navy-600">
                      Status: <Badge variant="Draft">Draft</Badge>
                      <span>· {result.slotsGenerated} slots</span>
                      <span>· {result.conflictsFound} conflicts</span>
                      {result.unscheduled?.length ? <span>· {result.unscheduled.length} unscheduled</span> : null}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={goPreview}><Eye size={16} /> Preview Timetable</Button>
                  <Button variant="gold" onClick={goPublish}><Upload size={16} /> Publish Timetable</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {!generating && !result && (
          <div className="mt-8 flex items-center justify-between border-t border-navy-100 pt-5">
            <Button variant="outline" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>Back</Button>
            {step < 4 && <Button variant="primary" onClick={() => setStep((s) => s + 1)}>Continue</Button>}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
