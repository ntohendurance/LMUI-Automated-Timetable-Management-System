const express = require('express')
const controller = require('./users.controller')
const protect = require('../../middleware/auth')
const { allowRoles } = require('../../middleware/role')
const asyncHandler = require('../../middleware/asyncHandler')

const router = express.Router()

router.use(protect, allowRoles('ADMIN'))

router.get('/', asyncHandler(controller.list))
router.get('/:id', asyncHandler(controller.getOne))
router.delete('/:id', asyncHandler(controller.remove))

module.exports = router
