// Standard API response helpers.

function success(res, { message = 'Success', data = null, pagination = null, status = 200 } = {}) {
  const body = { success: true, message }
  if (data !== null) body.data = data
  if (pagination) body.pagination = pagination
  return res.status(status).json(body)
}

function created(res, { message = 'Created successfully', data = null } = {}) {
  return success(res, { message, data, status: 201 })
}

function error(res, { message = 'Something went wrong', errors = null, status = 400 } = {}) {
  const body = { success: false, message }
  if (errors) body.errors = errors
  return res.status(status).json(body)
}

// Build a pagination meta object.
function paginate(page, limit, total) {
  return { page: Number(page), limit: Number(limit), total }
}

module.exports = { success, created, error, paginate }
