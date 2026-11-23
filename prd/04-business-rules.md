# 6. BUSINESS RULES

Aturan bisnis yang harus diterapkan pada sistem FairyGift:

1. Setiap pesanan memiliki nomor pesanan unik.
2. Harga total ditentukan berdasarkan harga produk dan komponen kustomisasi yang dipilih.
3. Perubahan pilihan komponen harus memperbarui total harga.
4. Pesanan hanya dapat dikonfirmasi jika informasi wajib checkout telah diisi.
5. Setiap pesanan harus menyimpan detail kustomisasi pelanggan.
6. Admin memiliki akses untuk mengelola katalog, pesanan, dan status pembayaran.
7. Pelanggan tidak memiliki akses ke dashboard admin.
8. Harga pesanan yang sudah dikonfirmasi harus tersimpan sebagai snapshot agar perubahan harga katalog tidak mengubah transaksi sebelumnya.
9. Status pembayaran dan status pemrosesan pesanan harus dikelola secara terpisah.
10. Website tidak menyediakan pemrosesan transaksi pembayaran secara langsung.
11. Pembayaran dilakukan secara manual melalui komunikasi WhatsApp.
12. Setiap pesanan memiliki status pembayaran Pending secara default.
13. Pelanggan diarahkan ke WhatsApp setelah pesanan berhasil disimpan.
14. Hanya admin yang memiliki wewenang untuk memperbarui status pembayaran menjadi Paid setelah melakukan verifikasi.
15. Pesanan mulai diproses setelah pembayaran dikonfirmasi sesuai kebijakan operasional FairyGift.
16. Pengiriman atau pengambilan pesanan mengikuti informasi yang disepakati antara pelanggan dan admin.
17. Pesan WhatsApp yang disiapkan oleh sistem tidak dianggap terkirim sebelum pelanggan menekan tombol kirim.
