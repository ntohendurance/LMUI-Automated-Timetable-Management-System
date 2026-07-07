import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { FormField, Input, Select } from '../ui/Field.jsx'
import { useCatalog } from '../../hooks/useCatalog.js'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function LecturerForm({ open, onClose, onSave, initial }) {
  const { departments } = useCatalog()
  const [form, setForm] = useState(
    initial || {
      name: '',
      email: '',
      staffId: '',
      departmentId: departments[0]?.id || '',
      availableDays: ['Monday'],
    }
  )
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const toggleDay = (day) =>
    setForm((f) => ({
      ...f,
      availableDays: f.availableDays.includes(day)
        ? f.availableDays.filter((d) => d !== day)
        : [...f.availableDays, day],
    }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.departmentId) e.departmentId = 'Department is required'
    if (form.availableDays.length === 0) e.availableDays = 'Select at least one available day'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSaving(true)
    setApiError('')
    try {
      await onSave(form)
    } catch (err) {
      setApiError(err.message || 'Could not save lecturer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Lecturer' : 'Add Lecturer'}
      subtitle="Lecturer details and weekly availability"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gold" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Lecturer'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {apiError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {apiError}
          </div>
        )}
        <FormField label="Full Name" required error={errors.name}>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nzo Desmond" error={errors.name} />
        </FormField>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Email" required error={errors.email}>
            <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@lmui.edu" error={errors.email} />
          </FormField>
          <FormField label="Staff ID">
            <Input value={form.staffId} onChange={(e) => set('staffId', e.target.value)} placeholder="LMUI/STF/0142" />
          </FormField>
        </div>
        <FormField label="Department" required error={errors.departmentId}>
          <Select value={form.departmentId} onChange={(e) => set('departmentId', e.target.value)} error={errors.departmentId}>
            <option value="">Select department…</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Available Days" required error={errors.availableDays}>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => {
              const active = form.availableDays.includes(day)
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? 'border-navy-800 bg-navy-800 text-white'
                      : 'border-navy-200 bg-white text-navy-600 hover:border-navy-300'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              )
            })}
          </div>
        </FormField>
      </form>
    </Modal>
  )
}
