const express = require('express')
const { body } = require('express-validator')
const controller = require('./semesters.controller')
const protect = require('../../middleware/auth')
const { allowRoles } = require('../../middleware/role')
const validate = require('../../middleware/validate')
const asyncHandler = require('../../middleware/asyncHandler')

const router = express.Router()

router.use(protect)

router.get('/', asyncHandler(controller.list))
// /active must be declared before /:id
router.get('/active', asyncHandler(controller.getActive))
router.get('/:id', asyncHandler(controller.getOne))

router.post(
  '/',
  allowRoles('ADMIN'),
  [
    body('academicYear').notEmpty().withMessage('Academic year is required'),
    body('semester').isIn(['SEMESTER_1', 'SEMESTER_2']).withMessage('Invalid semester'),
    body('startDate').notEmpty().withMessage('Start date is required'),
    body('endDate').notEmpty().withMessage('End date is required'),
  ],
  validate,
  asyncHandler(controller.create)
)

router.put('/:id/publish', allowRoles('ADMIN'), asyncHandler(controller.publish))
router.put('/:id/archive', allowRoles('ADMIN'), asyncHandler(controller.archive))
router.delete('/:id', allowRoles('ADMIN'), asyncHandler(controller.remove))

module.exports = router
