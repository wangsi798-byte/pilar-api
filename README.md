# 🛢 Pilar API — Backend Express + MongoDB Atlas

## Tech Stack
- **Node.js** + **Express.js** — REST API server
- **MongoDB Atlas** — database cloud gratis
- **Mongoose** — ODM untuk MongoDB
- **JWT** — autentikasi token
- **bcryptjs** — enkripsi password
- **Helmet + CORS** — keamanan dasar

---

## 🚀 Setup Langkah demi Langkah

### Langkah 1 — Buat MongoDB Atlas (GRATIS)

1. Buka https://cloud.mongodb.com → daftar/login
2. Klik **"Build a Database"** → pilih **Free (M0)**
3. Pilih region terdekat (Singapore)
4. Klik **"Create"**
5. Buat user database:
   - Username: `pilaruser`
   - Password: buat yang kuat, catat!
6. Di **Network Access** → klik **"Add IP Address"** → **"Allow Access from Anywhere"** (`0.0.0.0/0`)
7. Di **Database** → klik **"Connect"** → **"Drivers"**
8. Salin connection string, bentuknya:
   ```
   mongodb+srv://pilaruser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
9. Ganti `<password>` dan tambahkan nama database `/pilar`:
   ```
   mongodb+srv://pilaruser:PASSWORD_ANDA@cluster0.xxxxx.mongodb.net/pilar?retryWrites=true&w=majority
   ```

---

### Langkah 2 — Konfigurasi .env

```bash
cp .env.example .env
```

Edit file `.env`:
```
MONGODB_URI=mongodb+srv://pilaruser:PASSWORD_ANDA@cluster0.xxxxx.mongodb.net/pilar?retryWrites=true&w=majority
JWT_SECRET=buat_string_panjang_acak_minimal_32_karakter
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

---

### Langkah 3 — Install & Jalankan

```bash
npm install
npm run seed     # ← Isi database dengan data awal
npm run dev      # ← Jalankan server (http://localhost:5000)
```

Cek apakah berjalan:
```bash
curl http://localhost:5000/health
```

---

### Langkah 4 — Konfigurasi Frontend

Di folder `pilar` (frontend), buat file `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 Endpoint API

| Method | Path                      | Keterangan              | Auth |
|--------|---------------------------|-------------------------|------|
| POST   | `/api/auth/login`         | Login, dapat token JWT  | ❌   |
| GET    | `/api/auth/me`            | Info user login         | ✅   |
| GET    | `/api/anggota`            | List semua anggota      | ✅   |
| POST   | `/api/anggota`            | Tambah anggota          | ✅   |
| PUT    | `/api/anggota/:id`        | Edit anggota            | ✅   |
| DELETE | `/api/anggota/:id`        | Hapus anggota           | ✅   |
| GET    | `/api/paket`              | List paket              | ✅   |
| POST   | `/api/paket`              | Tambah paket            | ✅   |
| PUT    | `/api/paket/:id`          | Edit paket              | ✅   |
| DELETE | `/api/paket/:id`          | Hapus paket             | ✅   |
| GET    | `/api/pembayaran`         | List pembayaran         | ✅   |
| POST   | `/api/pembayaran`         | Catat pembayaran        | ✅   |
| PUT    | `/api/pembayaran/:id`     | Edit pembayaran         | ✅   |
| DELETE | `/api/pembayaran/:id`     | Hapus pembayaran        | ✅   |
| GET    | `/api/pembayaran/rekap`   | Ringkasan laporan       | ✅   |

---

## ☁️ Deploy ke Railway (GRATIS)

1. Push `pilar-api` ke GitHub
2. Buka https://railway.app → login dengan GitHub
3. Klik **"New Project"** → **"Deploy from GitHub repo"**
4. Pilih repo `pilar-api`
5. Klik **"Variables"** → tambahkan semua isi `.env`
6. Railway otomatis detect Node.js dan deploy
7. Klik **"Settings"** → **"Domains"** → generate domain publik
8. Salin URL (cth: `https://pilar-api.railway.app`)

### Update frontend untuk production:

Di Vercel dashboard → project `pilar` → **Settings** → **Environment Variables**:
```
VITE_API_URL = https://pilar-api.railway.app/api
```

Lalu di `.env` backend di Railway:
```
CLIENT_URL = https://pilar.vercel.app
```

---

## 🔑 Kredensial Default (setelah seed)

| Username   | Password    | Role     |
|------------|-------------|----------|
| `admin`    | `pilar2025` | Admin    |
| `operator` | `op1234`    | Operator |

---

## 📁 Struktur

```
pilar-api/
├── src/
│   ├── config/
│   │   ├── db.js          ← Koneksi MongoDB
│   │   └── seed.js        ← Data awal
│   ├── models/
│   │   ├── User.js
│   │   ├── Anggota.js
│   │   ├── Paket.js
│   │   └── Pembayaran.js
│   ├── controllers/       ← Logic bisnis
│   ├── routes/            ← Definisi endpoint
│   ├── middleware/
│   │   ├── auth.js        ← JWT protect
│   │   └── errorHandler.js
│   └── server.js          ← Entry point
├── .env.example
└── package.json
```
