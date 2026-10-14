# Panduan koneksi database ODD WORLDS

Project ini memiliki frontend React + Vite (untuk Vercel) dan backend Express (untuk Railway). Jangan masukkan kata sandi MySQL ke frontend atau ke repositori GitHub.

## A. Impor struktur MySQL

1. Buka layanan MySQL di Railway dan gunakan kredensial/koneksi yang diberikan Railway.
2. Impor `database.sql` ke database yang dipakai aplikasi. Jika database sudah berisi data penting, buat cadangan dahulu dan jangan menjalankan perintah penghapusan tabel.
3. Pastikan tabel `kelas`, `siswa`, dan `absensi` tersedia.

## B. Deploy backend ke Railway

1. Push seluruh isi project ke GitHub.
2. Di Railway, buat layanan baru dari repositori GitHub yang sama.
3. Pada pengaturan layanan backend, set **Root Directory** menjadi `/backend`.
4. Build command boleh dikosongkan; Start Command: `npm start`.
5. Hubungkan layanan MySQL ke layanan backend. Railway umumnya menyediakan `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, dan `MYSQLDATABASE` secara otomatis. Jika tidak, isi variabel tersebut dari tab Variables MySQL.
6. Deploy, lalu aktifkan domain publik pada pengaturan Networking.
7. Uji `https://ALAMAT-API-RAILWAY/api/health`. Harus menghasilkan `{"ok":true,"database":"terhubung"}`.
8. Setelah URL Vercel diketahui, set variabel `FRONTEND_URL` di layanan backend ke URL Vercel, tanpa garis miring di akhir. Jika memakai beberapa domain, pisahkan dengan koma.

## C. Hubungkan frontend di Vercel

1. Pada project Vercel, buka Settings → Environment Variables.
2. Tambahkan `VITE_API_URL` dengan nilai URL publik backend Railway, misalnya `https://odd-worlds-api-production.up.railway.app` (gunakan URL milikmu sendiri).
3. Simpan dan lakukan Redeploy agar variabel Vite masuk ke build.
4. Buka halaman `/archive`, tambahkan data absensi, lalu muat ulang halaman. Data seharusnya tetap ada karena dibaca dari MySQL.

## API yang tersedia

- `GET /api/health` — cek API dan database.
- `GET /api/absensi` — daftar absensi.
- `POST /api/absensi` — tambah absensi.
- `PUT /api/absensi/:id` — ubah absensi.
- `DELETE /api/absensi/:id` — hapus absensi.

## Catatan

- Jangan commit file `.env` atau kredensial database.
- Jika tabel sudah ada tetapi struktur berbeda, cek dahulu sebelum impor ulang.
- API memakai nama tabel dan kolom Indonesia dari `database.sql`.
