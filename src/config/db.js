const mongoose = require('mongoose')

let isConnected = false

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return mongoose.connection

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    isConnected = true
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    return conn
  } catch (err) {
    console.error(`❌ Gagal konek MongoDB: ${err.message}`)
    isConnected = false
    throw err
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB terputus, mencoba reconnect…')
  isConnected = false
})

module.exports = connectDB
