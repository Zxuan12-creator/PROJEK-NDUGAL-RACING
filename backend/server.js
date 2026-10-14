import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(x => x.trim()) : true }));
app.use(express.json({ limit: '100kb' }));
const port = Number(process.env.PORT || 3000);
const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
  user: process.env.MYSQLUSER || process.env.DB_USER,
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'odd_worlds',
  waitForConnections: true, connectionLimit: 8, queueLimit: 0,
  ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  dateStrings: true
});
const statuses = new Set(['Hadir','Izin','Sakit','Alpa']);
function validate(body) {
  const name = String(body.name || '').trim();
  const kelas = String(body.kelas || '').trim();
  const date = String(body.date || '').trim();
  const status = String(body.status || 'Hadir');
  const note = String(body.note || '').trim();
  if (!name || name.length > 120) return 'Nama siswa wajib diisi (maksimal 120 karakter).';
  if (!kelas || kelas.length > 50) return 'Nama kelas wajib diisi (maksimal 50 karakter).';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) return 'Tanggal tidak valid.';
  if (!statuses.has(status)) return 'Status kehadiran tidak valid.';
  if (note.length > 500) return 'Catatan maksimal 500 karakter.';
  return { name, kelas, date, status, note };
}
async function ensureStudent(conn, name, kelas) {
  await conn.execute('INSERT INTO kelas (nama_kelas) VALUES (?) ON DUPLICATE KEY UPDATE nama_kelas=VALUES(nama_kelas)', [kelas]);
  const [[classRow]] = await conn.execute('SELECT id FROM kelas WHERE nama_kelas=? LIMIT 1', [kelas]);
  const [[existing]] = await conn.execute('SELECT id FROM siswa WHERE nama_lengkap=? AND kelas_id=? LIMIT 1', [name, classRow.id]);
  if (existing) return Number(existing.id);
  const code = `OW-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`.toUpperCase();
  const [result] = await conn.execute('INSERT INTO siswa (kode_siswa,nama_lengkap,kelas_id) VALUES (?,?,?)', [code,name,classRow.id]);
  return Number(result.insertId);
}
async function rowsFromQuery(where='', params=[]) {
  const [rows] = await pool.execute(`SELECT a.id, s.nama_lengkap AS name, k.nama_kelas AS kelas, a.tanggal AS date, a.status_kehadiran AS status, COALESCE(a.catatan,'') AS note FROM absensi a JOIN siswa s ON s.id=a.siswa_id JOIN kelas k ON k.id=s.kelas_id ${where} ORDER BY a.tanggal DESC, a.id DESC`, params);
  return rows.map(r => ({...r, id:Number(r.id)}));
}
app.get('/api/health', async (_req,res) => {
  try { await pool.query('SELECT 1'); res.json({ok:true, database:'terhubung'}); }
  catch (e) { res.status(503).json({ok:false, message:'API berjalan, tetapi basis data belum terhubung.', detail:process.env.NODE_ENV==='production'?undefined:e.message}); }
});
app.get('/api/absensi', async (_req,res) => { try { res.json({data:await rowsFromQuery()}); } catch(e) { console.error(e); res.status(500).json({message:'Gagal mengambil data absensi. Periksa koneksi MySQL dan jalankan database.sql.'}); } });
app.post('/api/absensi', async (req,res) => {
  const v=validate(req.body); if(typeof v==='string') return res.status(400).json({message:v});
  const conn=await pool.getConnection();
  try {
    await conn.beginTransaction();
    const studentId=await ensureStudent(conn,v.name,v.kelas);
    await conn.execute('INSERT INTO absensi (siswa_id,tanggal,status_kehadiran,catatan) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE status_kehadiran=VALUES(status_kehadiran),catatan=VALUES(catatan)',[studentId,v.date,v.status,v.note||null]);
    await conn.commit(); res.status(201).json({message:'Absensi tersimpan.'});
  } catch(e) { await conn.rollback(); console.error(e); res.status(500).json({message:'Gagal menyimpan absensi. Pastikan struktur database sudah diimpor.'}); }
  finally {conn.release();}
});
app.put('/api/absensi/:id', async (req,res) => {
  const id=Number(req.params.id); if(!Number.isInteger(id)||id<1) return res.status(400).json({message:'ID absensi tidak valid.'});
  const v=validate(req.body); if(typeof v==='string') return res.status(400).json({message:v});
  const conn=await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[old]] = await conn.execute('SELECT id FROM absensi WHERE id=?',[id]);
    if(!old){await conn.rollback();return res.status(404).json({message:'Data absensi tidak ditemukan.'});}
    const studentId=await ensureStudent(conn,v.name,v.kelas);
    await conn.execute('UPDATE absensi SET siswa_id=?,tanggal=?,status_kehadiran=?,catatan=? WHERE id=?',[studentId,v.date,v.status,v.note||null,id]);
    await conn.commit(); res.json({message:'Absensi diperbarui.'});
  } catch(e) {await conn.rollback(); console.error(e); res.status(500).json({message:'Gagal memperbarui absensi. Mungkin siswa sudah memiliki absensi pada tanggal tersebut.'});}
  finally {conn.release();}
});
app.delete('/api/absensi/:id', async (req,res) => {
  const id=Number(req.params.id); if(!Number.isInteger(id)||id<1) return res.status(400).json({message:'ID absensi tidak valid.'});
  try {const [result]=await pool.execute('DELETE FROM absensi WHERE id=?',[id]); if(!result.affectedRows)return res.status(404).json({message:'Data absensi tidak ditemukan.'});res.json({message:'Absensi dihapus.'});}
  catch(e){console.error(e);res.status(500).json({message:'Gagal menghapus absensi.'});}
});
app.listen(port,'0.0.0.0',()=>console.log(`API ODD WORLDS berjalan di port ${port}`));
