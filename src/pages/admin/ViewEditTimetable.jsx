import { useState, useEffect, useCallback } from 'react'
import { Upload, Archive, FileDown, History, Filter, Lock, Loader2 } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import SemesterSelector from '../../components/ui/SemesterSelector.jsx'
import ModificationDrawer from '../../components/ui/ModificationDrawer.jsx'
import TimetableGrid from '../../components/timetable/TimetableGrid.jsx'
import EditSlotModal from '../../components/forms/EditSlotModal.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import { Select } from '../../components/ui/Field.jsx'
import { useSemester } from '../../hooks/useSemester.js'
import { useCatalog } from '../../hooks/useCatalog.js'
import { timetableApi, modificationApi } from '../../api/endpoints.js'

const LEVELS = ['Year 1', 'Year 2', 'Year 3', 'Year 4']

export default function ViewEditTimetable() {
  const { semesters, selectedSemesterId, setSelectedSemesterId, selectedSemester, publish, archive, reload } =
    useSemester()
  const { departments, lecturers } = useCatalog()

  const [slots, setSlots] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmPublish, setConfirmPublish] = useState(false)
  const [confirmArchive, setConfirmArchive] = useState(false)
  const [busy, setBusy] = useState(false)

  const [fDept, setFDept] = useState('')
  const [fLevel, setFLevel] = useState('')
  const [fLecturer, setFLecturer] = useState('')

  const status = selectedSemester?.status
  const isArchived = status === 'Archived'

  const loadSlots = useCallback(async () => {
    if (!selectedSemesterId) return
    setLoading(true)
    try {
      const data = await timetableApi.forSemester(selectedSemesterId, {
        department: fDept || undefined,
        level: fLevel || undefined,
        lecturer: fLecturer || undefined,
      })
      setSlots(data)
    } catch {
      setSlots([])
    } finally {
      setLoading(false)
    }
  }, [selectedSemesterId, fDept, fLevel, fLecturer])

  const loadLogs = useCallback(async () => {
    if (!selectedSemesterId) return
    try {
      setLogs(await modificationApi.forSemester(selectedSemesterId))
    } catch {
      setLogs([])
    }
  }, [selectedSemesterId])

  useEffect(() => {
    loadSlots()
  }, [loadSlots])
  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const refresh = async () => {
    await Promise.all([loadSlots(), loadLogs()])
  }

  const handleCellClick = (slot, context) => {
    if (isArchived) return
    setEditing({ slot, context: { ...context, semesterId: selectedSemesterId } })
  }

  const handleSaveSlot = async (data) => {
    if (data.id) await timetableApi.updateSlot(data.id, data)
    else await timetableApi.createSlot({ ...data, semesterId: selectedSemesterId })
    setEditing(null)
    await refresh()
  }

  const handleDeleteSlot = async (slot) => {
    await timetableApi.deleteSlot(slot.id)
    setEditing(null)
    await refresh()
  }

  const doPublish = async () => {
    setBusy(true)
    try {
      await publish(selectedSemesterId)
      await refresh()
    } finally {
      setBusy(false)
      setConfirmPublish(false)
    }
  }

  const doArchive = async () => {
    setBusy(true)
    try {
      await archive(selectedSemesterId)
      await refresh()
    } finally {
      setBusy(false)
      setConfirmArchive(false)
    }
  }

  if (!selectedSemester) {
    return (
      <PageWrapper title="View / Edit Timetable">
        <div className="flex items-center justify-center rounded-xl border border-navy-100 bg-white py-20 text-navy-400">
          <Loader2 className="animate-spin" /> <span className="ml-2 text-sm">Loading semesters…</span>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="View / Edit Timetable">
      <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SemesterSelector semesters={semesters} value={selectedSemesterId} onChange={setSelectedSemesterId} />
          <div className="text-sm">
            <span className="text-navy-400">Viewing: </span>
            <span className="font-semibold text-navy-900">{selectedSemester.label}</span>
            <span className="mx-1.5 text-navy-300">|</span>
            <span className="text-navy-400">Status: </span>
            <Badge variant={status}>{status}</Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {status === 'Draft' && (
            <Button variant="gold" onClick={() => setConfirmPublish(true)} disabled={busy}>
              <Upload size={15} /> Publish
            </Button>
          )}
          {status === 'Published' && (
            <Button variant="primary" onClick={() => setConfirmArchive(true)} disabled={busy}>
              <Archive size={15} /> Archive
            </Button>
          )}
          <Button variant="outline" onClick={() => window.print()}>
            <FileDown size={15} /> Export PDF
          </Button>
          <Button variant="ghost" onClick={() => setDrawerOpen(true)}>
            <History size={15} /> Modification History
          </Button>
        </div>
      </div>

      {isArchived && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-navy-200 bg-navy-100 p-4 text-navy-600">
          <Lock size={18} />
          <p className="text-sm font-medium">This timetable is archived and read-only. No modifications can be made.</p>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-navy-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-navy-400">
          <Filter size={14} /> Filter
        </span>
        <Select value={fDept} onChange={(e) => setFDept(e.target.value)} className="sm:w-64">
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </Select>
        <Select value={fLevel} onChange={(e) => setFLevel(e.target.value)} className="sm:w-40">
          <option value="">All Levels</option>
          {LEVELS.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </Select>
        <Select value={fLecturer} onChange={(e) => setFLecturer(e.target.value)} className="sm:w-56">
          <option value="">All Lecturers</option>
          {lecturers.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </Select>
      </div>

      {!isArchived && (
        <p className="mb-3 text-xs text-navy-400">
          Tip: click any cell to edit a class, or an empty cell to add a new one.
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-navy-100 bg-white py-20 text-navy-400">
          <Loader2 className="animate-spin" /> <span className="ml-2 text-sm">Loading timetable…</span>
        </div>
      ) : (
        <TimetableGrid slots={slots} editable={!isArchived} onCellClick={handleCellClick} />
      )}

      {editing && (
        <EditSlotModal
          open={!!editing}
          onClose={() => setEditing(null)}
          slot={editing.slot}
          context={editing.context}
          onSave={handleSaveSlot}
          onDelete={handleDeleteSlot}
        />
      )}

      <ModificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} logs={logs} semesterLabel={selectedSemester.label} />

      <ConfirmDialog
        open={confirmPublish}
        onClose={() => setConfirmPublish(false)}
        onConfirm={doPublish}
        title="Publish timetable?"
        message={`Publishing makes ${selectedSemester.label} visible to all lecturers and students. You can still make admin edits afterwards.`}
        confirmLabel="Publish"
        variant="gold"
      />
      <ConfirmDialog
        open={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        onConfirm={doArchive}
        title="Archive timetable?"
        message={`Archiving ${selectedSemester.label} will lock it as read-only. This is typically done at the end of a semester.`}
        confirmLabel="Archive"
      />
    </PageWrapper>
  )
}
