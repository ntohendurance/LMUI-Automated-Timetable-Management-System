import { useState, useMemo, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Table from '../../components/ui/Table.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import SearchFilterBar from '../../components/ui/SearchFilterBar.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import StudentForm from '../../components/forms/StudentForm.jsx'
import { studentApi } from '../../api/endpoints.js'
import { useCatalog } from '../../hooks/useCatalog.js'

const LEVELS = ['Year 1', 'Year 2', 'Year 3', 'Year 4']

export default function Students() {
  const { departments } = useCatalog()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('')
  const [level, setLevel] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { items } = await studentApi.list({ limit: 200 })
      setStudents(items)
    } catch (err) {
      setError(err.message || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(
    () =>
      students.filter(
        (s) =>
          (s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.matricule.toLowerCase().includes(search.toLowerCase())) &&
          (!dept || s.department === dept) &&
          (!level || s.level === level)
      ),
    [students, search, dept, level]
  )

  const handleSave = async (data) => {
    if (editing) await studentApi.update(editing.id, data)
    else await studentApi.create(data)
    setFormOpen(false)
    setEditing(null)
    await load()
  }

  const handleDelete = async () => {
    await studentApi.remove(deleting.id)
    setDeleting(null)
    await load()
  }

  const columns = [
    { key: 'name', header: 'Student', render: (r) => <span className="font-semibold text-navy-900">{r.name}</span> },
    { key: 'matricule', header: 'Matricule', render: (r) => <span className="font-mono text-xs text-navy-600">{r.matricule}</span> },
    { key: 'department', header: 'Department', render: (r) => <span className="text-navy-500">{r.department}</span> },
    { key: 'level', header: 'Level', render: (r) => <Badge variant="neutral">{r.level}</Badge> },
    { key: 'email', header: 'Email', render: (r) => <span className="text-navy-500">{r.email}</span> },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex items-center gap-1">
          <button onClick={() => { setEditing(r); setFormOpen(true) }} className="rounded-md p-1.5 text-navy-400 transition hover:bg-navy-100 hover:text-navy-700">
            <Pencil size={15} />
          </button>
          <button onClick={() => setDeleting(r)} className="rounded-md p-1.5 text-navy-400 transition hover:bg-red-50 hover:text-red-600">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <PageWrapper
      title="Students"
      description="Manage enrolled students across departments and levels."
      actions={
        <Button variant="gold" onClick={() => { setEditing(null); setFormOpen(true) }}>
          <Plus size={16} /> Add Student
        </Button>
      }
    >
      <div className="mb-4">
        <SearchFilterBar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search by name or matricule…"
          filters={[
            { value: dept, onChange: setDept, placeholder: 'All Departments', options: departments.map((d) => ({ label: d.name, value: d.name })) },
            { value: level, onChange: setLevel, placeholder: 'All Levels', options: LEVELS.map((l) => ({ label: l, value: l })) },
          ]}
        />
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-navy-100 bg-white py-20 text-navy-400">
          <Loader2 className="animate-spin" /> <span className="ml-2 text-sm">Loading students…</span>
        </div>
      ) : (
        <Table columns={columns} data={filtered} emptyMessage="No students match your filters." />
      )}

      {formOpen && (
        <StudentForm
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditing(null) }}
          onSave={handleSave}
          initial={editing}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete student?"
        message={`Are you sure you want to remove ${deleting?.name} (${deleting?.matricule})? This action cannot be undone.`}
        confirmLabel="Delete Student"
      />
    </PageWrapper>
  )
}
