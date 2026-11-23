# 4. Admin Dashboard Screens (PRD 4.8, 4.9, & 9)

Dashboard Admin hanya dapat diakses setelah autentikasi (`role = admin`). Menggunakan **Tactile App Shell** standar: *Rail* kiri di atas `--ground` + *Panel* kanan yang mengambang `8px` dengan sudut `8px`.

---

## 4.1 Admin Login (`/admin/login`)

- **Kolom:** Kartu form `464px` dengan padding `32px` (`--shadow-card`), terpusat di atas `--ground`.
- **Isi:**
  - Logo `FairyGift Admin` + deskripsi singkat `"Masuk untuk mengelola katalog, pesanan, dan pembayaran."` (`ink-11`).
  - Field **Email** (`inputMode="email"`) dan **Password** (tombol pill `"Tampilkan"` / `"Sembunyikan"` di dalam field, ukuran `24px` / `32px` touch).
  - Satu **Primary `"Masuk"`** (lebar penuh di form login, berubah menjadi `"Memeriksa…"` saat submit).
  - Validasi error: ring `1px red-11` + pesan `"Email atau kata sandi tidak sesuai."`

---

## 4.2 Admin Shell (Rail + Top Strip)

### Desktop (`>= 768px`)
- **Rail (`292px` lebar, `.surface-rail` di atas `--ground`):**
  - *Pinned top:* Identitas `FairyGift` + tombol pencarian cepat (`⌘K` cari nomor pesanan / nama pelanggan).
  - *Scrolling middle (mask fade `36px`, tanpa garis pemisah antar grup):*
    - **Ringkasan:** `Overview`
    - **Operasional:** `Pesanan`, `Pembayaran` (angka jumlah pending netral `ink-11` di kanan jika `> 0`)
    - **Katalog:** `Produk`, `Kemasan & komponen`
  - *Baris navigasi:* tinggi `36px`, `--radius-control`, ikon `16px`, gap `6px`. Aktif: fill `ink-3` (`ink-2` di dark), tanpa shadow & tanpa border.
  - *Pinned foot (`18px` dari bawah):* Satu **Rail Notice** (hanya jika ada pembayaran menunggu verifikasi: `"3 pembayaran menunggu verifikasi"`, tombol Secondary `"Periksa"`) + baris akun admin + toggle tema (`Terang` / `Gelap`).
- **Panel Utama (`.surface-panel`, mengambang `8px`, `--shadow-panel`, `rounded-[8px]`):**
  - **Top Strip (`52px`):** Breadcrumb di kiri (`ink-10` parent, `ink-8` chevron), judul halaman terpusat absolut (`13/20 ink-12`), aksi halaman di kanan (mis. tombol Primary `"Tambah produk"` dengan ikon Plus `16px`). Garis `0.5px` di bawah strip hanya tampil saat halaman di-scroll.

### Phone (`< 768px`)
- Panel penuh tepi ke tepi (`radius: 0`), rail berubah menjadi **Top Bar (`56px + safe-area`)** dengan breadcrumb logo di kiri dan tombol menu `44px` (dua garis berubah jadi `×` `160ms`) di kanan.

---

## 4.3 Dashboard Overview (PRD §4.9A)

**Kolom:** `1200px`.

1. **Metrik Utama (Satu baris kartu, angka dominan `24/32 ink-12 tabular-nums` + label `13/20 ink-11` tepat di bawahnya):**
   - Total pesanan
   - Pembayaran belum diverifikasi (`amber` status dot di samping label jika `> 0`)
   - Pesanan sedang diproses (`blue` dot)
   - Pendapatan terverifikasi (opsional atau total nominal `Paid`)
2. **Pesanan Terbaru (Ringkasan, PRD §4.9A):**
   - Judul seksi `20/28` `"Pesanan terbaru"` di kiri, aksi `"Lihat semua"` di kanan (sejajar judul, di atas tabel).
   - Tabel maksimal **5–6 baris**, tanpa zebra stripe, kolom: `No. Pesanan`, `Pelanggan`, `Total`, `Pembayaran` (status dot + label), `Status Pesanan` (status dot + label), `Aksi` (`"Lihat"` pill `24px`).
