// ============================================================================
// OFFLINE MOCK — replaces all API calls with in-memory mock data.
// Swap in via VITE_OFFLINE=true (npm run dev:offline).
// ============================================================================
import {
  SEMESTERS,
  TIMETABLE_SLOTS,
  COURSES,
  LECTURERS,
  STUDENTS,
  ROOMS,
  MODIFICATION_LOGS,
  DEMO_ACCOUNTS,
  DEPARTMENTS,
} from '../data/mockData.js'
import { tokenStore } from './client.js'

// ---------------------------------------------------------------------------
// In-memory mutable state (resets on page refresh — fine for a demo)
// ---------------------------------------------------------------------------
let _semesters = SEMESTERS.map((s) => ({ ...s }))
let _courses = COURSES.map((c) => ({ ...c }))
let _lecturers = LECTURERS.map((l) => ({ ...l }))
let _students = STUDENTS.map((s) => ({ ...s }))
let _rooms = ROOMS.map((r) => ({ ...r }))
let _slots = TIMETABLE_SLOTS.map((s) => ({ ...s }))
let _mods = MODIFICATION_LOGS.map((m) => ({ ...m }))

// ---------------------------------------------------------------------------
// Lookup maps
// ---------------------------------------------------------------------------
const DEPT_MAP = {
  'Computer Graphics and Web Design': { id: 'dept-cgd', code: 'CGD' },
  'Software Engineering': { id: 'dept-cs', code: 'SWE' },
  'Information Technology': { id: 'dept-it', code: 'IT' },
}
const BLDG_MAP = {
  'Main Block': 'bld-main',
  'Design Wing': 'bld-design',
  'Tech Wing': 'bld-tech',
  Annex: 'bld-annex',
}
const BLDG_NAMES = ['Main Block', 'Design Wing', 'Tech Wing', 'Annex']

const STATUS_ENUM = { Draft: 'DRAFT', Published: 'PUBLISHED', Archived: 'ARCHIVED' }
const LEVEL_ENUM = { 'Year 1': 'YEAR_1', 'Year 2': 'YEAR_2', 'Year 3': 'YEAR_3', 'Year 4': 'YEAR_4' }
const PERIOD_ENUM = { Morning: 'MORNING', Afternoon: 'AFTERNOON', Evening: 'EVENING' }
const DAY_ENUM = {
  Monday: 'MON', Tuesday: 'TUE', Wednesday: 'WED',
  Thursday: 'THU', Friday: 'FRI', Saturday: 'SAT',
}
const SLOT_ENUM = {
  ts1: 'SLOT_8_10', ts2: 'SLOT_10_12', ts3: 'SLOT_12_14',
  ts4: 'SLOT_14_16', ts5: 'SLOT_16_18',
}

// ---------------------------------------------------------------------------
// Adapters — produce the same shape as the real endpoints + adapters
// ---------------------------------------------------------------------------
function adaptDept(name) {
  const d = DEPT_MAP[name] || { id: `dept-${name}`, code: name.slice(0, 3).toUpperCase() }
  return {
    id: d.id,
    name,
    code: d.code,
    courseCount: _courses.filter((c) => c.department === name).length,
    lecturerCount: _lecturers.filter((l) => l.department === name).length,
    studentCount: _students.filter((s) => s.department === name).length,
  }
}

function adaptBuilding(name) {
  return { id: BLDG_MAP[name] || `bld-${name}`, name, rooms: [] }
}

function adaptRoom(r) {
  return {
    id: r.id,
    roomId: r.roomId,
    name: r.name,
    capacity: r.capacity,
    buildingId: BLDG_MAP[r.building] || r.building,
    building: r.building,
  }
}

function adaptLecturer(l) {
  const deptId = DEPT_MAP[l.department]?.id || l.department
  return {
    id: l.id,
    userId: l.id,
    name: l.name,
    email: l.email,
    staffId: l.staffId,
    department: l.department,
    departmentId: deptId,
    availableDays: l.availableDays,
    availableDaysEnum: l.availableDays.map((d) => DAY_ENUM[d] || d),
    preferredSlots: l.preferredSlots,
    preferredTimeSlots: l.preferredSlots.map((p) => PERIOD_ENUM[p] || p),
    availability: l.availability,
    isApproved: true,
    courseCount: _courses.filter((c) => c.lecturerId === l.id).length,
    courses: _courses
      .filter((c) => c.lecturerId === l.id)
      .map((c) => ({ id: c.id, code: c.code, title: c.title, level: c.level })),
  }
}

