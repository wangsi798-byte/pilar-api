const mongoose = require('mongoose')

const anggotaSchema = new mongoose.Schema({
  nama:      { type: String, required: true, trim: true },
  alamat:    { type: String, default: '', trim: true },
  telepon:   { type: String, default: '', trim: true },
  bergabung: { type: Date, default: Date.now },
  status:    { type: String, enum: ['aktif','nonaktif'], default: 'aktif' },
}, { timestamps: true })

// Text index untuk pencarian nama
anggotaSchema.index({ nama: 'text' })

module.exports = mongoose.model('Anggota', anggotaSchema)
