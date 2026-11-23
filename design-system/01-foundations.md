# 1. Foundations — Warna, Tipografi, Ruang, dan Elevasi

## 1.0 Aset Brand Logo

Logo resmi FairyGift tersedia di [Gemini_Generated_Image_wzjby1wzjby1wzjb-Photoroom.svg](./logo%20brand/Gemini_Generated_Image_wzjby1wzjby1wzjb-Photoroom.svg).

- **Palet logo:** `#d54f75`, `#f57fa7`, `#fce0ea`, dan `#d39fc4` (nuansa *rose-pink* & *lilac-plum*).
- **Penyesuaian rasio & ukuran:** File SVG asli memiliki kanvas `viewBox="0 0 1466 819"` dengan ruang kosong di sekeliling ilustrasi. Saat dipasang pada *Top Bar* (`52px`) atau *Admin Rail* (`292px`), potong `viewBox` ke area konten (`200 265 1070 265`) dan kunci tingginya (`24–28px` di navbar, `20px` di breadcrumb mobile) agar proporsinya sejajar dengan kontrol `36px`.
- **Keselarasan warna UI:** Karena `#d54f75` berdekatan dengan warna status bahaya (`red`), sistem desain memilih **`plum`** (selaras dengan aksen `#d39fc4` pada logo) sebagai *identity hue* UI agar tidak bertabrakan dengan warna status *Rejected/Error*.

## 1.1 Sistem Warna Berbasis Peran (*Color Roles*)

Seluruh struktur UI FairyGift menggunakan skala netral hangat **Radix Sand** (`ink-1..12`), bukan warna *brand*. Warna (*hue*) hanya dipakai untuk **status** atau **identitas kategori/custom**.

### Skala Netral (`ink`)

| Step | Peran | Light (`Sand`) | Dark (`Sand`) |
|---|---|---|---|
| `ink-1` | Page ground / panel dasar | `#fdfdfc` | `#111110` |
| `ink-2` | App ground / rail (light), kartu terangkat (dark) | `#f9f9f8` | `#191918` |
| `ink-3` | Well input, chip tenang, item terpilih | `#f1f0ef` | `#222221` |
| `ink-4` | Hover pada fill, fokus pada well | `#e9e8e6` | `#2a2a28` |
| `ink-5` | Pressed fill, garis `0.5px` di dark | `#e2e1de` | `#31312e` |
| `ink-6` | Garis struktural (`0.5px`), cincin kontrol dark | `#dad9d6` | `#3b3a37` |
| `ink-7` | Garis kuat, outline kontrol di atas kartu (dark) | `#cfceca` | `#494844` |
| `ink-8` | Teks disabled di atas fill (jarang) | `#bcbbb5` | `#62605b` |
| `ink-9` | Ikon awal, judul grup rail, teks dekoratif non-esensial | `#8d8d86` | `#6f6d66` |
| `ink-10` | Placeholder, chevron, tombol `×`, `(opsional)`, breadcrumb induk | `#6d6c66` | `#8f8d85` |
| `ink-11` | Deskripsi, body sekunder, label metrik, teks kosong yang terbaca | `#63635e` | `#b5b3ad` |
| `ink-12` | Judul, nilai utama, label aktif, fill tombol Primary | `#21201c` | `#eeeeec` |

> [!IMPORTANT]
> **Aturan Gerbang Kontras 4.5:1 (Wajib):**
> Pada skala *Sand* asli, `ink-10` (`3.87:1`) gagal memenuhi kontras `4.5:1` di atas putih dan sumur input `ink-3`. Karena itu, `tokens.css` menyetel `--root-ink-10` ke `#6d6c66` (light, `5.26:1` di atas putih / `4.63:1` di atas `ink-3`) dan `#8f8d85` (dark, `4.89:1` di atas `ink-3`) agar seluruh placeholder, breadcrumb, dan label opsional lulus WCAG AA. Sementara itu, `ink-9` tetap dibatasi untuk ikon dekoratif/non-esensial, dan teks panduan utama tetap memakai `ink-11`.

### Pemetaan Warna Status & Identitas FairyGift

Status selalu mengalahkan identitas jika terjadi tabrakan warna.

