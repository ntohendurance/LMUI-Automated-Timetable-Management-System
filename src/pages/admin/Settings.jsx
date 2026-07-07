import { useState } from 'react'
import { Save, Check } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Button from '../../components/ui/Button.jsx'
import { FormField, Input, Select } from '../../components/ui/Field.jsx'
import { useSemester } from '../../hooks/useSemester.js'
import { INSTITUTION, DAYS } from '../../data/mockData.js'

export default function Settings() {
  const { semesters, activeSemester } = useSemester()
  const [institution, setInstitution] = useState(INSTITUTION.name)
  const [academicYear, setAcademicYear] = useState(activeSemester?.academicYear || '')
  const [activeSem, setActiveSem] = useState(activeSemester?.id || '')
  const [duration, setDuration] = useState('2')
  const [workingDays, setWorkingDays] = useState(DAYS)
  const [saved, setSaved] = useState(false)

  const toggleDay = (d) =>
    setWorkingDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <PageWrapper
      title="Settings"
      description="Configure institution details and global timetable preferences."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Institution */}
        <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
          <h3 className="mb-5 font-display text-lg text-navy-900">Institution</h3>
          <div className="space-y-4">
            <FormField label="Institution Name">
              <Input value={institution} onChange={(e) => setInstitution(e.target.value)} />
            </FormField>
            <FormField label="Current Academic Year">
              <Select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
                <option>2024/2025</option>
                <option>2025/2026</option>
                <option>2026/2027</option>
              </Select>
            </FormField>
            <FormField label="Active Semester">
              <Select value={activeSem} onChange={(e) => setActiveSem(e.target.value)}>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} — {s.status}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </div>

        {/* Timetable settings */}
        <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
          <h3 className="mb-5 font-display text-lg text-navy-900">Timetable Settings</h3>
          <div className="space-y-4">
            <FormField label="Default Time Slot Duration">
              <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
              </Select>
            </FormField>
            <FormField label="Working Days">
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d) => {
                  const on = workingDays.includes(d)
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                        on
                          ? 'border-navy-800 bg-navy-800 text-white'
                          : 'border-navy-200 bg-white text-navy-600 hover:border-navy-300'
                      }`}
                    >
                      {d.slice(0, 3)}
                    </button>
                  )
                })}
              </div>
            </FormField>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="gold" onClick={save}>
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? 'Saved' : 'Save Settings'}
        </Button>
        {saved && <span className="text-sm font-medium text-emerald-600">Settings saved successfully.</span>}
      </div>
    </PageWrapper>
  )
}
