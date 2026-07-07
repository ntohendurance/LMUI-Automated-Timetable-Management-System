// Role-based access control.
const { error } = require('../utils/response')

// Usage: allowRoles('ADMIN'), allowRoles('ADMIN', 'LECTURER')
function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, { status: 401, message: 'Authentication required.' })
    }
    if (!roles.includes(req.user.role)) {
      return error(res, {
        status: 403,
        message: 'You do not have permission to perform this action.',
      })
    }
    return next()
  }
}

module.exports = { allowRoles }
