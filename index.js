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
app.use(helmet())
app.use(morgan('dev'))
app.use(cors({
  origin: true,
  credentials: true,
}))
app.use(express.json())

// DB Connection Middleware for Vercel
let isConnected = false
app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectDB()
      isConnected = true
    } catch (err) {
      console.error('DB Connection Error:', err)
    }
  }
  next()
})

// Root & Health
app.get('/', async (req, res) => {
  const time = new Date().toISOString()
  const uri = process.env.MONGODB_URI ? 'SET' : 'MISSING'
  
  try {
    const User = require('./src/models/User')
    const existing = await User.countDocuments()
    
    if (existing > 0) {
      return res.json({ status: 'ok', app: 'pilar-api', time, db: 'connected', uri, seeded: true, users: existing })
    }
    
    const bcrypt = require('bcryptjs')
    await User.insertMany([
      { username: 'admin', password: await bcrypt.hash('pilar2025', 12), nama: 'Administrator', role: 'admin' },
      { username: 'operator', password: await bcrypt.hash('op1234', 12), nama: 'Operator', role: 'operator' }
    ])
    res.json({ status: 'ok', app: 'pilar-api', time, db: 'connected', uri, seeded: 'just now' })
  } catch (err) {
    res.json({ status: 'ok', app: 'pilar-api', time, db: 'failed', uri, seedError: err.message })
  }
})

app.get('/health', (_, res) => {
  res.json({ status: 'ok', app: 'pilar-api', env: process.env.NODE_ENV, time: new Date().toISOString() })
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

// Untuk development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Pilar API berjalan di port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`)
    })
  })
}

module.exports = app
