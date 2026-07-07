const service = require('./timetable.service')
const { success, created } = require('../../utils/response')

async function generate(req, res) {
  const data = await service.generate(req.body)
  return success(res, { message: 'Timetable generated successfully', data })
}

async function getSemesterSlots(req, res) {
  const data = await service.getSemesterSlots(req.user, req.params.semesterId, req.query)
  return success(res, { message: 'Timetable fetched successfully', data })
}

async function createSlot(req, res) {
  const data = await service.createSlot(req.user, req.body)
  return created(res, { message: 'Slot created successfully', data })
}

async function updateSlot(req, res) {
  const data = await service.updateSlot(req.user, req.params.slotId, req.body)
  return success(res, { message: 'Slot updated successfully', data })
}

async function deleteSlot(req, res) {
  await service.deleteSlot(req.user, req.params.slotId)
  return success(res, { message: 'Slot deleted successfully' })
}

module.exports = { generate, getSemesterSlots, createSlot, updateSlot, deleteSlot }
