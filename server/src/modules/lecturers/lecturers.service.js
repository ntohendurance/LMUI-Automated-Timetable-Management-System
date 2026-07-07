const bcrypt = require('bcryptjs')
const prisma = require('../../config/db')
const ApiError = require('../../utils/ApiError')

const SALT_ROUNDS = 12

const lecturerSelect = {
  id: true,
  staffId: true,
  departmentId: true,
  availableDays: true,
  preferredTimeSlots: true,
  isApproved: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true, email: true, role: true } },
  department: { select: { id: true, name: true, code: true } },
  _count: { select: { courses: true } },
}

async function list() {
  return prisma.lecturer.findMany({ select: lecturerSelect, orderBy: { user: { name: 'asc' } } })
}

async function getById(id) {
  const lecturer = await prisma.lecturer.findUnique({
    where: { id },
    select: {
      ...lecturerSelect,
      courses: { select: { id: true, code: true, title: true, level: true } },
    },
  })
  if (!lecturer) throw ApiError.notFound('Lecturer not found')
  return lecturer
}

// Resolve the lecturer record owned by a given user id.
async function getByUserId(userId) {
  return prisma.lecturer.findUnique({ where: { userId } })
}

// Authorization helper: admin OR the lecturer themselves.
async function assertCanAccess(reqUser, lecturerId) {
  if (reqUser.role === 'ADMIN') return
  const lecturer = await prisma.lecturer.findUnique({ where: { id: lecturerId } })
  if (!lecturer) throw ApiError.notFound('Lecturer not found')
  if (lecturer.userId !== reqUser.id) {
    throw ApiError.forbidden('You can only access your own lecturer profile.')
  }
}

async function create(data) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw ApiError.conflict('A user with this email already exists')

  const hashed = await bcrypt.hash(data.password || 'lecturer123', SALT_ROUNDS)

  const lecturer = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name: data.name, email: data.email, password: hashed, role: 'LECTURER' },
    })
    return tx.lecturer.create({
      data: {
        userId: user.id,
        staffId: data.staffId,
        departmentId: data.departmentId,
        availableDays: data.availableDays || ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        preferredTimeSlots: data.preferredTimeSlots || ['MORNING', 'AFTERNOON'],
        // Admin-created lecturers are trusted and approved immediately.
        isApproved: true,
      },
      select: lecturerSelect,
    })
  })
  return lecturer
}

// Admin approves (or revokes approval for) a self-registered lecturer.
async function setApproval(id, isApproved) {
  const lecturer = await prisma.lecturer.findUnique({ where: { id } })
  if (!lecturer) throw ApiError.notFound('Lecturer not found')
  return prisma.lecturer.update({
    where: { id },
    data: { isApproved: Boolean(isApproved) },
    select: lecturerSelect,
  })
}

async function update(reqUser, id, data) {
  await assertCanAccess(reqUser, id)

  // Self (non-admin) may only update availability fields.
  let lecturerData
  if (reqUser.role === 'ADMIN') {
    lecturerData = {
      staffId: data.staffId,
      departmentId: data.departmentId,
      availableDays: data.availableDays,
      preferredTimeSlots: data.preferredTimeSlots,
    }
  } else {
    lecturerData = {
      availableDays: data.availableDays,
      preferredTimeSlots: data.preferredTimeSlots,
    }
  }
  // Strip undefined keys
  Object.keys(lecturerData).forEach((k) => lecturerData[k] === undefined && delete lecturerData[k])

  const updated = await prisma.lecturer.update({
    where: { id },
    data: lecturerData,
    select: lecturerSelect,
  })

  // Admin may also update the linked user's name/email.
  if (reqUser.role === 'ADMIN' && (data.name || data.email)) {
    await prisma.user.update({
      where: { id: updated.user.id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.email ? { email: data.email } : {}),
      },
    })
    return getById(id)
  }

  return updated
}

async function remove(id) {
  const lecturer = await prisma.lecturer.findUnique({ where: { id } })
  if (!lecturer) throw ApiError.notFound('Lecturer not found')

  await prisma.$transaction(async (tx) => {
    // Unassign courses first (soft approach).
    await tx.course.updateMany({ where: { lecturerId: id }, data: { lecturerId: null } })
    // Deleting the user cascades to the lecturer profile.
    await tx.user.delete({ where: { id: lecturer.userId } })
  })
  return { id }
}

module.exports = {
  list,
  getById,
  getByUserId,
  assertCanAccess,
  create,
  update,
  setApproval,
  remove,
  lecturerSelect,
}
