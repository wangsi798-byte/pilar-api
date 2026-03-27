const mongoose = require('mongoose')

const tabunganBebasSchema = new mongoose.Schema({
  anggota:    { type: mongoose.Schema.Types.ObjectId, ref: 'Anggota', required: true },
  jumlah:     { type: Number, required: true },
  tanggal:    { type: Date, default: Date.now },
  keterangan: { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('TabunganBebas', tabunganBebasSchema)
