const express = require('express')
const { body } = require('express-validator')
const controller = require('./rooms.controller')
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
    body('name').notEmpty().withMessage('Name is required'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive number'),
    body('buildingId').notEmpty().withMessage('Building is required'),
  ],
  validate,
  asyncHandler(controller.create)
)

router.put('/:id', allowRoles('ADMIN'), asyncHandler(controller.update))
router.delete('/:id', allowRoles('ADMIN'), asyncHandler(controller.remove))

module.exports = router
