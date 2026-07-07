const service = require('./students.service')
const { success, created, paginate } = require('../../utils/response')

async function list(req, res) {
  const { items, total, page, limit } = await service.list(req.query)
  return success(res, {
    message: 'Students fetched successfully',
    data: items,
    pagination: paginate(page, limit, total),
  })
}

async function getOne(req, res) {
  await service.assertCanAccess(req.user, req.params.id)
  const data = await service.getById(req.params.id)
  return success(res, { message: 'Student fetched successfully', data })
}

async function create(req, res) {
  const data = await service.create(req.body)
  return created(res, { message: 'Student created successfully', data })
}

async function update(req, res) {
  const data = await service.update(req.params.id, req.body)
  return success(res, { message: 'Student updated successfully', data })
}

async function remove(req, res) {
  await service.remove(req.params.id)
  return success(res, { message: 'Student deleted successfully' })
}

module.exports = { list, getOne, create, update, remove }
