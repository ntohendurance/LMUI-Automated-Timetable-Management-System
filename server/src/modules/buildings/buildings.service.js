const prisma = require('../../config/db')
const ApiError = require('../../utils/ApiError')

async function list() {
  return prisma.building.findMany({
    orderBy: { name: 'asc' },
    include: {
      rooms: { select: { id: true, name: true, capacity: true }, orderBy: { name: 'asc' } },
    },
  })
}

async function create({ name }) {
  return prisma.building.create({ data: { name } })
}

async function update(id, { name }) {
  const building = await prisma.building.findUnique({ where: { id } })
  if (!building) throw ApiError.notFound('Building not found')
  return prisma.building.update({ where: { id }, data: { name } })
}

async function remove(id) {
  const building = await prisma.building.findUnique({
    where: { id },
    include: { _count: { select: { rooms: true } } },
  })
  if (!building) throw ApiError.notFound('Building not found')
  if (building._count.rooms > 0) {
    throw ApiError.badRequest('Cannot delete a building that still has rooms attached.')
  }
  await prisma.building.delete({ where: { id } })
  return { id }
}

module.exports = { list, create, update, remove }
