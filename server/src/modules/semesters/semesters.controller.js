const service = require('./semesters.service')
const { success, created } = require('../../utils/response')

async function list(req, res) {
  const data = await service.list()
  return success(res, { message: 'Semesters fetched successfully', data })
}

async function getActive(req, res) {
  const data = await service.getActive()
  return success(res, { message: 'Active semester fetched successfully', data })
}

async function getOne(req, res) {
  const data = await service.getById(req.params.id)
  return success(res, { message: 'Semester fetched successfully', data })
}

async function create(req, res) {
  const data = await service.create(req.body)
  return created(res, { message: 'Semester created successfully', data })
}

async function publish(req, res) {
  const data = await service.publish(req.params.id)
  return success(res, { message: 'Timetable published successfully', data })
}

async function archive(req, res) {
  const data = await service.archive(req.params.id)
  return success(res, { message: 'Timetable archived successfully', data })
}

async function remove(req, res) {
  await service.remove(req.params.id)
  return success(res, { message: 'Semester deleted successfully' })
}

module.exports = { list, getActive, getOne, create, publish, archive, remove }
