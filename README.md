# FairyGift — Platform E-Commerce Kado & Hampers Custom

Platform e-commerce untuk **FairyGift** yang memudahkan pelanggan memilih paket hadiah siap kirim atau merangkai **Kado Custom** 3 langkah dengan estimasi harga langsung, memesan tanpa ribet, dan melakukan konfirmasi via **WhatsApp**, dilengkapi **Dashboard Admin** untuk mengelola operasional pesanan, verifikasi pembayaran, produk, dan komponen kustomisasi.

---

## Fitur Utama

### Storefront Pembeli
- **Beranda & Katalog (`/`, `/katalog`)**: Etalase paket hadiah dengan filter kategori, filter ketersediaan, dan pencarian produk langsung.
- **Detail Produk (`/produk/[slug]`)**: Tampilan rincian paket hadiah, daftar isi, pemilih kuantitas, serta status ketersediaan langsung.
- **Perangkai Kado Custom (`/custom-gift`)**: Alur interaktif 3 langkah (**Kemasan** dengan pilihan warna & varian desain → **Isi Hadiah** → **Kartu Ucapan** dengan pratinjau langsung) beserta kalkulasi harga real-time dan simpan draf otomatis.
- **Keranjang & Pemesanan (`/keranjang`, `/checkout`)**:
  - Validasi ketersediaan stok & harga terbaru sebelum checkout serta aksi ubah/hapus item dengan modal konfirmasi.
  - Form **Data pemesanan & pengiriman** yang informatif dengan panduan jelas per kolom, ringkasan error fokus otomatis, jadwal kirim/ambil minimal 2 hari, serta proteksi *idempotency* agar pesanan tidak dobel.
- **Struk & Konfirmasi WhatsApp (`/pesanan/[orderNumber]`)**: Halaman ringkasan transaksi dengan nomor pesanan monospace, status pesanan & pembayaran terpisah, serta tombol kirim konfirmasi langsung ke WhatsApp admin.
- **Tema Terang & Gelap**: Dukungan mode tampilan di storefront, halaman login, dan admin.

### Autentikasi & Dashboard Admin (`/login`, `/admin`)
- **Halaman Masuk Admin (`/login`)**: Autentikasi Firebase Auth Email/Password dengan logo brand terpusat dan tombol ikon lihat/sembunyikan kata sandi.
- **Workspace Sidebar & Top Bar**:
  - Navigasi terkelompok (**Ringkasan**, **Operasional**, **Katalog**) beserta indikator antrean pembayaran.
  - Utilitas **Lihat Toko**, pengalih **Mode Gelap / Terang**, serta menu akun admin di bagian bawah sidebar.
  - Pencarian cepat pesanan/pelanggan (`Ctrl/⌘ + K`) dan indikator status toko (**Toko Aktif** / **Mode Uji Coba**) di top bar utama.
- **Beranda Admin (`/admin`)**: Ringkasan metrik KPI, jadwal kirim terdekat, distribusi status pesanan, dan pesanan terbaru.
- **Pesanan (`/admin/pesanan`)**: Filter status, pencarian, panel detail pesanan lengkap (tautan struk & tombol chat WhatsApp), dan pembaruan status pesanan.
- **Pembayaran (`/admin/pembayaran`)**: Antrean pemeriksaan pembayaran manual lengkap dengan modal konfirmasi dan riwayat log perubahan status.
- **Produk (`/admin/produk`)** & **Kemasan & Isi Kado (`/admin/kustomisasi`)**: CRUD lengkap dengan unggah foto ke Cloudinary.

---

## Struktur Proyek Secara Detail

