import { useState, useMemo, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Table from '../../components/ui/Table.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import SearchFilterBar from '../../components/ui/SearchFilterBar.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import CourseForm from '../../components/forms/CourseForm.jsx'
import { courseApi } from '../../api/endpoints.js'
import { useCatalog } from '../../hooks/useCatalog.js'

const LEVELS = ['Year 1', 'Year 2', 'Year 3', 'Year 4']

export default function Courses() {
  const { departments, reload: reloadCatalog } = useCatalog()
  const [courses, setCourses] = useState([])
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
      const { items } = await courseApi.list({ limit: 200 })
      setCourses(items)
    } catch (err) {
      setError(err.message || 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(
    () =>
      courses.filter(
        (c) =>
          (c.code.toLowerCase().includes(search.toLowerCase()) ||
            c.title.toLowerCase().includes(search.toLowerCase())) &&
          (!dept || c.department === dept) &&
          (!level || c.level === level)
      ),
    [courses, search, dept, level]
  )

  const handleSave = async (data) => {
    if (editing) await courseApi.update(editing.id, data)
    else await courseApi.create(data)
    setFormOpen(false)
    setEditing(null)
    await load()
    reloadCatalog()
  }

  const handleDelete = async () => {
    await courseApi.remove(deleting.id)
    setDeleting(null)
    await load()
    reloadCatalog()
  }

  const columns = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-bold text-navy-900">{r.code}</span> },
    { key: 'title', header: 'Course Title' },
    { key: 'department', header: 'Department', render: (r) => <span className="text-navy-500">{r.department}</span> },
    { key: 'level', header: 'Level', render: (r) => <Badge variant="neutral">{r.level}</Badge> },
    { key: 'creditUnits', header: 'Credits', className: 'text-center', render: (r) => <span className="font-semibold">{r.creditUnits}</span> },
    { key: 'lecturer', header: 'Assigned Lecturer', render: (r) => r.lecturerName || <span className="text-navy-300">—</span> },
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
      title="Courses"
      description="Manage all courses offered across departments and levels."
      actions={
        <Button variant="gold" onClick={() => { setEditing(null); setFormOpen(true) }}>
          <Plus size={16} /> Add Course
        </Button>
      }
    >
      <div className="mb-4">
        <SearchFilterBar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search by code or title…"
          filters={[
            { value: dept, onChange: setDept, placeholder: 'All Departments', options: departments.map((d) => ({ label: d.name, value: d.name })) },
            { value: level, onChange: setLevel, placeholder: 'All Levels', options: LEVELS.map((l) => ({ label: l, value: l })) },
          ]}
        />
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-navy-100 bg-white py-20 text-navy-400">
          <Loader2 className="animate-spin" /> <span className="ml-2 text-sm">Loading courses…</span>
        </div>
      ) : (
        <Table columns={columns} data={filtered} emptyMessage="No courses match your filters." />
      )}

      {formOpen && (
        <CourseForm
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
        title="Delete course?"
        message={`Are you sure you want to delete ${deleting?.code} — ${deleting?.title}? This action cannot be undone.`}
        confirmLabel="Delete Course"
      />
    </PageWrapper>
  )
}
