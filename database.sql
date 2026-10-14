-- BASIS DATA ODD WORLDS — ABSENSI SEKOLAH
-- Impor melalui phpMyAdmin. Tabel dan kolom menggunakan bahasa Indonesia.
CREATE DATABASE IF NOT EXISTS odd_worlds
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE odd_worlds;

CREATE TABLE IF NOT EXISTS kelas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nama_kelas VARCHAR(50) NOT NULL,
  dibuat_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unik_nama_kelas (nama_kelas)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS siswa (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  kode_siswa VARCHAR(30) NOT NULL,
  nama_lengkap VARCHAR(120) NOT NULL,
  kelas_id BIGINT UNSIGNED NOT NULL,
  dibuat_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  diubah_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unik_kode_siswa (kode_siswa),
  KEY indeks_kelas_id (kelas_id),
  CONSTRAINT fk_siswa_kelas
    FOREIGN KEY (kelas_id) REFERENCES kelas(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS absensi (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  siswa_id BIGINT UNSIGNED NOT NULL,
  tanggal DATE NOT NULL,
  status_kehadiran ENUM('Hadir','Izin','Sakit','Alpa') NOT NULL DEFAULT 'Hadir',
  catatan VARCHAR(500) NULL,
  dibuat_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  diubah_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unik_absensi_siswa_tanggal (siswa_id, tanggal),
  KEY indeks_tanggal_status (tanggal, status_kehadiran),
  CONSTRAINT fk_absensi_siswa
    FOREIGN KEY (siswa_id) REFERENCES siswa(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- Contoh data awal: satu kelas dan lima siswa.
INSERT INTO kelas (nama_kelas)
VALUES ('XII')
ON DUPLICATE KEY UPDATE nama_kelas = VALUES(nama_kelas);

SET @kelas_xii_id := (SELECT id FROM kelas WHERE nama_kelas = 'XII' LIMIT 1);

INSERT INTO siswa (kode_siswa, nama_lengkap, kelas_id) VALUES
  ('OW-KVN-001', 'Kevin', @kelas_xii_id),
  ('OW-HLM-002', 'Halim', @kelas_xii_id),
  ('OW-LNL-003', 'Leonel', @kelas_xii_id),
  ('OW-GLH-004', 'Galih', @kelas_xii_id),
  ('OW-KFI-005', 'Kafi', @kelas_xii_id)
ON DUPLICATE KEY UPDATE
  nama_lengkap = VALUES(nama_lengkap),
  kelas_id = VALUES(kelas_id);

-- Contoh menampilkan absensi beserta nama siswa dan kelas:
-- SELECT a.id, s.nama_lengkap, k.nama_kelas, a.tanggal, a.status_kehadiran, a.catatan
-- FROM absensi a
-- JOIN siswa s ON s.id = a.siswa_id
-- JOIN kelas k ON k.id = s.kelas_id
-- ORDER BY a.tanggal DESC, s.nama_lengkap;
