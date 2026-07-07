// express-validator error handler.
const { validationResult } = require('express-validator')
const { error } = require('../utils/response')

module.exports = function validate(req, res, next) {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => ({
      field: e.path || e.param,
      message: e.msg,
    }))
    return error(res, { status: 422, message: 'Validation failed', errors })
  }
  return next()
}
