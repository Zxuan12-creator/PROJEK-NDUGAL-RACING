
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'railway',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 10000,
  dateStrings: true
});

export function validate(body = {}) {
  const name = String(body.name || '').trim();
  const kelas = String(body.kelas || '').trim();
  const date = String(body.date || '').trim();
  const status = String(body.status || 'Hadir');
  const note = String(body.note || '').trim();

  if (!name || name.length > 120)
    return 'Nama siswa wajib diisi (maksimal 120 karakter).';

  if (!kelas || kelas.length > 50)
    return 'Nama kelas wajib diisi (maksimal 50 karakter).';

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return 'Tanggal tidak valid.';

  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== date)
    return 'Tanggal tidak valid.';

  if (!['Hadir', 'Izin', 'Sakit', 'Alpa'].includes(status))
    return 'Status kehadiran tidak valid.';

  if (note.length > 500)
    return 'Catatan maksimal 500 karakter.';

  return { name, kelas, date, status, note };
}

export async function ensureStudent(conn, name, kelas) {
  await conn.execute(
    `INSERT INTO kelas (nama_kelas) VALUES (?)
     ON DUPLICATE KEY UPDATE nama_kelas = VALUES(nama_kelas)`,
    [kelas]
  );

  const [[classRow]] = await conn.execute(
    'SELECT id FROM kelas WHERE nama_kelas = ? LIMIT 1',
    [kelas]
  );

  const [[existing]] = await conn.execute(
    'SELECT id FROM siswa WHERE nama_lengkap = ? AND kelas_id = ? LIMIT 1',
    [name, classRow.id]
  );

  if (existing) return Number(existing.id);

  const code = `OW-${Date.now().toString(36)}-${Math.random()
    .toString(36).slice(2, 7)}`.toUpperCase();

  const [result] = await conn.execute(
    'INSERT INTO siswa (kode_siswa, nama_lengkap, kelas_id) VALUES (?, ?, ?)',
    [code, name, classRow.id]
  );

  return Number(result.insertId);
}
