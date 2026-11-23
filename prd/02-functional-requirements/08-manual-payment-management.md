# 4.8 Manual Payment Management

**Deskripsi:**

FairyGift tidak menggunakan payment gateway. Proses pembayaran dilakukan secara manual melalui komunikasi WhatsApp antara pelanggan dan admin.

Website tidak memproses transaksi pembayaran. Website hanya mencatat status pembayaran yang diperbarui oleh admin setelah melakukan verifikasi.

**Kebutuhan Fungsional:**

- Menyimpan status pembayaran setiap pesanan.
- Menampilkan informasi status pembayaran pada dashboard admin.
- Memungkinkan admin memperbarui status pembayaran.
- Menyimpan waktu verifikasi pembayaran.
- Menyimpan informasi admin yang melakukan verifikasi jika diperlukan.

**Acceptance Criteria:**

- Setiap pesanan memiliki status pembayaran Pending secara default.
- Admin dapat mengubah status pembayaran menjadi Paid setelah melakukan verifikasi.
- Perubahan status pembayaran tersimpan di database.
- Status pembayaran dapat dilihat pada detail pesanan.
- Tidak terdapat proses pembayaran otomatis di dalam website.
