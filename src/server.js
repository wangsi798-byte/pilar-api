require('dotenv').config()
const express      = require('express')
const cors         = require('cors')
const helmet       = require('helmet')
const morgan       = require('morgan')
const connectDB    = require('./config/db')
const errorHandler = require('./middleware/errorHandler')

// Routes
const authRoutes       = require('./routes/auth')
const anggotaRoutes    = require('./routes/anggota')
const paketRoutes      = require('./routes/paket')
const pembayaranRoutes = require('./routes/pembayaran')

// Init
const app  = express()
const PORT = process.env.PORT ?? 5000

// Connect to MongoDB
connectDB()

// Middleware
app.use(helmet())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(cors({
  origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())

// Health check
app.get('/health', (_, res) => res.json({
  status: 'ok',
  app: 'pilar-api',
  env: process.env.NODE_ENV,
  time: new Date().toISOString(),
}))

// API Routes
app.use('/api/auth',        authRoutes)
app.use('/api/anggota',     anggotaRoutes)
app.use('/api/paket',       paketRoutes)
app.use('/api/pembayaran',  pembayaranRoutes)

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} tidak ditemukan.` })
})

// Error handler
app.use(errorHandler)

// For Vercel serverless
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Pilar API berjalan di port ${PORT}  [${process.env.NODE_ENV ?? 'development'}]`)
  })
}

// Export for Vercel
module.exports = app
