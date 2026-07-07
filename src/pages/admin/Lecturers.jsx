import { useState, useMemo, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Loader2, UserCheck, UserX, Clock } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Table from '../../components/ui/Table.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import SearchFilterBar from '../../components/ui/SearchFilterBar.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import LecturerForm from '../../components/forms/LecturerForm.jsx'
import { lecturerApi } from '../../api/endpoints.js'
import { useCatalog } from '../../hooks/useCatalog.js'

export default function Lecturers() {
  const { departments, reload: reloadCatalog } = useCatalog()
  const [lecturers, setLecturers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setLecturers(await lecturerApi.list())
    } catch (err) {
      setError(err.message || 'Failed to load lecturers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(
    () =>
      lecturers.filter(
        (l) =>
          (l.name.toLowerCase().includes(search.toLowerCase()) ||
            l.email.toLowerCase().includes(search.toLowerCase())) &&
          (!dept || l.department === dept)
      ),
    [lecturers, search, dept]
  )

  const handleSave = async (data) => {
    if (editing) await lecturerApi.update(editing.id, data)
    else await lecturerApi.create(data)
    setFormOpen(false)
    setEditing(null)
    await load()
    reloadCatalog()
  }

  const handleDelete = async () => {
    await lecturerApi.remove(deleting.id)
    setDeleting(null)
    await load()
    reloadCatalog()
  }

  const handleApprove = async (lecturer, approve = true) => {
    await lecturerApi.approve(lecturer.id, approve)
    await load()
    reloadCatalog()
  }

  const pendingCount = lecturers.filter((l) => !l.isApproved).length

  const columns = [
    {
      key: 'name',
      header: 'Lecturer',
      render: (r) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 text-xs font-bold text-gold-300">
            {r.name.split(' ').map((p) => p[0]).slice(-2).join('')}
          </span>
          <span className="font-semibold text-navy-900">{r.name}</span>
        </div>
      ),
    },
    { key: 'email', header: 'Email', render: (r) => <span className="text-navy-500">{r.email}</span> },
    { key: 'department', header: 'Department', render: (r) => <span className="text-navy-500">{r.department}</span> },
    { key: 'courses', header: 'Courses', className: 'text-center', render: (r) => <Badge variant="neutral">{r.courseCount}</Badge> },
    { key: 'availability', header: 'Availability', render: (r) => <Badge variant={r.availability} dot>{r.availability}</Badge> },
    {
      key: 'status',
      header: 'Status',
      render: (r) =>
        r.isApproved ? (
          <Badge variant="Approved" dot>Approved</Badge>
        ) : (
          <Badge variant="Pending" dot>Pending</Badge>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex items-center gap-1">
          {!r.isApproved ? (
            <button
              onClick={() => handleApprove(r, true)}
              title="Approve lecturer"
              className="rounded-md p-1.5 text-emerald-500 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              <UserCheck size={15} />
            </button>
          ) : (
            <button
              onClick={() => handleApprove(r, false)}
              title="Revoke approval"
              className="rounded-md p-1.5 text-navy-400 transition hover:bg-gold-50 hover:text-gold-700"
            >
              <UserX size={15} />
            </button>
          )}
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
      title="Lecturers"
      description="Manage teaching staff, departments and availability."
      actions={
        <Button variant="gold" onClick={() => { setEditing(null); setFormOpen(true) }}>
          <Plus size={16} /> Add Lecturer
        </Button>
      }
    >
      <div className="mb-4">
        <SearchFilterBar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search by name or email…"
          filters={[{ value: dept, onChange: setDept, placeholder: 'All Departments', options: departments.map((d) => ({ label: d.name, value: d.name })) }]}
        />
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {pendingCount > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-gold-300 bg-gold-50 px-4 py-3 text-sm text-navy-700">
          <Clock size={16} className="shrink-0 text-gold-600" />
          <span>
            <strong>{pendingCount}</strong> self-registered {pendingCount === 1 ? 'lecturer is' : 'lecturers are'} awaiting approval.
            Approve an account to let them sign in and be assigned to courses.
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-navy-100 bg-white py-20 text-navy-400">
          <Loader2 className="animate-spin" /> <span className="ml-2 text-sm">Loading lecturers…</span>
        </div>
      ) : (
        <Table columns={columns} data={filtered} emptyMessage="No lecturers match your filters." />
      )}

      {formOpen && (
        <LecturerForm
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
        title="Delete lecturer?"
        message={`Are you sure you want to remove ${deleting?.name}? This action cannot be undone.`}
        confirmLabel="Delete Lecturer"
      />
    </PageWrapper>
  )
}
