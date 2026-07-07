const prisma = require('../../config/db')
const ApiError = require('../../utils/ApiError')

async function list() {
  return prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { courses: true, lecturers: true, students: true } },
    },
  })
}

async function getById(id) {
  const dept = await prisma.department.findUnique({
    where: { id },
    include: {
      _count: { select: { courses: true, lecturers: true, students: true } },
      courses: { select: { id: true, code: true, title: true, level: true } },
    },
  })
  if (!dept) throw ApiError.notFound('Department not found')
  return dept
}

async function create({ name, code }) {
  return prisma.department.create({ data: { name, code: code.toUpperCase() } })
}

async function update(id, data) {
  await getById(id)
  const payload = { ...data }
  if (payload.code) payload.code = payload.code.toUpperCase()
  return prisma.department.update({ where: { id }, data: payload })
}

async function remove(id) {
  const dept = await prisma.department.findUnique({
    where: { id },
    include: { _count: { select: { courses: true, lecturers: true, students: true } } },
  })
  if (!dept) throw ApiError.notFound('Department not found')

  const { courses, lecturers, students } = dept._count
  if (courses || lecturers || students) {
    throw ApiError.badRequest(
      'Cannot delete a department that still has courses, lecturers or students attached.'
    )
  }
  await prisma.department.delete({ where: { id } })
  return { id }
}

module.exports = { list, getById, create, update, remove }
