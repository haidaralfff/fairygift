# 3. Storefront Screens — Customer Flow (PRD 4.1 – 4.7)

Seluruh halaman pelanggan dapat diakses **tanpa login** (PRD §4.1 & §12.2 guest checkout). Shell storefront menggunakan *Top Bar* tunggal setinggi `52px` desktop (`56px + safe-area-inset-top` di phone) di atas permukaan `--panel`.

### Top Navigation Bar (Storefront)
- **Kiri:** Wordmark/logo `FairyGift` (`16/24 ink-12`, ikon bunga/kado `20px`) + tautan datar `Katalog` dan `Custom Gift` (`13/20 ink-11`, aktif `ink-12` di atas wash `ink-2`/`ink-3` tanpa underline tebal).
- **Kanan:** Tombol pencarian berbentuk field tipis (`0.5px ink-6`, chip `⌘K` di desktop, menjadi full-screen sheet di phone) + **Cart Utility Pill** (`28px` pill putih + `--shadow-toggle`, ikon tas `14px` + hitungan item `tabular-nums`, misal `Keranjang · 2`).
- **Garis bawah bar:** Hairline `0.5px var(--line)` muncul hanya setelah halaman di-scroll.

---

## 3.1 Homepage (PRD §4.1)

**Kolom:** `1200px` untuk grid produk, `800px` untuk blok hero & pengenalan layanan.

1. **Hero Section (Atas lipatan, tenang & langsung ke aksi):**
   - Judul Display (`32/40`, `-0.02em`): dua nada *mixed-ink*, mis. `"Hadiah personal "` (`ink-11`) + `"dirangkai sesuai momen Anda"` (`ink-12`).
   - Deskripsi `13/20 ink-11` (maksimal 2 baris, `70ch`), menjelaskan layanan Make-to-Order & Custom Gift Builder.
   - Sepasang tombol: Secondary `"Jelajahi katalog"` di kiri, **Primary `"Buat custom gift"`** di kanan (di phone bertumpuk penuh lebar, Primary di atas).
   - Media/visual produk unggulan di sisi kanan atau di bawahnya (rasio `16:9` / `4:3`, frame `0.5px ink-6`, `rounded-[var(--radius-feature)]`).
2. **Kategori Hadiah (`1200px`):**
   - Baris pill filter horizontal (`"Birthday Gift"`, `"Graduation Gift"`, `"Anniversary Gift"`, `"Aesthetic Gift"`, `"Special Occasion Gift"`). Klik langsung menuju `/katalog?kategori=...`. Di phone dapat di-scroll menyamping dengan *edge fade* `20px`, tidak pernah wrap ke 2 baris.
3. **Paket Hadiah Unggulan (`1200px`):**
   - Judul seksi `20/28` `"Paket siap pesan"` di kiri + link/tombol Secondary `"Lihat semua"` di kanan (sejajar judul, di atas grid).
   - Grid 3 kolom (desktop) / 1 kolom (phone), kelipatan 3 (`6` produk unggulan) menggunakan **Product Card**.

---

## 3.2 Product Catalog & Detail (PRD §4.2)

### Halaman Katalog (`/katalog`)
- **Kolom:** `1200px`.
- **Toolbar (di atas grid):**
  - Kiri: Baris filter kategori berupa utility pill yang scroll menyamping di phone.
  - Tengah/Kanan: Segmented toggle `"Semua"` / `"Tersedia"` + input pencarian.
- **Grid Produk:** 3–4 kolom desktop, 1 kolom phone (`gap-4` = `16px`). Produk dengan `is_available = false` tampil redup (`opacity-50`) dengan label status netral `"Stok habis"` dan tombol nonaktif.

### Halaman Detail Produk (`/produk/[slug]`)
- **Kolom:** `800px` (2 kolom desktop: foto produk `1:1` di kiri dengan `0.5px ink-6` frame, detail & aksi di kanan).
- **Hierarki kanan:**
  1. Badge kategori netral (`"Graduation Gift"`) + status dot (`"Tersedia"` hijau atau `"Tidak tersedia"` abu).
  2. Judul produk `20/28 ink-12`.
  3. Harga `24/32 ink-12 tabular-nums`.
  4. Deskripsi & daftar isi paket (`13/20 ink-11`, garis pemisah `0.5px`).
  5. Baris aksi (`36px` kontrol sejajar): *Quantity Stepper* di kiri + satu **Primary `"Tambah ke keranjang"`** mengisi sisa lebar (disabled jika tidak tersedia, dengan teks keterangan di bawahnya pada mobile).

---

## 3.3 Custom Gift Builder: 3 Tahapan (PRD §4.3 & §4.4)

**Kolom:** `1200px` terbagi menjadi area kustomisasi (`~760px`) di kiri dan **Sticky Summary Card** (`~380px`) di kanan.

