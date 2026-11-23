# FairyGift — Platform E-Commerce Kado & Hampers Custom

Platform e-commerce untuk **FairyGift** yang memudahkan pelanggan memilih paket hadiah siap kirim atau merangkai **Kado Custom** 3 langkah dengan estimasi harga langsung, memesan tanpa ribet, dan melakukan konfirmasi via **WhatsApp**, dilengkapi **Dashboard Admin** untuk mengelola operasional pesanan, verifikasi pembayaran, produk, dan komponen kustomisasi.

---

## Fitur Utama

### Storefront Pembeli
- **Beranda & Katalog (`/`, `/katalog`)**: Etalase paket hadiah dengan filter kategori, pencarian cepat (`Ctrl/⌘ + K`), dan pengurutan harga.
- **Detail Produk (`/produk/[slug]`)**: Tampilan rincian produk lengkap beserta status ketersediaan langsung.
- **Perangkai Kado Custom (`/custom-gift`)**: Alur interaktif 3 langkah (**Kemasan** dengan pilihan warna & varian desain → **Isi Hadiah** → **Kartu Ucapan**) dengan kalkulasi harga real-time.
- **Keranjang & Pemesanan (`/keranjang`, `/checkout`)**:
  - Validasi ketersediaan stok sebelum pemesanan dibuat.
  - Form **Data pemesanan & pengiriman** dengan ringkasan validasi aksesibel, panduan nomor WhatsApp, jadwal kirim minimal 2 hari, serta proteksi *idempotency* agar pesanan tidak dobel.
- **Struk & Konfirmasi WhatsApp (`/pesanan/[orderNumber]`)**: Halaman ringkasan transaksi dengan tombol kirim konfirmasi langsung ke WhatsApp admin.
- **Tema Terang & Gelap**: Dukungan mode tampilan di storefront dan admin.

### Dashboard Admin (`/admin`)
- **Workspace Sidebar & Top Bar**:
  - Navigasi terkelompok (**Ringkasan**, **Operasional**, **Katalog**) beserta indikator antrean pembayaran.
  - Utilitas **Lihat Toko**, pengalih **Mode Gelap / Terang**, serta menu akun admin di bagian bawah sidebar.
  - Pencarian cepat pesanan/pelanggan (`Ctrl/⌘ + K`) dan indikator status toko (**Toko Aktif** / **Mode Uji Coba**) di top bar utama.
- **Beranda Admin (`/admin`)**: Ringkasan metrik, jadwal kirim terdekat, distribusi status pesanan, dan pesanan terbaru.
- **Pesanan (`/admin/pesanan`)**: Filter status, pencarian, detail pesanan lengkap (tautan struk & tombol chat WhatsApp), dan pembaruan status pesanan.
- **Pembayaran (`/admin/pembayaran`)**: Antrean pemeriksaan pembayaran manual lengkap dengan modal konfirmasi dan riwayat log perubahan status.
- **Produk (`/admin/produk`)** & **Kemasan & Isi Kado (`/admin/kustomisasi`)**: CRUD lengkap dengan unggah foto ke Cloudinary.

---

## Struktur Repositori

```text
.
├── web/                  # Aplikasi Next.js 15 (Storefront, Admin Dashboard, & API Routes)
├── prd/                  # Product Requirements Document & alur bisnis FairyGift
├── design-system/        # Token desain, komponen, panduan UI/UX, dan aset logo
├── broilerplate/         # Referensi awal aset / template
└── .github/workflows/    # GitHub Actions CI (lint, typecheck, build)
```

Dokumentasi detail teknis aplikasi web dapat dibaca di [`web/README.md`](./web/README.md).

---

## Stack Teknologi

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling & Animasi**: Tailwind CSS v4, Lucide Icons, Motion
- **Validasi**: Zod
- **Database & Auth**: Firebase Spark (Cloud Firestore + Firebase Auth Email/Password)
- **Media Storage**: Cloudinary
- **Deployment & CI**: Vercel + GitHub Actions ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml))

---

## Menjalankan di Lokal

1. Masuk ke folder aplikasi web dan salin environment template:

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

> **Catatan Mode Uji Coba**: Tanpa mengisi kredensial Firebase di `web/.env`, storefront dan dashboard admin tetap bisa dijalankan menggunakan data demo lokal. Untuk persistensi data ke Firestore, autentikasi admin, dan unggah foto Cloudinary, lengkapi variabel di `web/.env` lalu jalankan `npm run setup`.

### Perintah yang Tersedia (di dalam `web/`)

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan lokal |
| `npm run build` | Membangun bundle production Next.js |
| `npm run start` | Menjalankan hasil build production |
| `npm run lint` | Menjalankan pemeriksaan ESLint |
| `npm run typecheck` | Menjalankan pemeriksaan tipe TypeScript (`tsc --noEmit`) |
| `npm run setup` | Wizard interaktif konfigurasi Firebase, akun admin awal, & seed Firestore |
| `npm run setup:check` | Mengecek status koneksi Firebase Client, Firebase Admin, & Cloudinary |

---

## Deploy ke Vercel & Setup Firebase

1. Import repositori ini di [Vercel](https://vercel.com/) dengan **Root Directory** diatur ke `web`.
2. Masukkan seluruh variabel dari [`web/.env.example`](./web/.env.example) pada **Project Settings → Environment Variables** di Vercel, dengan `NEXT_PUBLIC_APP_URL` diarahkan ke domain produksi (contoh: `https://faiirygift.vercel.app`).
3. Pada **Firebase Console → Authentication → Settings → Authorized domains**, pastikan domain produksi Vercel Anda sudah terdaftar agar login admin berjalan normal di production.
4. Setiap push atau pull request ke branch `main` otomatis menjalankan workflow CI (`lint`, `typecheck`, dan `build`) serta memicu deployment Vercel.
