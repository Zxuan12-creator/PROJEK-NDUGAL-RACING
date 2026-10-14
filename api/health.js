
import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      ok: false,
      message: 'Metode tidak diizinkan.'
    });
  }

  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'odd_worlds',
      connectTimeout: 10000
    });

    await connection.query('SELECT 1');

    return res.status(200).json({
      ok: true,
      database: 'terhubung'
    });
  } catch (error) {
    console.error('Koneksi database gagal:', error.message);

    return res.status(503).json({
      ok: false,
      message: 'Database belum terhubung. Periksa konfigurasi Vercel.'
    });
  } finally {
    if (connection) await connection.end();
  }
}
