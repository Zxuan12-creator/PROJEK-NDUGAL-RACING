# ODD WORLDS

Website React + Vite untuk lima dunia, Bumi 3D, foto dunia, dan halaman absensi.

## Menjalankan di komputer

1. Pasang Node.js versi LTS.
2. Buka terminal pada folder project.
3. Jalankan `npm install`.
4. Jalankan `npm run dev`.

## Membuat versi siap hosting

Jalankan `npm run build`. Hasil produksi berada di folder `dist`.

## Hosting frontend di Vercel

1. Unggah project ini ke repositori GitHub milikmu.
2. Masuk ke Vercel dan pilih **Add New → Project**.
3. Impor repositori tadi. Vercel akan mendeteksi Vite.
4. Build command: `npm run build`; output directory: `dist`.
5. Tekan **Deploy**.

File `vercel.json` sudah menyertakan aturan agar halaman `/archive` dapat dibuka langsung.

## Database

`database.sql` berisi skema berbahasa Indonesia dengan primary key dan foreign key. Halaman absensi frontend saat ini masih memakai penyimpanan browser (`localStorage`), jadi database SQL belum terhubung sampai dibuat backend API.

## Catatan foto dan Bumi

Foto dunia dan tekstur Bumi saat ini dimuat dari internet. Pastikan hosting dan pengunjung memiliki akses internet. Animasi Bumi berhenti ketika elemen tidak terlihat dan mengikuti pengaturan reduced motion.

## Koneksi database absensi

Halaman absensi menggunakan backend Express di folder `backend/` dan MySQL. Ikuti `PANDUAN-KONEKSI-DATABASE.md` untuk deploy API di Railway, mengatur `VITE_API_URL` di Vercel, serta menguji koneksi. Data absensi tidak lagi disimpan ke localStorage.
