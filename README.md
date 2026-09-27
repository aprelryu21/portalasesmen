# KARTU UJIAN — School Exam Card Generator

Aplikasi web modern berbasis **Neobrutalism** untuk operator dan guru sekolah dalam mengelola, mendesain, dan mencetak **kartu ujian siswa secara otomatis** berbasis ukuran kertas fisik A4.

---

## 🌟 Fitur Utama

### 1. Pengelolaan Data Siswa
- **Input Manual**: Tambah dan edit data siswa lengkap dengan validasi nama, jenis kelamin, kelas, tempat/tanggal lahir, ruang, dan nomor meja.
- **Import Data Excel**: Unduh template Excel resmi (`.xlsx`), isi data siswa, dan upload kembali dengan validasi instan (cek duplikat NISN, peringatan, dan error per baris).
- **Pencocokan Foto Massal (ZIP / Multiple Files)**: Unggah file `.zip` berisi foto siswa; sistem otomatis mencocokkan nama file foto dengan NISN, NIS, atau Nama siswa.
- **Avatar Gender Otomatis**: Siswa yang belum memiliki foto akan otomatis menggunakan vector SVG Avatar Siswa Laki-laki / Perempuan yang rapi dan profesional. Tidak ada gambar pecah atau kartu bolong.
- **Pencarian, Filter & Sortir**: Cari siswa berdasarkan nama, NISN, atau NIS; filter per kelas, gender, dan status foto.
- **Sistem Seleksi Siswa**: Pilih siswa tertentu atau seluruh siswa untuk dicetak.

### 2. Studio Desain Kartu (Live Realtime Preview)
- **Preset Desain**: Classic (Formal), Modern (Teal), dan Playful (Neobrutalism kuning-cyan).
- **Presisi Ukuran Fisik**: Mendukung ukuran standar (95×65 mm), ID Card (86×54 mm), Large (105×74 mm), serta Custom mm.
- **Kustomisasi Elemen**:
  - Kop Header: Logo sekolah, nama sekolah, nama ujian, semester/tahun ajaran, dan NPSN.
  - Foto: Ukuran mm, bentuk (rounded, square, circle), border.
  - Biodata: Nama lengkap (skala font otomatis menyesuaikan panjang nama tanpa overflow), NISN, NIS, kelas, TTL, dan ruang/meja.
  - QR Code: Verifikasi NISN terenkripsi untuk pengawas ujian.
  - Footer & Tanda Tangan: Tanggal titimangsa, nama kepala sekolah, NIP, dan ruang tanda tangan/stempel.

### 3. Sistem Cetak & Ekspor PDF A4
- **Layout Fleksibel**:
  - **1 Baris × 2 Kartu** (Standar hemat kertas ujian sekolah Indonesia: muat 6 hingga 8 kartu per lembar A4).
  - **1 Baris × 1 Kartu** (Ukuran besar).
- **Paginasi Akurat**: Pembagian lembar A4 otomatis dengan CSS physical units (`mm`), `break-inside: avoid;`, dan `page-break-after: always;`.
- **Panduan Pemotongan**: Opsi garis putus-putus (*cut lines*) dan tanda sudut (*crop marks*) untuk memudahkan guru/operator memotong kartu dengan rapi.
- **Ekspor PDF Vektor**: Menggunakan dialog cetak native browser (`Ctrl+P` / `Cmd+P` -> *Save as PDF*) yang menghasilkan teks tajam dan gambar jernih beresolusi tinggi tanpa kompresi pixel canvas buram.

### 4. Portal Admin & Portal Sekolah Terpisah
- **Portal Sekolah**:
  - Khusus operator sekolah untuk mengelola data siswa, input manual, import Excel, upload foto ZIP, avatar gender, editor desain kartu realtime, serta cetak lembar A4.
  - Bersih dari informasi teknis database atau konfigurasi server sehingga siap dibagikan ke sekolah mana pun.
- **Portal Admin (Khusus Administrator Nagata)**:
  - **Manajemen Pengguna**: Kelola akun operator sekolah (tambah akun, ubah role, tangguhkan akun, reset password, hapus akun).
  - **Insight & Statistik**: Pantau jumlah siswa terdaftar tiap sekolah, rasio kelengkapan foto vs avatar, dan aktivitas ujian.
  - **Monitor Upload Siswa**: Inspeksi data siswa yang diunggah oleh masing-masing sekolah dan opsi langsung membuka kartu sekolah tersebut.
  - **Pengaturan Lanjutan & Database**: Konfigurasi Google Apps Script & Google Drive terenkripsi yang hanya dapat diakses oleh admin, cadangan data JSON, dan sinkronisasi cloud.
- **Landing Page Publik**:
  - Halaman awal interaktif untuk mengenalkan platform ke berbagai sekolah tanpa mengekspos informasi login admin ataupun database internal.

---

## 🚀 Menjalankan Aplikasi

```bash
# Install dependencies
npm install

# Jalankan server development
npm run dev

# Build untuk production
npm run build
```

---

## 📋 Format Template Excel
Template dapat diunduh langsung di dalam aplikasi melalui tombol **"Download Template Excel"**.
Kolom yang tersedia:
1. `No`
2. `NISN` (10 digit angka unik)
3. `NIS` (Nomor Induk Sekolah)
4. `Nama Lengkap` (Wajib diisi)
5. `Jenis Kelamin (L/P)` ("L" untuk Laki-laki, "P" untuk Perempuan)
6. `Kelas` (Contoh: "Kelas 6A")
7. `Tempat Lahir` (Contoh: "Kediri")
8. `Tanggal Lahir (YYYY-MM-DD)` (Contoh: "2014-05-12")
9. `Ruang Ujian` (Opsional, Contoh: "Ruang 01")
10. `Nomor Meja` (Opsional, Contoh: "01")

## 📸 Aturan Penamaan File Foto Massal (ZIP)
Kemas foto siswa dalam file `.zip` (misal: `foto-siswa.zip`).
Beri nama file foto berdasarkan:
- **NISN**: `0123456781.jpg`, `0123456782.png` *(Sangat Direkomendasikan)*
- **NIS**: `2023001.jpg`
- **Nama Siswa**: `ahmad_rizky.jpg`
Sistem akan otomatis mencocokkan setiap file dengan siswa yang sesuai.
