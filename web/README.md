# FairyGift — Kado & Hampers Custom

Platform web e-commerce untuk **FairyGift** yang menyediakan katalog hadiah siap pesan, perangkai **Kado Custom** 3 langkah dengan estimasi harga langsung, pemesanan tamu terintegrasi **WhatsApp**, serta **Dashboard Admin** untuk mengelola pesanan, verifikasi pembayaran manual, produk, kemasan, dan isi kado.

---

## Fitur Utama

### Storefront Pembeli
- **Beranda & Katalog (`/`, `/katalog`)**: Etalase paket hadiah dengan filter kategori, filter ketersediaan, dan pencarian produk langsung.
- **Detail Produk (`/produk/[slug]`)**: Informasi detail paket hadiah beserta ketersediaan stok langsung.
- **Rangkai Kado Custom (`/custom-gift`)**: Alur bertahap (**Langkah 1–3**) untuk memilih **Kemasan** (beserta pilihan warna dan varian desain), **Isi Hadiah**, dan **Kartu Ucapan** dengan pratinjau langsung dan ringkasan harga real-time.
- **Keranjang & Pemesanan (`/keranjang`, `/checkout`)**:
  - Validasi ketersediaan produk/komponen sebelum checkout serta aksi ubah/hapus item dengan modal konfirmasi.
  - Form **Data pemesanan & pengiriman** yang informatif dengan panduan jelas per kolom, ringkasan error fokus otomatis, dan jadwal kirim/ambil minimal 2 hari.
  - Proteksi *idempotency key* untuk mencegah pesanan ganda saat klik berulang.
- **Struk & Konfirmasi WhatsApp (`/pesanan/[orderNumber]`)**: Halaman ringkasan transaksi lengkap dengan nomor pesanan monospace dan tautan langsung konfirmasi pembayaran ke WhatsApp admin.
- **Tema Terang & Gelap**: Mendukung pergantian tema di storefront, halaman login, maupun admin.

### Autentikasi & Dashboard Admin (`/login`, `/admin`)
- **Halaman Masuk Admin (`/login`)**: Autentikasi Firebase Auth Email/Password dengan logo terpusat dan tombol ikon lihat/sembunyikan kata sandi.
- **Workspace Sidebar & Top Bar**:
  - Sidebar terkelompok (**Ringkasan**, **Operasional**, **Katalog**) dengan indikator antrean pembayaran tertunda.
  - Utilitas cepat **Lihat Toko**, pengalih **Mode Gelap / Terang**, serta menu akun di bagian bawah sidebar (info akun + tombol **Keluar dari Admin**).
  - Pencarian cepat pesanan/pelanggan (`Ctrl/⌘ + K`) dan indikator status koneksi toko (**Toko Aktif** / **Mode Uji Coba**) berada di top bar utama.
- **Beranda Admin (`/admin`)**: Metrik ringkasan KPI, jadwal kirim terdekat, distribusi status pesanan, dan daftar pesanan terbaru.
- **Pesanan (`/admin/pesanan`)**: Filter status pesanan & status pembayaran, pencarian nomor pesanan/nama/WhatsApp, panel detail pesanan lengkap (termasuk tautan struk & tombol chat WhatsApp), serta pembaruan status pesanan.
- **Pembayaran (`/admin/pembayaran`)**: Antrean verifikasi pembayaran manual beserta modal konfirmasi dan riwayat log perubahan status pembayaran.
- **Produk (`/admin/produk`)**: Tambah, edit, ubah ketersediaan, dan hapus produk siap pesan beserta unggah gambar ke Cloudinary.
- **Kemasan & Isi Kado (`/admin/kustomisasi`)**: Pengelolaan tab **Kemasan** (warna, varian desain, harga), **Isi Hadiah**, dan **Kartu Ucapan**.

---

## Struktur Direktori Aplikasi (`web/`)

