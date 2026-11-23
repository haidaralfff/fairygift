# FairyGift Design System (Tactile Design)

Sistem desain untuk **FairyGift – Custom Gift E-Commerce Platform** (PRD v1.2), dibangun dengan pendekatan **tactile, layered, dan quiet** agar pengalaman merancang hadiah terasa fisik seperti kertas, pita, dan kotak kado tanpa dekorasi berlebih.

---

## Prinsip Utama

1. **Fisik namun tenang:** Ground hangat (*Radix Sand*), permukaan putih terangkat dengan *ring* 1px dan *drop shadow* tajam (`1–2px`), satu aksi hitam (`ink-12`) sebagai langkah berikutnya.
2. **Hierarki dari langkah kontras, bukan tebal huruf:** Satu bobot UI (*Inter Medium 500*). Pembedaan dilakukan lewat kombinasi ukuran dan langkah *ink* (`12 → 11 → 10`).
3. **Taktilitas meminjam dari parent:** Tidak ada warna atau bayangan kontrol yang statis. Setiap tombol, kartu, dan badge mengambil *fill*, *edge*, dan *drop* dari permukaan tempatnya berada (*panel*, *card*, *rail*, *table*, *overlay*).
4. **Warna hanya untuk makna:** Netral (*Sand*) membangun seluruh struktur. Warna (*Plum*, *Green*, *Amber*, *Blue*, *Red*) hanya untuk identitas kategori/custom dan status pesanan/pembayaran.
5. **Satu bahasa di dua sisi (Storefront & Admin):** Pelanggan dan Admin berbagi token, radius, ketinggian kontrol (`36px` desktop / `44px` mobile), dan pola interaksi yang identik.

---

## Struktur Folder `design-system/`

| File | Isi & Fungsi |
|---|---|
| [tokens.css](./tokens.css) | Token CSS siap pakai (Light & Dark), *surface step-shift*, kurva *motion*, *Tailwind v4 mapping*, dan aturan *touch/phone* |
| [01-foundations.md](./01-foundations.md) | Skala warna *Sand* + *Hue*, aturan kontras 4.5:1, tipografi (*Inter* & *tabular-nums*), aturan *copy* Indonesia, grid 4px, radius, dan elevasi |
| [02-components.md](./02-components.md) | Resep komponen untuk FairyGift (Button, Field/Well, Choice Tile/Card, Quantity Stepper, Badge & Status Dot, Table, Modal, Side Panel, Bottom Sheet, Toast) |
| [03-storefront-screens.md](./03-storefront-screens.md) | Blueprint halaman pelanggan (PRD 4.1–4.7): Homepage, Katalog & Detail, Custom Gift Builder 3 Tahap, Keranjang, Checkout, Konfirmasi + WhatsApp |
| [04-admin-screens.md](./04-admin-screens.md) | Blueprint dashboard admin (PRD 4.8–4.9 & 9): Login, Shell Rail, Overview, Order Management, Manual Payment Verification, Product & Customization CRUD |
| [05-motion-mobile-qa.md](./05-motion-mobile-qa.md) | Spesifikasi *motion*, adaptasi *mobile/touch* (`< 768px`, `pointer: coarse`), dan checklist **Never Ship** sebelum rilis |
| [logo brand/](./logo%20brand/) | Aset logo SVG resmi FairyGift (`#d54f75`, `#f57fa7`, `#fce0ea`, `#d39fc4`) |

---

## Pemetaan Keputusan Desain terhadap PRD FairyGift

| Kebutuhan PRD | Keputusan Tactile Design |
|---|---|
| Pembayaran manual via WhatsApp (tidak ada payment gateway) | Tombol **Hubungi admin via WhatsApp** menjadi satu-satunya aksi *Primary* (`ink-12`) di halaman konfirmasi pesanan, dilengkapi nomor pesanan yang dapat disalin dengan *instant tick*. |
| Harga dinamis pada Custom Gift Builder (4.3 & 4.4) | Menggunakan `tabular-nums` + format `Intl.NumberFormat('id-ID')` tanpa `.00`, ditampilkan pada *summary card* kanan (desktop) dan *fixed bottom bar* (mobile) agar total selalu terlihat tanpa melompat. |
| Status pesanan & pembayaran terpisah (PRD §9) | Dikelola sebagai dua kolom/kontrol terpisah: di tabel menggunakan **status dot 8px + label**, di kartu/detail menggunakan **pill badge** (`hue-3` + `hue-11` + `--shadow-badge`). |
| Detail kustomisasi & kartu ucapan (PRD 4.3, 4.9B) | Ditampilkan di *Side Panel* (desktop `440px`) atau *Bottom Sheet* (mobile) menggunakan kartu baris terangkat (*raised card of rows*) dengan garis `0.5px`. |
| Pertanyaan terbuka PRD (§12.2: *Guest checkout*) | UI Checkout didesain *guest-first* tanpa kewajiban login (kolom `440px` form + ringkasan pesanan) agar sesuai dengan *Acceptance Criteria* Homepage & Checkout tanpa hambatan. |