3. **Ringkasan Status Pesanan:**
   - Baris metrik/meter sederhana (`10px` bar tinggi, `tabular-nums`) menampilkan distribusi `Pending`, `Processing`, `Ready`, `Completed`.

---

## 4.4 Order Management (`/admin/pesanan`) (PRD §4.9B & §9)

**Kolom:** `1200px`.

### Toolbar Tabel (di atas tabel)
- Kiri: *Segmented Toggle* status pesanan (`Semua`, `Pending`, `Processing`, `Ready`, `Completed`, `Cancelled`; di phone menjadi dropdown pill pembuka sheet).
- Kanan: Filter pill status pembayaran, dropdown urutkan (`"Terbaru"` / `"Jadwal kirim terdekat"` untuk memprioritaskan deadline Make-to-Order), dan kolom pencarian nomor pesanan / nama pelanggan.

### Tabel Pesanan (`38px` baris desktop / `44px` phone)
- Kolom:
  1. `No. Pesanan` (`ink-12 tabular-nums`, mis. `FG-2026-0001`)
  2. `Pelanggan` (`ink-11`, max `32ch` truncate + tooltip, nama & nomor WA)
  3. `Tanggal Kirim/Ambil` (`ink-11 tabular-nums`, format `Intl.DateTimeFormat`, mis. `Jum, 27 Nov`)
  4. `Total` (`ink-11 tabular-nums`, mis. `Rp245.000`)
  5. `Pembayaran` (**8px dot + label**: `Pending` amber, `Paid` green, `Rejected` red, `Refunded` netral)
  6. `Pesanan` (**8px dot + label**: `Pending` amber, `Processing` blue ping, `Ready` green ping, `Completed` green solid, `Cancelled` netral)
  7. `Aksi` (`"Detail"` pill `24px`)
- **Baris `Cancelled`:** `opacity-50` di seluruh baris.
- **Pager:** `12px` di bawah luar frame tabel (`"Menampilkan 1-20 dari 64"` di kiri, `"Sebelumnya"` / `"Berikutnya"` di kanan).

### Order Detail Side Panel (`440px` desktop / Bottom Sheet di phone)
Membuka satu pesanan tanpa meninggalkan tabel:
1. **Header Band:** Nomor pesanan (`FG-2026-0001`) + badge terpisah untuk **Payment Status** dan **Order Status**.
2. **Body (`16px` padding, *raised card of rows*):**
   - **Informasi Pelanggan & Pengiriman:** Nama pemesan, penerima, nomor WhatsApp (dengan pill `"Salin"` & tautan langsung `"Chat WhatsApp"`), metode (`Pengiriman` / `Ambil sendiri`), alamat, tanggal, catatan.
   - **Detail Produk & Kustomisasi (PRD §4.9B):**
     - Jika Custom Gift: Jenis kemasan + warna + desain, daftar komponen isi hadiah + harga snapshot masing-masing, **Desain Kartu Ucapan + Pesan Kartu Ucapan lengkap** (tidak terpotong).
     - Total harga snapshot (`tabular-nums`).
   - **Kontrol Status Terpisah (PRD §9 & Guardrail PRD §6.15):**
     - Dropdown `Status Pesanan` (`Pending`, `Processing`, `Ready`, `Completed`, `Cancelled`) + tombol Secondary `"Simpan status"`.
     - Jika admin memilih `Processing` atau `Ready` saat status pembayaran masih `Pending`, tampilkan **notice non-blocking (`amber-3` / `amber-11`)**: `"Pembayaran masih Pending. Pastikan konfirmasi pembayaran sudah diterima sebelum memproses pesanan."`
     - Seksi **Status Pembayaran** dengan tombol aksi verifikasi manual (lihat §4.5).
3. **Footer:** Tombol Secondary `"Tutup"` di kiri, aksi konfirmasi/simpan Primary di kanan.

---

## 4.5 Manual Payment Management (`/admin/pembayaran`) (PRD §4.8 & §4.9C)

