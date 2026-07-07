const prisma = require('../../config/db')
const ApiError = require('../../utils/ApiError')

const roomInclude = { building: { select: { id: true, name: true } } }

async function list() {
  return prisma.room.findMany({ include: roomInclude, orderBy: { name: 'asc' } })
}

async function getById(id) {
  const room = await prisma.room.findUnique({ where: { id }, include: roomInclude })
  if (!room) throw ApiError.notFound('Room not found')
  return room
}

async function create(data) {
  return prisma.room.create({
    data: { name: data.name, capacity: Number(data.capacity), buildingId: data.buildingId },
    include: roomInclude,
  })
}

async function update(id, data) {
  await getById(id)
  const payload = { ...data }
  if (payload.capacity !== undefined) payload.capacity = Number(payload.capacity)
  return prisma.room.update({ where: { id }, data: payload, include: roomInclude })
}

async function remove(id) {
  await getById(id)
  const publishedSlot = await prisma.timetableSlot.findFirst({
    where: { roomId: id, semester: { status: 'PUBLISHED' } },
  })
  if (publishedSlot) {
    throw ApiError.badRequest('Cannot delete a room that is part of a published timetable.')
  }
  await prisma.room.delete({ where: { id } })
  return { id }
}

module.exports = { list, getById, create, update, remove }
