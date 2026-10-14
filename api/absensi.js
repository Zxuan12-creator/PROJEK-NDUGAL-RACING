
import { pool, validate, ensureStudent } from '../lib/db.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const [rows] = await pool.execute(`
        SELECT
          a.id,
          s.nama_lengkap AS name,
          k.nama_kelas AS kelas,
          a.tanggal AS date,
          a.status_kehadiran AS status,
          COALESCE(a.catatan, '') AS note
        FROM absensi a
        JOIN siswa s ON s.id = a.siswa_id
        JOIN kelas k ON k.id = s.kelas_id
        ORDER BY a.tanggal DESC, a.id DESC
      `);

      return res.status(200).json({
        data: rows.map(row => ({ ...row, id: Number(row.id) }))
      });
    }

    if (req.method === 'POST') {
      const value = validate(req.body);

      if (typeof value === 'string') {
        return res.status(400).json({ message: value });
      }

      const conn = await pool.getConnection();

      try {
        await conn.beginTransaction();

        const studentId = await ensureStudent(
          conn, value.name, value.kelas
        );

        await conn.execute(
          `INSERT INTO absensi
            (siswa_id, tanggal, status_kehadiran, catatan)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
            status_kehadiran = VALUES(status_kehadiran),
            catatan = VALUES(catatan)`,
          [
            studentId,
            value.date,
            value.status,
            value.note || null
          ]
        );

        await conn.commit();

        return res.status(201).json({
          message: 'Absensi tersimpan.'
        });
      } catch (error) {
        await conn.rollback();
        throw error;
      } finally {
        conn.release();
      }
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({
      message: 'Metode tidak diizinkan.'
    });
  } catch (error) {
    console.error('API absensi:', error.message);

    return res.status(500).json({
      message: 'Gagal memproses absensi. Periksa koneksi database dan struktur tabel.'
    });
  }
}
