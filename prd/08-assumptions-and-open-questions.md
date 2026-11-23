# 12. ASSUMPTIONS & OPEN QUESTIONS

## 12.1 Assumptions

- FairyGift dikembangkan sebagai website e-commerce.
- Model bisnis menggunakan B2C dengan sistem Make-to-Order.
- Harga komponen ditentukan oleh admin.
- Website tidak menggunakan payment gateway.
- Website tidak menyediakan simulasi pembayaran.
- Pembayaran dilakukan secara manual melalui komunikasi WhatsApp.
- WhatsApp digunakan sebagai media komunikasi pelanggan dan admin.
- Website menggunakan WhatsApp Click to Chat untuk mengarahkan pelanggan.
- Admin memverifikasi pembayaran secara manual.
- Status pembayaran diperbarui melalui dashboard admin.
- Pengiriman atau pengambilan pesanan diproses berdasarkan informasi yang diinput pelanggan.
- Ketersediaan produk dan komponen dikelola oleh admin.

## 12.2 Open Questions

Beberapa keputusan berikut perlu ditentukan sebelum implementasi:

1. Apakah pelanggan wajib membuat akun sebelum melakukan checkout?
2. Apakah pelanggan dapat melakukan pemesanan sebagai guest?
3. Apakah pelanggan perlu mengunggah bukti pembayaran melalui website atau cukup melalui WhatsApp?
4. Apakah setiap komponen hadiah memiliki batas stok?
5. Apakah pelanggan dapat mengunggah desain atau gambar referensi sendiri?
6. Bagaimana aturan pembatalan pesanan setelah proses perakitan dimulai?
7. Apakah admin perlu mengonfirmasi pesanan sebelum pelanggan melakukan pembayaran?
8. Apakah nomor WhatsApp admin hanya satu atau terdapat beberapa admin yang menangani pesanan?

---

# 13. CONCLUSION

FairyGift dirancang sebagai platform e-commerce yang mengintegrasikan proses pemesanan hadiah siap beli dan kustomisasi hadiah secara mandiri.

Dengan adanya Custom Gift Builder, perhitungan harga otomatis, keranjang belanja, checkout, integrasi WhatsApp, dan dashboard admin, FairyGift diharapkan dapat memberikan pengalaman pemesanan yang lebih praktis bagi pelanggan sekaligus meningkatkan efisiensi pengelolaan pesanan.

Penggunaan WhatsApp sebagai media pembayaran dan komunikasi memungkinkan FairyGift menjalankan proses transaksi tanpa memerlukan integrasi payment gateway. Website tetap berperan sebagai pusat pengelolaan produk, kustomisasi, dan pencatatan pesanan, sedangkan proses konfirmasi pembayaran dilakukan secara langsung antara pelanggan dan admin.

Dokumen PRD ini menjadi acuan awal dalam proses UI/UX design, perancangan database, pengembangan backend, pengembangan frontend, serta pengujian sistem FairyGift.
