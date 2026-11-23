# 4.7 WhatsApp Integration

**Deskripsi:**

FairyGift menggunakan WhatsApp sebagai media komunikasi antara pelanggan dan admin, khususnya untuk konfirmasi pesanan dan pembayaran.

Setelah pelanggan berhasil melakukan checkout, website menyediakan tombol untuk menghubungi admin melalui WhatsApp.

Sistem menggunakan mekanisme WhatsApp Click to Chat untuk membuka WhatsApp dengan pesan yang telah disiapkan secara otomatis.

**Kebutuhan Fungsional:**

- Menyediakan tombol Hubungi Admin via WhatsApp.
- Mengarahkan pelanggan ke nomor WhatsApp admin yang telah dikonfigurasi.
- Menyiapkan pesan otomatis berdasarkan detail pesanan.
- Menyertakan nomor pesanan pada pesan WhatsApp.
- Menyertakan ringkasan produk dan total harga.
- Menyertakan informasi nama pelanggan.

**Contoh Pesan WhatsApp Otomatis:**

```text
Halo FairyGift, saya ingin mengonfirmasi pesanan.

Nomor Pesanan: FG-2026-0001

Nama: [Nama Pelanggan]

Detail Pesanan:
- Produk: Custom Gift Box
- Kemasan: Pink Box
- Isi: Bunga, Cokelat, Boneka Mini
- Kartu Ucapan: Happy Graduation!

Total Harga: RpXXX.XXX

Mohon informasi selanjutnya mengenai proses pembayaran. Terima kasih.
```

**Acceptance Criteria:**

- Tombol WhatsApp tersedia setelah checkout berhasil.
- Sistem mengarahkan pelanggan ke nomor WhatsApp admin.
- Pesan otomatis memuat informasi pesanan yang benar.
- Informasi pesanan tetap tersimpan di website meskipun pelanggan belum mengirim pesan WhatsApp.
- Pelanggan tetap harus menekan tombol kirim di WhatsApp untuk mengirim pesan.

**Catatan Teknis:**

Pengalihan menggunakan WhatsApp Click to Chat dengan format URL:

`https://wa.me/nomoradmin?text=pesan`

Nomor admin dan pesan harus dikonfigurasi sesuai kebutuhan operasional FairyGift.
