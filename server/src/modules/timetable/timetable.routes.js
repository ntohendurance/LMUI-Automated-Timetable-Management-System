const express = require('express')
const { body } = require('express-validator')
const controller = require('./timetable.controller')
const protect = require('../../middleware/auth')
const { allowRoles } = require('../../middleware/role')
const validate = require('../../middleware/validate')
const asyncHandler = require('../../middleware/asyncHandler')

const router = express.Router()

router.use(protect)

router.post(
  '/generate',
  allowRoles('ADMIN'),
  [body('semesterId').notEmpty().withMessage('semesterId is required')],
  validate,
  asyncHandler(controller.generate)
)

// All roles — service filters slots by role.
router.get('/semester/:semesterId', asyncHandler(controller.getSemesterSlots))

router.post(
  '/slot',
  allowRoles('ADMIN'),
  [
    body('semesterId').notEmpty(),
    body('courseId').notEmpty(),
    body('lecturerId').notEmpty(),
    body('roomId').notEmpty(),
    body('day').isIn(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']),
    body('timeSlot').isIn(['SLOT_8_10', 'SLOT_10_12', 'SLOT_12_14', 'SLOT_14_16', 'SLOT_16_18']),
    body('level').isIn(['YEAR_1', 'YEAR_2', 'YEAR_3', 'YEAR_4']),
    body('departmentId').notEmpty(),
  ],
  validate,
  asyncHandler(controller.createSlot)
)

router.put('/slot/:slotId', allowRoles('ADMIN'), asyncHandler(controller.updateSlot))
router.delete('/slot/:slotId', allowRoles('ADMIN'), asyncHandler(controller.deleteSlot))

module.exports = router