### 1. Ringkasan Root Repositori

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions CI (lint, typecheck, build pada push/PR main)
├── web/                          # Aplikasi utama Next.js 15 (Storefront, Login, Admin, & API)
├── design-system/                # Token desain (Radix Sand), komponen, panduan layar, & aset logo
├── prd/                          # Product Requirements Document, user flow, & aturan bisnis
├── broilerplate/                 # Template/referensi awal struktur Next.js sebelum pengembangan
├── .gitignore                    # Aturan pengecualian Git di tingkat repositori
└── README.md                     # Dokumentasi utama repositori
```

### 2. Struktur Lengkap Aplikasi (`web/`)

```text
web/
├── .env.example                  # Template variabel environment (Firebase, Cloudinary, WhatsApp, Seed)
├── eslint.config.mjs             # Konfigurasi ESLint (Next.js core-web-vitals & TypeScript)
├── next.config.ts                # Konfigurasi Next.js (whitelist domain gambar res.cloudinary.com)
├── postcss.config.mjs            # Konfigurasi PostCSS untuk Tailwind CSS v4
├── tsconfig.json                 # Konfigurasi TypeScript (path alias @/* -> ./src/*)
├── package.json                  # Daftar dependensi & skrip npm (dev, build, lint, typecheck, setup)
├── firebase.json                 # Konfigurasi target Firestore rules & indexes untuk Firebase CLI
├── firestore.rules               # Aturan keamanan akses koleksi Cloud Firestore
├── firestore.indexes.json        # Definisi composite index query Cloud Firestore
├── scripts/
│   └── setup-integration.mjs     # CLI wizard setup .env, pembuatan akun admin awal, & seed data
├── public/
│   ├── favicon.ico               # Ikon tab browser
│   └── images/
│       ├── fairygift-logo.svg    # Aset SVG logo resmi FairyGift
│       ├── catalog/              # Ilustrasi SVG fallback kategori (box, card, flower, snack)
│       └── paketgift/
│           ├── buket/            # Foto produk buket siap pesan
│           └── wadahgift/        # Foto kemasan hardbox, gable box, & tote bag
└── src/
    ├── types/
    │   └── domain.ts             # Kontrak tipe TypeScript (Product, Category, CustomGift, Order, Status)
    ├── lib/
    │   ├── constants.ts          # Konstanta global (min. hari H-2, batas karakter kartu, kategori)
    │   ├── format.ts             # Formatter Rupiah (IDR), tanggal Indonesia, & link WhatsApp
    │   ├── storage.ts            # Helper upload gambar ke Cloudinary & validasi ukuran/format
    │   ├── validators.ts         # Skema validasi Zod untuk checkout, produk, dan kustomisasi
    │   ├── firebase/
    │   │   ├── client.ts         # Inisialisasi Firebase Client SDK & status konfigurasi Auth/DB
    │   │   └── admin.ts          # Inisialisasi Firebase Admin SDK & verifikasi Bearer Token admin
    │   └── data/
    │       ├── catalog-service.ts # Query katalog & produk (Firestore dengan fallback demo lokal)
    │       ├── demo-seed.ts      # Data seed katalog, kemasan, isi hadiah, & kartu ucapan bawaan
    │       └── dev-order-store.ts # Penyimpanan pesanan sementara di memori saat mode uji coba lokal
    ├── components/
    │   ├── layout/
    │   │   ├── storefront-header.tsx # Logo, navigasi utama, theme toggle, & tombol keranjang
    │   │   └── storefront-footer.tsx # Ringkasan brand, tautan belanja, dan komitmen layanan
    │   ├── storefront/
    │   │   ├── product-card.tsx      # Kartu produk katalog dengan badge kategori, status, & harga
    │   │   ├── catalog-client.tsx    # Filter kategori, status ketersediaan, & pencarian katalog
    │   │   ├── product-detail-client.tsx # Galeri detail produk, daftar isi, stepper, & tambah keranjang
    │   │   └── custom-gift-builder.tsx   # Wizard 3 tahap perangkai kado custom + ringkasan harga live
    │   ├── cart/
    │   │   └── cart-provider.tsx     # React Context keranjang belanja (sync localStorage & total)
    │   ├── admin/
    │   │   ├── admin-auth-provider.tsx # Context autentikasi admin & helper fetch ber-token
    │   │   └── admin-shell.tsx       # Sidebar workspace, top bar, pencarian Ctrl/⌘+K, & proteksi /login
    │   └── ui/
    │       ├── brand-logo.tsx        # Komponen SVG logo FairyGift responsif
    │       ├── copy-pill.tsx         # Tombol salin cepat nomor pesanan dengan feedback status
    │       ├── modal-sheet.tsx       # Dialog modal (desktop) & bottom sheet (mobile)
    │       ├── pill-badge.tsx        # Badge status & identitas kategori (plum, green, amber, red)
    │       ├── quantity-stepper.tsx  # Kontrol ubah jumlah item (- / +)
    │       ├── resilient-image.tsx   # Wrapper gambar dengan placeholder/fallback otomatis jika gagal muat
    │       ├── scroll-reveal.tsx     # Animasi masuk bertahap per section saat di-scroll (Motion)
    │       ├── segmented-toggle.tsx  # Kontrol pilihan segmen taktil (Diantar/Ambil, Semua/Tersedia)
    │       ├── status-dot.tsx        # Indikator status titik berwarna + animasi ping opsional
    │       ├── tactile-switch.tsx    # Sakelar toggle aksesibel untuk status ketersediaan
    │       ├── theme-toggle.tsx      # Pengalih mode Terang / Gelap persisten (fg-theme)
    │       └── toast.tsx             # Notifikasi toast global
    └── app/
        ├── layout.tsx            # Root layout: load font tri-stack, tema awal, Toast & CartProvider
        ├── globals.css           # Entry Tailwind v4, helper .font-display, & token rose storefront
        ├── tokens.css            # Design tokens (Radix Sand, radius, shadow, skala tipografi)
        ├── icon.svg              # App icon Next.js
        ├── login/
        │   └── page.tsx          # Halaman masuk admin (/login) dengan toggle ikon password
        ├── (storefront)/
        │   ├── layout.tsx        # Shell storefront (StorefrontHeader + main + StorefrontFooter)
        │   ├── page.tsx          # Beranda editorial (hero, keunggulan, kategori, unggulan, alur, FAQ)
        │   ├── katalog/page.tsx  # Halaman katalog semua paket hadiah
        │   ├── produk/[slug]/page.tsx    # Halaman detail paket hadiah berdasarkan slug
        │   ├── custom-gift/page.tsx      # Halaman perangkai Kado Custom 3 langkah
        │   ├── keranjang/page.tsx        # Halaman keranjang belanja & validasi stok/harga
        │   ├── checkout/page.tsx         # Form data pemesanan, pengiriman, & ringkasan order
        │   └── pesanan/[orderNumber]/page.tsx # Struk pesanan & tombol konfirmasi WhatsApp
        ├── admin/(dashboard)/
        │   ├── layout.tsx        # Pembungkus AdminAuthProvider & AdminShell untuk rute /admin/*
        │   ├── page.tsx          # Ringkasan dashboard admin (KPI, jadwal kirim, status pesanan)
        │   ├── pesanan/page.tsx  # Manajemen daftar pesanan, detail panel, & ubah status
        │   ├── pembayaran/page.tsx # Antrean verifikasi pembayaran manual & log riwayat
        │   ├── produk/page.tsx   # Manajemen CRUD produk siap pesan & upload gambar
        │   └── kustomisasi/page.tsx # Manajemen tab Kemasan, Isi Hadiah, & Kartu Ucapan
        └── api/
            ├── health/route.ts           # Cek status layanan, Firebase, & Cloudinary
            ├── products/route.ts         # Publik: daftar produk & komponen kustomisasi
            ├── cart/validate/route.ts    # Publik: validasi ketersediaan & harga item keranjang
            ├── checkout/route.ts         # Publik: buat pesanan baru dengan proteksi idempotency
            ├── orders/[orderNumber]/route.ts # Publik: ambil detail struk berdasarkan token akses
            ├── seed/route.ts             # Seed katalog awal ke Firestore (butuh x-seed-secret)
            └── admin/
                ├── overview/route.ts     # Admin: agregasi metrik dashboard & jadwal kirim
                ├── orders/route.ts       # Admin: daftar & filter pesanan
                ├── orders/[id]/route.ts  # Admin: detail, update status pesanan & verifikasi bayar
                ├── products/route.ts     # Admin: list & tambah produk baru
                ├── products/[id]/route.ts # Admin: update & hapus produk
                ├── customizations/route.ts # Admin: CRUD kemasan, isi hadiah, & kartu ucapan
                └── upload/route.ts       # Admin: upload gambar ke Cloudinary
