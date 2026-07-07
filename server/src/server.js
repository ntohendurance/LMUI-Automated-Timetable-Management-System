require('dotenv').config()

const app = require('./app')
const prisma = require('./config/db')

const PORT = process.env.PORT || 5000

async function start() {
  try {
    await prisma.$connect()
    // eslint-disable-next-line no-console
    console.log('✓ Connected to PostgreSQL via Prisma')

    const server = app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`✓ LMUI E-Timetable API running on http://localhost:${PORT}`)
    })

    const shutdown = async (signal) => {
      // eslint-disable-next-line no-console
      console.log(`\n${signal} received — shutting down gracefully...`)
      server.close(async () => {
        await prisma.$disconnect()
        process.exit(0)
      })
    }

    process.on('SIGINT', () => shutdown('SIGINT'))
    process.on('SIGTERM', () => shutdown('SIGTERM'))
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('✗ Failed to start server:', err)
    await prisma.$disconnect()
    process.exit(1)
  }
}

start()
