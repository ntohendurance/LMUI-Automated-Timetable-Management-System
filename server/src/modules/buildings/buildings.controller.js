const service = require('./buildings.service')
const { success, created } = require('../../utils/response')

async function list(req, res) {
  const data = await service.list()
  return success(res, { message: 'Buildings fetched successfully', data })
}

async function create(req, res) {
  const data = await service.create(req.body)
  return created(res, { message: 'Building created successfully', data })
}

async function update(req, res) {
  const data = await service.update(req.params.id, req.body)
  return success(res, { message: 'Building updated successfully', data })
}

async function remove(req, res) {
  await service.remove(req.params.id)
  return success(res, { message: 'Building deleted successfully' })
}

module.exports = { list, create, update, remove }
