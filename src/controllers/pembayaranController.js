const Pembayaran = require('../models/Pembayaran')
const Anggota    = require('../models/Anggota')
const Paket      = require('../models/Paket')

// GET /api/pembayaran
exports.getAll = async (req, res, next) => {
  try {
    const { anggotaId, paketId } = req.query
    const filter = {}
    if (anggotaId) filter.anggota = anggotaId
    if (paketId)   filter.paket   = paketId

    const data = await Pembayaran.find(filter)
      .populate('anggota', 'nama telepon')
      .populate('paket',   'nama harga')
      .sort({ tanggal: -1 })
    res.json({ success: true, count: data.length, data })
  } catch (err) { next(err) }
}

// POST /api/pembayaran
exports.create = async (req, res, next) => {
  try {
    const data = await Pembayaran.create(req.body)
    await data.populate([
      { path: 'anggota', select: 'nama telepon' },
      { path: 'paket',   select: 'nama harga' },
    ])
    res.status(201).json({ success: true, data })
  } catch (err) { next(err) }
}

// PUT /api/pembayaran/:id
exports.update = async (req, res, next) => {
  try {
    const data = await Pembayaran.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    ).populate('anggota', 'nama').populate('paket', 'nama harga')
    if (!data) return res.status(404).json({ success: false, message: 'Pembayaran tidak ditemukan.' })
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

// DELETE /api/pembayaran/:id
exports.remove = async (req, res, next) => {
  try {
    const data = await Pembayaran.findByIdAndDelete(req.params.id)
    if (!data) return res.status(404).json({ success: false, message: 'Pembayaran tidak ditemukan.' })
    res.json({ success: true, message: 'Pembayaran berhasil dihapus.' })
  } catch (err) { next(err) }
}

// GET /api/pembayaran/rekap  — ringkasan per anggota untuk laporan
exports.rekap = async (req, res, next) => {
  try {
    const anggotaList = await Anggota.find().sort({ nama: 1 })
    const paketList   = await Paket.find()
    const allPay      = await Pembayaran.find()
      .populate('paket', 'nama harga')

    const rows = anggotaList.map(ang => {
      const pays      = allPay.filter(p => p.anggota.toString() === ang._id.toString())
      const paket     = pays[0]?.paket ?? null
      const terkumpul = pays.reduce((s, p) => s + p.jumlah, 0)
      const harga     = paket?.harga ?? 0
      const sisa      = Math.max(0, harga - terkumpul)
      const persen    = harga ? Math.min(100, Math.round((terkumpul / harga) * 100)) : 0
      const status    = harga > 0 && terkumpul >= harga ? 'Lunas' : harga > 0 ? 'Belum Lunas' : '-'
      return {
        anggota: { _id: ang._id, nama: ang.nama, alamat: ang.alamat, telepon: ang.telepon, status: ang.status },
        paket,
        terkumpul, harga, sisa, persen, status,
        riwayat: pays,
      }
    })

    const totalTerkumpul = rows.reduce((s, r) => s + r.terkumpul, 0)
    const totalTagihan   = rows.reduce((s, r) => s + r.harga,     0)
    const jumlahLunas    = rows.filter(r => r.status === 'Lunas').length

    res.json({
      success: true,
      ringkasan: { totalTerkumpul, totalTagihan, jumlahLunas, totalAnggota: anggotaList.length },
      data: rows,
    })
  } catch (err) { next(err) }
}
