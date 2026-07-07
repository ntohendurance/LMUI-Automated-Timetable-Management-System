// ============================================================================
// Adapters — translate backend records (Prisma enums, nested relations) into
// the UI-friendly shapes the existing components already expect.
// ============================================================================

// ---- Enum ⇄ label maps ----
export const LEVEL_TO_LABEL = {
  YEAR_1: 'Year 1',
  YEAR_2: 'Year 2',
  YEAR_3: 'Year 3',
  YEAR_4: 'Year 4',
}
export const LABEL_TO_LEVEL = {
  'Year 1': 'YEAR_1',
  'Year 2': 'YEAR_2',
  'Year 3': 'YEAR_3',
  'Year 4': 'YEAR_4',
}

export const DAY_TO_FULL = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
}
export const FULL_TO_DAY = {
  Monday: 'MON',
  Tuesday: 'TUE',
  Wednesday: 'WED',
  Thursday: 'THU',
  Friday: 'FRI',
  Saturday: 'SAT',
}
export const DAY_TO_SHORT = { MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat' }
export const SHORT_TO_DAY = { Mon: 'MON', Tue: 'TUE', Wed: 'WED', Thu: 'THU', Fri: 'FRI', Sat: 'SAT' }

// Time slots — keep the same ids the UI grid uses (ts1..ts5).
export const TIME_SLOTS = [
  { id: 'ts1', enum: 'SLOT_8_10', label: '8 – 10 AM' },
  { id: 'ts2', enum: 'SLOT_10_12', label: '10 – 12 PM' },
  { id: 'ts3', enum: 'SLOT_12_14', label: '12 – 2 PM' },
  { id: 'ts4', enum: 'SLOT_14_16', label: '2 – 4 PM' },
  { id: 'ts5', enum: 'SLOT_16_18', label: '4 – 6 PM' },
]
export const SLOT_ENUM_TO_TSID = Object.fromEntries(TIME_SLOTS.map((t) => [t.enum, t.id]))
export const TSID_TO_SLOT_ENUM = Object.fromEntries(TIME_SLOTS.map((t) => [t.id, t.enum]))
export const SLOT_ENUM_TO_LABEL = Object.fromEntries(TIME_SLOTS.map((t) => [t.enum, t.label]))

export const STATUS_TO_LABEL = { DRAFT: 'Draft', PUBLISHED: 'Published', ARCHIVED: 'Archived' }
export const SEMTERM_TO_LABEL = { SEMESTER_1: 'Semester 1', SEMESTER_2: 'Semester 2' }

export const PERIOD_TO_LABEL = { MORNING: 'Morning', AFTERNOON: 'Afternoon', EVENING: 'Evening' }
export const LABEL_TO_PERIOD = { Morning: 'MORNING', Afternoon: 'AFTERNOON', Evening: 'EVENING' }

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// ---- Record adapters ----
export function adaptSemester(s) {
  if (!s) return null
  return {
    id: s.id,
    academicYear: s.academicYear,
    semester: SEMTERM_TO_LABEL[s.semester] || s.semester,
    semesterEnum: s.semester,
    label: `${s.academicYear} — ${SEMTERM_TO_LABEL[s.semester] || s.semester}`,
    status: STATUS_TO_LABEL[s.status] || s.status,
    statusEnum: s.status,
    startDate: s.startDate,
    endDate: s.endDate,
    dateGenerated: s.generatedAt || s.createdAt,
    publishedAt: s.publishedAt,
    archivedAt: s.archivedAt,
    slotCount: s._count?.timetableSlots ?? s.timetableSlots?.length ?? 0,
  }
}

export function adaptDepartment(d) {
  if (!d) return null
  return {
    id: d.id,
    name: d.name,
    code: d.code,
    courseCount: d._count?.courses ?? 0,
    lecturerCount: d._count?.lecturers ?? 0,
    studentCount: d._count?.students ?? 0,
  }
}

export function adaptCourse(c) {
  if (!c) return null
  return {
    id: c.id,
    code: c.code,
    title: c.title,
    creditUnits: c.creditUnits,
    department: c.department?.name || '',
    departmentId: c.departmentId,
    level: LEVEL_TO_LABEL[c.level] || c.level,
    levelEnum: c.level,
    lecturerId: c.lecturerId || '',
    lecturerName: c.lecturer?.user?.name || '',
    preferredTimeSlot: c.preferredTimeSlot || '',
    preferredDay: c.preferredDay || '',
  }
}

export function adaptLecturer(l) {
  if (!l) return null
  return {
    id: l.id,
    userId: l.user?.id,
    name: l.user?.name || '',
    email: l.user?.email || '',
    staffId: l.staffId,
    department: l.department?.name || '',
    departmentId: l.departmentId,
    availableDays: (l.availableDays || []).map((d) => DAY_TO_FULL[d] || d),
    availableDaysEnum: l.availableDays || [],
    preferredSlots: (l.preferredTimeSlots || []).map((p) => PERIOD_TO_LABEL[p] || p),
    preferredTimeSlots: l.preferredTimeSlots || [],
    availability: (l.availableDays || []).length > 0 ? 'Available' : 'Unavailable',
    isApproved: l.isApproved !== false, // default to approved when field is absent
    courseCount: l._count?.courses ?? 0,
    courses: (l.courses || []).map((c) => ({
      id: c.id,
      code: c.code,
      title: c.title,
      level: LEVEL_TO_LABEL[c.level] || c.level,
    })),
  }
}

export function adaptStudent(s) {
  if (!s) return null
  return {
    id: s.id,
    userId: s.user?.id,
    name: s.user?.name || '',
    email: s.user?.email || '',
    matricule: s.matricule,
    department: s.department?.name || '',
    departmentId: s.departmentId,
    level: LEVEL_TO_LABEL[s.level] || s.level,
    levelEnum: s.level,
  }
}

export function adaptBuilding(b) {
  if (!b) return null
  return { id: b.id, name: b.name, rooms: b.rooms || [] }
}

export function adaptRoom(r) {
  if (!r) return null
  return {
    id: r.id,
    roomId: r.name, // UI shows a "Room ID" column; backend room name doubles as the code
    name: r.name,
    capacity: r.capacity,
    buildingId: r.buildingId,
    building: r.building?.name || '',
  }
}

// Timetable slot — self-contained for the grid + carries raw ids/enums for edit.
export function adaptSlot(s) {
  if (!s) return null
  return {
    id: s.id,
    semesterId: s.semesterId,
    day: DAY_TO_FULL[s.day] || s.day,
    dayEnum: s.day,
    timeSlotId: SLOT_ENUM_TO_TSID[s.timeSlot] || s.timeSlot,
    timeSlotEnum: s.timeSlot,
    courseId: s.courseId,
    courseCode: s.course?.code || '',
    courseTitle: s.course?.title || '',
    lecturerId: s.lecturerId,
    lecturerName: s.lecturer?.user?.name || '',
    roomId: s.roomId,
    roomName: s.room?.name || '',
    departmentId: s.departmentId,
    department: s.department?.name || '',
    level: LEVEL_TO_LABEL[s.level] || s.level,
    levelEnum: s.level,
    conflict: s.hasConflict ? s.conflictReason || 'Scheduling conflict' : null,
  }
}

export function adaptModification(m) {
  if (!m) return null
  return {
    id: m.id,
    semesterId: m.semesterId,
    action: m.description,
    by: m.user?.name || 'Admin',
    timestamp: m.createdAt,
  }
}
