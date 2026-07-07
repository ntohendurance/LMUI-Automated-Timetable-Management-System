// Conflict detection utilities.
//
// Works on plain slot objects of the shape:
//   { id, lecturerId, roomId, departmentId, level, day, timeSlot, ... }
// Returns the same slots annotated with { hasConflict, conflictReason }.

const prisma = require('../config/db')

/**
 * Detect conflicts across a set of slots (in-memory, no DB writes).
 * Three hard checks:
 *   1. Lecturer double-booking — same lecturer, same day+timeSlot
 *   2. Room double-booking     — same room, same day+timeSlot
 *   3. Student group clash      — same department+level, same day+timeSlot
 */
function detectConflicts(slots) {
  // Reset annotations
  const annotated = slots.map((s) => ({ ...s, hasConflict: false, conflictReason: null }))

  const byLecturer = new Map()
  const byRoom = new Map()
  const byGroup = new Map()

  const push = (map, key, idx) => {
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(idx)
  }

  annotated.forEach((s, idx) => {
    const dt = `${s.day}__${s.timeSlot}`
    push(byLecturer, `${s.lecturerId}__${dt}`, idx)
    push(byRoom, `${s.roomId}__${dt}`, idx)
    push(byGroup, `${s.departmentId}__${s.level}__${dt}`, idx)
  })

  const flag = (idx, reason) => {
    annotated[idx].hasConflict = true
    annotated[idx].conflictReason = annotated[idx].conflictReason
      ? `${annotated[idx].conflictReason} ${reason}`
      : reason
  }

  for (const [, idxs] of byLecturer) {
    if (idxs.length > 1) idxs.forEach((i) => flag(i, 'Lecturer is double-booked at this day/time.'))
  }
  for (const [, idxs] of byRoom) {
    if (idxs.length > 1) idxs.forEach((i) => flag(i, 'Room is double-booked at this day/time.'))
  }
  for (const [, idxs] of byGroup) {
    if (idxs.length > 1)
      idxs.forEach((i) => flag(i, 'Student group (department + level) has overlapping classes.'))
  }

  return annotated
}

/**
 * Count how many slots carry a conflict.
 */
function countConflicts(slots) {
  return slots.filter((s) => s.hasConflict).length
}

/**
 * Recompute conflicts for an entire semester and persist hasConflict /
 * conflictReason back to the database.
 */
async function recomputeSemesterConflicts(semesterId) {
  const slots = await prisma.timetableSlot.findMany({ where: { semesterId } })
  const annotated = detectConflicts(slots)

  await prisma.$transaction(
    annotated.map((s) =>
      prisma.timetableSlot.update({
        where: { id: s.id },
        data: { hasConflict: s.hasConflict, conflictReason: s.conflictReason },
      })
    )
  )

  return { conflictsFound: countConflicts(annotated), slots: annotated }
}

/**
 * Check whether a single candidate slot would conflict with the rest of the
 * semester (excluding itself). Used before creating/updating a slot.
 * Returns { hasConflict, conflictReason }.
 */
async function checkSlotAgainstSemester(candidate, { excludeSlotId = null } = {}) {
  const siblings = await prisma.timetableSlot.findMany({
    where: {
      semesterId: candidate.semesterId,
      day: candidate.day,
      timeSlot: candidate.timeSlot,
      id: excludeSlotId ? { not: excludeSlotId } : undefined,
    },
  })

  const reasons = []
  if (siblings.some((s) => s.lecturerId === candidate.lecturerId))
    reasons.push('Lecturer is double-booked at this day/time.')
  if (siblings.some((s) => s.roomId === candidate.roomId))
    reasons.push('Room is double-booked at this day/time.')
  if (
    siblings.some(
      (s) => s.departmentId === candidate.departmentId && s.level === candidate.level
    )
  )
    reasons.push('Student group (department + level) has overlapping classes.')

  return {
    hasConflict: reasons.length > 0,
    conflictReason: reasons.length ? reasons.join(' ') : null,
  }
}

module.exports = {
  detectConflicts,
  countConflicts,
  recomputeSemesterConflicts,
  checkSlotAgainstSemester,
}
