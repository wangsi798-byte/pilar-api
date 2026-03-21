const mongoose = require('mongoose')

const paketSchema = new mongoose.Schema({
  nama:       { type: String, required: true, trim: true },
  harga:      { type: Number, required: true, min: 0 },
  deskripsi:  { type: String, default: '' },
  items:      [{ type: String, trim: true }],
  stok:       { type: Number, default: 0, min: 0 },
}, { timestamps: true })

module.exports = mongoose.model('Paket', paketSchema)
