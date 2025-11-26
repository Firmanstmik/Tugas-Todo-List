-- Add role column to existing users table (if table already exists)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role ENUM('user', 'admin') DEFAULT 'user';

-- Create index for role
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- SET USER SEBAGAI ADMIN (PILIH SALAH SATU):
-- ============================================

-- Opsi 1: Set user pertama (ID 1) sebagai admin
-- UPDATE users SET role = 'admin' WHERE id = 1 LIMIT 1;

-- Opsi 2: Set berdasarkan email (ganti dengan email Anda)
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- Opsi 3: Set berdasarkan username (ganti dengan username Anda)
-- UPDATE users SET role = 'admin' WHERE username = 'your-username';

-- Setelah menjalankan salah satu UPDATE di atas, LOGOUT dan LOGIN LAGI di aplikasi!

