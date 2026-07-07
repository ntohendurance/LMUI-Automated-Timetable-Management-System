const service = require('./departments.service')
const { success, created } = require('../../utils/response')

async function list(req, res) {
  const data = await service.list()
  return success(res, { message: 'Departments fetched successfully', data })
}

async function getOne(req, res) {
  const data = await service.getById(req.params.id)
  return success(res, { message: 'Department fetched successfully', data })
}

async function create(req, res) {
  const data = await service.create(req.body)
  return created(res, { message: 'Department created successfully', data })
}

async function update(req, res) {
  const data = await service.update(req.params.id, req.body)
  return success(res, { message: 'Department updated successfully', data })
}

async function remove(req, res) {
  await service.remove(req.params.id)
  return success(res, { message: 'Department deleted successfully' })
}

module.exports = { list, getOne, create, update, remove }
