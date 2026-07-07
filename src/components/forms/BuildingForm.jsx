import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { FormField, Input } from '../ui/Field.jsx'

export default function BuildingForm({ open, onClose, onSave, initial }) {
  const [name, setName] = useState(initial?.name || '')
  const [error, setError] = useState('')
  const [apiError, setApiError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Building name is required')
      return
    }
    setSaving(true)
    setApiError('')
    try {
      await onSave({ name: name.trim() })
    } catch (err) {
      setApiError(err.message || 'Could not save building')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Building' : 'Add Building'}
      subtitle="A campus block that houses rooms and halls"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gold" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Building'}
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
        <FormField label="Building Name" required error={error}>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            placeholder="Main Block"
            error={error}
          />
        </FormField>
      </form>
    </Modal>
  )
}
