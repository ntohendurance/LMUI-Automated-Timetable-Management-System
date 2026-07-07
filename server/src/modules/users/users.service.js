const prisma = require('../../config/db')
const ApiError = require('../../utils/ApiError')

// Password is never selected.
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
}

async function list({ role, page = 1, limit = 10 } = {}) {
  const pageNum = Math.max(1, Number(page) || 1)
  const take = Math.max(1, Number(limit) || 10)
  const skip = (pageNum - 1) * take

  const where = role ? { role: String(role).toUpperCase() } : {}

  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, select: userSelect, orderBy: { name: 'asc' }, skip, take }),
    prisma.user.count({ where }),
  ])
  return { items, total, page: pageNum, limit: take }
}

async function getById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      ...userSelect,
      lecturer: { include: { department: true } },
      student: { include: { department: true } },
    },
  })
  if (!user) throw ApiError.notFound('User not found')
  return user
}

async function remove(id) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw ApiError.notFound('User not found')
  await prisma.user.delete({ where: { id } })
  return { id }
}

module.exports = { list, getById, remove }
