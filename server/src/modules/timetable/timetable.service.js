const prisma = require('../../config/db')
const ApiError = require('../../utils/ApiError')
const { generateTimetable } = require('./timetable.generator')
const {
  detectConflicts,
  countConflicts,
  checkSlotAgainstSemester,
  recomputeSemesterConflicts,
} = require('../../utils/conflicts')
const { SLOT_LABELS } = require('../../utils/constants')

const slotInclude = {
  course: { select: { id: true, code: true, title: true, creditUnits: true, level: true } },
  lecturer: {
    select: { id: true, staffId: true, user: { select: { id: true, name: true, email: true } } },
  },
  room: { select: { id: true, name: true, capacity: true, building: { select: { name: true } } } },
  department: { select: { id: true, name: true, code: true } },
}

function slotSnapshot(slot) {
  return {
    courseId: slot.courseId,
    lecturerId: slot.lecturerId,
    roomId: slot.roomId,
    day: slot.day,
    timeSlot: slot.timeSlot,
    level: slot.level,
    departmentId: slot.departmentId,
  }
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------
async function generate({ semesterId, constraints }) {
  const semester = await prisma.semester.findUnique({ where: { id: semesterId } })
  if (!semester) throw ApiError.notFound('Semester not found')
  if (semester.status !== 'DRAFT') {
    throw ApiError.badRequest('Timetables can only be generated for a Draft semester.')
  }

  const [courses, lecturers, rooms] = await Promise.all([
    prisma.course.findMany({
      select: {
        id: true,
        departmentId: true,
        lecturerId: true,
        level: true,
        preferredDay: true,
        preferredTimeSlot: true,
      },
    }),
    prisma.lecturer.findMany({
      // Only approved lecturers can be scheduled.
      where: { isApproved: true },
      select: { id: true, availableDays: true, preferredTimeSlots: true },
    }),
    prisma.room.findMany({ select: { id: true, capacity: true } }),
  ])

  if (!rooms.length) throw ApiError.badRequest('No rooms available for scheduling.')

  const { slots, unscheduled } = generateTimetable({
    semesterId,
    courses,
    lecturers,
    rooms,
    constraints: constraints || {},
  })

  // Conflict detection pass (defensive — greedy should avoid hard conflicts).
  const annotated = detectConflicts(slots)
  const conflictsFound = countConflicts(annotated)

  // Replace any existing slots for this draft semester, then insert fresh ones.
  await prisma.$transaction(async (tx) => {
    await tx.timetableSlot.deleteMany({ where: { semesterId } })
    if (annotated.length) {
      await tx.timetableSlot.createMany({
        data: annotated.map((s) => ({
          semesterId,
          courseId: s.courseId,
          lecturerId: s.lecturerId,
          roomId: s.roomId,
          day: s.day,
          timeSlot: s.timeSlot,
          level: s.level,
          departmentId: s.departmentId,
          hasConflict: s.hasConflict,
          conflictReason: s.conflictReason,
        })),
      })
    }
    await tx.semester.update({ where: { id: semesterId }, data: { generatedAt: new Date() } })
  })

  const savedSlots = await prisma.timetableSlot.findMany({
    where: { semesterId },
    include: slotInclude,
    orderBy: [{ day: 'asc' }, { timeSlot: 'asc' }],
  })

  return {
    slotsGenerated: savedSlots.length,
    conflictsFound,
    unscheduled,
    slots: savedSlots,
  }
}

// ---------------------------------------------------------------------------
// Role-filtered fetch
// ---------------------------------------------------------------------------
async function getSemesterSlots(reqUser, semesterId, query = {}) {
  const semester = await prisma.semester.findUnique({ where: { id: semesterId } })
  if (!semester) throw ApiError.notFound('Semester not found')

  const where = { semesterId }

  // Role scoping
  if (reqUser.role === 'LECTURER') {
    const lecturer = await prisma.lecturer.findUnique({ where: { userId: reqUser.id } })
    if (!lecturer) throw ApiError.forbidden('No lecturer profile linked to this account.')
    where.lecturerId = lecturer.id
  } else if (reqUser.role === 'STUDENT') {
    const student = await prisma.student.findUnique({ where: { userId: reqUser.id } })
    if (!student) throw ApiError.forbidden('No student profile linked to this account.')
    where.departmentId = student.departmentId
    where.level = student.level
  }

  // Optional filters (admin-facing, but harmless for all)
  if (query.department) where.departmentId = query.department
  if (query.level) where.level = query.level
  if (query.lecturer) where.lecturerId = query.lecturer
  if (query.day) where.day = query.day

  return prisma.timetableSlot.findMany({
    where,
    include: slotInclude,
    orderBy: [{ day: 'asc' }, { timeSlot: 'asc' }],
  })
}

// ---------------------------------------------------------------------------
// Slot mutations (with modification logging + conflict checks)
// ---------------------------------------------------------------------------
async function createSlot(reqUser, data) {
  const semester = await prisma.semester.findUnique({ where: { id: data.semesterId } })
  if (!semester) throw ApiError.notFound('Semester not found')

  const conflict = await checkSlotAgainstSemester(data)

  const slot = await prisma.timetableSlot.create({
    data: {
      semesterId: data.semesterId,
      courseId: data.courseId,
      lecturerId: data.lecturerId,
      roomId: data.roomId,
      day: data.day,
      timeSlot: data.timeSlot,
      level: data.level,
      departmentId: data.departmentId,
      hasConflict: conflict.hasConflict,
      conflictReason: conflict.conflictReason,
    },
    include: slotInclude,
  })

  await prisma.timetableModification.create({
    data: {
      semesterId: slot.semesterId,
      slotId: slot.id,
      action: 'CREATED',
      changedBy: reqUser.id,
      previousData: null,
      newData: slotSnapshot(slot),
      description: `Added ${slot.course.code} on ${slot.day} ${SLOT_LABELS[slot.timeSlot]}`,
    },
  })

  // Recompute conflicts across the semester so peers reflect the new slot.
  await recomputeSemesterConflicts(slot.semesterId)
  return prisma.timetableSlot.findUnique({ where: { id: slot.id }, include: slotInclude })
}

async function updateSlot(reqUser, slotId, data) {
  const existing = await prisma.timetableSlot.findUnique({
    where: { id: slotId },
    include: { course: { select: { code: true } } },
  })
  if (!existing) throw ApiError.notFound('Timetable slot not found')

  const merged = {
    semesterId: existing.semesterId,
    courseId: data.courseId ?? existing.courseId,
    lecturerId: data.lecturerId ?? existing.lecturerId,
    roomId: data.roomId ?? existing.roomId,
    day: data.day ?? existing.day,
    timeSlot: data.timeSlot ?? existing.timeSlot,
    level: data.level ?? existing.level,
    departmentId: data.departmentId ?? existing.departmentId,
  }

  const conflict = await checkSlotAgainstSemester(merged, { excludeSlotId: slotId })

  const updated = await prisma.timetableSlot.update({
    where: { id: slotId },
    data: {
      courseId: merged.courseId,
      lecturerId: merged.lecturerId,
      roomId: merged.roomId,
      day: merged.day,
      timeSlot: merged.timeSlot,
      level: merged.level,
      departmentId: merged.departmentId,
      hasConflict: conflict.hasConflict,
      conflictReason: conflict.conflictReason,
    },
    include: slotInclude,
  })

  const movedTime = existing.day !== updated.day || existing.timeSlot !== updated.timeSlot
  const description = movedTime
    ? `Moved ${updated.course.code} from ${existing.day} ${SLOT_LABELS[existing.timeSlot]} to ${updated.day} ${SLOT_LABELS[updated.timeSlot]}`
    : `Updated ${updated.course.code} (${updated.day} ${SLOT_LABELS[updated.timeSlot]})`

  await prisma.timetableModification.create({
    data: {
      semesterId: updated.semesterId,
      slotId: updated.id,
      action: 'UPDATED',
      changedBy: reqUser.id,
      previousData: slotSnapshot(existing),
      newData: slotSnapshot(updated),
      description,
    },
  })

  await recomputeSemesterConflicts(updated.semesterId)
  return prisma.timetableSlot.findUnique({ where: { id: slotId }, include: slotInclude })
}

async function deleteSlot(reqUser, slotId) {
  const existing = await prisma.timetableSlot.findUnique({
    where: { id: slotId },
    include: { course: { select: { code: true } } },
  })
  if (!existing) throw ApiError.notFound('Timetable slot not found')

  // Log first (slotId set null on delete via SetNull relation).
  await prisma.timetableModification.create({
    data: {
      semesterId: existing.semesterId,
      slotId: existing.id,
      action: 'DELETED',
      changedBy: reqUser.id,
      previousData: slotSnapshot(existing),
      newData: null,
      description: `Deleted ${existing.course.code} from ${existing.day} ${SLOT_LABELS[existing.timeSlot]}`,
    },
  })

  await prisma.timetableSlot.delete({ where: { id: slotId } })
  await recomputeSemesterConflicts(existing.semesterId)
  return { id: slotId }
}

module.exports = { generate, getSemesterSlots, createSlot, updateSlot, deleteSlot }
