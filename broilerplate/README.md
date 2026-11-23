# FairyGift — Boilerplate (Next.js + Tailwind v4 + Firebase + Cloudinary)

Kerangka aplikasi **FairyGift – Custom Gift E-Commerce Platform** yang sudah terhubung dengan *Tactile Design System* (`tokens.css`), skema domain PRD v1.2, Firebase (Firestore & Auth), serta upload gambar Cloudinary gratis untuk deploy ke Vercel.

## Struktur Folder

- `src/app/tokens.css` & `src/app/globals.css` — Token warna Radix Sand, skala 4px, dark mode, dan helper Tactile Design.
- `src/types/domain.ts` — Tipe TypeScript untuk Product, Packaging, GiftComponent, CardDesign, Order, PaymentLog, dan status terpisah (`OrderStatus`, `PaymentStatus`).
- `src/lib/firebase/client.ts` — Firebase Client SDK (Auth & baca publik).
- `src/lib/firebase/admin.ts` — Firebase Admin SDK untuk transaksi server, verifikasi token Admin, dan parsing `FIREBASE_PRIVATE_KEY` aman di Vercel.
- `src/lib/storage.ts` — Adapter upload Cloudinary dengan validasi `JPG/PNG/WebP` maksimal `2 MB`.
- `src/lib/validators.ts` & `src/lib/format.ts` — Validasi Zod, formatter `Rp`, dan pembuat pesan WhatsApp otomatis.
- `src/app/api/checkout/route.ts` — Transaksi checkout atomik (`runTransaction`), anti-duplikat (`idempotencyKey`), validasi/potong stok komponen, dan penomoran `FG-YYYY-XXXX`.
- `src/app/api/admin/upload/route.ts` — Endpoint upload gambar khusus admin.
- `firestore.rules` & `firestore.indexes.json` — Aturan keamanan & index komposit Firestore.

## Langkah Setup Lokal & Deploy Gratis

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Firebase (Spark Plan — Gratis tanpa kartu kredit)
1. Buat project baru di [Firebase Console](https://console.firebase.google.com).
2. Aktifkan **Authentication** → *Sign-in method* → **Email/Password**.
   - Buat 1 user admin pertama, catat `UID`-nya.
3. Aktifkan **Cloud Firestore** → Start in *Production mode*.
   - Buat dokumen di koleksi `users` dengan ID = `UID` admin tadi:
     ```json
     {
       "name": "Admin FairyGift",
       "email": "admin@fairygift.id",
       "role": "admin"
     }
     ```
   - Terapkan isi `firestore.rules` ke tab **Firestore Database → Rules**.
4. Ambil **Web App Config** (`NEXT_PUBLIC_FIREBASE_*`) dan **Service Account Private Key** (`FIREBASE_*`) dari *Project Settings*.

### 3. Setup Cloudinary (Free Plan — Gratis tanpa kartu kredit)
1. Daftar di [Cloudinary](https://cloudinary.com).
2. Salin `Cloud Name`, `API Key`, dan `API Secret` dari Dashboard.

### 4. Konfigurasi `.env.local` & Jalankan
```bash
cp .env.example .env.local
# Isi seluruh variabel di .env.local
npm run dev
```
Buka `http://localhost:3000` dan cek `http://localhost:3000/api/health` untuk memastikan semua integrasi terbaca `true`.

### 5. Deploy ke Vercel (Gratis)
1. Push folder `broilerplate` ke GitHub (atau atur *Root Directory* Vercel ke `broilerplate`).
2. Masukkan seluruh variabel dari `.env.example` ke **Vercel → Project Settings → Environment Variables**.
3. Deploy — HTTPS otomatis aktif.
