const express = require('express')
const controller = require('./modifications.controller')
const protect = require('../../middleware/auth')
const { allowRoles } = require('../../middleware/role')
const asyncHandler = require('../../middleware/asyncHandler')

const router = express.Router()

router.use(protect, allowRoles('ADMIN'))

router.get('/semester/:semesterId', asyncHandler(controller.listForSemester))
router.get('/slot/:slotId', asyncHandler(controller.listForSlot))

module.exports = router
