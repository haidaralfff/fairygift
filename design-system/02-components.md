# 2. Component Specifications (FairyGift Recipes)

Semua komponen ditulis hanya dengan token dari [tokens.css](./tokens.css) dan skala 4px. Tidak ada warna *hex* atau `px` mentah di luar token.

---

## 2.1 Buttons & Action Hierarchy

Satu permukaan hanya boleh memiliki **maksimal satu tombol Primary**. Tidak ada tombol abu-abu di *light mode*.

| Peran | Kegunaan di FairyGift | Spesifikasi Visual |
|---|---|---|
| **Primary** | Aksi langkah utama: `"Tambah ke keranjang"`, `"Lanjut ke tahap berikutnya"`, `"Konfirmasi pesanan"`, `"Hubungi admin via WhatsApp"`, `"Simpan produk"`, `"Tandai sudah dibayar"` | Tinggi `var(--control-h)` (`36px` / `44px` mobile), `px-3.5`, `rounded-[var(--radius-control)]`, `bg-[var(--primary-bg)]`, `text-[var(--primary-fg)]`, `shadow-[var(--shadow-primary)]`, `hover:bg-[var(--primary-hover)]`, `active:scale-[0.97]`. Disabled dark: solid `bg-ink-4 text-ink-8 shadow-none`. |
| **Secondary** | Aksi pendamping: `"Lihat katalog"`, `"Batal"`, `"Kembali"`, `"Ubah"`, `"Coba lagi"`, aksi header | `bg-[var(--raised)]` (`white` light / `ink-3` panel dark / `ink-4` card dark), `text-ink-12`, `shadow-[var(--shadow-button)]`, `hover:bg-[var(--root-ink-2)]` (dark `hover:bg-ink-4`), `active:scale-[0.97]`. |
| **Utility Pill** | Alat yang menempel pada konten: `"Salin nomor pesanan"`, pill filter kategori (`"Birthday Gift"`), tombol keranjang di header | `h-[var(--control-h-pill)]` (`28px`; `36px` touch), `rounded-full`, `bg-[var(--raised)]`, `shadow-[var(--shadow-toggle)]`, ikon `14px` (stroke `2.5` di grid 24px). |
| **Icon Button** | Edit/hapus per baris produk/komponen, tutup info | `size-[var(--control-h-icon)]` (`22px`), tanpa fill, `text-ink-10 hover:text-ink-12 hover:bg-ink-4 active:scale-[0.92]`, wajib `touch-target` (`44×44` area sentuh). |
| **Ghost / Text Link** | `"Hapus"` di keranjang, `"Reset pilihan"` | Ghost: tanpa fill, `text-ink-10 hover:text-ink-12 hover:bg-ink-2`. Link: garis bawah hanya pada kata link. |
| **Destructive Trigger** | `"Hapus produk"`, `"Batalkan pesanan"`, `"Tolak pembayaran"` | Tombol Secondary dengan teks & ikon `text-[var(--red-11)]` dan `hover:bg-[var(--red-3)]` (tidak pernah merah solid di halaman). |
| **Destructive Confirm** | Konfirmasi final di dalam modal/sheet (`"Ya, hapus produk"`, `"Ya, batalkan pesanan"`) | Solid `bg-[var(--red-9)] text-[var(--red-contrast)]`, `hover:brightness-95`, dark `shadow-[0_0_0_0.5px_var(--red-9),0_1px_2px_0_rgb(0_0_0/.5)]`. |

### Copy Action (Nomor Pesanan `FG-2026-0001`)
- Klik langsung mengubah ikon salin menjadi centang (`1.3×`) selama `1000ms` (ikon) atau `1500ms` (pill), **tanpa menunggu promise clipboard selesai**. Jika ditolak browser, langsung revert atau tampilkan `"Gagal menyalin"`. **Jangan tampilkan toast untuk aksi salin.**

### Loading Button (Label Swap)
- Label dan state `"Membuat pesanan…"`, `"Menyimpan…"` berbagi **satu sel grid** agar lebar tombol tidak meloncat. Teks masuk naik `6px` + `blur(2px)`, keluar naik `-6px`, `200ms`.

---

## 2.2 Form Fields (*Wells*) & Validasi

Input berbentuk **sumur (*well*)** yang masuk ke dalam permukaan (bukan tombol yang menonjol).

