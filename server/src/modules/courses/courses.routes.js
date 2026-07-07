const express = require('express')
const { body } = require('express-validator')
const controller = require('./courses.controller')
const protect = require('../../middleware/auth')
const { allowRoles } = require('../../middleware/role')
const validate = require('../../middleware/validate')
const asyncHandler = require('../../middleware/asyncHandler')

const router = express.Router()

router.use(protect)

router.get('/', asyncHandler(controller.list))
router.get('/:id', asyncHandler(controller.getOne))

router.post(
  '/',
  allowRoles('ADMIN'),
  [
    body('code').notEmpty().withMessage('Course code is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('creditUnits').isInt({ min: 1, max: 6 }).withMessage('Credit units must be 1–6'),
    body('departmentId').notEmpty().withMessage('Department is required'),
    body('level').isIn(['YEAR_1', 'YEAR_2', 'YEAR_3', 'YEAR_4']).withMessage('Invalid level'),
  ],
  validate,
  asyncHandler(controller.create)
)

router.put('/:id', allowRoles('ADMIN'), asyncHandler(controller.update))
router.delete('/:id', allowRoles('ADMIN'), asyncHandler(controller.remove))

module.exports = router
