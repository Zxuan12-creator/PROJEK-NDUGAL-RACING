
import { pool, validate, ensureStudent } from '../../lib/db.js';

export default async function handler(req, res) {
  const id = Number(req.query.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({
      message: 'ID absensi tidak valid.'
    });
  }

  try {
    if (req.method === 'PUT') {
      const value = validate(req.body);

      if (typeof value === 'string') {
        return res.status(400).json({ message: value });
      }

      const conn = await pool.getConnection();

      try {
        await conn.beginTransaction();

        const [[old]] = await conn.execute(
          'SELECT id FROM absensi WHERE id = ?',
          [id]
        );

        if (!old) {
          await conn.rollback();
          return res.status(404).json({
            message: 'Data absensi tidak ditemukan.'
          });
        }

        const studentId = await ensureStudent(
          conn, value.name, value.kelas
        );

        await conn.execute(
          `UPDATE absensi
           SET siswa_id = ?, tanggal = ?,
               status_kehadiran = ?, catatan = ?
           WHERE id = ?`,
          [
            studentId,
            value.date,
            value.status,
            value.note || null,
            id
          ]
        );

        await conn.commit();

        return res.status(200).json({
          message: 'Absensi diperbarui.'
        });
      } catch (error) {
        await conn.rollback();
        throw error;
      } finally {
        conn.release();
      }
    }

    if (req.method === 'DELETE') {
      const [result] = await pool.execute(
        'DELETE FROM absensi WHERE id = ?',
        [id]
      );

      if (!result.affectedRows) {
        return res.status(404).json({
          message: 'Data absensi tidak ditemukan.'
        });
      }

      return res.status(200).json({
        message: 'Absensi dihapus.'
      });
    }

    res.setHeader('Allow', 'PUT, DELETE');
    return res.status(405).json({
      message: 'Metode tidak diizinkan.'
    });
  } catch (error) {
    console.error('API absensi:', error.message);

    return res.status(500).json({
      message: 'Gagal memproses absensi. Periksa koneksi database dan data yang dikirim.'
    });
  }
}
