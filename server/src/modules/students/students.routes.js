const express = require('express')
const { body } = require('express-validator')
const controller = require('./students.controller')
const protect = require('../../middleware/auth')
const { allowRoles } = require('../../middleware/role')
const validate = require('../../middleware/validate')
const asyncHandler = require('../../middleware/asyncHandler')

const router = express.Router()

router.use(protect)

router.get('/', allowRoles('ADMIN'), asyncHandler(controller.list))

// Admin or the student themselves (enforced in controller/service).
router.get('/:id', allowRoles('ADMIN', 'STUDENT'), asyncHandler(controller.getOne))

router.post(
  '/',
  allowRoles('ADMIN'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('matricule').notEmpty().withMessage('Matricule is required'),
    body('departmentId').notEmpty().withMessage('Department is required'),
    body('level').isIn(['YEAR_1', 'YEAR_2', 'YEAR_3', 'YEAR_4']).withMessage('Invalid level'),
  ],
  validate,
  asyncHandler(controller.create)
)

router.put('/:id', allowRoles('ADMIN'), asyncHandler(controller.update))
router.delete('/:id', allowRoles('ADMIN'), asyncHandler(controller.remove))

module.exports = router
