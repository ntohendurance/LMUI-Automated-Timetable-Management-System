import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { FormField, Input, Select } from '../ui/Field.jsx'
import { useCatalog } from '../../hooks/useCatalog.js'

const LEVELS = ['Year 1', 'Year 2', 'Year 3', 'Year 4']
const PERIODS = [
  { value: '', label: 'No preference' },
  { value: 'MORNING', label: 'Morning (8AM–12PM)' },
  { value: 'AFTERNOON', label: 'Afternoon (12PM–4PM)' },
  { value: 'EVENING', label: 'Evening (4PM–6PM)' },
]

export default function CourseForm({ open, onClose, onSave, initial }) {
  const { departments, lecturers } = useCatalog()
  const [form, setForm] = useState(
    initial || {
      code: '',
      title: '',
      departmentId: departments[0]?.id || '',
      creditUnits: 3,
      preferredTimeSlot: '',
      level: 'Year 1',
      lecturerId: '',
    }
  )
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.code.trim()) e.code = 'Course code is required'
    else if (!/^[A-Z]{2,4}\d{3}$/.test(form.code.trim().toUpperCase())) e.code = 'Format e.g. CGD301'
    if (!form.title.trim()) e.title = 'Course title is required'
    if (!form.departmentId) e.departmentId = 'Department is required'
    if (!form.creditUnits || form.creditUnits < 1 || form.creditUnits > 6)
      e.creditUnits = 'Credit units must be 1–6'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSaving(true)
    setApiError('')
    try {
      await onSave({
        ...form,
        code: form.code.toUpperCase(),
        creditUnits: Number(form.creditUnits),
      })
    } catch (err) {
      setApiError(err.message || 'Could not save course')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Course' : 'Add Course'}
      subtitle="Define a course offered this semester"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gold" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Course'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {apiError && (
          <div className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {apiError}
          </div>
        )}
        <FormField label="Course Code" required error={errors.code}>
          <Input value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="CGD301" error={errors.code} />
        </FormField>
        <FormField label="Credit Units" required error={errors.creditUnits}>
          <Input type="number" min={1} max={6} value={form.creditUnits} onChange={(e) => set('creditUnits', e.target.value)} error={errors.creditUnits} />
        </FormField>
        <FormField label="Course Title" required error={errors.title} className="sm:col-span-2">
          <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Advanced UI/UX Design" error={errors.title} />
        </FormField>
        <FormField label="Department" required error={errors.departmentId} className="sm:col-span-2">
          <Select value={form.departmentId} onChange={(e) => set('departmentId', e.target.value)} error={errors.departmentId}>
            <option value="">Select department…</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Target Level" required>
          <Select value={form.level} onChange={(e) => set('level', e.target.value)}>
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Preferred Time Slot">
          <Select value={form.preferredTimeSlot} onChange={(e) => set('preferredTimeSlot', e.target.value)}>
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Assigned Lecturer" className="sm:col-span-2">
          <Select value={form.lecturerId} onChange={(e) => set('lecturerId', e.target.value)}>
            <option value="">Unassigned</option>
            {lecturers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
        </FormField>
      </form>
    </Modal>
  )
}
