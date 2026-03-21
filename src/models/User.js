const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema({
  username: {
    type: String, required: true, unique: true,
    trim: true, lowercase: true, minlength: 3,
  },
  password: { type: String, required: true, minlength: 6, select: false },
  nama:     { type: String, required: true, trim: true },
  role:     { type: String, enum: ['admin','operator'], default: 'operator' },
}, { timestamps: true })

// Hash password sebelum disimpan
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Bandingkan password login
userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}

module.exports = mongoose.model('User', userSchema)
