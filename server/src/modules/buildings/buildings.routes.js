const express = require('express')
const { body } = require('express-validator')
const controller = require('./buildings.controller')
const protect = require('../../middleware/auth')
const { allowRoles } = require('../../middleware/role')
const validate = require('../../middleware/validate')
const asyncHandler = require('../../middleware/asyncHandler')

const router = express.Router()

router.use(protect)

router.get('/', asyncHandler(controller.list))

router.post(
  '/',
  allowRoles('ADMIN'),
  [body('name').notEmpty().withMessage('Name is required')],
  validate,
  asyncHandler(controller.create)
)

router.put(
  '/:id',
  allowRoles('ADMIN'),
  [body('name').notEmpty().withMessage('Name is required')],
  validate,
  asyncHandler(controller.update)
)

router.delete('/:id', allowRoles('ADMIN'), asyncHandler(controller.remove))

module.exports = router
