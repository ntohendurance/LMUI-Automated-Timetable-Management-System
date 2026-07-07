// JWT protection middleware.
const { verifyToken } = require('../config/jwt')
const { error } = require('../utils/response')

module.exports = function protect(req, res, next) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return error(res, { status: 401, message: 'Authentication required. No token provided.' })
  }

  try {
    const decoded = verifyToken(token)
    // decoded: { id, role, email, name }
    req.user = decoded
    return next()
  } catch (err) {
    return error(res, { status: 401, message: 'Invalid or expired token.' })
  }
}
