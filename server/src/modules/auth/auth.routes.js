const express = require('express')
const { body } = require('express-validator')
const controller = require('./auth.controller')
const validate = require('../../middleware/validate')
const protect = require('../../middleware/auth')
const { allowRoles } = require('../../middleware/role')
const asyncHandler = require('../../middleware/asyncHandler')
const { authLimiter } = require('../../middleware/rateLimiter')

const router = express.Router()

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').optional().isString(),
  ],
  validate,
  asyncHandler(controller.login)
)

// Public self-service sign-up (student or lecturer only).
router.post(
  '/signup',
  authLimiter,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
      .isIn(['LECTURER', 'STUDENT', 'lecturer', 'student'])
      .withMessage('You can only sign up as a student or a lecturer'),
  ],
  validate,
  asyncHandler(controller.signup)
)

// Public department list for the sign-up dropdown (no auth required).
router.get('/departments', asyncHandler(controller.publicDepartments))

router.post(
  '/register',
  protect,
  allowRoles('ADMIN'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['ADMIN', 'LECTURER', 'STUDENT', 'admin', 'lecturer', 'student']),
  ],
  validate,
  asyncHandler(controller.register)
)

router.get('/me', protect, asyncHandler(controller.me))

router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().withMessage('A valid email is required')],
  validate,
  asyncHandler(controller.forgotPassword)
)

router.post(
  '/reset-password',
  authLimiter,
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  asyncHandler(controller.resetPassword)
)

router.post(
  '/change-password',
  protect,
  authLimiter,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  asyncHandler(controller.changePassword)
)

module.exports = router
