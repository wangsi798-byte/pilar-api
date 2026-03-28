require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const connectDB = require('./src/config/db')
const errorHandler = require('./src/middleware/errorHandler')

// Routes
const authRoutes = require('./src/routes/auth')
const anggotaRoutes = require('./src/routes/anggota')
const paketRoutes = require('./src/routes/paket')
const pembayaranRoutes = require('./src/routes/pembayaran')
const tabunganBebasRoutes = require('./src/routes/tabunganBebas')

const app = express()

// Middleware
app.use(cors({
  origin: [
    'https://pilar2.vercel.app',
    'https://pilar2-qqqoy5qgy-wangsi798-bytes-projects.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(morgan('dev'))
app.use(express.json())

// DB Connection Middleware for Vercel
let isConnected = false
app.use(async (req, res, next) => {
  if (req.path === '/' || req.path === '/health') return next()
  if (isConnected) return next()
  try {
    await connectDB()
    isConnected = true
    next()
  } catch (err) {
    console.error('DB middleware error:', err.message)
    next()
  }
})

// Root & Health
app.get('/', async (req, res) => {
  const time = new Date().toISOString()
  try {
    const User = require('./src/models/User')
    const count = await User.countDocuments().catch(() => -1)
    if (count < 0) {
      // Direct connect attempt for debugging
      await connectDB().catch(() => {})
    }
    const finalCount = await User.countDocuments().catch(() => 0)
    
    if (finalCount > 0) {
      return res.json({ status: 'ok', app: 'pilar-api', time, db: 'connected', seeded: true, users: finalCount })
    }
    
    const bcrypt = require('bcryptjs')
    await User.insertMany([
      { username: 'admin', password: await bcrypt.hash('pilar2025', 12), nama: 'Administrator', role: 'admin' },
      { username: 'operator', password: await bcrypt.hash('op1234', 12), nama: 'Operator', role: 'operator' }
    ])
    res.json({ status: 'ok', app: 'pilar-api', time, db: 'connected', seeded: 'just now' })
  } catch (err) {
    res.json({ status: 'ok', app: 'pilar-api', time, seedError: err.message })
  }
})

app.get('/health', (_, res) => {
  res.json({ status: 'ok', app: 'pilar-api', time: new Date().toISOString() })
})

// Alternative seed endpoints
const seedHandler = async (req, res) => {
  try {
    const User = require('./src/models/User')
    const existing = await User.countDocuments()
    if (existing > 0) return res.json({ success: true, message: `${existing} users exist.` })
    const bcrypt = require('bcryptjs')
    await User.insertMany([
      { username: 'admin', password: await bcrypt.hash('pilar2025', 12), nama: 'Administrator', role: 'admin' },
      { username: 'operator', password: await bcrypt.hash('op1234', 12), nama: 'Operator', role: 'operator' }
    ])
    res.json({ success: true, message: 'Seeded successfully' })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
}

app.get('/seed', seedHandler)
app.get('/api/seed', seedHandler)

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/anggota', anggotaRoutes)
app.use('/api/paket', paketRoutes)
app.use('/api/pembayaran', pembayaranRoutes)
app.use('/api/tabungan-bebas', tabunganBebasRoutes)

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl || req.url} tidak ditemukan.` })
})

app.use(errorHandler)

module.exports = app
