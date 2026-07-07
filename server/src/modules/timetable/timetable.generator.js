// ============================================================================
// Constraint-based greedy timetable scheduler (pure JavaScript).
//
// Produces an array of slot objects ready to be inserted as TimetableSlot rows:
//   { semesterId, courseId, lecturerId, roomId, day, timeSlot, level,
//     departmentId, hasConflict, conflictReason }
// plus a list of unscheduled courses (those for which no valid slot existed).
// ============================================================================

const {
  DAYS,
  TIME_SLOTS,
  SLOT_PERIOD,
  SLOT_INDEX,
  DEFAULT_CLASS_SIZE,
} = require('../../utils/constants')

/**
 * @param {Object} input
 * @param {string} input.semesterId
 * @param {Array}  input.courses    courses with { id, departmentId, lecturerId, level, preferredDay, preferredTimeSlot }
 * @param {Array}  input.lecturers  lecturers with { id, availableDays, preferredTimeSlots }
 * @param {Array}  input.rooms      rooms with { id, capacity }
 * @param {Object} input.constraints soft-constraint flags
 * @returns {{ slots: Array, unscheduled: Array }}
 */
function generateTimetable({ semesterId, courses, lecturers, rooms, constraints = {} }) {
  const {
    avoidBackToBack = false,
    balanceWorkload = false,
    respectCapacity = false,
    groupByLevelAndDept = false,
  } = constraints

  const lecturerById = new Map(lecturers.map((l) => [l.id, l]))

  // Occupancy trackers (hard constraints)
  const lecturerBusy = new Set() // lecturerId__day__slot
  const roomBusy = new Set() // roomId__day__slot
  const groupBusy = new Set() // deptId__level__day__slot

  // Soft-constraint bookkeeping
  const lecturerDayCount = new Map() // lecturerId__day -> count (workload spread / back-to-back)
  const lecturerSlotsByDay = new Map() // lecturerId__day -> Set(slotIndex)
  const groupSlotsByDay = new Map() // deptId__level__day -> Set(slotIndex) (adjacency grouping)

  const key = (...parts) => parts.join('__')
  const addToSetMap = (map, k, v) => {
    if (!map.has(k)) map.set(k, new Set())
    map.get(k).add(v)
  }

  const slots = []
  const unscheduled = []

  // Schedule courses that have a lecturer; courses without a lecturer cannot be placed.
  const schedulable = courses.filter((c) => c.lecturerId && lecturerById.has(c.lecturerId))
  for (const c of courses) {
    if (!c.lecturerId || !lecturerById.has(c.lecturerId)) {
      unscheduled.push({ courseId: c.id, reason: 'No lecturer assigned to this course.' })
    }
  }

  // Order: courses with explicit preferences and tighter lecturer availability first.
  schedulable.sort((a, b) => {
    const la = lecturerById.get(a.lecturerId)
    const lb = lecturerById.get(b.lecturerId)
    const availA = (la.availableDays || DAYS).length
    const availB = (lb.availableDays || DAYS).length
    const prefA = (a.preferredDay ? 1 : 0) + (a.preferredTimeSlot ? 1 : 0)
    const prefB = (b.preferredDay ? 1 : 0) + (b.preferredTimeSlot ? 1 : 0)
    // Fewer available days = harder to place → schedule earlier.
    if (availA !== availB) return availA - availB
    return prefB - prefA
  })

  const classSize = DEFAULT_CLASS_SIZE

  for (const course of schedulable) {
    const lecturer = lecturerById.get(course.lecturerId)
    const availableDays = (lecturer.availableDays && lecturer.availableDays.length
      ? lecturer.availableDays
      : DAYS
    ).filter((d) => DAYS.includes(d))

    let best = null // { day, timeSlot, roomId, score }

    for (const day of availableDays) {
      for (const timeSlot of TIME_SLOTS) {
        // HARD: lecturer free this day+slot
        if (lecturerBusy.has(key(lecturer.id, day, timeSlot))) continue
        // HARD: student group (dept+level) free this day+slot
        if (groupBusy.has(key(course.departmentId, course.level, day, timeSlot))) continue

        for (const room of rooms) {
          // HARD: room free this day+slot
          if (roomBusy.has(key(room.id, day, timeSlot))) continue
          // HARD: room capacity must fit the class
          if (room.capacity < classSize) continue

          // ---- scoring (higher is better) ----
          let score = 0

          // Honour course preferences (always mildly preferred)
          if (course.preferredDay && course.preferredDay === day) score += 6
          if (course.preferredTimeSlot && SLOT_PERIOD[timeSlot] === course.preferredTimeSlot)
            score += 6

          // Honour lecturer preferred periods
          if (
            lecturer.preferredTimeSlots &&
            lecturer.preferredTimeSlots.includes(SLOT_PERIOD[timeSlot])
          ) {
            score += 4
          }

          // SOFT: respectCapacity — prefer rooms closest to class size
          if (respectCapacity) {
            const waste = room.capacity - classSize
            score += Math.max(0, 10 - waste / 5)
          }

          // SOFT: balanceWorkload — prefer days where this lecturer has fewer classes
          if (balanceWorkload) {
            const load = lecturerDayCount.get(key(lecturer.id, day)) || 0
            score += Math.max(0, 6 - load * 2)
          }

          // SOFT: avoidBackToBack — penalise adjacency to existing lecturer slots
          if (avoidBackToBack) {
            const daySlots = lecturerSlotsByDay.get(key(lecturer.id, day))
            if (daySlots) {
              const idx = SLOT_INDEX[timeSlot]
              if (daySlots.has(idx - 1) || daySlots.has(idx + 1)) score -= 5
            }
          }

          // SOFT: groupByLevelAndDept — prefer slots adjacent to same group's classes
          if (groupByLevelAndDept) {
            const gSlots = groupSlotsByDay.get(key(course.departmentId, course.level, day))
            if (gSlots) {
              const idx = SLOT_INDEX[timeSlot]
              if (gSlots.has(idx - 1) || gSlots.has(idx + 1)) score += 5
            }
          }

          // Slight preference for earlier days/slots to keep timetables compact.
          score += (DAYS.length - DAYS.indexOf(day)) * 0.2
          score += (TIME_SLOTS.length - SLOT_INDEX[timeSlot]) * 0.1

          if (!best || score > best.score) {
            best = { day, timeSlot, roomId: room.id, score }
          }
        }
      }
    }

    if (!best) {
      unscheduled.push({
        courseId: course.id,
        reason: 'No valid (day, time, room) combination satisfied all hard constraints.',
      })
      continue
    }

    // Commit assignment + update trackers
    lecturerBusy.add(key(lecturer.id, best.day, best.timeSlot))
    roomBusy.add(key(best.roomId, best.day, best.timeSlot))
    groupBusy.add(key(course.departmentId, course.level, best.day, best.timeSlot))

    lecturerDayCount.set(
      key(lecturer.id, best.day),
      (lecturerDayCount.get(key(lecturer.id, best.day)) || 0) + 1
    )
    addToSetMap(lecturerSlotsByDay, key(lecturer.id, best.day), SLOT_INDEX[best.timeSlot])
    addToSetMap(
      groupSlotsByDay,
      key(course.departmentId, course.level, best.day),
      SLOT_INDEX[best.timeSlot]
    )

    slots.push({
      semesterId,
      courseId: course.id,
      lecturerId: lecturer.id,
      roomId: best.roomId,
      day: best.day,
      timeSlot: best.timeSlot,
      level: course.level,
      departmentId: course.departmentId,
      hasConflict: false,
      conflictReason: null,
    })
  }

  return { slots, unscheduled }
}

module.exports = { generateTimetable }
