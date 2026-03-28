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

// Root
app.get('/', (_, res) => {
  res.json({ status: 'ok', app: 'pilar-api', time: new Date().toISOString() })
})

// Health check
app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    app: 'pilar-api',
    env: process.env.NODE_ENV,
    time: new Date().toISOString(),
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/anggota', anggotaRoutes)
app.use('/api/paket', paketRoutes)
app.use('/api/pembayaran', pembayaranRoutes)
app.use('/api/tabungan-bebas', tabunganBebasRoutes)

// Temporary seed endpoint — REMOVE after first use
app.get(['/seed', '/api/seed'], async (req, res) => {
  try {
    const bcrypt = require('bcryptjs')
    const User = require('./src/models/User')
    
    // Check if users already exist
    const existing = await User.countDocuments()
    if (existing > 0) {
      return res.json({ success: true, message: `Already seeded. ${existing} users exist.` })
    }
    
    const users = [
      { username: 'admin', password: await bcrypt.hash('pilar2025', 12), nama: 'Administrator', role: 'admin' },
      { username: 'operator', password: await bcrypt.hash('op1234', 12), nama: 'Operator', role: 'operator' },
    ]
    await User.insertMany(users)
    
    res.json({ success: true, message: '2 users created: admin/pilar2025, operator/op1234' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} tidak ditemukan.` })
})

app.use(errorHandler)

// Koneksi DB
let dbConnected = false
const ensureDbConnection = async () => {
  if (!dbConnected) {
    await connectDB()
    dbConnected = true
  }
}

// Handler untuk Vercel
module.exports = async (req, res) => {
  try {
    await ensureDbConnection()
    await app(req, res)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}
