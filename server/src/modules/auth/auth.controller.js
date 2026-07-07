const service = require('./auth.service')
const { success, created } = require('../../utils/response')

async function login(req, res) {
  const data = await service.login(req.body)
  return success(res, { message: 'Logged in successfully', data })
}

async function register(req, res) {
  const user = await service.register(req.body)
  return created(res, { message: 'User registered successfully', data: user })
}

async function signup(req, res) {
  const data = await service.signupPublic(req.body)
  return created(res, { message: 'Account created successfully', data })
}

async function publicDepartments(req, res) {
  const data = await service.listPublicDepartments()
  return success(res, { message: 'Departments fetched successfully', data })
}

async function me(req, res) {
  const user = await service.getMe(req.user.id)
  return success(res, { message: 'Profile fetched successfully', data: user })
}

async function changePassword(req, res) {
  await service.changePassword(req.user.id, req.body)
  return success(res, { message: 'Password changed successfully' })
}

async function forgotPassword(req, res) {
  const data = await service.requestPasswordReset(req.body)
  return success(res, { message: 'Account verified. You can now set a new password.', data })
}

async function resetPassword(req, res) {
  await service.resetPassword(req.body)
  return success(res, { message: 'Password reset successfully. You can now sign in.' })
}

module.exports = {
  login,
  register,
  signup,
  publicDepartments,
  me,
  changePassword,
  forgotPassword,
  resetPassword,
}
