// JWT sign / verify helpers.
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'lmui_jwt_secret_key_2026'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

function signToken(payload, expiresIn = JWT_EXPIRES_IN) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

module.exports = { signToken, verifyToken, JWT_SECRET, JWT_EXPIRES_IN }