- **Input & Select:** `h-[var(--control-h)]`, `rounded-[var(--radius-control)]`, `border-0`, `bg-ink-3` (varian di atas kartu putih: `bg-ink-2 focus:bg-ink-3`), `px-3`, `text-[length:var(--text-field)]` (`13px` desktop, `16px` pada `pointer: coarse`), `placeholder:text-ink-10`, `focus:bg-ink-4`.
- **Textarea** (Pesan kartu ucapan, alamat pengiriman, catatan): sama, `min-h-21` (`84px`), `py-2`, `overflow-wrap: break-word`.
- **Label, Required, & Hint:** Label `13/20 ink-12` (`ink-11` di alur checkout), jarak `6–8px` di atas field. Field opsional ditandai `"(opsional)"` (`ink-10`); field wajib memakai `required` + `aria-required="true"`. Jarak antar-field `20px`.
- **Error State (Validasi on blur & on submit):**
  - Tetap gunakan fill *well*, tambahkan ring `box-shadow: 0 0 0 1px var(--red-11)` dan `aria-invalid="true"` (tidak menggeser layout).
  - Pesan error `12/16` warna `var(--red-11)` tepat di bawah field (`role="alert"`, terhubung via `aria-describedby`), sebutkan solusi singkat: `"Nomor WhatsApp wajib diisi. Contoh: 081234567890."`
  - Saat submit gagal, **fokus otomatis berpindah ke field error pertama** dan input pengguna tidak pernah terhapus.

---

## 2.3 Selection Controls (Khusus Custom Gift Builder & Admin)

### A. Segmented Toggle
Dipakai untuk: filter cepat (`"Semua"` / `"Tersedia"`), metode penyerahan di Checkout (`"Pengiriman"` / `"Ambil sendiri"`), dan ganti tema (`"Terang"` / `"Gelap"`).
- Track `rounded-full p-1 gap-1`, satu langkah lebih gelap dari parent di light (`ink-3` di panel), satu langkah lebih terang di dark.
- Pilihan `28px` (track `36px` desktop) / `34px` (track `42px` phone), pill aktif putih + `--shadow-toggle`, bergerak dengan *shared-layout spring* (`bounce: 0.12, duration: 0.4`).
- `role="radiogroup"`, `role="radio"`, `aria-checked`, navigasi panah kiri/kanan.

### B. Selection Card & Choice Tile (Builder Tahap 1, 2, 3)
- **Kemasan & Desain Kartu (Single-select):**
  - *Selection Card* minimal tinggi `124px`, padding `14px`, gambar thumbnail (`alt` deskriptif) + nama di atas, harga `tabular-nums` di bawah, ikon radio bulat `18px` (`1.5px ink-6` ring) di kanan atas.
  - **Saat dipilih (tertekan masuk, bukan menonjol):** fill `ink-3` (`ink-4` di dark) + `0.5px` hairline, **tanpa shadow**. Lingkaran radio menampilkan titik `8px ink-12` + `aria-checked="true"`.
- **Isi Hadiah / Komponen (Multi-select, Tahap 2):**
  - Grid 2 kolom (`gap-2.5` = `10px`) di desktop/tablet, 1 kolom di phone.
  - Checkbox kotak `--radius-sm` (`4px`), `role="checkbox"`, `aria-checked`, terisi `ink-12` + centang `ink-1` saat dipilih.
  - Komponen dengan stok `0` / tidak tersedia **tidak dirender** pada Customer Builder (PRD §4.3 Acceptance Criteria).
- **Color Swatch Kemasan (Tahap 1):**
  - *Choice pill* tinggi `36px` (`44px` phone) berisi lingkaran warna `14px` (ring `0.5px ink-a4`) + **nama warna tertulis** `13/20` (warna tidak pernah menjadi satu-satunya penanda). Terpilih: `bg-ink-3` + `0.5px` ring `ink-7` (dark: `bg-ink-4` + `ink-8`) + `aria-checked="true"`.

### C. Switch (Ketersediaan Produk & Komponen di Admin)
- Desktop: track `52×26px`, knob putih `20px` inset `3px`, `--shadow-toggle`.
- Phone: track `51×31px`, knob `23px` inset `4px`, area sentuh `44pt`.
- Warna aktif: `var(--green-9)`. Nonaktif: `ink-7` (light) / `#343434` (dark).
- `role="switch"`, `aria-checked`, `aria-label` eksplisit. Knob digerakkan via `flex justify-start / justify-end` + layout spring (`bounce: 0.2, duration: 0.45`).

