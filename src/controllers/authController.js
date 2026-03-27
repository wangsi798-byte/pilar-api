const jwt  = require('jsonwebtoken')
const User = require('../models/User')

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  })
}

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' })
    }

    const user = await User.findOne({ username: username.toLowerCase() }).select('+password')
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Username atau password salah.' })
    }

    const token = signToken(user._id)
    res.json({
      success: true,
      token,
      user: { id: user._id, username: user.username, nama: user.nama, role: user.role },
    })
  } catch (err) { next(err) }
}

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({
    success: true,
    user: { id: req.user._id, username: req.user.username, nama: req.user.nama, role: req.user.role },
  })
}

// PUT /api/auth/password  (ubah password sendiri)
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id).select('+password')
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Password lama tidak sesuai.' })
    }
    user.password = newPassword
    await user.save()
    res.json({ success: true, message: 'Password berhasil diubah.' })
  } catch (err) { next(err) }
}