function adaptStudent(s) {
  return {
    id: s.id,
    userId: s.id,
    name: s.name,
    email: s.email,
    matricule: s.matricule,
    department: s.department,
    departmentId: DEPT_MAP[s.department]?.id || s.department,
    level: s.level,
    levelEnum: LEVEL_ENUM[s.level] || s.level,
  }
}

function adaptCourse(c) {
  const lec = _lecturers.find((l) => l.id === c.lecturerId)
  return {
    id: c.id,
    code: c.code,
    title: c.title,
    creditUnits: c.creditUnits,
    department: c.department,
    departmentId: DEPT_MAP[c.department]?.id || c.department,
    level: c.level,
    levelEnum: LEVEL_ENUM[c.level] || c.level,
    lecturerId: c.lecturerId || '',
    lecturerName: lec?.name || '',
    preferredTimeSlot: SLOT_ENUM[c.preferredSlot] || '',
    preferredDay: c.preferredDay || '',
  }
}

function adaptSemester(s) {
  return {
    id: s.id,
    academicYear: s.academicYear,
    semester: s.semester,
    semesterEnum: s.semester === 'Semester 1' ? 'SEMESTER_1' : 'SEMESTER_2',
    label: s.label,
    status: s.status,
    statusEnum: STATUS_ENUM[s.status] || 'DRAFT',
    startDate: s.startDate,
    endDate: s.endDate,
    dateGenerated: s.dateGenerated,
    publishedAt: s.status === 'Published' ? s.dateGenerated : null,
    archivedAt: s.status === 'Archived' ? s.endDate : null,
    slotCount: _slots.filter((sl) => sl.semesterId === s.id).length,
  }
}

function adaptSlot(sl) {
  const course = _courses.find((c) => c.id === sl.courseId) || {}
  const lec = _lecturers.find((l) => l.id === sl.lecturerId) || {}
  const room = _rooms.find((r) => r.id === sl.roomId) || {}
  const dept = course.department || ''
  return {
    id: sl.id,
    semesterId: sl.semesterId,
    day: sl.day,
    dayEnum: DAY_ENUM[sl.day] || sl.day,
    timeSlotId: sl.timeSlotId,
    timeSlotEnum: SLOT_ENUM[sl.timeSlotId] || sl.timeSlotId,
    courseId: sl.courseId,
    courseCode: course.code || '',
    courseTitle: course.title || '',
    lecturerId: sl.lecturerId,
    lecturerName: lec.name || '',
    roomId: sl.roomId,
    roomName: room.name || '',
    departmentId: DEPT_MAP[dept]?.id || '',
    department: dept,
    level: course.level || '',
    levelEnum: LEVEL_ENUM[course.level] || '',
    conflict: sl.conflict || null,
  }
}

