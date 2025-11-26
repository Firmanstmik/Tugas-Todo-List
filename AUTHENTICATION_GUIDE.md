# 🔐 Panduan Autentikasi - Todo List App

## ✅ Fitur yang Ditambahkan

### Backend
1. **Authentication Routes** (`/api/auth`)
   - `POST /api/auth/register` - Registrasi user baru
   - `POST /api/auth/login` - Login user
   - `GET /api/auth/verify` - Verifikasi token

2. **JWT Authentication Middleware**
   - Proteksi semua route `/api/todos`
   - Setiap request memerlukan token JWT yang valid
   - User hanya bisa melihat/mengelola todos miliknya sendiri

3. **Database Schema**
   - Tabel `users` untuk menyimpan data user
   - Kolom `user_id` di tabel `todos` untuk tracking ownership
   - Foreign key constraint untuk data integrity

### Frontend
1. **Halaman Login** - Desain profesional dengan animasi modern
2. **Halaman Register** - Form registrasi yang user-friendly
3. **AuthContext** - State management untuk authentication
4. **Protected Routes** - Redirect otomatis ke login jika belum authenticated
5. **User Info & Logout** - Menampilkan username dan tombol logout

## 🚀 Cara Setup

### 1. Install Dependencies

Dependencies sudah terinstall, tapi jika perlu reinstall:

```bash
# Backend
cd backend
npm install bcryptjs jsonwebtoken

# Frontend
cd frontend
npm install react-router-dom
```

### 2. Setup Database

Jalankan script SQL berikut di MariaDB:

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

-- Add user_id column to todos table
ALTER TABLE todos 
ADD COLUMN IF NOT EXISTS user_id INT,
ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
```

**Catatan:** Script lengkap ada di `backend/migrations/create_users_table.sql`

### 3. Environment Variables (Opsional)

Tambahkan di `backend/.env` jika ingin custom JWT secret:

```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

Default: `your-super-secret-jwt-key-change-this-in-production`

### 4. Jalankan Aplikasi

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

## 📱 Cara Menggunakan

### Registrasi User Baru
1. Buka aplikasi di browser
2. Klik "Sign up" atau akses `/register`
3. Isi form:
   - Username (min 3 karakter)
   - Email (format valid)
   - Password (min 6 karakter)
   - Confirm Password
4. Klik "Create Account"
5. Otomatis login dan redirect ke halaman todos

### Login
1. Akses `/login`
2. Masukkan email dan password
3. Klik "Sign In"
4. Redirect ke halaman todos

### Mengelola Todos
- Setelah login, semua todos yang dibuat akan terikat dengan user yang login
- User hanya bisa melihat/mengedit/menghapus todos miliknya sendiri
- Username ditampilkan di header
- Klik "Logout" untuk keluar

## 🔒 Security Features

1. **Password Hashing** - Menggunakan bcryptjs dengan salt rounds 10
2. **JWT Tokens** - Token expires dalam 7 hari
3. **Route Protection** - Semua todo routes memerlukan authentication
4. **User Isolation** - User hanya bisa akses todos miliknya
5. **Input Validation** - Validasi di frontend dan backend
6. **SQL Injection Protection** - Menggunakan parameterized queries

## 🎨 Design Features

### Login & Register Pages
- **Modern UI** dengan glassmorphism effect
- **Smooth animations** untuk better UX
- **Responsive design** untuk mobile dan desktop
- **Icon integration** dengan SVG icons
- **Error handling** dengan visual feedback
- **Loading states** dengan spinner animations

### Color Scheme
- Primary: `#0ea5e9` (Sky Blue)
- Secondary: `#14b8a6` (Teal)
- Error: `#ff6b6b` (Coral Red)
- Background: Gradient dengan animated particles

## 📁 Struktur File Baru

```
backend/
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── routes/
│   └── auth.js              # Authentication routes
└── migrations/
    ├── create_users_table.sql
    └── README.md

frontend/
├── contexts/
│   └── AuthContext.js       # Authentication state management
├── pages/
│   ├── Login.js            # Login page
│   ├── Login.css
│   ├── Register.js         # Register page
│   └── Register.css
└── components/
    ├── ProtectedRoute.js    # Route protection component
    ├── TodoApp.js          # Main todo app (moved from App.js)
    └── TodoApp.css
```

## 🐛 Troubleshooting

### Error: "Access denied. No token provided"
- Pastikan sudah login
- Cek apakah token tersimpan di localStorage
- Coba logout dan login lagi

### Error: "Invalid token"
- Token mungkin expired (7 hari)
- Logout dan login lagi

### Error: "User not found" saat login
- Pastikan email dan password benar
- Pastikan user sudah terdaftar

### Todos tidak muncul
- Pastikan sudah login
- Cek console untuk error
- Pastikan backend running dan database connected

## 🔄 Migration dari Versi Lama

Jika sudah ada data todos di database:

1. **Backup data** (jika penting)
2. Jalankan migration SQL
3. **Update todos existing** dengan user_id (opsional):
   ```sql
   -- Set user_id untuk todos existing (ganti USER_ID dengan ID user yang valid)
   UPDATE todos SET user_id = USER_ID WHERE user_id IS NULL;
   ```
4. Atau hapus todos lama dan mulai fresh

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token

### Todos (Protected - requires JWT)
- `GET /api/todos` - Get todos user (filtered by user_id)
- `POST /api/todos` - Create todo (auto-assign user_id)
- `PUT /api/todos/:id` - Update todo (only if owned by user)
- `DELETE /api/todos/:id` - Delete todo (only if owned by user)

## 🎯 Next Steps (Optional Enhancements)

1. **Password Reset** - Email verification untuk reset password
2. **Remember Me** - Extended token expiration
3. **Social Login** - OAuth dengan Google/GitHub
4. **Profile Page** - Edit profile user
5. **Admin Panel** - Role-based access control
6. **Activity Log** - Track user actions

---

**Selamat!** Aplikasi Todo List sekarang sudah memiliki sistem autentikasi yang lengkap dan aman! 🎉

