# 🔐 Role-Based Access Control (RBAC) Guide

## ✅ Fitur yang Ditambahkan

Sistem role-based access control telah ditambahkan dengan perbedaan akses antara **Admin** dan **User**.

### Backend Features

1. **Role Column di Database**
   - Tabel `users` memiliki kolom `role` dengan nilai `'user'` atau `'admin'`
   - Default role untuk user baru adalah `'user'`

2. **Admin Routes** (`/api/admin/*`)
   - `GET /api/admin/users` - Lihat semua users (admin only)
   - `GET /api/admin/stats` - Statistik aplikasi (admin only)
   - `PUT /api/admin/users/:id/role` - Update role user (admin only)
   - `DELETE /api/admin/users/:id` - Hapus user (admin only)

3. **Todos Routes dengan Role-Based Access**
   - **Admin**: Bisa melihat, edit, dan hapus **semua todos** dari semua users
   - **User**: Hanya bisa melihat, edit, dan hapus **todos miliknya sendiri**

4. **Middleware**
   - `authenticateToken` - Verifikasi JWT token
   - `requireAdmin` - Memastikan user adalah admin
   - `requireAdminOrOwner` - Admin atau owner resource

### Frontend Features

1. **Role Badge**
   - Menampilkan badge "Admin" atau "User" di header
   - Styling berbeda untuk admin dan user

2. **Admin Panel**
   - **Statistics Tab**: Menampilkan statistik aplikasi
     - Total users
     - Total todos
     - Completed todos
     - Pending todos
     - Users by role
   - **Users Management Tab**: 
     - Tabel semua users
     - Update role user (user ↔ admin)
     - Delete user
     - Hanya admin yang bisa akses

3. **Todos Display**
   - Admin melihat todos dengan info owner (username)
   - User hanya melihat todos miliknya sendiri

## 🚀 Setup Database

### Untuk Database Baru

Jalankan script di `backend/migrations/create_users_table.sql` (sudah include role column).

### Untuk Database Existing

Jalankan script di `backend/migrations/add_role_column.sql`:

```sql
-- Add role column to existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role ENUM('user', 'admin') DEFAULT 'user';

-- Create index for role
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

### Set Admin User

Untuk set user pertama sebagai admin:

```sql
-- Set user dengan ID 1 sebagai admin
UPDATE users SET role = 'admin' WHERE id = 1 LIMIT 1;

-- Atau set berdasarkan email
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

## 📋 Perbedaan Akses

### Admin
- ✅ Bisa melihat semua todos dari semua users
- ✅ Bisa edit/delete todos dari user lain
- ✅ Bisa akses Admin Panel
- ✅ Bisa melihat statistik aplikasi
- ✅ Bisa manage users (update role, delete)
- ✅ Todos ditampilkan dengan info owner

### User
- ✅ Hanya bisa melihat todos miliknya sendiri
- ✅ Hanya bisa edit/delete todos miliknya sendiri
- ❌ Tidak bisa akses Admin Panel
- ❌ Tidak bisa melihat todos user lain
- ❌ Tidak bisa manage users

## 🎨 UI Features

### Role Badge
- **Admin**: Badge biru dengan gradient, border
- **User**: Badge abu-abu sederhana

### Admin Panel
- **Modern Design**: Glassmorphism effect
- **Statistics Cards**: 
  - Total Users (blue)
  - Total Todos (teal)
  - Completed (green)
  - Pending (orange)
- **Users Table**: 
  - Responsive table
  - Role selector dropdown
  - Delete button dengan confirmation

### Todos Display
- Admin melihat: `"Todo Title" by username`
- User melihat: `"Todo Title"` (tanpa owner info)

## 🔒 Security

1. **Role Validation di Backend**
   - Semua admin routes protected dengan `requireAdmin` middleware
   - Todos routes check role sebelum allow access

2. **Frontend Protection**
   - Admin Panel hanya render jika `isAdmin === true`
   - API calls akan return 403 jika user bukan admin

3. **Self-Protection**
   - Admin tidak bisa remove admin role sendiri
   - Admin tidak bisa delete account sendiri

## 📝 API Endpoints

### Admin Endpoints (Requires Admin Role)

```
GET    /api/admin/users          - Get all users
GET    /api/admin/stats          - Get statistics
PUT    /api/admin/users/:id/role - Update user role
DELETE /api/admin/users/:id     - Delete user
```

### Todos Endpoints (Role-Based)

```
GET    /api/todos        - Get todos (all for admin, own for user)
POST   /api/todos        - Create todo (always own)
PUT    /api/todos/:id    - Update todo (any for admin, own for user)
DELETE /api/todos/:id    - Delete todo (any for admin, own for user)
```

## 🧪 Testing

### Test Admin Access
1. Login sebagai admin
2. Buka Admin Panel
3. Cek Statistics tab
4. Cek Users Management tab
5. Coba update role user lain
6. Coba delete user (bukan diri sendiri)

### Test User Access
1. Login sebagai user biasa
2. Pastikan tidak ada Admin Panel
3. Pastikan hanya melihat todos miliknya
4. Coba akses `/api/admin/users` (harus return 403)

## 🐛 Troubleshooting

### Admin Panel tidak muncul
- Pastikan user memiliki role `'admin'` di database
- Cek `user.role` di AuthContext
- Refresh page setelah update role

### Tidak bisa akses admin routes
- Pastikan JWT token include role
- Cek middleware `requireAdmin`
- Pastikan role di database adalah `'admin'` (case sensitive)

### Todos tidak muncul untuk admin
- Pastikan query di backend include JOIN dengan users table
- Cek apakah `req.user.role === 'admin'` benar

## 🔄 Migration Checklist

- [ ] Jalankan migration SQL untuk add role column
- [ ] Set minimal 1 user sebagai admin
- [ ] Test login sebagai admin
- [ ] Test login sebagai user biasa
- [ ] Verify admin bisa lihat semua todos
- [ ] Verify user hanya lihat todos sendiri
- [ ] Test Admin Panel functionality

---

**Selamat!** Sistem RBAC sudah lengkap dan siap digunakan! 🎉

