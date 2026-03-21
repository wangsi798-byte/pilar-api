const Anggota = require('../models/Anggota')

// GET /api/anggota
exports.getAll = async (req, res, next) => {
  try {
    const { q, status } = req.query
    const filter = {}
    if (status) filter.status = status
    if (q)      filter.$text = { $search: q }

    const data = await Anggota.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, count: data.length, data })
  } catch (err) { next(err) }
}

// GET /api/anggota/:id
exports.getOne = async (req, res, next) => {
  try {
    const data = await Anggota.findById(req.params.id)
    if (!data) return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan.' })
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

// POST /api/anggota
exports.create = async (req, res, next) => {
  try {
    const data = await Anggota.create(req.body)
    res.status(201).json({ success: true, data })
  } catch (err) { next(err) }
}

// PUT /api/anggota/:id
exports.update = async (req, res, next) => {
  try {
    const data = await Anggota.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    )
    if (!data) return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan.' })
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

// DELETE /api/anggota/:id
exports.remove = async (req, res, next) => {
  try {
    const data = await Anggota.findByIdAndDelete(req.params.id)
    if (!data) return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan.' })
    res.json({ success: true, message: 'Anggota berhasil dihapus.' })
  } catch (err) { next(err) }
}
