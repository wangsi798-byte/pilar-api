const mongoose = require('mongoose')

let isConnected = false

async function connectDB() {
  if (isConnected) return

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    isConnected = true
    console.log(`✅ MongoDB terhubung: ${conn.connection.host}`)
  } catch (err) {
    console.error('❌ Gagal konek MongoDB:', err.message)
    process.exit(1)
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB terputus, mencoba reconnect…')
  isConnected = false
})

module.exports = connectDB
