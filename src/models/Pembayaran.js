const mongoose = require('mongoose')

const pembayaranSchema = new mongoose.Schema({
  anggota:     { type: mongoose.Schema.Types.ObjectId, ref: 'Anggota', required: true },
  paket:       { type: mongoose.Schema.Types.ObjectId, ref: 'Paket',   required: true },
  jumlah:      { type: Number, required: true, min: 1 },
  tanggal:     { type: Date,   default: Date.now },
  metode:      { type: String, enum: ['tunai','transfer'], default: 'tunai' },
  keterangan:  { type: String, default: '', trim: true },
}, { timestamps: true })

// Compound index untuk query per-anggota per-paket
pembayaranSchema.index({ anggota: 1, paket: 1 })

module.exports = mongoose.model('Pembayaran', pembayaranSchema)