| Peran | Skala Hue | Digunakan untuk (PRD §4.2, §4.8, §9) |
|---|---|---|
| **Identity (Brand)** | `plum` (`plum-3` / `plum-11`) | Label penanda `"Custom Gift"`, badge produk unggulan/edisi, seri chart kategori hadiah |
| **Warning** | `amber` (`amber-3` / `amber-11` / dot `amber-9`) | Order Status **Pending**, Payment Status **Pending** (menunggu verifikasi manual admin) |
| **Info** | `blue` (`blue-3` / `blue-11` / dot `blue-9` ping) | Order Status **Processing** (sedang dirakit) |
| **Success** | `green` (`green-3` / `green-11` / dot `green-9`) | Order Status **Ready** (dot ping), Order Status **Completed**, Payment Status **Paid**, Status `"Tersedia"` |
| **Danger** | `red` (`red-3` / `red-11` / `red-9`) | Payment Status **Rejected**, error validasi form, konfirmasi hapus produk/komponen (`red-9` hanya di modal konfirmasi akhir) |
| **Inactive / Neutral** | `white` / `ink-3` (`--shadow-button`) | Order Status **Cancelled**, Payment Status **Refunded**, Status `"Habis"` / `"Nonaktif"` |

**Aturan Status PRD §9:**
- Status pesanan dan status pembayaran **tidak pernah digabung** menjadi satu badge. Keduanya selalu tampil berpasangan secara terpisah (di tabel sebagai dua kolom dot+teks; di panel detail sebagai dua baris terpisah).

---

## 1.2 Tipografi & Aturan *Copy* Bahasa Indonesia

- **Kombinasi Font (Tri-Stack):**
  - **Display / Editorial Serif (`--font-display`):** `"Playfair Display", Georgia, serif` (`500`, `600`, `700`, normal & italic) — dipakai pada judul utama (*hero*), judul seksi editorial beranda, judul halaman storefront, pratinjau pesan kartu ucapan, dan judul halaman login.
  - **Primary UI & Body Sans (`--font-sans`):** `"Plus Jakarta Sans", system-ui, sans-serif` (`400`, `500`, `600`, `700`) — dipakai untuk seluruh teks isi, kontrol UI, navigasi, form, kartu produk, dan operasional admin.
  - **Font Monospace (`--font-mono`):** `"JetBrains Mono", ui-monospace, monospace` (`400`, `500`, `600`) — khusus ID mesin/kode yang disalin tepat seperti nomor pesanan (`FG-2026-0001`), kode warna hex di admin, dan *key chip* (`⌘K`).
- **Hierarki Bobot:**
  - `400` (*Regular*): Teks deskripsi, paragraf isi, catatan bantu, jawaban FAQ.
  - `500` (*Medium*): Label form, tautan navigasi, tombol sekunder, pill kategori, baris tabel.
  - `600` (*SemiBold*): Judul seksi/kartu, harga produk & total pembayaran, nilai metrik KPI, CTA utama.
- **Angka:** Wajib `font-variant-numeric: tabular-nums` (`tabular-nums`) pada seluruh harga (`Rp185.000`), kuantitas, metrik dashboard, dan tanggal.

### Skala Tipografi

| Peran | Token | Desktop | Phone (`< 768px`) | Ink | Contoh di FairyGift |
|---|---|---|---|---|---|
| Display | `--text-display` | `34/42` (Hero `clamp(2.15rem, 4vw, 3.35rem)`), `-0.02em` | `34/42` (atau `24/32` jika >2 baris) | `ink-12` + `fg-rose-text` italic | `"Hadiah personal yang "` + *`"dirangkai khusus"`* |
| Figure | `--text-figure` | `24/32` | `24/32` | `ink-12` | `128` (Total pesanan), `Rp245.000` (Total builder) |
| Section / Page Title | `--text-section` | `20/28` | `20/28` | `ink-12` | `"Rangkai kado custom"`, `"Pesanan masuk"` |
| Card / Step / Dialog Title | `--text-title` | `16/24` | `16/24` | `ink-12` | `"Tahap 1. Pilih kemasan"`, `"Verifikasi pembayaran"` |
| Body & Controls | `--text-body` | `14/21` | `15/24` (`14/20` untuk sub-keterangan) | `ink-12` nilai / `ink-11` deskripsi | Label tombol, deskripsi paket, teks kartu ucapan |
| Meta & Badge | `--text-meta` | `12/16` (badge `12/20`) | `15/20` (badge `14/22`) | `ink-10` (atau `ink-11` jika penting) | `"(opsional)"`, timestamp verifikasi, teks badge |
| Field Input | `--text-field` | `14/21` | **`16/24`** (wajib di `pointer: coarse`) | `ink-12` | Input nama, nomor WhatsApp, pesan kartu ucapan |

### Aturan *Copy* UI (Wajib)

- **Sentence case** untuk semua label, judul seksi, dan tombol: `"Tambah ke keranjang"`, `"Lanjut ke checkout"`, `"Simpan produk"` (bukan `"Tambah Ke Keranjang"`).
- **Kata kerja + objek** pada tombol: `"Hubungi admin via WhatsApp"`, `"Konfirmasi pesanan"`, `"Tandai sudah dibayar"`.
- **Elipsis asli (`…`)** pada status *loading*: `"Menyimpan…"`, `"Membuat pesanan…"`, bukan tiga titik (`...`).
- **Tanpa *em dash* (`—`)** di copy UI; gunakan titik atau tanda hubung biasa (`-`).
- **Tanpa *eyebrow*:** Jangan letakkan label kecil di atas judul (misal jangan tulis `"TAHAP 1 DARI 3"` di atas judul tahap atau *progress bar*).
- **Format Rupiah:** Gunakan `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })` -> `Rp185.000` (tanpa `,00` untuk nominal bulat).

