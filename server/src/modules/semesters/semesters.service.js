const prisma = require('../../config/db')
const ApiError = require('../../utils/ApiError')

const fullSlotInclude = {
  course: { select: { id: true, code: true, title: true, creditUnits: true, level: true } },
  lecturer: {
    select: { id: true, staffId: true, user: { select: { id: true, name: true, email: true } } },
  },
  room: { select: { id: true, name: true, capacity: true, building: { select: { name: true } } } },
  department: { select: { id: true, name: true, code: true } },
}

async function list() {
  return prisma.semester.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { timetableSlots: true } } },
  })
}

async function getById(id) {
  const semester = await prisma.semester.findUnique({
    where: { id },
    include: {
      timetableSlots: { include: fullSlotInclude, orderBy: [{ day: 'asc' }, { timeSlot: 'asc' }] },
      _count: { select: { timetableSlots: true } },
    },
  })
  if (!semester) throw ApiError.notFound('Semester not found')
  return semester
}

async function getActive() {
  const semester = await prisma.semester.findFirst({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    include: { _count: { select: { timetableSlots: true } } },
  })
  if (!semester) {
    throw ApiError.notFound('No active published timetable for this semester')
  }
  return semester
}

async function create(data) {
  const exists = await prisma.semester.findUnique({
    where: { academicYear_semester: { academicYear: data.academicYear, semester: data.semester } },
  })
  if (exists) {
    throw ApiError.conflict('A timetable for this academic year and semester already exists.')
  }

  return prisma.semester.create({
    data: {
      academicYear: data.academicYear,
      semester: data.semester,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: 'DRAFT',
    },
  })
}

async function publish(id) {
  const semester = await prisma.semester.findUnique({
    where: { id },
    include: { _count: { select: { timetableSlots: true } } },
  })
  if (!semester) throw ApiError.notFound('Semester not found')
  if (semester.status !== 'DRAFT') {
    throw ApiError.badRequest('Only a Draft timetable can be published.')
  }
  if (semester._count.timetableSlots === 0) {
    throw ApiError.badRequest('Cannot publish a semester with no timetable slots.')
  }
  return prisma.semester.update({
    where: { id },
    data: { status: 'PUBLISHED', publishedAt: new Date() },
  })
}

async function archive(id) {
  const semester = await prisma.semester.findUnique({ where: { id } })
  if (!semester) throw ApiError.notFound('Semester not found')
  if (semester.status !== 'PUBLISHED') {
    throw ApiError.badRequest('Only a Published timetable can be archived.')
  }
  return prisma.semester.update({
    where: { id },
    data: { status: 'ARCHIVED', archivedAt: new Date() },
  })
}

async function remove(id) {
  const semester = await prisma.semester.findUnique({ where: { id } })
  if (!semester) throw ApiError.notFound('Semester not found')
  if (semester.status !== 'DRAFT') {
    throw ApiError.badRequest('Only a Draft timetable can be deleted.')
  }
  // Cascade configured on TimetableSlot + modifications removes children.
  await prisma.semester.delete({ where: { id } })
  return { id }
}

module.exports = { list, getById, getActive, create, publish, archive, remove }
