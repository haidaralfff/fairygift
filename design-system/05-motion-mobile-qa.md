# 5. Motion, Mobile Adaptation, & Never-Ship QA Checklist

## 5.1 Motion Specification

**Prinsip:** Putuskan apakah elemen perlu bergerak sebelum menentukan caranya. Elemen yang sering dilihat bergerak sesedikit mungkin. Semua kurva menggunakan `--ease-out` (`cubic-bezier(.23, 1, .32, 1)`), **tanpa `ease-in`**, **tanpa `transition: all`**, **tanpa `scale(0)`**.

| Interaksi di FairyGift | Properti & Nilai | Durasi / Spring | Reduced Motion (`prefers-reduced-motion`) |
|---|---|---|---|
| **Hover baris, kartu, tombol** (fine pointer) | Warna/background saja, tidak ada pergeseran posisi | `150ms` `--ease-out` | Sama (warna saja) |
| **Tekan tombol / pill** | `active:scale-[0.97]` (`0.92` untuk ikon `22px`, `0.99` untuk kartu produk) | `150ms` `--ease-out` | Tetap `scale(.97)` (umpan balik taktil) |
| **Perpindahan Tahap Builder (1 ↔ 2 ↔ 3)** | Tahap keluar: `opacity: 0`, `translateY(-8px)`, `blur(6px)`; Tahap masuk: `opacity: 1`, `translateY(0)`, `blur(0)` dari `+8px` (stagger blok `40ms`) | Keluar `150ms`, Masuk `250ms` `--ease-out` | Crossfade `150–200ms` tanpa geser/blur |
| **Segmented Toggle Pill** (Katalog, Pengiriman/Ambil, Tab Admin) | Shared-layout pill meluncur di dalam track `overflow-hidden` | Spring `{ bounce: 0.12, duration: 0.4 }` | Tween `150ms` |
| **Switch Ketersediaan (Admin)** | Knob flex `justify-start` ↔ `justify-end`; track warna `150ms` | Spring `{ bounce: 0.2, duration: 0.45 }` | Instan (tanpa travel) |
| **Dropdown / Menu** | Dari `scale(.97)` + `opacity: 0` ke `1`, `transform-origin` di trigger; chevron berputar `180deg` | Masuk `150ms`, Keluar `120ms` | Crossfade `150ms`, chevron flip instan |
| **Modal Desktop** (CRUD Produk, Konfirmasi Bayar) | Backdrop `200ms`; Card masuk dari `translateY(16px)` + `blur(4px)` + `opacity: 0` | Masuk `240ms`, Keluar `200ms` | Crossfade `200ms` |
| **Side Panel Desktop** (Detail Pesanan) | `translateX(100%)` → `0` (solid, tanpa blur/fade) | Masuk `240ms`, Keluar `200ms` | Crossfade `200ms` |
| **Bottom Sheet Mobile** | `translateY(calc(100% + 48px))` → `0` (solid sepanjang gerak); lepas drag pakai `--ease-drawer` | Naik `320ms`, Turun `200ms`, Spring back `400ms` | Fade `200ms` |
| **Loading Label Swap** (`"Membuat pesanan…"`) | Teks lama naik `-6px` + `blur(2px)`, teks baru naik dari `+6px` dalam grid cell yang sama | `200ms` `--ease-out` | Crossfade `150ms` |
| **Copy Nomor Pesanan (`FG-2026-0001`)** | Ikon ↔ Centang (`1.3×`, `scale(.5 ↔ 1)`) langsung saat klik | Transisi `200ms`, tahan `1000–1500ms` | Opacity `150ms` |
| **Total Harga Builder berubah** | **Jangan animasikan angka.** Angka `tabular-nums` langsung berubah agar terasa responsif dan akurat | `0ms` | `0ms` |

---

## 5.2 Mobile & Touch Adaptation (`< 768px` & `pointer: coarse`)

Layout mobile bukan sekadar desktop yang dipersempit. Aturan berikut aktif otomatis melalui [tokens.css](./tokens.css):

1. **Target Sentuh Minimum `44×44px`:**
   - Tombol, input, select, baris pilihan, dan baris tabel otomatis naik menjadi `44px`.
   - Ikon kecil (`22px` hapus/edit, tombol `+/-` stepper, badge/pill kecil) wajib memiliki kelas `.touch-target` agar area sentuhnya `44×44px` dengan jarak aman antar-ikon agar tidak tumpang tindih.
2. **Tipografi Mobile:**
   - Lantai minimum teks UI & meta: `15px` (`15/24` untuk body). Sub-keterangan di bawah judul boleh `14/20`.
   - Input form (`input`, `textarea`, `select`) **wajib `16px`** pada setiap perangkat `(pointer: coarse)` (termasuk tablet/iPad) untuk mencegah auto-zoom iOS Safari.
