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
const tabunganBebasRoutes = require('./routes/tabunganBebas')

// Init
const app  = express()
const PORT = process.env.PORT ?? 5000

// Middleware (tanpa connectDB dulu)
app.use(helmet())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
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
app.get('/health', async (_, res) => {
  try {
    // Cek koneksi DB
    const mongoose = require('mongoose')
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    
    res.json({
      status: 'ok',
      app: 'pilar-api',
      env: process.env.NODE_ENV,
      db: dbStatus,
      time: new Date().toISOString(),
    })
  } catch (error) {
    res.json({
      status: 'ok',
      app: 'pilar-api',
      env: process.env.NODE_ENV,
      db: 'check failed',
      time: new Date().toISOString(),
    })
  }
})

// API Routes
app.use('/api/auth',        authRoutes)
app.use('/api/anggota',     anggotaRoutes)
app.use('/api/paket',       paketRoutes)
app.use('/api/pembayaran',  pembayaranRoutes)
app.use('/api/tabungan-bebas', tabunganBebasRoutes)

// Temporary seed endpoint — REMOVE after first use
app.get(['/seed', '/api/seed'], async (req, res) => {
  try {
    const bcrypt = require('bcryptjs')
    const User = require('./models/User')
    
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

// Error handler
app.use(errorHandler)

// Koneksi DB untuk Vercel (dipanggil saat pertama kali request)
let dbConnected = false
const ensureDbConnection = async () => {
  if (!dbConnected) {
    await connectDB()
    dbConnected = true
  }
}

// Wrapper untuk Vercel
const handler = async (req, res) => {
  try {
    await ensureDbConnection()
    return app(req, res)
  } catch (error) {
    console.error('DB Connection Error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Untuk development
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Pilar API berjalan di port ${PORT}  [${process.env.NODE_ENV ?? 'development'}]`)
    })
  })
}

// Export untuk Vercel
module.exports = handler
