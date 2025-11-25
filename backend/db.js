const mariadb = require('mariadb');
require('dotenv').config();

// Create connection pool
const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '12345',
  database: process.env.DB_NAME || 'mern',
  port: process.env.DB_PORT || 3306,
  connectionLimit: 5,
});

// Test connection with better error handling
pool.getConnection()
  .then(conn => {
    console.log('✅ Database connected successfully');
    console.log(`   Database: ${process.env.DB_NAME || 'mern'}`);
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    conn.release();
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Pastikan MariaDB service berjalan');
    console.error('   2. Cek file .env di folder backend');
    console.error('   3. Verifikasi kredensial database:');
    console.error(`      Host: ${process.env.DB_HOST || 'localhost'}`);
    console.error(`      User: ${process.env.DB_USER || 'belajar'}`);
    console.error(`      Database: ${process.env.DB_NAME || 'mern'}`);
    console.error(`      Port: ${process.env.DB_PORT || 3306}`);
    console.error('   4. Test koneksi manual: mysql -u belajar -p');
    console.error('');
  });

// Graceful shutdown - close pool on process termination
process.on('SIGTERM', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});

module.exports = pool;

