# 8. DATA REQUIREMENTS

Data utama yang dibutuhkan dalam sistem FairyGift meliputi:

| Entitas | Informasi Utama |
|---|---|
| Users | ID, nama, email, password hash, role |
| Products | ID, nama, deskripsi, harga, gambar, status |
| Categories | ID, nama kategori |
| Packaging | ID, nama kemasan, warna, harga |
| Gift Components | ID, nama komponen, harga, stok |
| Card Designs | ID, nama desain, gambar |
| Orders | ID, nomor pesanan, data pelanggan, total harga, status |
| Order Items | ID, pesanan, produk, kuantitas, harga |
| Customizations | Detail kemasan, komponen, dan kartu ucapan |
| Payments | ID, pesanan, status pembayaran, waktu verifikasi |

**Keterangan:**

- Data Users digunakan untuk mengelola akun dan hak akses admin.
- Data Products digunakan untuk menyimpan informasi produk.
- Data Packaging digunakan untuk menyimpan pilihan kemasan hadiah.
- Data Gift Components digunakan untuk menyimpan pilihan isi hadiah.
- Data Orders digunakan untuk menyimpan transaksi pemesanan.
- Data Customizations digunakan untuk menyimpan detail hadiah custom.
- Data Payments digunakan untuk mencatat status pembayaran yang diverifikasi secara manual.

Struktur ini merupakan rancangan awal dan dapat disesuaikan ketika proses perancangan database dilakukan.

---

# 9. ORDER AND PAYMENT STATUS

Status pesanan dan pembayaran dikelola secara terpisah agar proses operasional lebih jelas.

## 9.1 Order Status

Status pemrosesan pesanan yang digunakan:

1. **Pending:** Pesanan telah dibuat dan menunggu konfirmasi pembayaran.
2. **Processing:** Pesanan sedang disiapkan.
3. **Ready:** Pesanan telah selesai dirakit dan siap dikirim atau diambil.
4. **Completed:** Pesanan telah selesai diterima atau diambil pelanggan.
5. **Cancelled:** Pesanan dibatalkan.

## 9.2 Payment Status

Status pembayaran yang digunakan:

1. **Pending:** Pembayaran belum diverifikasi oleh admin.
2. **Paid:** Pembayaran telah diverifikasi oleh admin.
3. **Rejected:** Pembayaran tidak valid atau tidak sesuai.
4. **Refunded:** Dana telah dikembalikan kepada pelanggan jika proses refund diterapkan.

**Catatan:** Status pembayaran tidak otomatis mengubah status pesanan. Admin mengelola keduanya sesuai kondisi transaksi.
