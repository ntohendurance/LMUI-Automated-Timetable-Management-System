import { AlertTriangle, Plus } from 'lucide-react'
import { DAYS, TIME_SLOTS } from '../../api/adapters.js'

/**
 * Shared weekly timetable grid (Mon–Sat, 8AM–6PM in 2-hour slots).
 *
 * props:
 *  - slots: array of slot objects for the semester
 *  - editable: admin can click cells (open edit / add)
 *  - onCellClick(slot|null, {day, timeSlotId})
 *  - cellFields: which detail lines to render — array of
 *      'code' | 'title' | 'lecturer' | 'room' | 'level'
 *  - days: optional override of days array (e.g. single day for "today")
 */
export default function TimetableGrid({
  slots,
  editable = false,
  onCellClick,
  cellFields = ['code', 'lecturer', 'room', 'level'],
  days = DAYS,
}) {
  const slotMap = {}
  slots.forEach((s) => {
    slotMap[`${s.day}__${s.timeSlotId}`] = s
  })

  const renderCellContent = (slot) => (
    <>
      {cellFields.includes('code') && (
        <p className="font-bold text-navy-900">{slot.courseCode}</p>
      )}
      {cellFields.includes('title') && (
        <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-navy-700">
          {slot.courseTitle}
        </p>
      )}
      {cellFields.includes('lecturer') && (
        <p className="text-[11px] text-navy-500">{slot.lecturerName}</p>
      )}
      {cellFields.includes('room') && (
        <p className="text-[11px] font-medium text-gold-700">{slot.roomName}</p>
      )}
      {cellFields.includes('level') && (
        <p className="text-[10px] uppercase tracking-wide text-navy-400">
          {slot.level}
          {slot.department ? ` · ${slot.department.split(' ')[0]}` : ''}
        </p>
      )}
    </>
  )

  return (
    <div className="overflow-x-auto scrollbar-thin rounded-xl border border-navy-100 bg-white shadow-sm">
      <table className="w-full min-w-[860px] border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 w-28 border-b border-r border-navy-100 bg-navy-900 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gold-300">
              Time
            </th>
            {days.map((day) => (
              <th
                key={day}
                className="border-b border-r border-navy-100 bg-navy-900 px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-white"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map((ts) => (
            <tr key={ts.id}>
              <th className="sticky left-0 z-10 border-b border-r border-navy-100 bg-navy-50 px-3 py-3 text-left align-top text-xs font-semibold text-navy-600">
                {ts.label}
              </th>
              {days.map((day) => {
                const slot = slotMap[`${day}__${ts.id}`]
                const hasConflict = slot?.conflict
                const clickable = editable && onCellClick
                return (
                  <td
                    key={`${day}-${ts.id}`}
                    onClick={() => clickable && onCellClick(slot || null, { day, timeSlotId: ts.id })}
                    className={`group relative h-24 border-b border-r border-navy-100 px-2 py-2 align-top transition ${
                      clickable ? 'cursor-pointer hover:bg-gold-50/60' : ''
                    } ${
                      slot
                        ? hasConflict
                          ? 'bg-gold-50'
                          : 'bg-white'
                        : 'bg-navy-50/30'
                    }`}
                  >
                    {slot ? (
                      <div className="space-y-0.5">
                        {hasConflict && (
                          <div className="group/c absolute right-1.5 top-1.5">
                            <AlertTriangle size={15} className="text-red-500" />
                            <div className="pointer-events-none absolute right-0 top-6 z-20 w-52 rounded-lg bg-navy-900 px-3 py-2 text-[11px] leading-snug text-white opacity-0 shadow-lg transition group-hover/c:opacity-100">
                              <span className="font-semibold text-red-300">Conflict: </span>
                              {hasConflict}
                            </div>
                          </div>
                        )}
                        <div className={`rounded-md border-l-[3px] ${hasConflict ? 'border-red-400' : 'border-gold-400'} bg-white/60 py-0.5 pl-2`}>
                          {renderCellContent(slot)}
                        </div>
                      </div>
                    ) : (
                      clickable && (
                        <div className="flex h-full items-center justify-center opacity-0 transition group-hover:opacity-100">
                          <span className="flex items-center gap-1 text-[11px] font-medium text-navy-400">
                            <Plus size={13} /> Add
                          </span>
                        </div>
                      )
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
