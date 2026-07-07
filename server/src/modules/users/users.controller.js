const service = require('./users.service')
const { success, paginate } = require('../../utils/response')

async function list(req, res) {
  const { items, total, page, limit } = await service.list(req.query)
  return success(res, {
    message: 'Users fetched successfully',
    data: items,
    pagination: paginate(page, limit, total),
  })
}

async function getOne(req, res) {
  const data = await service.getById(req.params.id)
  return success(res, { message: 'User fetched successfully', data })
}

async function remove(req, res) {
  await service.remove(req.params.id)
  return success(res, { message: 'User deleted successfully' })
}

module.exports = { list, getOne, remove }
