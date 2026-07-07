const service = require('./rooms.service')
const { success, created } = require('../../utils/response')

async function list(req, res) {
  const data = await service.list()
  return success(res, { message: 'Rooms fetched successfully', data })
}

async function getOne(req, res) {
  const data = await service.getById(req.params.id)
  return success(res, { message: 'Room fetched successfully', data })
}

async function create(req, res) {
  const data = await service.create(req.body)
  return created(res, { message: 'Room created successfully', data })
}

async function update(req, res) {
  const data = await service.update(req.params.id, req.body)
  return success(res, { message: 'Room updated successfully', data })
}

async function remove(req, res) {
  await service.remove(req.params.id)
  return success(res, { message: 'Room deleted successfully' })
}

module.exports = { list, getOne, create, update, remove }
