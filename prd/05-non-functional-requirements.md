# 7. NON-FUNCTIONAL REQUIREMENTS

## 7.1 Performance

- Halaman website harus dapat dimuat dengan waktu yang wajar.
- Perubahan pilihan pada Custom Gift Builder harus ditampilkan tanpa proses yang terasa lambat.
- Sistem harus mampu menangani beberapa pengguna secara bersamaan sesuai kapasitas infrastruktur MVP.
- Proses pembuatan pesanan harus berjalan secara efisien.

## 7.2 Security

- Password admin harus disimpan dalam bentuk hash.
- Dashboard admin harus dilindungi autentikasi dan otorisasi.
- Endpoint admin harus membatasi akses berdasarkan role.
- Input pelanggan harus divalidasi untuk mengurangi risiko serangan.
- Sistem harus menerapkan proteksi terhadap SQL Injection dan XSS.
- Komunikasi website harus menggunakan HTTPS ketika sudah dipublikasikan.
- Informasi pesanan hanya dapat diakses oleh pihak yang berwenang.
- Proses perubahan status pembayaran harus dibatasi untuk admin.

## 7.3 Usability

- Antarmuka harus mudah dipahami.
- Proses kustomisasi harus memiliki tahapan yang jelas.
- Informasi harga harus mudah ditemukan.
- Tombol WhatsApp harus mudah diakses.
- Website harus responsif pada perangkat desktop maupun mobile.

## 7.4 Reliability

- Data pesanan harus tersimpan secara konsisten.
- Sistem harus memberikan umpan balik ketika proses pemesanan berhasil atau gagal.
- Kegagalan proses checkout tidak boleh menghasilkan pesanan duplikat.
- Perubahan status pembayaran dan pesanan harus tersimpan dengan benar.
- Detail kustomisasi harus tetap tersedia setelah pesanan dibuat.
