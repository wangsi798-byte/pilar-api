const Paket = require('../models/Paket')

exports.getAll = async (req, res, next) => {
  try {
    const data = await Paket.find().sort({ harga: 1 })
    res.json({ success: true, count: data.length, data })
  } catch (err) { next(err) }
}

exports.getOne = async (req, res, next) => {
  try {
    const data = await Paket.findById(req.params.id)
    if (!data) return res.status(404).json({ success: false, message: 'Paket tidak ditemukan.' })
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

exports.create = async (req, res, next) => {
  try {
    const data = await Paket.create(req.body)
    res.status(201).json({ success: true, data })
  } catch (err) { next(err) }
}

exports.update = async (req, res, next) => {
  try {
    const data = await Paket.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    )
    if (!data) return res.status(404).json({ success: false, message: 'Paket tidak ditemukan.' })
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

exports.remove = async (req, res, next) => {
  try {
    const data = await Paket.findByIdAndDelete(req.params.id)
    if (!data) return res.status(404).json({ success: false, message: 'Paket tidak ditemukan.' })
    res.json({ success: true, message: 'Paket berhasil dihapus.' })
  } catch (err) { next(err) }
}