---

## 2.4 Quantity Stepper (Shopping Cart & Builder)

Kontrol `+` / `-` tetap memakai tinggi `var(--control-h-compact)` (`32px` desktop) atau `var(--control-h-pill)` (`28px`) di dalam baris keranjang, di-wrap sebagai grup putih `--shadow-button` atau well `ink-3` dengan dua tombol `icon` (`aria-label="Kurangi jumlah"` / `"Tambah jumlah"`) + angka `tabular-nums` di tengah (`min-w-8 text-center`). Minimal `1`; tombol `-` dinonaktifkan saat `1` (penghapusan eksplisit lewat tombol `"Hapus"` agar tidak terhapus tak sengaja). Di phone setiap tombol stepper mendapat `.touch-target` (`44×44`) dengan jarak horizontal minimal `8px` agar hit area tidak tumpang tindih.

---

## 2.5 Product Card, Media Fallback, & Summary Card

- **Product Card (Katalog & Homepage):**
  - *Clickable card*: `bg-[var(--raised)]`, `rounded-[var(--radius-container)]` (`8px`), `shadow-[var(--shadow-card)]`, `p-3` (`12px`) untuk area info.
  - Foto produk rasio tetap (`4:3` atau `1:1` konsisten satu grid), sudut atas mengikuti nested radius (`6px` jika ada padding, `7.5px` jika full-bleed di bawah `0.5px` border), frame foto `0.5px ink-6`.
  - **Image Resilience:** Wajib `loading="lazy"` (kecuali hero atas lipatan), `object-cover`, dan fallback netral (`bg-ink-2` + ikon kado `20px ink-9`) jika URL gambar gagal dimuat (`onError`), sehingga rasio kartu tidak pernah kolaps.
  - Isi maksimal 3 baris bersih: Nama produk (`16/24 ink-12`, clamp 2 baris), kategori/ketersediaan (pill netral / status dot hijau/abu), harga (`13/20 ink-12 tabular-nums`). Deskripsi di-clamp maksimal 2 baris (`ink-11`).
  - **Produk habis / nonaktif:** Seluruh isi kartu redup ke `opacity-50` atau badge netral `"Tidak tersedia"`, tombol `"Tambah ke keranjang"` dinonaktifkan (`disabled`) disertai teks alasan di halaman detail.
- **Summary Card (Builder & Checkout):**
  - *Data card*: `bg-[var(--raised)]`, `rounded-[var(--radius-container)]`, `shadow-[var(--shadow-card)]`, `p-6` (`24px` desktop, `20px` phone), `0.5px` hairline pemisah rincian harga dan total akhir (`24/32 ink-12 tabular-nums`).
  - Total harga dibungkus `aria-live="polite"` (atau ringkas di elemen tersembunyi visual) agar pembaca layar mengumumkan pembaruan harga saat komponen dipilih/diubah.

---

## 2.6 Badges & Status Dots

- **Pill Badge** (untuk kartu detail, ringkasan status, kategori):
  - `h-[var(--badge-h)]` (`20px`; `22px` phone; `24px` jika di samping judul `20px`), `rounded-full px-2 text-xs`.
  - Berwarna: `bg-[var(--<hue>-3)] text-[var(--<hue>-11)] shadow-[var(--shadow-badge)]`.
  - Netral (Cancelled, Refunded, Kategori di kartu): `bg-[var(--raised)] text-ink-11 shadow-[var(--shadow-button)]`.
- **Status Dot (Khusus di dalam Tabel Admin):**
  - Tabel **tidak memakai pill badge** agar baris tidak penuh warna. Gunakan titik `8px` (`rounded-full bg-current`, `aria-hidden="true"`) + **teks status wajib di sampingnya** (makna tidak pernah hanya warna).
  - Status aktif berjalan (`Processing`, `Ready`) memakai `animate-ping` (opacity `0.75`) yang sinkron pada satu fase clock; mati otomatis di `prefers-reduced-motion`.

---

## 2.7 Tables (Admin Dashboard)

