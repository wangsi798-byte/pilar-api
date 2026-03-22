const mongoose = require('mongoose')

let isConnected = false

async function connectDB() {
  if (isConnected) return

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // Tingkatkan ke 30 detik untuk Vercel
      connectTimeoutMS: 30000,
    })
    isConnected = true
    console.log(`✅ MongoDB terhubung: ${conn.connection.host}`)
  } catch (err) {
    console.error('❌ Gagal konek MongoDB:', err.message)
    // Jangan gunakan process.exit(1) di Vercel karena akan mematikan serverless function
    throw err
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB terputus, mencoba reconnect…')
  isConnected = false
})

module.exports = connectDB