```

### 3. Dokumentasi Produk & Sistem Desain (`prd/` & `design-system/`)

```text
prd/
├── README.md                     # Indeks dokumen kebutuhan produk
├── 01-product-overview.md        # Visi produk, target pengguna, & cakupan platform
├── 02-functional-requirements/   # Spesifikasi fitur 01–09 (Beranda hingga Dashboard Admin)
├── 03-user-flows.md              # Alur perjalanan pembeli & alur operasional admin
├── 04-business-rules.md          # Aturan bisnis (lead time H-2, custom gift, idempotency)
├── 05-non-functional-requirements.md # Target performa, keamanan, aksesibilitas, & reliabilitas
├── 06-data-requirements-and-statuses.md # Skema koleksi data & siklus status pesanan/bayar
├── 07-mvp-and-success-metrics.md # Cakupan MVP & indikator keberhasilan
└── 08-assumptions-and-open-questions.md # Asumsi teknis & daftar keputusan terbuka

design-system/
├── README.md                     # Ringkasan filosofi desain taktil & aturan penggunaan
├── tokens.css                    # Sumber token CSS sistem desain (sinkron dengan web/src/app/tokens.css)
├── 01-foundations.md             # Warna Radix Sand, tipografi tri-stack, spasi, & elevasi
├── 02-components.md              # Spesifikasi tombol, input, badge, kartu, modal, & tabel
├── 03-storefront-screens.md      # Panduan tata letak seluruh halaman storefront
├── 04-admin-screens.md           # Panduan tata letak sidebar, tabel, & panel dashboard admin
├── 05-motion-mobile-qa.md        # Kurva animasi Motion, target sentuh mobile, & checklist QA
└── logo brand/                   # File SVG master logo FairyGift
```

Dokumentasi detail teknis setup lokal & deployment juga tersedia di [`web/README.md`](./web/README.md).

---

## Stack Teknologi

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling, Tipografi & Animasi**: Tailwind CSS v4, `Playfair Display` + `Plus Jakarta Sans` + `JetBrains Mono` (`next/font/google`), Material Icons (`@mui/icons-material`), Motion
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
