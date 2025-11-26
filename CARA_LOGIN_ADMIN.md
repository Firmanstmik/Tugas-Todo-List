# 🔐 Cara Login Sebagai Admin

Panduan lengkap untuk login sebagai admin di Todo List App.

## 📋 Langkah-Langkah

### **Metode 1: Set User Existing Menjadi Admin** (Paling Mudah)

Jika Anda sudah punya akun user, ikuti langkah ini:

#### 1. Buka Database Manager
Buka **HeidiSQL**, **phpMyAdmin**, atau **Command Line MariaDB**

#### 2. Pilih Database
```sql
USE mern;
```

#### 3. Lihat Daftar Users
```sql
SELECT id, username, email, role FROM users;
```

#### 4. Set User Menjadi Admin

**Opsi A: Set berdasarkan ID**
```sql
UPDATE users SET role = 'admin' WHERE id = 1;
```

**Opsi B: Set berdasarkan email**
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

**Opsi C: Set berdasarkan username**
```sql
UPDATE users SET role = 'admin' WHERE username = 'your-username';
```

#### 5. Verifikasi
```sql
SELECT id, username, email, role FROM users WHERE role = 'admin';
```

Pastikan user Anda muncul dengan `role = 'admin'`

#### 6. Login di Aplikasi
1. Buka aplikasi di browser: `http://localhost:3000`
2. Klik "Sign in" atau akses `/login`
3. Masukkan **email** dan **password** user yang sudah di-set sebagai admin
4. Setelah login, Anda akan melihat:
   - Badge **"Admin"** di header
   - **Admin Panel** muncul di bawah header
   - Bisa melihat semua todos dari semua users

---

### **Metode 2: Buat User Admin Baru Langsung**

Jika ingin membuat user baru langsung sebagai admin:

#### 1. Buka Database Manager
Buka **HeidiSQL**, **phpMyAdmin**, atau **Command Line MariaDB**

#### 2. Pilih Database
```sql
USE mern;
```

#### 3. Buat User Baru dengan Role Admin

**Catatan:** Password harus di-hash dengan bcrypt. Cara termudah adalah:
1. **Daftar dulu via aplikasi** (akan jadi user biasa)
2. **Lalu set role menjadi admin** menggunakan Metode 1 di atas

**Atau** jika ingin langsung insert (perlu hash password manual):

```sql
-- Install bcryptjs di Node.js untuk hash password
-- Atau gunakan online bcrypt generator: https://bcrypt-generator.com/

-- Contoh (password: admin123, hash: $2a$10$...)
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@example.com', '$2a$10$hashed_password_here', 'admin');
```

**⚠️ Tidak disarankan** karena perlu hash password manual.

---

### **Metode 3: Set User Pertama Sebagai Admin** (Quick Setup)

Jika ini pertama kali setup dan belum ada user:

#### 1. Daftar User Baru via Aplikasi
1. Buka `http://localhost:3000`
2. Klik "Sign up" atau akses `/register`
3. Buat akun baru (username, email, password)
4. Setelah registrasi, Anda akan otomatis login sebagai **user biasa**

#### 2. Set Menjadi Admin
Buka database dan jalankan:

```sql
USE mern;

-- Set user pertama (ID 1) sebagai admin
UPDATE users SET role = 'admin' WHERE id = 1 LIMIT 1;

-- Atau set berdasarkan email yang baru dibuat
UPDATE users SET role = 'admin' WHERE email = 'email-yang-didaftarkan@example.com';
```

#### 3. Logout dan Login Lagi
1. Klik tombol **"Logout"** di aplikasi
2. Login lagi dengan email dan password yang sama
3. Sekarang Anda akan login sebagai **admin**!

---

## ✅ Verifikasi Login Sebagai Admin

Setelah login, pastikan Anda melihat:

### ✅ Tanda-Tanda Login Sebagai Admin:

1. **Badge "Admin"** muncul di header (bukan "User")
   - Badge biru dengan gradient
   - Terletak di sebelah username

2. **Admin Panel** muncul di bawah header
   - Tab "Statistics" dan "Users Management"
   - Menampilkan statistik aplikasi

3. **Todos menampilkan owner info**
   - Format: `"Todo Title" by username`
   - Bisa melihat todos dari semua users

4. **Bisa akses Admin Panel**
   - Klik tab "Statistics" → lihat statistik
   - Klik tab "Users Management" → manage users

### ❌ Jika Masih User Biasa:

- Badge "User" (abu-abu) muncul
- Tidak ada Admin Panel
- Hanya melihat todos milik sendiri
- Tidak bisa akses `/api/admin/*`

**Solusi:** Pastikan role di database sudah `'admin'` (case sensitive!)

---

## 🔍 Troubleshooting

### Problem: Login tapi masih jadi user biasa

**Penyebab:**
- Role di database belum di-update
- Token JWT masih lama (belum include role baru)

**Solusi:**
1. **Logout** dari aplikasi
2. **Login lagi** (token baru akan dibuat dengan role terbaru)
3. Atau **clear browser cache** dan login lagi

### Problem: Error saat update role di database

**Penyebab:**
- Kolom `role` belum ada di tabel `users`

**Solusi:**
Jalankan migration:
```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role ENUM('user', 'admin') DEFAULT 'user';

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

### Problem: Tidak bisa akses Admin Panel

**Penyebab:**
- Role di database bukan `'admin'`
- Token JWT tidak include role

**Solusi:**
1. Cek role di database:
   ```sql
   SELECT id, username, email, role FROM users WHERE email = 'your-email@example.com';
   ```
2. Pastikan `role = 'admin'` (huruf kecil, tanpa spasi)
3. Logout dan login lagi

### Problem: Lupa password admin

**Solusi:**
1. Reset password di database (perlu hash baru)
2. Atau buat user admin baru
3. Atau gunakan fitur "Forgot Password" (jika sudah diimplementasikan)

---

## 📝 Quick Reference

### SQL Commands

```sql
-- Lihat semua users dan role mereka
SELECT id, username, email, role FROM users;

-- Set user menjadi admin (by ID)
UPDATE users SET role = 'admin' WHERE id = 1;

-- Set user menjadi admin (by email)
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';

-- Set user menjadi admin (by username)
UPDATE users SET role = 'admin' WHERE username = 'admin';

-- Lihat semua admin
SELECT id, username, email FROM users WHERE role = 'admin';

-- Set user kembali menjadi user biasa
UPDATE users SET role = 'user' WHERE id = 1;
```

### Default Admin Account (Untuk Testing)

Jika ingin membuat default admin untuk testing:

```sql
-- Set user pertama sebagai admin
UPDATE users SET role = 'admin' WHERE id = 1 LIMIT 1;

-- Atau buat user admin khusus untuk testing
-- (Password harus di-hash dulu!)
INSERT INTO users (username, email, password, role) 
VALUES ('testadmin', 'admin@test.com', '$2a$10$hashed_password', 'admin');
```

---

## 🎯 Tips

1. **Selalu logout dan login lagi** setelah update role di database
2. **Gunakan email yang mudah diingat** untuk admin account
3. **Jangan share password admin** dengan user biasa
4. **Backup database** sebelum melakukan perubahan besar
5. **Test di browser incognito** jika ada masalah dengan cache

---

**Selamat!** Sekarang Anda sudah tahu cara login sebagai admin! 🎉

Jika masih ada masalah, pastikan:
- ✅ Database migration sudah dijalankan
- ✅ Role column sudah ada di tabel users
- ✅ User sudah di-set sebagai admin di database
- ✅ Sudah logout dan login lagi