- **Filter Default:** *Segmented Toggle* terbuka pada `"Belum diverifikasi"` (`Pending`) vs `"Semua"`.
- **Aksi Verifikasi Manual (Modal Konfirmasi `460px` / Bottom Sheet):**
  - Admin dapat memilih pembaruan status ke **`Paid`** (Primary `"Verifikasi Paid"`), **`Rejected`** (Destructive trigger -> confirm `"Tolak pembayaran"`), atau **`Refunded`**.
  - Field opsional catatan verifikasi (mis. `"Bukti transfer BCA via WA diterima"`).
  - Sistem otomatis mencatat `verified_at` (timestamp) dan `verified_by` (nama admin).
  - **Riwayat Pembayaran:** Ditampilkan sebagai daftar baris kronologis ringkas di dalam detail pesanan (`"Pending -> Paid · Admin Rina · 23 Nov, 11:20"`), menggunakan `ink-11` dan `tabular-nums`.
- **Aturan Ketat PRD:** Tidak ada integrasi *payment gateway* atau tombol simulasi bayar otomatis; seluruh perubahan status pembayaran berasal dari aksi admin.

---

## 4.6 Product Management (`/admin/produk`) (PRD §4.9D)

- **Header Action:** Satu **Primary `"Tambah produk"`** (dengan ikon Plus `16px`) di kanan atas halaman.
- **Tabel Produk:** Kolom `Produk` (thumbnail `32×32px` + nama `ink-12`), `Kategori` (teks `ink-11`), `Harga` (`tabular-nums`), `Ketersediaan` (**Switch** `52×26` langsung mengubah status aktif/nonaktif dengan update optimis + fallback error toast jika API gagal), `Aksi` (`Edit` icon + `Hapus` icon `22px` dengan `touch-target`).
- **Modal Tambah / Edit Produk (`620px` desktop / Bottom Sheet phone):**
  - Header: `"Tambah produk"` atau `"Edit produk"` (tanpa tombol `×`, Cancel di footer).
  - Body (`20px` jarak antar field): Nama produk, Kategori (dropdown), Harga (`Rp`, numeric `tabular-nums`), Upload/URL Gambar (preview `0.5px ink-6`, validasi format `JPG/PNG/WebP` & ukuran maks `2 MB` dengan pesan error inline jelas jika gagal), Deskripsi (`textarea`), Switch `"Tersedia untuk dipesan"`.
  - Footer: Secondary `"Batal"` di kiri, **Primary `"Simpan produk"`** di kanan.
- **Hapus Produk:** Klik ikon hapus memunculkan Modal Konfirmasi `460px`: judul merah `"Hapus produk ini?"`, konsekuensi `"Produk tidak akan tampil di katalog pelanggan. Pesanan lama tetap menyimpan riwayatnya."`, tombol kanan solid `red-9` **`"Ya, hapus produk"`**.

---

## 4.7 Customization Management (`/admin/kustomisasi`) (PRD §4.9E)

Mengelola bahan penyusun *Custom Gift Builder* dalam satu halaman bertab *Segmented Toggle* (tanpa underline tabs):

**Segmented Toggle:** `Kemasan` | `Isi Hadiah` | `Kartu Ucapan`

1. **Tab Kemasan:**
   - Tabel jenis wadah/kemasan: Nama kemasan, daftar warna tersedia (chip warna kecil + nama), varian desain, harga (`tabular-nums`), Switch `Tersedia`, aksi Edit/Hapus.
   - Modal CRUD memungkinkan admin menambah/menghapus warna kemasan (mis. *Pink*, *Sage*, *Cream*) beserta kode hex swatch-nya.
2. **Tab Isi Hadiah (Gift Components):**
   - Tabel komponen: Thumbnail + nama (Bunga, Cokelat, Boneka Mini, Parfum, Tumbler, dll.), kategori komponen, harga (`tabular-nums`), stok (`tabular-nums`, atau status tersedia), Switch `Tersedia`, aksi Edit/Hapus.
3. **Tab Kartu Ucapan (Card Designs):**
   - Grid kartu / tabel desain kartu: Preview gambar `0.5px` frame, nama desain, biaya tambahan (jika ada, `Rp0` jika gratis), Switch `Tersedia`, aksi Edit/Hapus.
