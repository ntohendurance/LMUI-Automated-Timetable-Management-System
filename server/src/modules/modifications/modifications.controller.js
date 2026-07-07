const service = require('./modifications.service')
const { success, paginate } = require('../../utils/response')

async function listForSemester(req, res) {
  const { items, total, page, limit } = await service.listForSemester(
    req.params.semesterId,
    req.query
  )
  return success(res, {
    message: 'Modification history fetched successfully',
    data: items,
    pagination: paginate(page, limit, total),
  })
}

async function listForSlot(req, res) {
  const data = await service.listForSlot(req.params.slotId)
  return success(res, { message: 'Slot history fetched successfully', data })
}

module.exports = { listForSemester, listForSlot }