- **Frame:** `0.5px` border `var(--line)`, `rounded-[var(--radius-container)]` (`8px`), `shadow-[var(--shadow-table)]`.
- **Baris:** Tinggi `38px` desktop (`44px` phone), tanpa zebra stripe untuk daftar pendek (`5–6` baris di Overview); strip `white / ink-2` (dark `ink-2 / ink-3`) hanya untuk tabel penuh yang panjang.
- **Teks & Alignment:** Semua sel **rata kiri**, termasuk harga dan tanggal (`tabular-nums`). Header (`<th scope="col">`) & kolom pertama (Nomor Pesanan / Nama Produk) memakai `ink-12`; kolom lainnya `ink-11` (lulus 4.5:1). Free text (nama pelanggan, alamat, catatan) maksimal `32ch` lalu `truncate` (`…`) + tooltip/title nilai penuh dan tetap dapat diseleksi.
- **Baris dibatalkan (`Cancelled`):** Seluruh baris `opacity-50`.
- **Aksi & Pager:** Kolom aksi (`"Lihat"` pill `24px` / tombol `⋯`) muncul di paling kanan. **Pager berada `12px` di luar bawah tabel** (`"Menampilkan 1-10 dari 48"` di kiri `ink-11`, tombol `"Sebelumnya"` / `"Berikutnya"` putih di kanan).

---

## 2.8 Modals, Side Panels, Bottom Sheets, & Toasts

- **Desktop Modal (`620px` form / `460px` confirm):** 3 bagian terpisah oleh hairline `0.5px`: Header Band (`20/20/16px`, tanpa tombol `×` jika ada footer), Body (`16–24px`), Footer (`12px`, Cancel kiri, Confirm kanan). Backdrop hitam `30%` light / `90%` dark + `blur(2px)`. Wajib `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, *Tab trap*, *scroll lock*, tutup via `Escape`, dan kembalikan fokus ke tombol pemicu saat tertutup. Jika form sudah diubah (*dirty*), klik backdrop tidak langsung menutup agar input tidak hilang.
- **Desktop Side Panel (`440px`):** Untuk memeriksa detail pesanan, isi kustomisasi, pesan kartu ucapan, dan memverifikasi pembayaran tanpa meninggalkan daftar pesanan. Masuk dari kanan (`240ms`), tanpa backdrop dim, tutup dengan `Escape`.
- **Phone Bottom Sheet (`< 768px`):** Semua modal dan side panel otomatis menjadi *bottom sheet* penuh lebar, sudut atas `14px`, **grab handle putih taktil `36×5px`** di atas sheet (`88×44px` hit area berlabel `"Tutup"`, tekan/ketuk menutup sheet), judul `20/28` langsung di body tanpa header band, data tergabung dalam *raised card* berbaris `48pt`, dan tombol aksi penuh lebar di bawahnya.
- **Toast:** Maksimal satu di layar (`bottom-6`, `z-120`, `role="status"` / `aria-live="polite"`), tinggi `48px` pill penuh, warna `-3` + ring `-6` + teks `-11`, hilang otomatis `6 detik`. Dipakai untuk konfirmasi sistem yang tidak terlihat langsung (mis. error server atau sukses pembaruan status dari panel yang sudah tertutup). **Jangan pakai toast untuk aksi salin atau perubahan harga builder.**

---

## 2.9 Empty, Loading, & Error States

- **Empty State:** Panel `ink-2` polos (tanpa border di light, `0.5px` ring di dark), padding `44px`, ikon `18px` (`24px` phone, **tanpa kotak pembungkus**), 2 baris teks `13/20 ink-11`: apa yang kosong + apa yang harus dilakukan (contoh: `"Keranjang masih kosong."` / `"Pilih paket hadiah atau rangkai custom gift Anda."`), diikuti satu tombol Secondary jika relevan.
- **Loading State:**
  - Tabel/kartu: skeleton `12px` `bg-ink-4` radius kontrol dengan pulse halus (`ink-a3 ↔ ink-a4`), menjaga lebar kolom tetap stabil.
  - Angka metrik dashboard: tanda pisah `-` berdenyut di `ink-10` sambil mempertahankan labelnya.
- **Failed Load:** Layout empty state + pesan dua baris (`"Gagal memuat daftar pesanan."` / `"Periksa koneksi Anda lalu coba lagi."`) + satu tombol Secondary `"Coba lagi"`.

