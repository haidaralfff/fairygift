# 4.4 Dynamic Price Calculation

**Deskripsi:**

Fitur ini bertanggung jawab menghitung total harga hadiah secara otomatis berdasarkan pilihan pelanggan dalam Custom Gift Builder.

**Kebutuhan Fungsional:**

- Mengambil harga kemasan yang dipilih.
- Mengambil harga setiap komponen hadiah.
- Menghitung total harga berdasarkan seluruh komponen yang dipilih.
- Memperbarui harga ketika pelanggan mengubah pilihan.
- Menampilkan rincian harga sebelum pelanggan melakukan checkout.

**Rumus Perhitungan:**

Total Harga = Harga Kemasan + Total Harga Komponen + Biaya Tambahan (jika ada).

**Acceptance Criteria:**

- Sistem menghitung harga berdasarkan data harga yang tersimpan.
- Perubahan komponen memperbarui total harga.
- Total harga ditampilkan secara konsisten pada Custom Gift Builder dan keranjang.
- Perhitungan harga dilakukan kembali di server ketika pesanan disimpan untuk mencegah manipulasi harga dari sisi pelanggan.