**Draft Resilience:** Pilihan kemasan, warna, isi hadiah, dan teks kartu ucapan **otomatis tersimpan sementara (`localStorage`)** agar refresh halaman atau perpindahan aplikasi di ponsel tidak menghapus progres pelanggan. Sediakan tombol Ghost `"Reset pilihan"` dengan konfirmasi ringan jika pengguna ingin mengulang dari awal.

### Navigasi Tahap (*Step Markers*)
- Tidak memakai *eyebrow* `"TAHAP 1 DARI 3"`.
- Menggunakan **Step Markers** `32px` putih + `--shadow-button` (`1`, `2`, `3`) terhubung garis vertikal/horizontal `0.5px ink-6`. Tahap selesai berubah menjadi lingkaran `green-9` dengan centang `green-contrast`.
- **Progressive disclosure & Step Validation:** Tahap berikutnya tetap dapat diklik setelah tahap sebelumnya valid. Jika tombol `"Lanjut ke tahap berikutnya"` masih nonaktif, tampilkan **penjelasan satu baris di bawah tombol** (mis. `"Pilih 1 kemasan dan warnanya untuk melanjutkan."`) agar pengguna pemula tidak mengira halaman macet.

### Tahap 1. Pemilihan kemasan
- **Pilihan Wadah/Kemasan:** Grid *Selection Card* (`min-h-[124px]`, thumbnail wadah + nama + harga `tabular-nums` + radio `18px`). Terpilih = tertekan (`bg-ink-3` + hairline, tanpa shadow).
- **Pilihan Warna Kemasan:** Baris *Color Swatch Pill* (`36px`) sesuai daftar warna dari kemasan yang dipilih, selalu menampilkan lingkaran warna + nama warna.
- **Pilihan Desain Kemasan:** *Choice Tiles* 2 kolom untuk varian desain/pita yang tersedia.

### Tahap 2. Pemilihan isi hadiah (Multi-Select)
- **Pencarian & Filter:** Filter kategori komponen dinamis (hanya kategori yang memiliki item) + input pencarian cepat bila komponen berjumlah `>= 15` agar terhindar dari *wall of options*, disertai jumlah terpilih (`"3 dipilih"`).
- Grid 2 kolom (1 kolom phone) *Choice Tile* dengan gambar mini `40×40px` (`0.5px` frame), nama komponen, harga satuan (`+Rp35.000`, `tabular-nums`), dan checkbox kotak `--radius-sm`.
- Hanya komponen dengan `is_available = true` (dan stok tersedia) yang ditampilkan. Minimal `1` komponen dipilih sebelum lanjut ke Tahap 3.

### Tahap 3. Kartu ucapan
- **Desain Kartu:** Grid horizontal/2-kolom *Selection Card* menampilkan preview desain kartu ucapan yang tersedia.
- **Teks Ucapan:** *Well* textarea `min-h-21`, label `"Pesan kartu ucapan (opsional)"`, batas `maxLength="250"`, counter karakter `12/16 ink-10 tabular-nums` (`0/250`) di kanan bawah label. Teks panjang dan emoji terbungkus rapi (`overflow-wrap: break-word`).
- **Ringkasan Personalisasi Kartu:** Preview *raised card* kecil di bawah input yang langsung menampilkan teks ucapan di atas desain kartu terpilih secara tenang (tanpa efek 3D/gradient berlebihan).

### Dynamic Price Calculation & Summary Card (PRD §4.4)
- **Desktop (Kanan Sticky):** Data card (`--shadow-card`, `p-6`) berisi:
  - Rincian item terpilih: Kemasan + Warna/Desain (`harga`), Daftar Komponen (`harga` masing-masing), Kartu Ucapan (`harga` / `Termasuk`).
  - Garis `0.5px var(--line)`.
  - Baris **Total Harga**: label `13/20 ink-11`, nominal `24/32 ink-12 tabular-nums` (`Harga Kemasan + Total Komponen + Biaya Tambahan`) di dalam region `aria-live="polite"`.
  - Satu **Primary `"Tambah ke keranjang"`** (aktif setelah kemasan & minimal 1 isi hadiah dipilih; di tahap 1 & 2 tombol utama adalah `"Lanjut ke tahap berikutnya"`).
- **Phone (`< 768px`):**
  - *Summary* ringkas & tombol utama berpindah ke **Fixed Bottom Action Bar** (total harga di kiri `20/28 tabular-nums` + link `"Rincian"` yang membuka bottom sheet rincian komponen; tombol Primary di kanan/full-width).

---

## 3.4 Shopping Cart (`/keranjang`) (PRD §4.5)

- **Kolom:** `800px` (atau `1200px` split daftar item kiri + ringkasan kanan jika desktop).
- **Daftar Item:** Kartu terangkat (`--shadow-card`) berisi baris item terpisah garis `0.5px`.
  - **Item Paket Siap Pesan:** Foto + nama + harga satuan + *Quantity Stepper* + subtotal + tombol Ghost `"Hapus"`.
  - **Item Custom Gift:** Badge identifikasi `plum` (`"Custom Gift"`) + ringkasan *compact* 3 baris (`Kemasan: ...`, `Isi: ...`, `Kartu: "..."`) + *Quantity Stepper* + subtotal + link `"Ubah"` (kembali ke builder membawa data yang tersimpan) & `"Hapus"`.
