const prisma = require('../../config/db')
const ApiError = require('../../utils/ApiError')

const courseInclude = {
  department: { select: { id: true, name: true, code: true } },
  lecturer: {
    select: {
      id: true,
      staffId: true,
      user: { select: { id: true, name: true, email: true } },
    },
  },
}

async function list({ department, level, search, page = 1, limit = 10 }) {
  const pageNum = Math.max(1, Number(page) || 1)
  const take = Math.max(1, Number(limit) || 10)
  const skip = (pageNum - 1) * take

  const where = {
    AND: [
      department ? { departmentId: department } : {},
      level ? { level } : {},
      search
        ? {
            OR: [
              { code: { contains: search, mode: 'insensitive' } },
              { title: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
    ],
  }

  const [items, total] = await Promise.all([
    prisma.course.findMany({ where, include: courseInclude, orderBy: { code: 'asc' }, skip, take }),
    prisma.course.count({ where }),
  ])

  return { items, total, page: pageNum, limit: take }
}

async function getById(id) {
  const course = await prisma.course.findUnique({ where: { id }, include: courseInclude })
  if (!course) throw ApiError.notFound('Course not found')
  return course
}

async function create(data) {
  const payload = {
    code: data.code.toUpperCase(),
    title: data.title,
    creditUnits: Number(data.creditUnits),
    departmentId: data.departmentId,
    lecturerId: data.lecturerId || null,
    level: data.level,
    preferredTimeSlot: data.preferredTimeSlot || null,
    preferredDay: data.preferredDay || null,
  }
  return prisma.course.create({ data: payload, include: courseInclude })
}

async function update(id, data) {
  await getById(id)
  const payload = { ...data }
  if (payload.code) payload.code = payload.code.toUpperCase()
  if (payload.creditUnits !== undefined) payload.creditUnits = Number(payload.creditUnits)
  if (payload.lecturerId === '') payload.lecturerId = null
  return prisma.course.update({ where: { id }, data: payload, include: courseInclude })
}

async function remove(id) {
  await getById(id)
  // Block deletion if the course appears in any PUBLISHED timetable.
  const publishedSlot = await prisma.timetableSlot.findFirst({
    where: { courseId: id, semester: { status: 'PUBLISHED' } },
  })
  if (publishedSlot) {
    throw ApiError.badRequest('Cannot delete a course that is part of a published timetable.')
  }
  await prisma.course.delete({ where: { id } })
  return { id }
}

module.exports = { list, getById, create, update, remove }
