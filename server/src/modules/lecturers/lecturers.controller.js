const service = require('./lecturers.service')
const { success, created } = require('../../utils/response')

async function list(req, res) {
  const data = await service.list()
  return success(res, { message: 'Lecturers fetched successfully', data })
}

async function getOne(req, res) {
  await service.assertCanAccess(req.user, req.params.id)
  const data = await service.getById(req.params.id)
  return success(res, { message: 'Lecturer fetched successfully', data })
}

async function create(req, res) {
  const data = await service.create(req.body)
  return created(res, { message: 'Lecturer created successfully', data })
}

async function update(req, res) {
  const data = await service.update(req.user, req.params.id, req.body)
  return success(res, { message: 'Lecturer updated successfully', data })
}

async function approve(req, res) {
  const isApproved = req.body.isApproved !== false // default to approving
  const data = await service.setApproval(req.params.id, isApproved)
  return success(res, {
    message: isApproved ? 'Lecturer approved successfully' : 'Lecturer approval revoked',
    data,
  })
}

async function remove(req, res) {
  await service.remove(req.params.id)
  return success(res, { message: 'Lecturer deleted successfully' })
}

module.exports = { list, getOne, create, update, approve, remove }
