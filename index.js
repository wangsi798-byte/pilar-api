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

const app = express()

// Middleware
app.use(helmet())
app.use(morgan('dev'))
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://pilar2.vercel.app',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: true,
  credentials: true,
}))
app.use(express.json())

// Health check
app.get('/', (_, res) => {
  res.json({
    status: 'ok',
    message: 'Pilar API is running',
    app: 'pilar-api'
  })
})

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
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({
        success: false,
        message: 'Konfigurasi MONGODB_URI belum diset di Vercel.',
      })
    }
    await ensureDbConnection()
    await app(req, res)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message,
      error: error.stack
    })
  }
}
