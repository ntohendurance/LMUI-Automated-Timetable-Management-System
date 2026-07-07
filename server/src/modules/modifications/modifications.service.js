const prisma = require('../../config/db')

const modInclude = {
  user: { select: { id: true, name: true, email: true } },
}

async function listForSemester(semesterId, { page = 1, limit = 10 } = {}) {
  const pageNum = Math.max(1, Number(page) || 1)
  const take = Math.max(1, Number(limit) || 10)
  const skip = (pageNum - 1) * take

  const [items, total] = await Promise.all([
    prisma.timetableModification.findMany({
      where: { semesterId },
      include: modInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.timetableModification.count({ where: { semesterId } }),
  ])

  return { items, total, page: pageNum, limit: take }
}

async function listForSlot(slotId) {
  return prisma.timetableModification.findMany({
    where: { slotId },
    include: modInclude,
    orderBy: { createdAt: 'desc' },
  })
}

module.exports = { listForSemester, listForSlot }