function adaptMod(m) {
  return { id: m.id, semesterId: m.semesterId, action: m.action, by: m.by, timestamp: m.timestamp }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const delay = (ms) => new Promise((r) => setTimeout(r, ms))

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function _buildRawUser(acc) {
  return {
    id: acc.id,
    name: acc.name,
    email: acc.email,
    role: acc.role,
    department: acc.department || '',
    staffId: acc.staffId || null,
    matricule: acc.matricule || null,
    level: acc.level || null,
  }
}

function _currentRole() {
  const token = tokenStore.get()
  return token?.startsWith('mock:') ? token.split(':')[1] : null
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const authApi = {
  async login({ email, password, role }) {
    await delay(400)
    const acc = DEMO_ACCOUNTS[role]
    // Accept any password in offline demo — just match email+role
    if (!acc || acc.email.toLowerCase() !== email.toLowerCase()) {
      // Try to find by role regardless of email for convenience
      const fallback = Object.values(DEMO_ACCOUNTS).find((a) => a.role === role)
      if (!fallback) throw Object.assign(new Error('Invalid credentials'), { status: 401 })
      tokenStore.set(`mock:${role}`)
      return { token: `mock:${role}`, user: _buildRawUser(fallback) }
    }
    tokenStore.set(`mock:${role}`)
    return { token: `mock:${role}`, user: _buildRawUser(acc) }
  },

  async signup(payload) {
    await delay(500)
    // Offline: lecturers go pending, students get instant access
    if (payload.role === 'lecturer' || payload.role === 'LECTURER') {
      return { pending: true, user: { name: payload.name, email: payload.email } }
    }
    const newStudent = {
      id: `s-${uid()}`,
      name: payload.name,
      email: payload.email,
      matricule: payload.matricule || `LMUI/NEW/${uid().toUpperCase()}`,
      department: payload.department || 'Software Engineering',
      level: 'Year 1',
      role: 'student',
    }
    tokenStore.set(`mock:student`)
    return { token: `mock:student`, user: _buildRawUser({ ...newStudent, role: 'student' }) }
  },

  async publicDepartments() {
    await delay(200)
    return DEPARTMENTS.map((name) => adaptDept(name))
  },

  async me() {
    await delay(100)
    const role = _currentRole()
    if (!role) throw Object.assign(new Error('Unauthorized'), { status: 401 })
    const acc = DEMO_ACCOUNTS[role]
    if (!acc) throw Object.assign(new Error('Unauthorized'), { status: 401 })
    return _buildRawUser(acc)
  },

  async changePassword() {
    await delay(300)
    return { message: 'Password updated (demo mode — not persisted)' }
  },

  async forgotPassword(email) {
    await delay(400)
    return { resetToken: 'mock-reset-token', name: 'Demo User', email }
  },

  async resetPassword() {
    await delay(300)
    return { message: 'Password reset (demo mode)' }
  },

  logout() {
    tokenStore.clear()
  },
}

// ---------------------------------------------------------------------------
// Departments
// ---------------------------------------------------------------------------
export const departmentApi = {
  async list() {
    await delay(200)
    return DEPARTMENTS.map(adaptDept)
  },
  async create({ name }) {
    await delay(300)
    const d = { id: `dept-${uid()}`, name, code: name.slice(0, 3).toUpperCase() }
    return { id: d.id, name: d.name, code: d.code, courseCount: 0, lecturerCount: 0, studentCount: 0 }
  },
  async update(id, { name }) {
    await delay(200)
    return { id, name, code: name.slice(0, 3).toUpperCase(), courseCount: 0, lecturerCount: 0, studentCount: 0 }
  },
  async remove() { await delay(200) },
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------
export const courseApi = {
  async list({ department, level, search, page = 1, limit = 100 } = {}) {
    await delay(250)
    let items = _courses.map(adaptCourse)
    if (department) items = items.filter((c) => c.department === department || c.departmentId === department)
    if (level) items = items.filter((c) => c.level === level || c.levelEnum === level)
    if (search) {
      const q = search.toLowerCase()
      items = items.filter((c) => c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
    }
    const total = items.length
    items = items.slice((page - 1) * limit, page * limit)
    return { items, pagination: { page, totalPages: Math.ceil(total / limit), total } }
  },
  async create(form) {
    await delay(350)
    const newCourse = {
      id: `c-${uid()}`,
      code: form.code,
      title: form.title,
      creditUnits: Number(form.creditUnits),
      department: DEPARTMENTS.find((_, i) =>
        Object.values(DEPT_MAP)[i]?.id === form.departmentId
      ) || form.department || '',
      lecturerId: form.lecturerId || null,
      level: form.level,
      preferredSlot: form.preferredTimeSlot || null,
    }
    // Resolve department name from id
    const deptEntry = Object.entries(DEPT_MAP).find(([, v]) => v.id === form.departmentId)
    if (deptEntry) newCourse.department = deptEntry[0]
    _courses.push(newCourse)
    return adaptCourse(newCourse)
  },
  async update(id, form) {
    await delay(300)
    const idx = _courses.findIndex((c) => c.id === id)
    if (idx !== -1) {
      const deptEntry = Object.entries(DEPT_MAP).find(([, v]) => v.id === form.departmentId)
      _courses[idx] = {
        ..._courses[idx],
        ...form,
        department: deptEntry ? deptEntry[0] : _courses[idx].department,
      }
    }
    return adaptCourse(_courses[idx] || _courses[0])
  },
  async remove(id) {
    await delay(250)
    _courses = _courses.filter((c) => c.id !== id)
  },
}

// ---------------------------------------------------------------------------
// Lecturers
// ---------------------------------------------------------------------------
export const lecturerApi = {
  async list() {
    await delay(250)
    return _lecturers.map(adaptLecturer)
  },
  async getOne(id) {
    await delay(150)
    const l = _lecturers.find((l) => l.id === id)
    if (!l) throw Object.assign(new Error('Not found'), { status: 404 })
    return adaptLecturer(l)
  },
  async create(form) {
    await delay(400)
    const deptEntry = Object.entries(DEPT_MAP).find(([, v]) => v.id === form.departmentId)
    const newLec = {
      id: `lec-${uid()}`,
      name: form.name,
      email: form.email,
      staffId: form.staffId || `LMUI/STF/${uid().toUpperCase().slice(0, 4)}`,
      department: deptEntry ? deptEntry[0] : form.department || '',
      availableDays: form.availableDays || [],
      preferredSlots: (form.preferredTimeSlots || []).map((p) => {
        const rev = { MORNING: 'Morning', AFTERNOON: 'Afternoon', EVENING: 'Evening' }
        return rev[p] || p
      }),
      availability: (form.availableDays || []).length > 0 ? 'Available' : 'Unavailable',
    }
    _lecturers.push(newLec)
    return adaptLecturer(newLec)
  },
  async update(id, form) {
    await delay(300)
    const idx = _lecturers.findIndex((l) => l.id === id)
    if (idx !== -1) {
      const deptEntry = form.departmentId
        ? Object.entries(DEPT_MAP).find(([, v]) => v.id === form.departmentId)
        : null
      const days = form.availableDays || _lecturers[idx].availableDays
      _lecturers[idx] = {
        ..._lecturers[idx],
        ...(form.name && { name: form.name }),
        ...(form.email && { email: form.email }),
        ...(form.staffId && { staffId: form.staffId }),
        ...(deptEntry && { department: deptEntry[0] }),
        availableDays: days,
        availability: days.length > 0 ? 'Available' : 'Unavailable',
      }
    }
    return adaptLecturer(_lecturers[idx] || _lecturers[0])
  },
  async approve(id, isApproved = true) {
    await delay(200)
    const l = _lecturers.find((l) => l.id === id)
    return adaptLecturer(l || _lecturers[0])
  },
  async remove(id) {
    await delay(250)
    _lecturers = _lecturers.filter((l) => l.id !== id)
  },
}

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------
export const studentApi = {
  async list({ department, level, search, page = 1, limit = 100 } = {}) {
    await delay(250)
    let items = _students.map(adaptStudent)
    if (department) items = items.filter((s) => s.department === department || s.departmentId === department)
    if (level) items = items.filter((s) => s.level === level || s.levelEnum === level)
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (s) => s.name.toLowerCase().includes(q) || s.matricule.toLowerCase().includes(q)
      )
    }
    const total = items.length
    items = items.slice((page - 1) * limit, page * limit)
    return { items, pagination: { page, totalPages: Math.ceil(total / limit), total } }
  },
  async create(form) {
    await delay(350)
    const deptEntry = Object.entries(DEPT_MAP).find(([, v]) => v.id === form.departmentId)
    const newStudent = {
      id: `s-${uid()}`,
      name: form.name,
      email: form.email,
      matricule: form.matricule,
      department: deptEntry ? deptEntry[0] : form.department || '',
      level: form.level,
    }
    _students.push(newStudent)
    return adaptStudent(newStudent)
  },
  async update(id, form) {
    await delay(300)
    const idx = _students.findIndex((s) => s.id === id)
    if (idx !== -1) {
      const deptEntry = form.departmentId
        ? Object.entries(DEPT_MAP).find(([, v]) => v.id === form.departmentId)
        : null
      _students[idx] = {
        ..._students[idx],
        ...(form.name && { name: form.name }),
        ...(form.email && { email: form.email }),
        ...(form.matricule && { matricule: form.matricule }),
        ...(deptEntry && { department: deptEntry[0] }),
        ...(form.level && { level: form.level }),
      }
    }
    return adaptStudent(_students[idx] || _students[0])
  },
  async remove(id) {
    await delay(250)
    _students = _students.filter((s) => s.id !== id)
  },
}

// ---------------------------------------------------------------------------
// Rooms
// ---------------------------------------------------------------------------
export const roomApi = {
  async list() {
    await delay(200)
    return _rooms.map(adaptRoom)
  },
  async create(form) {
    await delay(350)
    const bldgEntry = Object.entries(BLDG_MAP).find(([, v]) => v === form.buildingId)
    const newRoom = {
      id: `r-${uid()}`,
      roomId: form.name,
      name: form.name,
      capacity: Number(form.capacity),
      building: bldgEntry ? bldgEntry[0] : 'Main Block',
    }
    _rooms.push(newRoom)
    return adaptRoom(newRoom)
  },
  async update(id, form) {
    await delay(300)
    const idx = _rooms.findIndex((r) => r.id === id)
    if (idx !== -1) {
      const bldgEntry = form.buildingId
        ? Object.entries(BLDG_MAP).find(([, v]) => v === form.buildingId)
        : null
      _rooms[idx] = {
        ..._rooms[idx],
        ...(form.name && { name: form.name, roomId: form.name }),
        ...(form.capacity && { capacity: Number(form.capacity) }),
        ...(bldgEntry && { building: bldgEntry[0] }),
      }
    }
    return adaptRoom(_rooms[idx] || _rooms[0])
  },
  async remove(id) {
    await delay(250)
    _rooms = _rooms.filter((r) => r.id !== id)
  },
}

// ---------------------------------------------------------------------------
// Buildings
// ---------------------------------------------------------------------------
export const buildingApi = {
  async list() {
    await delay(150)
    return BLDG_NAMES.map(adaptBuilding)
  },
  async create(name) {
    await delay(300)
    return adaptBuilding(name)
  },
  async update(id, name) {
    await delay(200)
    return { id, name, rooms: [] }
  },
  async remove() { await delay(200) },
}

// ---------------------------------------------------------------------------
// Semesters
// ---------------------------------------------------------------------------
export const semesterApi = {
  async list() {
    await delay(250)
    return _semesters.map(adaptSemester)
  },
  async getOne(id) {
    await delay(200)
    const s = _semesters.find((s) => s.id === id)
    if (!s) throw Object.assign(new Error('Not found'), { status: 404 })
    return {
      semester: adaptSemester(s),
      slots: _slots.filter((sl) => sl.semesterId === id).map(adaptSlot),
    }
  },
  async active() {
    await delay(150)
    const s = _semesters.find((s) => s.status === 'Published') || _semesters[0]
    return adaptSemester(s)
  },
  async create(form) {
    await delay(400)
    const newSem = {
      id: `sem-${uid()}`,
      academicYear: form.academicYear,
      semester: form.semester || 'Semester 1',
      label: `${form.academicYear} — ${form.semester || 'Semester 1'}`,
      status: 'Draft',
      startDate: form.startDate,
      endDate: form.endDate,
      dateGenerated: new Date().toISOString().split('T')[0],
    }
    _semesters.push(newSem)
    return adaptSemester(newSem)
  },
  async publish(id) {
    await delay(300)
    _semesters = _semesters.map((s) => {
      if (s.id === id) return { ...s, status: 'Published' }
      if (s.status === 'Published') return { ...s, status: 'Archived' }
      return s
    })
    const s = _semesters.find((s) => s.id === id)
    _mods.unshift({
      id: `m-${uid()}`,
      semesterId: id,
      action: `Timetable for ${s?.label} published`,
      by: 'Admin',
      timestamp: new Date().toISOString(),
    })
    return adaptSemester(s)
  },
  async archive(id) {
    await delay(300)
    _semesters = _semesters.map((s) => (s.id === id ? { ...s, status: 'Archived' } : s))
    const s = _semesters.find((s) => s.id === id)
    return adaptSemester(s)
  },
  async remove(id) {
    await delay(250)
    _semesters = _semesters.filter((s) => s.id !== id)
  },
}

// ---------------------------------------------------------------------------
// Timetable
// ---------------------------------------------------------------------------
const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SLOT_IDS = ['ts1', 'ts2', 'ts3', 'ts4', 'ts5']

export const timetableApi = {
  async generate(semesterId, constraints) {
    // Simulate AI scheduling — takes ~2 s, then produces conflict-free slots
    await delay(2000)

    // Remove any existing draft slots for this semester
    _slots = _slots.filter((s) => s.semesterId !== semesterId)

    // Simple greedy placement: assign each course a unique day+slot
    const usedCells = new Set()
    const newSlots = []
    let coursePool = [..._courses]

    for (const course of coursePool) {
      let placed = false
      for (const day of DAYS_ORDER) {
        for (const tsId of SLOT_IDS) {
          const lecKey = `${course.lecturerId}:${day}:${tsId}`
          const roomCandidates = _rooms.filter((r) => !usedCells.has(`${r.id}:${day}:${tsId}`))
          if (usedCells.has(lecKey) || roomCandidates.length === 0) continue
          const room = roomCandidates[0]
          const slot = {
            id: `sl-gen-${uid()}`,
            semesterId,
            courseId: course.id,
            lecturerId: course.lecturerId,
            roomId: room.id,
            day,
            timeSlotId: tsId,
          }
          _slots.push(slot)
          usedCells.add(lecKey)
          usedCells.add(`${room.id}:${day}:${tsId}`)
          placed = true
          break
        }
        if (placed) break
      }
    }

    const resultSlots = _slots.filter((s) => s.semesterId === semesterId)

    // Log the generation
    _mods.unshift({
      id: `m-${uid()}`,
      semesterId,
      action: `Timetable generated (${resultSlots.length} slots placed, 0 conflicts)`,
      by: 'Admin',
      timestamp: new Date().toISOString(),
    })

    return {
      semesterId,
      slots: resultSlots.map(adaptSlot),
      stats: { placed: resultSlots.length, conflicts: 0 },
    }
  },

  async forSemester(semesterId, filters = {}) {
    await delay(250)
    let slots = _slots.filter((s) => s.semesterId === semesterId).map(adaptSlot)
    if (filters.department) {
      slots = slots.filter(
        (s) => s.department === filters.department || s.departmentId === filters.department
      )
    }
    if (filters.level) {
      slots = slots.filter((s) => s.level === filters.level || s.levelEnum === filters.level)
    }
    if (filters.lecturer) {
      slots = slots.filter((s) => s.lecturerId === filters.lecturer)
    }
    if (filters.day) {
      slots = slots.filter((s) => s.day === filters.day || s.dayEnum === filters.day)
    }
    return slots
  },

  async createSlot(form) {
    await delay(350)
    const newSlot = {
      id: `sl-${uid()}`,
      semesterId: form.semesterId,
      courseId: form.courseId,
      lecturerId: form.lecturerId,
      roomId: form.roomId,
      day: form.day,
      timeSlotId: form.timeSlotId,
    }
    _slots.push(newSlot)
    _mods.unshift({
      id: `m-${uid()}`,
      semesterId: form.semesterId,
      action: `Slot added manually by Admin`,
      by: 'Admin',
      timestamp: new Date().toISOString(),
    })
    return adaptSlot(newSlot)
  },

  async updateSlot(slotId, form) {
    await delay(300)
    const idx = _slots.findIndex((s) => s.id === slotId)
    if (idx !== -1) {
      _slots[idx] = { ..._slots[idx], ...form }
      _mods.unshift({
        id: `m-${uid()}`,
        semesterId: _slots[idx].semesterId,
        action: `Slot updated by Admin`,
        by: 'Admin',
        timestamp: new Date().toISOString(),
      })
    }
    return adaptSlot(_slots[idx] || _slots[0])
  },

  async deleteSlot(slotId) {
    await delay(250)
    _slots = _slots.filter((s) => s.id !== slotId)
  },
}

// ---------------------------------------------------------------------------
// Modifications
// ---------------------------------------------------------------------------
export const modificationApi = {
  async forSemester(semesterId, { page = 1, limit = 100 } = {}) {
    await delay(200)
    const items = _mods
      .filter((m) => m.semesterId === semesterId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice((page - 1) * limit, page * limit)
    return items.map(adaptMod)
  },
}