3. **Interaksi Touch Alami:**
   - Hover dibatasi pada `@media (hover: hover) and (pointer: fine)` agar status hover tidak menempel setelah tap.
   - `-webkit-tap-highlight-color: transparent`, `touch-action: manipulation`, `overscroll-behavior: none`, `100dvh`, dan `env(safe-area-inset-bottom)` diterapkan global.
   - Tidak ada informasi yang hanya muncul saat hover (tooltip penjelasan stok/harga di builder menjadi teks pembantu atau *info popover* on-tap).
4. **Checkout & Custom Gift Builder Fixed Bottom Bar:**
   - Bar tetap di bawah dengan garis atas `0.5px`, latar panel, padding `12px 20px max(20px, env(safe-area-inset-bottom))`.
   - Menampilkan total harga `tabular-nums` + aksi Primary lebar penuh di atasnya; konten di atasnya diberi ruang bawah `calc(160px + env(safe-area-inset-bottom))` agar tidak tertutup bar.
5. **Dialog & Panel Menjadi Bottom Sheet:**
   - Modal CRUD produk/komponen, verifikasi pembayaran, dan Side Panel Detail Pesanan otomatis berubah menjadi *bottom sheet* (`radius-top: 14px`, grab handle putih `36×5px` dengan hit area `88×44px`, drag-to-close melewati `min(64px, 15% tinggi)` atau flick `> 0.11 px/ms`).
6. **Tabel Admin di Phone:**
   - Scroll menyamping tanpa scrollbar terlihat; kolom pertama (`No. Pesanan`) *sticky* di kiri dengan hairline `0.5px` (ditambah bayangan kanan tipis saat ter-scroll).

---

## 5.3 Never-Ship Checklist (Audit Sebelum Eksekusi/Rilis)

Gunakan daftar ini untuk memverifikasi implementasi UI FairyGift di desktop & mobile, mode terang & gelap, pada zoom `4–8×`:

- [ ] **Maksimal 1 Primary per permukaan:** Tidak ada halaman atau modal dengan dua tombol hitam (`ink-12`). Aksi destruktif tidak pernah menjadi Primary.
- [ ] **Tidak ada tombol abu-abu di light mode:** Semua tombol sekunder berlatar putih (`--surface-top`) + `--shadow-button`.
- [ ] **Warna tidak dipakai untuk peringkat kepentingan:** Warna (`plum`, `green`, `amber`, `blue`, `red`) hanya untuk kategori/custom dan status pesanan/pembayaran.
- [ ] **Status Pesanan dan Status Pembayaran terpisah:** Tidak pernah digabung; tabel memakai 8px dot + teks (bukan pill badge).
- [ ] **Kontras 4.5:1 tercapai:** Semua label metrik, navigasi rail, pager, dan empty state di atas latar putih/sand memakai `ink-11` atau `ink-12` (bukan `ink-9`/`ink-10`).
- [ ] **Elevasi Dark Mode benar:** Kontrol di dark mode lebih terang dari induknya (`ground + 2`), memakai outline solid `0.5px` seragam keliling + drop hitam (tanpa *lit top edge*, tanpa *glow* berwarna).
- [ ] **Ukuran tidak bercabang antar tema:** Padding, tinggi kontrol, radius, dan tebal garis (`0.5px`) identik antara light dan dark mode.
- [ ] **Tidak ada double border & nested radius salah:** Frame foto, kartu, dan header modal tidak menumpuk dua garis `1px`; sudut dalam = `outer - border`.
- [ ] **Bobot & Copy bersih:** Satu bobot *Medium 500*; semua tombol memakai *sentence case*; loading memakai elipsis asli (`…`); harga memakai `tabular-nums` tanpa `,00`; tanpa *eyebrow* label dan tanpa *em dash*.
- [ ] **Worst-case data teruji:** Nama produk panjang (`>32ch`), catatan/ucapan panjang, emoji, nominal jutaan (`Rp12.500.000`), daftar kosong (*empty*), gagal muat (*failed load*), dan status *loading* tidak membuat layout bergeser.
- [ ] **WhatsApp Handoff & Resilience terjamin:** Pesanan tersimpan di database **sebelum** redirect ke `https://wa.me/...`, idempotency mencegah pesanan ganda saat klik beruntun, draft builder/keranjang bertahan saat refresh, dan halaman `/pesanan/[orderNumber]` + tombol salin pesan tersedia.
- [ ] **Aksesibilitas & Browser Surfaces (WCAG AA):** Placeholder & `(opsional)` memakai `--root-ink-10` terkalibrasi (`>= 4.5:1`), seluruh alur utama dapat diselesaikan via keyboard, `aria-live="polite"` aktif pada total harga builder, dan `color-scheme`, `::selection`, serta `:focus-visible` mengikuti tema.
- [ ] **Stale-Item & Upload Guard:** Item keranjang yang tiba-tiba habis terdeteksi sebelum checkout; error upload gambar dan gambar rusak memiliki fallback rasio tetap.