- **Stale Stock / Price Guard:** Jika ada produk atau komponen dalam keranjang yang baru saja dinonaktifkan/habis di database, beri penanda `red-3`/`red-11` inline pada baris tersebut (`"Komponen ini baru saja habis. Ubah atau hapus item untuk melanjutkan."`) dan nonaktifkan `"Lanjut ke checkout"` sampai item diperbaiki.
- **Empty State:** Panel `ink-2` polos + ikon tas `18px` + `"Keranjang belanja kosong."` / `"Pilih paket hadiah atau buat hadiah custom terlebih dahulu."` + tombol Secondary `"Lihat katalog"`.
- **Footer / Ringkasan:** Subtotal, total harga (`tabular-nums`), dan satu **Primary `"Lanjut ke checkout"`**.

---

## 3.5 Checkout (`/checkout`) (PRD §4.6)

- **Kolom:** `440px` form terpusat (atau `800px` grid: form `440px` kiri + ringkasan pesanan `320px` kanan pada desktop).
- **Struktur Form (jarak antar field `20px`, semua input *well* `ink-3`, `16px` di touch):**
  1. **Nama pelanggan** (wajib, `autocomplete="name"`)
  2. **Nama penerima** `(opsional)`. Keterangan: `"Isi jika berbeda dengan nama pemesan."`
  3. **Nomor WhatsApp aktif** (wajib, `inputMode="tel"`, `autocomplete="tel"`, contoh placeholder `"081234567890"`)
  4. **Metode penerimaan:** Segmented Toggle (`"Pengiriman"` / `"Ambil sendiri"`)
  5. **Alamat pengiriman** (textarea *well*, muncul secara halus `200ms` hanya saat `"Pengiriman"` dipilih; wajib jika pengiriman)
  6. **Tanggal pengiriman atau pengambilan** (wajib, `min` tanggal hari ini atau H+1 sesuai aturan operasional agar tanggal lampau tercegah)
  7. **Catatan tambahan** `(opsional)` (textarea *well*)
- **Ringkasan Pesanan:** Menampilkan daftar item, detail kustomisasi lengkap, dan total harga (`tabular-nums`).
- **Idempotensi & Pemulihan Error (PRD §7.4):**
  - Satu **Primary `"Konfirmasi pesanan"`** menggunakan *idempotency token* per sesi checkout agar klik ganda atau jaringan lambat **tidak pernah membuat pesanan duplikat**.
  - Saat diklik berubah *in-place* menjadi spinner + `"Membuat pesanan…"`, field terkunci *read-only* sementara.
  - Jika server gagal (`500` / timeout), **seluruh input form tetap terjaga** dan tampilkan banner/toast error jelas dengan tombol `"Coba lagi"`. Server selalu menghitung ulang seluruh harga sebelum menyimpan.

---

## 3.6 Order Confirmation & WhatsApp Integration (`/pesanan/[orderNumber]`) (PRD §4.7)

Halaman konfirmasi memiliki URL tetap berbasis nomor pesanan (dengan token akses/verifikasi nomor WA singkat atau sesi lokal agar data pelanggan terlindungi per PRD §7.2) sehingga pelanggan tetap dapat mengakses tombol WhatsApp meskipun menutup tab sebelumnya.

- **Kolom:** `440px` terpusat di atas `--panel`.
- **Struktur Card (`--shadow-card`, `p-6`):**
  1. **Status Banner:** Pill badge `green` (`"Pesanan berhasil dibuat"`).
  2. **Nomor Pesanan:** Ditampilkan menonjol (`20/28 font-mono ink-12`, misal `FG-2026-0001`) + **Utility Pill `"Salin"`** (klik langsung menjadi centang selama `1500ms`, tanpa toast).
  3. **Ringkasan Tersimpan:** *Raised card of rows* (`0.5px` pemisah) berisi nama pemesan, detail produk/kustomisasi, kartu ucapan, dan **Total Harga** (`tabular-nums`).
  4. **Catatan Eksplisit (PRD §4.7 & §6.17):** Teks `13/20 ink-11`: `"Pesanan Anda sudah tersimpan. Klik tombol di bawah lalu tekan Kirim di WhatsApp untuk konfirmasi dan instruksi pembayaran."`
  5. **Aksi Utama (Satu-satunya Primary):** Tombol **`"Hubungi admin via WhatsApp"`** dengan ikon chat `16px` mengarah ke `https://wa.me/<nomoradmin>?text=<encoded_message>`.
  6. **Fallback & Aksi Sekunder:** Utility Pill `"Salin pesan WhatsApp"` (jika `wa.me` gagal terbuka di perangkat desktop tertentu) + tombol Secondary `"Kembali ke beranda"`.

