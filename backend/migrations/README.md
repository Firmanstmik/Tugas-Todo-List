# Database Migrations

## Setup Authentication Tables

Jalankan script SQL berikut di database MariaDB untuk membuat tabel users dan menambahkan kolom user_id ke tabel todos:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add user_id column to todos table if it doesn't exist
ALTER TABLE todos 
ADD COLUMN IF NOT EXISTS user_id INT,
ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
```

## Cara Menjalankan

1. Buka **HeidiSQL**, **phpMyAdmin**, atau **Command Line MariaDB**
2. Pilih database `mern`
3. Jalankan script SQL di atas
4. Verifikasi dengan:
   ```sql
   DESCRIBE users;
   DESCRIBE todos;
   ```

## Catatan

- Jika tabel todos sudah memiliki data, pastikan untuk mengupdate data existing dengan user_id yang valid atau hapus data lama
- Foreign key constraint akan memastikan data integrity
- Index akan meningkatkan performa query

