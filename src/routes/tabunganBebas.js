const express = require('express')
const router = express.Router()
const TabunganBebas = require('../models/TabunganBebas')
const Anggota = require('../models/Anggota')

// GET /api/tabungan-bebas
router.get('/', async (req, res) => {
  try {
    const { anggotaId } = req.query
    let filter = {}
    if (anggotaId) filter.anggota = anggotaId
    
    const tabungan = await TabunganBebas.find(filter)
      .populate('anggota', 'nama')
      .sort({ tanggal: -1 })
    
    res.json(tabungan)
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/tabungan-bebas
router.post('/', async (req, res) => {
  try {
    const { anggota, jumlah, tanggal, keterangan } = req.body
    
    // Validasi anggota exists
    const anggotaExists = await Anggota.findById(anggota)
    if (!anggotaExists) {
      return res.status(400).json({ success: false, message: 'Anggota tidak ditemukan' })
    }
    
    const newTabungan = new TabunganBebas({
      anggota,
      jumlah,
      tanggal: tanggal || Date.now(),
      keterangan
    })
    
    const saved = await newTabungan.save()
    const populated = await saved.populate('anggota', 'nama')
    
    res.status(201).json(populated)
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// PUT /api/tabungan-bebas/:id
router.put('/:id', async (req, res) => {
  try {
    const { anggota, jumlah, tanggal, keterangan } = req.body
    
    // Validasi anggota jika diubah
    if (anggota) {
      const anggotaExists = await Anggota.findById(anggota)
      if (!anggotaExists) {
        return res.status(400).json({ success: false, message: 'Anggota tidak ditemukan' })
      }
    }
    
    const updated = await TabunganBebas.findByIdAndUpdate(
      req.params.id,
      { anggota, jumlah, tanggal, keterangan },
      { new: true, runValidators: true }
    ).populate('anggota', 'nama')
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Tabungan tidak ditemukan' })
    }
    
    res.json(updated)
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// DELETE /api/tabungan-bebas/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await TabunganBebas.findByIdAndDelete(req.params.id)
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Tabungan tidak ditemukan' })
    }
    
    res.json({ success: true, message: 'Tabungan berhasil dihapus' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