```text
web/
├── .env.example                  # Template variabel environment
├── eslint.config.mjs             # Konfigurasi ESLint Next.js & TypeScript
├── next.config.ts                # Konfigurasi Next.js (whitelist host res.cloudinary.com)
├── postcss.config.mjs            # Plugin PostCSS untuk Tailwind CSS v4
├── tsconfig.json                 # Konfigurasi TypeScript (@/* -> ./src/*)
├── firebase.json                 # Target rules & indexes Cloud Firestore
├── firestore.rules               # Aturan keamanan database Firestore
├── firestore.indexes.json        # Composite index query Firestore
├── scripts/
│   └── setup-integration.mjs     # CLI wizard setup .env, akun admin, & seed awal
├── public/images/                # Aset statis publik (logo SVG, ilustrasi fallback, foto produk)
└── src/
    ├── types/domain.ts           # Definisi tipe data Product, Category, CustomGift, & Order
    ├── lib/
    │   ├── constants.ts          # Konstanta bisnis (lead time 2 hari, batas karakter, kategori)
    │   ├── format.ts             # Formatter Rupiah, tanggal Indonesia, & builder URL WhatsApp
    │   ├── storage.ts            # Helper upload gambar ke Cloudinary & validasi ukuran/format
    │   ├── validators.ts         # Skema validasi Zod API & form
    │   ├── firebase/             # Konfigurasi Firebase Client SDK & Firebase Admin SDK
    │   └── data/                 # Layanan katalog Firestore, demo seed, & dev order store
    ├── components/
    │   ├── layout/               # Header & footer storefront
    │   ├── storefront/           # Kartu produk, filter katalog, detail produk, & custom gift builder
    │   ├── cart/                 # Context & provider keranjang belanja
    │   ├── admin/                # Provider autentikasi admin & shell workspace dashboard
    │   └── ui/                   # Primitif UI (BrandLogo, ModalSheet, PillBadge, StatusDot, dll.)
    └── app/
        ├── layout.tsx            # Root layout (Playfair Display, Plus Jakarta Sans, JetBrains Mono)
        ├── globals.css           # Entry Tailwind v4, .font-display, & token rose storefront
        ├── tokens.css            # Design tokens Radix Sand, radius, shadow, & skala tipografi
        ├── login/                # Halaman autentikasi admin (/login)
        ├── (storefront)/         # Halaman publik pembeli (/, /katalog, /produk, /custom-gift, /keranjang, /checkout, /pesanan)
        ├── admin/(dashboard)/    # Halaman terproteksi admin (/admin, pesanan, pembayaran, produk, kustomisasi)
        └── api/                  # Route Handlers publik (/api/products, /api/checkout, dll.) & admin (/api/admin/*)
```

---

## Stack Teknologi

- **Frontend & API Server**: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4
- **Tipografi, Ikon, Validasi & Animasi**: `Playfair Display` + `Plus Jakarta Sans` + `JetBrains Mono`, `@mui/icons-material`, Zod, Motion
- **Database & Autentikasi Admin**: Firebase Spark (Cloud Firestore + Firebase Auth Email/Password)
- **Penyimpanan Gambar**: Cloudinary Free Tier (`JPG`/`PNG`/`WebP`, maksimal `2 MB`)
- **Hosting**: Vercel Hobby

---

## Pemetaan Status Pesanan & Pembayaran

Nilai kode internal di Firestore/API tetap dipertahankan untuk kompatibilitas data, sementara seluruh tampilan UI menampilkan label berbahasa Indonesia yang ramah pengguna:

| Jenis | Kode Internal (DB/API) | Label Tampilan UI |
| --- | --- | --- |
| **Status Pesanan** | `Pending` | Menunggu |
| | `Processing` | Disiapkan |
| | `Ready` | Siap Kirim / Diambil |
| | `Completed` | Selesai |
| | `Cancelled` | Dibatalkan |
| **Status Pembayaran** | `Pending` | Belum Dibayar |
| | `Paid` | Lunas |
| | `Rejected` | Ditolak |
| | `Refunded` | Dana Dikembalikan |

---

## Struktur Rute & API

### Halaman Web
- **Storefront**:
  - `/` — Beranda toko
  - `/katalog` — Katalog produk
  - `/produk/[slug]` — Detail produk siap pesan
  - `/custom-gift` — Perangkai Kado Custom (3 langkah)
  - `/keranjang` — Keranjang belanja
  - `/checkout` — Data pemesanan & pengiriman
  - `/pesanan/[orderNumber]` — Struk pesanan & kirim konfirmasi WhatsApp
- **Autentikasi & Admin**:
  - `/login` — Halaman masuk admin
  - `/admin` — Beranda Admin (ringkasan operasional)
  - `/admin/pesanan` — Daftar & detail pesanan
  - `/admin/pembayaran` — Verifikasi pembayaran manual
  - `/admin/produk` — Kelola produk
  - `/admin/kustomisasi` — Kelola kemasan, isi hadiah, dan kartu ucapan

### API Endpoints
- **Publik**:
  - `GET /api/health` — Cek status layanan & integrasi Firebase/Cloudinary
  - `GET /api/products` — Ambil daftar produk & komponen kustomisasi
  - `POST /api/cart/validate` — Validasi stok, harga, dan ketersediaan item keranjang
  - `POST /api/checkout` — Buat pesanan baru (dengan *idempotency key*)
  - `GET /api/orders/[orderNumber]` — Ambil detail struk pesanan
  - `POST /api/seed` — Seed data katalog awal (memerlukan header `x-seed-secret`)
- **Admin** *(memerlukan Bearer Token Firebase Auth dengan role `admin`)*:
  - `GET /api/admin/overview` — Metrik operasional & jadwal kirim terdekat
  - `GET /api/admin/orders` — Daftar pesanan dengan filter & pencarian
  - `GET / PATCH /api/admin/orders/[id]` — Detail pesanan, ubah status pesanan, atau konfirmasi status pembayaran + log riwayat
  - `GET / POST /api/admin/products` & `PATCH / DELETE /api/admin/products/[id]` — Kelola produk
  - `GET / POST / PATCH / DELETE /api/admin/customizations` — Kelola kemasan, isi hadiah, dan kartu ucapan
  - `POST /api/admin/upload` — Unggah gambar produk/kustomisasi ke Cloudinary