---

## 1.3 Grid Spasi, Ukuran Kontrol, & Radius

- **Grid 4px** (dengan setengah langkah `2px`): `2, 4, 6, 8, 12, 16, 20, 24, 32, 48, 64`.
- **Lebar Kolom Halaman:**
  - `1200px`: Katalog produk, Custom Gift Builder (area kerja), Dashboard Overview & Tabel Admin.
  - `800px`: Halaman Detail Produk / Halaman Informasi / Konfirmasi Pesanan lebar.
  - `440px`: Checkout form, Login Admin (`464px` card dengan padding `32px`).
- **Ketinggian Kontrol Seragam:**
  - Desktop: `--control-h: 36px` (tombol, input, select, baris rail), tabel `--row-h: 38px`.
  - Mobile (`< 768px`): `--control-h: 44px`, tabel/baris sheet `44–48px`.
  - Di satu baris yang sama, tinggi input = tinggi tombol = tinggi *segmented toggle*.
- **Tangga Radius (`--radius-control: 6px`):**
  - `3px` (`--radius-xs`): *key chip* (`⌘K`).
  - `4px` (`--radius-sm`): kotak centang (*checkbox*).
  - `6px` (`--radius-control`): tombol, input, select, item menu, baris rail, baris kartu di sheet.
  - `8px` (`--radius-container`): kartu produk, panel, tabel, modal, side panel, popover.
  - `12px` (`--radius-feature`): banner hero, notice besar.
  - `14px` (`--radius-sheet`): sudut atas *bottom sheet* mobile.
  - `999px`: badge, pill utilitas, segmented toggle, foto/swatch bulat.
  - **Nested radius:** `outer radius - border`.

---

## 1.4 Lapisan Permukaan & Elevasi (*Light vs Dark*)

| Lapisan | Light Mode | Dark Mode |
|---|---|---|
| **Ground** | `ink-2` (`#f9f9f8`) | `#080807` (satu tingkat di bawah `ink-1`) |
| **Panel** | `#ffffff` + `--shadow-panel` | `ink-1` (`#111110`) + `--shadow-panel` |
| **Raised Card** (Kartu produk, ringkasan harga) | `#ffffff` + `--shadow-card` | `ink-2` (`#191918`) + outline `0.5px` `ink-6` + drop hitam |
| **Control** (Tombol secondary, pill) | `#ffffff` + `--shadow-button` | `ground + 2` (`ink-3` di panel, `ink-4` di card/modal) + outline `0.5px` (`ink-6`/`ink-7`) + drop hitam |
| **Well** (Input teks, track toggle) | `ink-3` (lebih gelap dari permukaan) | `ink-3` (lebih terang dari `ink-1`/`ink-2`), tanpa border |
| **Overlay** (Modal, Side Panel, Menu) | `#ffffff` + `--shadow-modal` / `--shadow-menu` | `ink-2` + outline `0.5px` `ink-7` + drop hitam |

- **Aturan Dark Mode:** Tidak boleh ada *lit top edge* (`inset 0 1px 0 white`), tidak boleh ada *glow* berwarna, dan ukuran/padding/radius **dilarang berubah** antara light dan dark mode.
- **Step-shift:** Gunakan kelas `.surface-rail`, `.surface-panel`, `.surface-raised`, dan `.surface-overlay` agar tombol dan garis otomatis beradaptasi dengan latar induknya.

---

## 1.5 Browser Surfaces & Semantic Landmarks (Aksesibilitas)

- **Skip Link:** Setiap halaman menyediakan tautan `"Langsung ke konten utama"` (*sr-only*, muncul saat `:focus-visible` di pojok kiri atas dengan gaya tombol *Primary*) menuju `#main-content`.
- **Landmark HTML:** Gunakan `<header>`, `<nav aria-label="...">`, `<main id="main-content">`, dan `<footer>` secara semantik. Setiap halaman hanya memiliki **satu `<h1>`**.
- **Native Browser Surfaces:** `tokens.css` mengatur `color-scheme: light / dark` (agar `<input type="date">` pada Checkout tidak menyilaukan di *dark mode*), `::selection` berwarna `plum-3`, `caret-color: ink-12`, `:focus-visible` ring `2px var(--focus-ring)`, dan custom scrollbar desktop `8px`.

