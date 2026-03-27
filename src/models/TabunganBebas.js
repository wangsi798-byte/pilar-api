const TabunganBebas = require('../models/TabunganBebas')

exports.getAll = async (req, res) => {
  try {
    const data = await TabunganBebas.find()
      .populate('anggota', 'nama')
      .sort({ tanggal: -1 })
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.create = async (req, res) => {
  try {
    const { anggota, jumlah, tanggal, keterangan } = req.body
    const data = await TabunganBebas.create({ anggota, jumlah, tanggal, keterangan })
    const populated = await data.populate('anggota', 'nama')
    res.status(201).json({ success: true, data: populated })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

exports.update = async (req, res) => {
  try {
    const data = await TabunganBebas.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('anggota', 'nama')
    if (!data) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' })
    res.json({ success: true, data })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

exports.remove = async (req, res) => {
  try {
    const data = await TabunganBebas.findByIdAndDelete(req.params.id)
    if (!data) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' })
    res.json({ success: true, message: 'Data berhasil dihapus' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