---

## Menjalankan di Lokal

1. Masuk ke folder `web/` dan salin template environment:

```bash
cd web
cp .env.example .env
```

2. Pasang dependensi dan jalankan server pengembangan:

```bash
npm install
npm run dev
```

3. Buka `http://localhost:3000`.

> **Catatan Mode Uji Coba Lokal**: Jika kredensial Firebase belum diisi di `.env`, storefront dan dashboard admin tetap bisa dijalankan dalam **Mode Uji Coba / Pratinjau** menggunakan data demo dan penyimpanan sementara di memori/lokal (`dev-order-store`). Agar perubahan admin tersimpan permanen ke database dan foto dapat diunggah, lengkapi integrasi Firebase & Cloudinary.

### Daftar Perintah `npm`

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan Next.js (`--turbopack`) |
| `npm run build` | Membangun aplikasi production (`next build`) |
| `npm run start` | Menjalankan hasil build production |
| `npm run lint` | Menjalankan pemeriksaan ESLint |
| `npm run typecheck` | Memeriksa tipe TypeScript (`tsc --noEmit`) |
| `npm run setup` | Menjalankan wizard setup `.env`, akun admin awal, & seed Firestore |
| `npm run setup:check` | Mengecek status koneksi Firebase Client, Firebase Admin, dan Cloudinary |

---

## Variabel Environment (`.env`)

| Variabel | Keterangan |
| --- | --- |
| `NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER` | Nomor WhatsApp admin format internasional tanpa `+` (contoh: `6281234567890`) |
| `NEXT_PUBLIC_APP_URL` | URL utama aplikasi (lokal: `http://localhost:3000`, produksi: `https://faiirygift.vercel.app`) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Web API Key dari Firebase Project Settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth Domain Firebase (contoh: `project-id.firebaseapp.com`) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ID Project Firebase |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID Web Firebase |
| `FIREBASE_PROJECT_ID` | ID Project untuk Firebase Admin SDK |
| `FIREBASE_CLIENT_EMAIL` | Email Service Account Firebase Admin |
| `FIREBASE_PRIVATE_KEY` | Private Key Service Account (gunakan `\n` untuk baris baru) |
| `CLOUDINARY_CLOUD_NAME` | Nama cloud Cloudinary |
| `CLOUDINARY_API_KEY` | API Key Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret Cloudinary |
| `SEED_SECRET` | Rahasia header `x-seed-secret` untuk endpoint `/api/seed` |

---

## Setup Firebase & Cloudinary

### 1. Firebase Spark (Auth & Firestore)
1. Buka [Firebase Console](https://console.firebase.google.com/) dan buat project baru.
2. Aktifkan **Authentication -> Sign-in method -> Email/Password**.
3. Tambahkan domain deploy Anda di **Authentication -> Settings -> Authorized domains** agar login `/login` berjalan di production:
   - `faiirygift.vercel.app` (atau domain produksi Vercel Anda)
   - `localhost` (sudah tersedia secara default)
4. Aktifkan **Cloud Firestore** (pilih region terdekat, misalnya `asia-southeast2` Jakarta), lalu terapkan aturan dari `firestore.rules` dan indeks dari `firestore.indexes.json`.
5. Buat akun admin di **Authentication -> Users**, lalu buat dokumen pada koleksi `users` dengan Document ID = **User UID** admin tersebut:

```json
{
  "uid": "<USER_UID_ADMIN>",
  "name": "Admin FairyGift",
  "email": "admin@fairygift.id",
  "role": "admin",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

6. Atau gunakan wizard otomatis setelah mengisi kunci Web App & Service Account:

```bash
npm run setup
npm run setup:check
```

### 2. Cloudinary
1. Buat akun gratis di [Cloudinary](https://cloudinary.com/).
2. Salin `Cloud Name`, `API Key`, dan `API Secret` dari dashboard Cloudinary ke `.env`.

### 3. Seed Katalog Awal ke Firestore
Setelah `.env` terisi dan server berjalan (`npm run dev`), jalankan:

```bash
curl -X POST http://localhost:3000/api/seed \
  -H "x-seed-secret: fairygift-dev-seed"
```

Ganti `fairygift-dev-seed` jika nilai `SEED_SECRET` di `.env` diubah.

---

## Deploy ke Vercel

1. Push kode ke repositori GitHub dan import ke [Vercel](https://vercel.com/).
2. Atur **Root Directory** project Vercel ke `web`.
3. Masukkan seluruh environment variables dari `.env.example` ke **Project Settings -> Environment Variables** di Vercel, dengan `NEXT_PUBLIC_APP_URL` mengarah ke domain produksi Anda (contoh: `https://faiirygift.vercel.app`).
4. Pastikan domain produksi Vercel sudah ditambahkan di **Firebase Console -> Authentication -> Settings -> Authorized domains**.
5. Deploy — setiap push ke branch `main` akan otomatis memicu build & deployment terbaru di Vercel.
