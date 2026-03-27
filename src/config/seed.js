require('dotenv').config()
const mongoose  = require('mongoose')
const bcrypt    = require('bcryptjs')
const connectDB = require('./db')

// Import models
const User      = require('../models/User')
const Anggota   = require('../models/Anggota')
const Paket     = require('../models/Paket')
const Pembayaran = require('../models/Pembayaran')

const USERS = [
  { username: 'admin',    password: 'pilar2025', nama: 'Administrator', role: 'admin' },
  { username: 'operator', password: 'op1234',    nama: 'Operator',      role: 'operator' },
]

const PAKET = [
  {
    nama: 'Paket Bronze', harga: 300000,
    deskripsi: 'Paket sembako dasar + kue Lebaran',
    items: ['Beras 5 kg','Minyak goreng 2 L','Gula 1 kg','Kue Lebaran 1 toples'],
    stok: 30,
  },
  {
    nama: 'Paket Silver', harga: 500000,
    deskripsi: 'Paket sembako lengkap + sirup + kue',
    items: ['Beras 5 kg','Minyak goreng 2 L','Gula 2 kg','Sirup 1 botol','Kue Lebaran 2 toples','Teh 1 dos'],
    stok: 40,
  },
  {
    nama: 'Paket Gold', harga: 750000,
    deskripsi: 'Paket premium lengkap + daging + hamper',
    items: ['Beras 10 kg','Minyak goreng 2 L','Gula 2 kg','Sirup 2 botol','Kue Lebaran 3 toples','Daging sapi 1 kg','Hamper mewah'],
    stok: 20,
  },
]

const ANGGOTA = [
  { nama: 'Ahmad Fauzi',     alamat: 'Jl. Mawar No. 12',     telepon: '081234567890', bergabung: '2025-01-05', status: 'aktif' },
  { nama: 'Siti Rahmawati',  alamat: 'Jl. Melati No. 7',     telepon: '081345678901', bergabung: '2025-01-07', status: 'aktif' },
  { nama: 'Budi Santoso',    alamat: 'Jl. Kenanga No. 3',    telepon: '081456789012', bergabung: '2025-01-10', status: 'aktif' },
  { nama: 'Dewi Lestari',    alamat: 'Jl. Flamboyan No. 18', telepon: '081567890123', bergabung: '2025-01-12', status: 'aktif' },
  { nama: 'Eko Prasetyo',    alamat: 'Jl. Anggrek No. 5',    telepon: '081678901234', bergabung: '2025-01-15', status: 'aktif' },
  { nama: 'Fitri Handayani', alamat: 'Jl. Tulip No. 9',      telepon: '081789012345', bergabung: '2025-01-18', status: 'aktif' },
  { nama: 'Gunawan Hadi',    alamat: 'Jl. Seruni No. 21',    telepon: '081890123456', bergabung: '2025-01-20', status: 'nonaktif' },
  { nama: 'Hana Pertiwi',    alamat: 'Jl. Dahlia No. 4',     telepon: '081901234567', bergabung: '2025-02-01', status: 'aktif' },
]

async function seed() {
  await connectDB()
  console.log('🌱 Memulai proses seed…')

  // Kosongkan koleksi lama
  await Promise.all([
    User.deleteMany({}),
    Anggota.deleteMany({}),
    Paket.deleteMany({}),
    Pembayaran.deleteMany({}),
  ])
  console.log('🗑  Koleksi lama dibersihkan')

  // Users
  const hashedUsers = await Promise.all(
    USERS.map(async u => ({
      ...u,
      password: await bcrypt.hash(u.password, 12),
    }))
  )
  await User.insertMany(hashedUsers)
  console.log(`👤 ${USERS.length} user dibuat`)

  // Paket
  const paketDocs = await Paket.insertMany(PAKET)
  console.log(`🎁 ${paketDocs.length} paket dibuat`)

  // Anggota
  const anggotaDocs = await Anggota.insertMany(ANGGOTA)
  console.log(`👥 ${anggotaDocs.length} anggota dibuat`)

  // Pembayaran (referensikan _id dari Mongoose)
  const ang = anggotaDocs
  const pkt = paketDocs
  const PEMBAYARAN = [
    { anggota: ang[0]._id, paket: pkt[1]._id, jumlah: 100000, tanggal: '2025-02-10', metode: 'tunai',    keterangan: 'Cicilan 1' },
    { anggota: ang[0]._id, paket: pkt[1]._id, jumlah: 100000, tanggal: '2025-03-10', metode: 'tunai',    keterangan: 'Cicilan 2' },
    { anggota: ang[0]._id, paket: pkt[1]._id, jumlah: 300000, tanggal: '2025-04-01', metode: 'transfer', keterangan: 'Pelunasan' },
    { anggota: ang[1]._id, paket: pkt[0]._id, jumlah: 300000, tanggal: '2025-02-15', metode: 'transfer', keterangan: 'Lunas' },
    { anggota: ang[2]._id, paket: pkt[2]._id, jumlah: 200000, tanggal: '2025-02-20', metode: 'tunai',    keterangan: 'Cicilan 1' },
    { anggota: ang[3]._id, paket: pkt[1]._id, jumlah: 250000, tanggal: '2025-03-01', metode: 'transfer', keterangan: 'Cicilan 1' },
    { anggota: ang[4]._id, paket: pkt[0]._id, jumlah: 150000, tanggal: '2025-03-05', metode: 'tunai',    keterangan: 'Cicilan 1' },
    { anggota: ang[5]._id, paket: pkt[2]._id, jumlah: 375000, tanggal: '2025-03-10', metode: 'transfer', keterangan: 'Cicilan 1' },
    { anggota: ang[7]._id, paket: pkt[1]._id, jumlah: 500000, tanggal: '2025-04-05', metode: 'transfer', keterangan: 'Lunas' },
  ]
  await Pembayaran.insertMany(PEMBAYARAN)
  console.log(`💳 ${PEMBAYARAN.length} pembayaran dibuat`)

  console.log('\n✅ Seed selesai!')
  console.log('─────────────────────────────')
  console.log('Login: admin / pilar2025')
  console.log('Login: operator / op1234')
  console.log('─────────────────────────────')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
