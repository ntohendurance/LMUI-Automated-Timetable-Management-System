import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { FormField, Input, Select } from '../ui/Field.jsx'
import { useCatalog } from '../../hooks/useCatalog.js'

export default function RoomForm({ open, onClose, onSave, initial }) {
  const { buildings } = useCatalog()
  const [form, setForm] = useState(
    initial || { name: '', capacity: 50, buildingId: buildings[0]?.id || '' }
  )
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Room name is required'
    if (!form.buildingId) e.buildingId = 'Building is required'
    if (!form.capacity || form.capacity < 1) e.capacity = 'Capacity must be greater than 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSaving(true)
    setApiError('')
    try {
      await onSave({ ...form, capacity: Number(form.capacity) })
    } catch (err) {
      setApiError(err.message || 'Could not save room')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Room / Hall' : 'Add Room / Hall'}
      subtitle="Teaching space available for scheduling"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gold" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Room'}
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
        <FormField label="Room Name" required error={errors.name}>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="LH101" error={errors.name} />
        </FormField>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Capacity" required error={errors.capacity}>
            <Input type="number" min={1} value={form.capacity} onChange={(e) => set('capacity', e.target.value)} error={errors.capacity} />
          </FormField>
          <FormField label="Building" required error={errors.buildingId}>
            <Select value={form.buildingId} onChange={(e) => set('buildingId', e.target.value)} error={errors.buildingId}>
              <option value="">Select building…</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </form>
    </Modal>
  )
}
