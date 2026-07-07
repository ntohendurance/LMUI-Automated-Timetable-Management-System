// Custom error carrying an HTTP status code, thrown from services/controllers
// and translated to a JSON response by the global error handler.
class ApiError extends Error {
  constructor(status, message, errors = null) {
    super(message)
    this.status = status
    this.errors = errors
    this.name = 'ApiError'
  }

  static badRequest(msg = 'Bad request', errors) {
    return new ApiError(400, msg, errors)
  }
  static unauthorized(msg = 'Unauthorized') {
    return new ApiError(401, msg)
  }
  static forbidden(msg = 'Forbidden') {
    return new ApiError(403, msg)
  }
  static notFound(msg = 'Record not found') {
    return new ApiError(404, msg)
  }
  static conflict(msg = 'Conflict') {
    return new ApiError(409, msg)
  }
  static unprocessable(msg = 'Validation failed', errors) {
    return new ApiError(422, msg, errors)
  }
}

module.exports = ApiError
