import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { FormField, Input, Select } from '../ui/Field.jsx'
import { useCatalog } from '../../hooks/useCatalog.js'

const LEVELS = ['Year 1', 'Year 2', 'Year 3', 'Year 4']

export default function StudentForm({ open, onClose, onSave, initial }) {
  const { departments } = useCatalog()
  const [form, setForm] = useState(
    initial || {
      name: '',
      matricule: '',
      email: '',
      departmentId: departments[0]?.id || '',
      level: 'Year 1',
    }
  )
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.matricule.trim()) e.matricule = 'Matricule number is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.departmentId) e.departmentId = 'Department is required'
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
      setApiError(err.message || 'Could not save student')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Student' : 'Add Student'}
      subtitle="Student enrolment record"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gold" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Student'}
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
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Endurance Ntoh" error={errors.name} />
        </FormField>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Matricule Number" required error={errors.matricule}>
            <Input value={form.matricule} onChange={(e) => set('matricule', e.target.value)} placeholder="LMUI/CGD/22/001" error={errors.matricule} />
          </FormField>
          <FormField label="Email" required error={errors.email}>
            <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@lmui.edu" error={errors.email} />
          </FormField>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <FormField label="Level" required>
            <Select value={form.level} onChange={(e) => set('level', e.target.value)}>
              {LEVELS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </Select>
          </FormField>
        </div>
      </form>
    </Modal>
  )
}
