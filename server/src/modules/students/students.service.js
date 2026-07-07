const bcrypt = require('bcryptjs')
const prisma = require('../../config/db')
const ApiError = require('../../utils/ApiError')

const SALT_ROUNDS = 12

const studentSelect = {
  id: true,
  matricule: true,
  level: true,
  departmentId: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true, email: true, role: true } },
  department: { select: { id: true, name: true, code: true } },
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
              { matricule: { contains: search, mode: 'insensitive' } },
              { user: { name: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {},
    ],
  }

  const [items, total] = await Promise.all([
    prisma.student.findMany({
      where,
      select: studentSelect,
      orderBy: { user: { name: 'asc' } },
      skip,
      take,
    }),
    prisma.student.count({ where }),
  ])

  return { items, total, page: pageNum, limit: take }
}

async function getById(id) {
  const student = await prisma.student.findUnique({ where: { id }, select: studentSelect })
  if (!student) throw ApiError.notFound('Student not found')
  return student
}

async function getByUserId(userId) {
  return prisma.student.findUnique({ where: { userId } })
}

async function assertCanAccess(reqUser, studentId) {
  if (reqUser.role === 'ADMIN') return
  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) throw ApiError.notFound('Student not found')
  if (student.userId !== reqUser.id) {
    throw ApiError.forbidden('You can only access your own student profile.')
  }
}

async function create(data) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw ApiError.conflict('A user with this email already exists')

  const hashed = await bcrypt.hash(data.password || 'student123', SALT_ROUNDS)

  const student = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name: data.name, email: data.email, password: hashed, role: 'STUDENT' },
    })
    return tx.student.create({
      data: {
        userId: user.id,
        matricule: data.matricule,
        departmentId: data.departmentId,
        level: data.level,
      },
      select: studentSelect,
    })
  })
  return student
}

async function update(id, data) {
  const student = await getById(id)

  const studentData = {}
  if (data.matricule !== undefined) studentData.matricule = data.matricule
  if (data.departmentId !== undefined) studentData.departmentId = data.departmentId
  if (data.level !== undefined) studentData.level = data.level

  const updated = await prisma.student.update({
    where: { id },
    data: studentData,
    select: studentSelect,
  })

  if (data.name || data.email) {
    await prisma.user.update({
      where: { id: student.user.id },
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
  const student = await prisma.student.findUnique({ where: { id } })
  if (!student) throw ApiError.notFound('Student not found')
  // Deleting the user cascades to the student profile.
  await prisma.user.delete({ where: { id: student.userId } })
  return { id }
}

module.exports = { list, getById, getByUserId, assertCanAccess, create, update, remove }
