import api, { tokenStore } from './client.js'
import {
  adaptSemester,
  adaptDepartment,
  adaptCourse,
  adaptLecturer,
  adaptStudent,
  adaptRoom,
  adaptBuilding,
  adaptSlot,
  adaptModification,
  LABEL_TO_LEVEL,
  TSID_TO_SLOT_ENUM,
  FULL_TO_DAY,
} from './adapters.js'

const data = (res) => res.data.data
const meta = (res) => res.data.pagination

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const authApi = {
  async login({ email, password, role }) {
    const res = await api.post('/auth/login', { email, password, role })
    const payload = res.data.data
    if (payload?.token) tokenStore.set(payload.token)
    return payload // { token, user }
  },
  async signup(payload) {
    const res = await api.post('/auth/signup', payload)
    const result = res.data.data
    if (result?.token) tokenStore.set(result.token)
    return result // { token, user }
  },
  async publicDepartments() {
    const res = await api.get('/auth/departments')
    return data(res) // [{ id, name, code }]
  },
  async me() {
    const res = await api.get('/auth/me')
    return data(res)
  },
  async changePassword({ currentPassword, newPassword }) {
    const res = await api.post('/auth/change-password', { currentPassword, newPassword })
    return res.data
  },
  async forgotPassword(email) {
    const res = await api.post('/auth/forgot-password', { email })
    return res.data.data // { resetToken, name, email }
  },
  async resetPassword(token, newPassword) {
    const res = await api.post('/auth/reset-password', { token, newPassword })
    return res.data
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
    const res = await api.get('/departments')
    return data(res).map(adaptDepartment)
  },
  async create(payload) {
    const res = await api.post('/departments', payload)
    return adaptDepartment(data(res))
  },
  async update(id, payload) {
    const res = await api.put(`/departments/${id}`, payload)
    return adaptDepartment(data(res))
  },
  async remove(id) {
    await api.delete(`/departments/${id}`)
  },
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------
function courseToApi(form) {
  return {
    code: form.code,
    title: form.title,
    creditUnits: Number(form.creditUnits),
    departmentId: form.departmentId,
    lecturerId: form.lecturerId || null,
    level: LABEL_TO_LEVEL[form.level] || form.level,
    preferredTimeSlot: form.preferredTimeSlot || null,
    preferredDay: form.preferredDay || null,
  }
}

export const courseApi = {
  async list({ department, level, search, page = 1, limit = 100 } = {}) {
    const res = await api.get('/courses', {
      params: {
        department: department || undefined,
        level: level ? LABEL_TO_LEVEL[level] || level : undefined,
        search: search || undefined,
        page,
        limit,
      },
    })
    return { items: data(res).map(adaptCourse), pagination: meta(res) }
  },
  async create(form) {
    const res = await api.post('/courses', courseToApi(form))
    return adaptCourse(data(res))
  },
  async update(id, form) {
    const res = await api.put(`/courses/${id}`, courseToApi(form))
    return adaptCourse(data(res))
  },
  async remove(id) {
    await api.delete(`/courses/${id}`)
  },
}

// ---------------------------------------------------------------------------
// Lecturers
// ---------------------------------------------------------------------------
export const lecturerApi = {
  async list() {
    const res = await api.get('/lecturers')
    return data(res).map(adaptLecturer)
  },
  async getOne(id) {
    const res = await api.get(`/lecturers/${id}`)
    return adaptLecturer(data(res))
  },
  async create(form) {
    const res = await api.post('/lecturers', {
      name: form.name,
      email: form.email,
      staffId: form.staffId || `LMUI/STF/${Date.now().toString().slice(-4)}`,
      departmentId: form.departmentId,
      availableDays: (form.availableDays || []).map((d) => FULL_TO_DAY[d] || d),
      preferredTimeSlots: form.preferredTimeSlots || ['MORNING', 'AFTERNOON'],
    })
    return adaptLecturer(data(res))
  },
  async update(id, form) {
    const payload = {}
    if (form.name) payload.name = form.name
    if (form.email) payload.email = form.email
    if (form.staffId) payload.staffId = form.staffId
    if (form.departmentId) payload.departmentId = form.departmentId
    if (form.availableDays)
      payload.availableDays = form.availableDays.map((d) => FULL_TO_DAY[d] || d)
    if (form.preferredTimeSlots) payload.preferredTimeSlots = form.preferredTimeSlots
    const res = await api.put(`/lecturers/${id}`, payload)
    return adaptLecturer(data(res))
  },
  async approve(id, isApproved = true) {
    const res = await api.put(`/lecturers/${id}/approve`, { isApproved })
    return adaptLecturer(data(res))
  },
  async remove(id) {
    await api.delete(`/lecturers/${id}`)
  },
}

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------
export const studentApi = {
  async list({ department, level, search, page = 1, limit = 100 } = {}) {
    const res = await api.get('/students', {
      params: {
        department: department || undefined,
        level: level ? LABEL_TO_LEVEL[level] || level : undefined,
        search: search || undefined,
        page,
        limit,
      },
    })
    return { items: data(res).map(adaptStudent), pagination: meta(res) }
  },
  async create(form) {
    const res = await api.post('/students', {
      name: form.name,
      email: form.email,
      matricule: form.matricule,
      departmentId: form.departmentId,
      level: LABEL_TO_LEVEL[form.level] || form.level,
    })
    return adaptStudent(data(res))
  },
  async update(id, form) {
    const res = await api.put(`/students/${id}`, {
      name: form.name,
      email: form.email,
      matricule: form.matricule,
      departmentId: form.departmentId,
      level: LABEL_TO_LEVEL[form.level] || form.level,
    })
    return adaptStudent(data(res))
  },
  async remove(id) {
    await api.delete(`/students/${id}`)
  },
}

// ---------------------------------------------------------------------------
// Rooms & Buildings
// ---------------------------------------------------------------------------
export const roomApi = {
  async list() {
    const res = await api.get('/rooms')
    return data(res).map(adaptRoom)
  },
  async create(form) {
    const res = await api.post('/rooms', {
      name: form.name,
      capacity: Number(form.capacity),
      buildingId: form.buildingId,
    })
    return adaptRoom(data(res))
  },
  async update(id, form) {
    const res = await api.put(`/rooms/${id}`, {
      name: form.name,
      capacity: Number(form.capacity),
      buildingId: form.buildingId,
    })
    return adaptRoom(data(res))
  },
  async remove(id) {
    await api.delete(`/rooms/${id}`)
  },
}

export const buildingApi = {
  async list() {
    const res = await api.get('/buildings')
    return data(res).map(adaptBuilding)
  },
  async create(name) {
    const res = await api.post('/buildings', { name })
    return adaptBuilding(data(res))
  },
  async update(id, name) {
    const res = await api.put(`/buildings/${id}`, { name })
    return adaptBuilding(data(res))
  },
  async remove(id) {
    await api.delete(`/buildings/${id}`)
  },
}

// ---------------------------------------------------------------------------
// Semesters
// ---------------------------------------------------------------------------
export const semesterApi = {
  async list() {
    const res = await api.get('/semesters')
    return data(res).map(adaptSemester)
  },
  async getOne(id) {
    const res = await api.get(`/semesters/${id}`)
    const s = data(res)
    return { semester: adaptSemester(s), slots: (s.timetableSlots || []).map(adaptSlot) }
  },
  async active() {
    const res = await api.get('/semesters/active')
    return adaptSemester(data(res))
  },
  async create(form) {
    const res = await api.post('/semesters', form)
    return adaptSemester(data(res))
  },
  async publish(id) {
    const res = await api.put(`/semesters/${id}/publish`)
    return adaptSemester(data(res))
  },
  async archive(id) {
    const res = await api.put(`/semesters/${id}/archive`)
    return adaptSemester(data(res))
  },
  async remove(id) {
    await api.delete(`/semesters/${id}`)
  },
}

// ---------------------------------------------------------------------------
// Timetable
// ---------------------------------------------------------------------------
export const timetableApi = {
  async generate(semesterId, constraints) {
    const res = await api.post('/timetable/generate', { semesterId, constraints })
    const d = data(res)
    return { ...d, slots: (d.slots || []).map(adaptSlot) }
  },
  async forSemester(semesterId, filters = {}) {
    const res = await api.get(`/timetable/semester/${semesterId}`, {
      params: {
        department: filters.department || undefined,
        level: filters.level ? LABEL_TO_LEVEL[filters.level] || filters.level : undefined,
        lecturer: filters.lecturer || undefined,
        day: filters.day ? FULL_TO_DAY[filters.day] || filters.day : undefined,
      },
    })
    return data(res).map(adaptSlot)
  },
  async createSlot(form) {
    const res = await api.post('/timetable/slot', {
      semesterId: form.semesterId,
      courseId: form.courseId,
      lecturerId: form.lecturerId,
      roomId: form.roomId,
      day: FULL_TO_DAY[form.day] || form.day,
      timeSlot: TSID_TO_SLOT_ENUM[form.timeSlotId] || form.timeSlotId,
      level: LABEL_TO_LEVEL[form.level] || form.level,
      departmentId: form.departmentId,
    })
    return adaptSlot(data(res))
  },
  async updateSlot(slotId, form) {
    const payload = {}
    if (form.courseId) payload.courseId = form.courseId
    if (form.lecturerId) payload.lecturerId = form.lecturerId
    if (form.roomId) payload.roomId = form.roomId
    if (form.day) payload.day = FULL_TO_DAY[form.day] || form.day
    if (form.timeSlotId) payload.timeSlot = TSID_TO_SLOT_ENUM[form.timeSlotId] || form.timeSlotId
    if (form.level) payload.level = LABEL_TO_LEVEL[form.level] || form.level
    if (form.departmentId) payload.departmentId = form.departmentId
    const res = await api.put(`/timetable/slot/${slotId}`, payload)
    return adaptSlot(data(res))
  },
  async deleteSlot(slotId) {
    await api.delete(`/timetable/slot/${slotId}`)
  },
}

// ---------------------------------------------------------------------------
// Modifications
// ---------------------------------------------------------------------------
export const modificationApi = {
  async forSemester(semesterId, { page = 1, limit = 100 } = {}) {
    const res = await api.get(`/modifications/semester/${semesterId}`, { params: { page, limit } })
    return data(res).map(adaptModification)
  },
}
