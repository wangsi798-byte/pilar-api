const mongoose = require('mongoose')

const TabunganBebasSchema = new mongoose.Schema({
  anggota: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anggota',
    required: true
  },
  jumlah: {
    type: Number,
    required: true,
    min: 0
  },
  tanggal: {
    type: Date,
    default: Date.now
  },
  keterangan: {
    type: String,
    trim: true
  }
}, { timestamps: true })

module.exports = mongoose.model('TabunganBebas', TabunganBebasSchema)
