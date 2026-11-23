# 4.6 Checkout

**Deskripsi:**

Checkout merupakan proses pengumpulan informasi pelanggan dan detail pesanan sebelum pesanan dikirimkan ke sistem.

**Kebutuhan Fungsional:**

Pelanggan harus mengisi informasi berikut:

- Nama pelanggan.
- Nama penerima jika berbeda.
- Nomor WhatsApp aktif.
- Alamat pengiriman jika memilih pengiriman.
- Tanggal pengiriman atau pengambilan.
- Catatan tambahan jika diperlukan.

Sistem juga harus:

- Menampilkan ringkasan produk.
- Menampilkan detail kustomisasi.
- Menampilkan subtotal dan total harga.
- Memvalidasi informasi wajib.
- Menyediakan tombol konfirmasi pesanan.

**Acceptance Criteria:**

- Sistem memvalidasi data wajib sebelum pesanan dikonfirmasi.
- Sistem menyimpan informasi pelanggan dan detail pesanan.
- Sistem menghasilkan nomor pesanan unik.
- Pelanggan mendapatkan informasi bahwa pesanan berhasil dibuat.
- Pesanan tersimpan sebelum pelanggan diarahkan ke WhatsApp.
