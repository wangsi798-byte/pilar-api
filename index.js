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
// CORS harus di paling atas agar preflight OPTIONS request tidak terblokir
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
}))

app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())

// Health check (Tanpa perlu koneksi DB)
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

// Middleware koneksi DB untuk semua route API
let dbConnected = false
app.use(async (req, res, next) => {
  // Lewati koneksi DB untuk request OPTIONS (preflight) agar cepat
  if (req.method === 'OPTIONS') {
    return next()
  }

  if (!dbConnected) {
    try {
      if (!process.env.MONGODB_URI) {
        return res.status(500).json({
          success: false,
          message: 'Konfigurasi MONGODB_URI belum diset.',
        })
      }
      await connectDB()
      dbConnected = true
      next()
    } catch (error) {
      console.error('Database connection error:', error)
      res.status(500).json({
        success: false,
        message: 'Gagal terhubung ke database: ' + error.message,
      })
    }
  } else {
    next()
  }
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/anggota', anggotaRoutes)
app.use('/api/paket', paketRoutes)
app.use('/api/pembayaran', pembayaranRoutes)

// 404 handler (Hanya untuk route yang tidak terdaftar)
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} tidak ditemukan.` })
})

// Error handler
app.use(errorHandler)

// Export app untuk Vercel
module.exports = app
