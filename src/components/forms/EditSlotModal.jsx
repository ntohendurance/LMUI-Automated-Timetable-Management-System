import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import ConfirmDialog from '../ui/ConfirmDialog.jsx'
import { FormField, Select } from '../ui/Field.jsx'
import { useCatalog } from '../../hooks/useCatalog.js'
import { TIME_SLOTS, DAYS } from '../../api/adapters.js'

/**
 * Edit / Add a timetable slot. Used on the Admin View / Edit Timetable page.
 * slot === null  → adding a new slot
 * context = { day, timeSlotId } supplied when an empty cell was clicked
 */
export default function EditSlotModal({ open, onClose, slot, context, onSave, onDelete }) {
  const { courses, lecturers, rooms } = useCatalog()
  const isEdit = !!slot

  const [form, setForm] = useState(() => ({
    courseId: slot?.courseId || courses[0]?.id || '',
    lecturerId: slot?.lecturerId || lecturers[0]?.id || '',
    roomId: slot?.roomId || rooms[0]?.id || '',
    day: slot?.day || context?.day || DAYS[0],
    timeSlotId: slot?.timeSlotId || context?.timeSlotId || TIME_SLOTS[0].id,
  }))
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  // Derive level + department from the selected course (required by the API).
  const selectedCourse = courses.find((c) => c.id === form.courseId)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.courseId || !form.lecturerId || !form.roomId) {
      setApiError('Course, lecturer and room are all required.')
      return
    }
    setSaving(true)
    setApiError('')
    try {
      await onSave({
        ...slot,
        ...form,
        level: selectedCourse?.level || slot?.level,
        departmentId: selectedCourse?.departmentId || slot?.departmentId,
        semesterId: slot?.semesterId || context?.semesterId,
      })
    } catch (err) {
      setApiError(err.message || 'Could not save slot')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={isEdit ? 'Edit Time Slot' : 'Add Time Slot'}
        subtitle={isEdit ? 'Update this scheduled class' : 'Schedule a new class for this slot'}
        footer={
          <div className="flex w-full items-center justify-between">
            <div>
              {isEdit && (
                <Button
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 size={15} /> Delete Slot
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="gold" onClick={submit} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          {apiError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {apiError}
            </div>
          )}
          <FormField label="Course">
            <Select value={form.courseId} onChange={(e) => set('courseId', e.target.value)}>
              <option value="">Select course…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Lecturer">
            <Select value={form.lecturerId} onChange={(e) => set('lecturerId', e.target.value)}>
              <option value="">Select lecturer…</option>
              {lecturers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Room">
            <Select value={form.roomId} onChange={(e) => set('roomId', e.target.value)}>
              <option value="">Select room…</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (cap. {r.capacity})
                </option>
              ))}
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Day">
              <Select value={form.day} onChange={(e) => set('day', e.target.value)}>
                {DAYS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Time Slot">
              <Select value={form.timeSlotId} onChange={(e) => set('timeSlotId', e.target.value)}>
                {TIME_SLOTS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false)
          onDelete(slot)
        }}
        title="Delete this slot?"
        message="This will remove the class from the timetable and log the change in the modification history. This cannot be undone."
        confirmLabel="Delete Slot"
      />
    </>
  )
}
