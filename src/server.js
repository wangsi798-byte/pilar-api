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

// DB Connection Middleware for Vercel
let isConnected = false
app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      const connectDB = require('./config/db')
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
    const User = require('./models/User')
    const existing = await User.countDocuments()
    if (existing > 0) return res.json({ status: 'ok', app: 'pilar-api', time, db: 'connected', uri, seeded: true, users: existing })
    const bcrypt = require('bcryptjs')
    await User.insertMany([
      { username: 'admin', password: await bcrypt.hash('pilar2025', 12), nama: 'Administrator', role: 'admin' },
      { username: 'operator', password: await bcrypt.hash('op1234', 12), nama: 'Operator', role: 'operator' }
    ])
    res.json({ status: 'ok', app: 'pilar-api', time, db: 'connected', uri, seeded: 'just now' })
  } catch (err) { res.json({ status: 'ok', app: 'pilar-api', time, db: 'failed', uri, seedError: err.message }) }
})

app.get('/health', (_, res) => {
  res.json({ status: 'ok', app: 'pilar-api', env: process.env.NODE_ENV, time: new Date().toISOString() })
})

// Alternative seed endpoints
const seedHandler = async (req, res) => {
  try {
    const User = require('./models/User')
    const existing = await User.countDocuments()
    if (existing > 0) return res.json({ success: true, message: `${existing} users exist.` })
    const bcrypt = require('bcryptjs')
    await User.insertMany([
      { username: 'admin', password: await bcrypt.hash('pilar2025', 12), nama: 'Administrator', role: 'admin' },
      { username: 'operator', password: await bcrypt.hash('op1234', 12), nama: 'Operator', role: 'operator' }])
    res.json({ success: true, message: 'Seeded successfully' })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
}

app.get('/seed', seedHandler)
app.get('/api/seed', seedHandler)

// API Routes
app.use('/api/auth',        authRoutes)
app.use('/api/anggota',     anggotaRoutes)
app.use('/api/paket',       paketRoutes)
app.use('/api/pembayaran',  pembayaranRoutes)
app.use('/api/tabungan-bebas', tabunganBebasRoutes)

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
