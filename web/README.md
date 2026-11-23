# FairyGift — Platform E-Commerce Hadiah Kustom

Platform web e-commerce untuk **FairyGift** (katalog hadiah siap pesan, **Custom Gift Builder** 3 langkah dengan kalkulasi harga real-time, **Guest Checkout + WhatsApp**, dan **Admin Dashboard** untuk pengelolaan pesanan, verifikasi pembayaran manual, produk, serta komponen kustomisasi).

## Arsitektur Gratis untuk Deploy Online

- **Frontend & API Server**: Next.js 15 App Router + TypeScript + Tailwind CSS v4 — **Vercel Hobby** (Gratis)
- **Database & Autentikasi Admin**: **Firebase Spark** (Cloud Firestore + Firebase Auth Email/Password, tanpa kartu kredit)
- **Penyimpanan Gambar Produk**: **Cloudinary Free Tier** (25 GB bandwidth/bulan, validasi `JPG/PNG/WebP` maksimal `2 MB`)

## Menjalankan di Lokal

1. Masuk ke folder `web/` lalu salin file environment:

```bash
cp .env.example .env
```

2. Jalankan server pengembangan:

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

> **Catatan Mode Demo Lokal**: Tanpa mengisi kredensial Firebase di `.env`, Storefront (Beranda, Katalog, Detail Produk, Custom Gift Builder, Keranjang, Checkout, dan Halaman Sukses Pesanan) tetap bisa diuji langsung menggunakan data demo dan penyimpanan transaksi lokal (`dev-order-store`). Untuk mengaktifkan **Admin Dashboard** dan persistensi database **Firestore**, lengkapi langkah setup Firebase dan Cloudinary di bawah.

---

## Setup Firebase Spark (Gratis)

1. Buka [Firebase Console](https://console.firebase.google.com/) dan buat project baru (Spark Plan).
2. Aktifkan **Authentication** -> Sign-in method -> **Email/Password**.
3. Buat akun admin di tab **Authentication -> Users** (misal `admin@fairygift.id`), lalu salin **User UID**-nya.
4. Aktifkan **Cloud Firestore** (pilih region terdekat seperti `asia-southeast2` Jakarta).
5. Buat dokumen di Firestore pada koleksi `users` dengan Document ID = **User UID** tadi:

```json
{
  "uid": "<USER_UID_ADMIN>",
  "name": "Admin FairyGift",
  "email": "admin@fairygift.id",
  "role": "admin",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

6. Salin aturan keamanan dari `firestore.rules` ke tab **Firestore -> Rules** (atau deploy via `firebase deploy --only firestore` menggunakan `firebase.json` yang sudah tersedia) dan indeks dari `firestore.indexes.json`.
7. Ambil kunci **Web App** (Project Settings -> Your apps) dan **Service Account** JSON (Project Settings -> Service accounts -> Generate new private key).
8. Jalankan wizard integrasi otomatis agar tidak salah format `FIREBASE_PRIVATE_KEY`, sekaligus membuat akun Admin pertama & seed data katalog:

```bash
npm run setup
```

Atau cek status koneksi integrasi kapan saja:

```bash
npm run setup:check
```

## Setup Cloudinary (Gratis)

1. Daftar akun gratis di [Cloudinary](https://cloudinary.com/).
2. Dari Dashboard Cloudinary, salin `Cloud Name`, `API Key`, dan `API Secret` ke `.env`:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## Seed Katalog Awal ke Firestore

Setelah `.env` terisi dan server berjalan (`npm run dev`), jalankan permintaan `POST` ke `/api/seed` untuk mengisi kategori, produk siap pesan, kemasan, komponen isi hadiah, dan kartu ucapan awal:

```bash
curl -X POST http://localhost:3000/api/seed \
  -H "x-seed-secret: fairygift-dev-seed"
```

Ganti `fairygift-dev-seed` jika Anda mengubah nilai `SEED_SECRET` di `.env`.

## Deploy Online ke Vercel (Gratis)

1. Push folder `web/` ke repositori GitHub Anda (atau atur **Root Directory** Vercel ke `web`).
2. Import repositori di [Vercel](https://vercel.com/).
3. Masukkan seluruh environment variables dari `.env.example` ke **Project Settings -> Environment Variables** di Vercel (`NEXT_PUBLIC_APP_URL` diisi domain produksi Vercel Anda, misalnya `https://fairygift.vercel.app`).
4. Klik **Deploy**.

## Struktur Rute Utama

- **Storefront**:
  - `/` — Beranda toko
  - `/katalog` — Katalog produk dengan filter kategori, pencarian, dan pengurutan
  - `/produk/[slug]` — Detail produk siap pesan
  - `/custom-gift` — Custom Gift Builder 3 langkah (Kemasan, Isi Hadiah, Kartu Ucapan)
  - `/keranjang` — Keranjang belanja dengan validasi stok/ketersediaan terbaru
  - `/checkout` — Checkout tamu dengan idempotency token
  - `/pesanan/[orderNumber]` — Halaman ringkasan pesanan dan tombol kirim konfirmasi WhatsApp
- **Admin Dashboard** (`/admin/login`):
  - `/admin` — Overview metrik & pesanan terbaru
  - `/admin/pesanan` — Manajemen pesanan, panel detail, dan pembaruan `orderStatus`
  - `/admin/pembayaran` — Verifikasi pembayaran manual & log riwayat verifikasi
  - `/admin/produk` — CRUD produk siap pesan + upload gambar Cloudinary
  - `/admin/kustomisasi` — CRUD Kemasan, Isi Hadiah, dan Kartu Ucapan
