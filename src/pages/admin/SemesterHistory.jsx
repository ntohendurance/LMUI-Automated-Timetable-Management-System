import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Pencil, Archive, Trash2 } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Table from '../../components/ui/Table.jsx'
import Badge from '../../components/ui/Badge.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import { useSemester } from '../../hooks/useSemester.js'
import { semesterApi } from '../../api/endpoints.js'
import { formatDate } from '../../utils/format.js'

export default function SemesterHistory() {
  const navigate = useNavigate()
  const { semesters, setSelectedSemesterId, archive, reload } = useSemester()
  const [deleting, setDeleting] = useState(null)

  const openTimetable = (id) => {
    setSelectedSemesterId(id)
    navigate('/admin/timetable/view')
  }

  const handleDelete = async () => {
    await semesterApi.remove(deleting.id)
    setDeleting(null)
    await reload()
  }

  const columns = [
    { key: 'academicYear', header: 'Academic Year', render: (r) => <span className="font-semibold text-navy-900">{r.academicYear}</span> },
    { key: 'semester', header: 'Semester', render: (r) => <span className="text-navy-600">{r.semester}</span> },
    { key: 'dateGenerated', header: 'Date Generated', render: (r) => <span className="text-navy-500">{formatDate(r.dateGenerated)}</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status}>{r.status}</Badge> },
    { key: 'slots', header: 'Total Slots', className: 'text-center', render: (r) => <span className="font-semibold text-navy-700">{r.slotCount}</span> },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openTimetable(r.id)} title="View" className="rounded-md p-1.5 text-navy-400 transition hover:bg-navy-100 hover:text-navy-700">
            <Eye size={15} />
          </button>
          {(r.status === 'Draft' || r.status === 'Published') && (
            <button onClick={() => openTimetable(r.id)} title="Edit" className="rounded-md p-1.5 text-navy-400 transition hover:bg-navy-100 hover:text-navy-700">
              <Pencil size={15} />
            </button>
          )}
          {r.status === 'Published' && (
            <button onClick={() => archive(r.id)} title="Archive" className="rounded-md p-1.5 text-navy-400 transition hover:bg-navy-100 hover:text-navy-700">
              <Archive size={15} />
            </button>
          )}
          {r.status === 'Draft' && (
            <button onClick={() => setDeleting(r)} title="Delete" className="rounded-md p-1.5 text-navy-400 transition hover:bg-red-50 hover:text-red-600">
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <PageWrapper
      title="Semester History"
      description="All generated timetables across academic years. Only one active timetable exists per semester."
    >
      <Table columns={columns} data={semesters} emptyMessage="No timetables have been generated yet." />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete draft timetable?"
        message={`Delete the Draft timetable for ${deleting?.label}? Only unpublished drafts can be deleted. This cannot be undone.`}
        confirmLabel="Delete Draft"
      />
    </PageWrapper>
  )
}
