// Global error handler — translates thrown errors into the standard envelope.
const { Prisma } = require('@prisma/client')
const ApiError = require('../utils/ApiError')
const { error } = require('../utils/response')

// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  // Known application errors
  if (err instanceof ApiError) {
    return error(res, { status: err.status, message: err.message, errors: err.errors })
  }

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : err.meta?.target
        return error(res, {
          status: 409,
          message: `A record with this value already exists${target ? ` (${target})` : ''}.`,
        })
      }
      case 'P2025':
        return error(res, { status: 404, message: 'Record not found.' })
      case 'P2003':
        return error(res, { status: 400, message: 'Related record does not exist.' })
      default:
        break
    }
  }

  // Prisma validation errors (bad query input)
  if (err instanceof Prisma.PrismaClientValidationError) {
    return error(res, { status: 400, message: 'Invalid request data.' })
  }

  // JWT errors that slipped through
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return error(res, { status: 401, message: 'Invalid or expired token.' })
  }

  // Fallback
  const isDev = process.env.NODE_ENV !== 'production'
  if (isDev) {
    // eslint-disable-next-line no-console
    console.error('[Unhandled error]', err)
  }
  return error(res, {
    status: 500,
    message: 'Internal server error',
    errors: isDev ? [{ message: err.message }] : null,
  })
}
