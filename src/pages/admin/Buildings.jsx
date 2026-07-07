import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Pencil, Trash2, DoorOpen, Loader2 } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Table from '../../components/ui/Table.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import SearchFilterBar from '../../components/ui/SearchFilterBar.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import BuildingForm from '../../components/forms/BuildingForm.jsx'
import { buildingApi } from '../../api/endpoints.js'
import { useCatalog } from '../../hooks/useCatalog.js'

export default function Buildings() {
  const { reload: reloadCatalog } = useCatalog()
  const [buildings, setBuildings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setBuildings(await buildingApi.list())
    } catch (err) {
      setError(err.message || 'Failed to load buildings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(
    () => buildings.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())),
    [buildings, search]
  )

  const handleSave = async (data) => {
    if (editing) await buildingApi.update(editing.id, data.name)
    else await buildingApi.create(data.name)
    setFormOpen(false)
    setEditing(null)
    await load()
    reloadCatalog()
  }

  const handleDelete = async () => {
    setDeleteError('')
    try {
      await buildingApi.remove(deleting.id)
      setDeleting(null)
      await load()
      reloadCatalog()
    } catch (err) {
      setDeleteError(err.message || 'Could not delete building')
    }
  }

  const columns = [
    { key: 'name', header: 'Building Name', render: (r) => <span className="font-semibold text-navy-900">{r.name}</span> },
    {
      key: 'rooms',
      header: 'Rooms / Halls',
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 text-navy-600">
          <DoorOpen size={14} className="text-gold-500" />
          {r.rooms.length}
        </span>
      ),
    },
    {
      key: 'roomList',
      header: 'Rooms',
      render: (r) =>
        r.rooms.length ? (
          <div className="flex flex-wrap gap-1">
            {r.rooms.slice(0, 4).map((rm) => (
              <Badge key={rm.id} variant="neutral">{rm.name}</Badge>
            ))}
            {r.rooms.length > 4 && <Badge variant="neutral">+{r.rooms.length - 4}</Badge>}
          </div>
        ) : (
          <span className="text-navy-300">No rooms yet</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex items-center gap-1">
          <button onClick={() => { setEditing(r); setFormOpen(true) }} className="rounded-md p-1.5 text-navy-400 transition hover:bg-navy-100 hover:text-navy-700">
            <Pencil size={15} />
          </button>
          <button onClick={() => { setDeleteError(''); setDeleting(r) }} className="rounded-md p-1.5 text-navy-400 transition hover:bg-red-50 hover:text-red-600">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <PageWrapper
      title="Buildings"
      description="Manage the campus blocks that house your rooms and lecture halls."
      actions={
        <Button variant="gold" onClick={() => { setEditing(null); setFormOpen(true) }}>
          <Plus size={16} /> Add Building
        </Button>
      }
    >
      <div className="mb-4">
        <SearchFilterBar search={search} onSearch={setSearch} searchPlaceholder="Search buildings…" />
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-navy-100 bg-white py-20 text-navy-400">
          <Loader2 className="animate-spin" /> <span className="ml-2 text-sm">Loading buildings…</span>
        </div>
      ) : (
        <Table columns={columns} data={filtered} emptyMessage="No buildings match your search." />
      )}

      {formOpen && (
        <BuildingForm
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditing(null) }}
          onSave={handleSave}
          initial={editing}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => { setDeleting(null); setDeleteError('') }}
        onConfirm={handleDelete}
        title="Delete building?"
        message={
          deleteError ||
          `Are you sure you want to delete ${deleting?.name}? A building can only be removed once all its rooms have been reassigned or deleted.`
        }
        confirmLabel="Delete Building"
      />
    </PageWrapper>
  )
}
