import { useState, useMemo, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Users2, Loader2 } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Table from '../../components/ui/Table.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import SearchFilterBar from '../../components/ui/SearchFilterBar.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import RoomForm from '../../components/forms/RoomForm.jsx'
import { roomApi } from '../../api/endpoints.js'
import { useCatalog } from '../../hooks/useCatalog.js'

export default function Rooms() {
  const { reload: reloadCatalog } = useCatalog()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setRooms(await roomApi.list())
    } catch (err) {
      setError(err.message || 'Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(
    () =>
      rooms.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.building.toLowerCase().includes(search.toLowerCase())
      ),
    [rooms, search]
  )

  const handleSave = async (data) => {
    if (editing) await roomApi.update(editing.id, data)
    else await roomApi.create(data)
    setFormOpen(false)
    setEditing(null)
    await load()
    reloadCatalog()
  }

  const handleDelete = async () => {
    await roomApi.remove(deleting.id)
    setDeleting(null)
    await load()
    reloadCatalog()
  }

  const columns = [
    { key: 'roomId', header: 'Room ID', render: (r) => <span className="font-mono text-xs font-semibold text-navy-700">{r.roomId}</span> },
    { key: 'name', header: 'Room Name', render: (r) => <span className="font-semibold text-navy-900">{r.name}</span> },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 text-navy-600">
          <Users2 size={14} className="text-gold-500" />
          {r.capacity}
        </span>
      ),
    },
    { key: 'building', header: 'Building', render: (r) => <Badge variant="neutral">{r.building}</Badge> },
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
      title="Rooms / Halls"
      description="Manage teaching spaces available for timetable scheduling."
      actions={
        <Button variant="gold" onClick={() => { setEditing(null); setFormOpen(true) }}>
          <Plus size={16} /> Add Room
        </Button>
      }
    >
      <div className="mb-4">
        <SearchFilterBar search={search} onSearch={setSearch} searchPlaceholder="Search rooms or buildings…" />
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-navy-100 bg-white py-20 text-navy-400">
          <Loader2 className="animate-spin" /> <span className="ml-2 text-sm">Loading rooms…</span>
        </div>
      ) : (
        <Table columns={columns} data={filtered} emptyMessage="No rooms match your search." />
      )}

      {formOpen && (
        <RoomForm
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
        title="Delete room?"
        message={`Are you sure you want to delete ${deleting?.name}? This action cannot be undone.`}
        confirmLabel="Delete Room"
      />
    </PageWrapper>
  )
}
