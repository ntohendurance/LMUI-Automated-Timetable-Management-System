const express = require('express')
const { body } = require('express-validator')
const controller = require('./lecturers.controller')
const protect = require('../../middleware/auth')
const { allowRoles } = require('../../middleware/role')
const validate = require('../../middleware/validate')
const asyncHandler = require('../../middleware/asyncHandler')

const router = express.Router()

router.use(protect)

router.get('/', allowRoles('ADMIN'), asyncHandler(controller.list))

// Admin or the lecturer themselves (enforced in controller/service).
router.get('/:id', allowRoles('ADMIN', 'LECTURER'), asyncHandler(controller.getOne))

router.post(
  '/',
  allowRoles('ADMIN'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('staffId').notEmpty().withMessage('Staff ID is required'),
    body('departmentId').notEmpty().withMessage('Department is required'),
  ],
  validate,
  asyncHandler(controller.create)
)

// Admin approves / revokes a self-registered lecturer.
router.put(
  '/:id/approve',
  allowRoles('ADMIN'),
  [body('isApproved').optional().isBoolean().withMessage('isApproved must be true or false')],
  validate,
  asyncHandler(controller.approve)
)

router.put('/:id', allowRoles('ADMIN', 'LECTURER'), asyncHandler(controller.update))
router.delete('/:id', allowRoles('ADMIN'), asyncHandler(controller.remove))

module.exports = router
