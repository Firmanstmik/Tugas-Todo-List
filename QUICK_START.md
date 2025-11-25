# 🚀 Quick Start Guide - MariaDB Todo App

## ✅ Step 1: Database (SUDAH SELESAI!)
Database `mern` sudah dibuat dan data sample sudah ada. Lanjut ke step berikutnya!

---

## 📦 Step 2: Setup Backend

### 2.1 Install Dependencies
Buka **Terminal/PowerShell baru** dan jalankan:

```bash
cd backend
npm install
```

Tunggu sampai selesai (biasanya 1-2 menit).

### 2.2 Buat File .env
Buat file `.env` di folder `backend` dengan isi:

```env
DB_HOST=localhost
DB_USER=belajar
DB_PASS=belajar
DB_NAME=mern
DB_PORT=3306
PORT=5000
```

**Cara membuat file .env:**
- **Windows:** Buka Notepad, paste isi di atas, save as `.env` (pastikan "Save as type" = "All Files")
- **Atau via PowerShell:**
  ```powershell
  cd backend
  @"
  DB_HOST=localhost
  DB_USER=belajar
  DB_PASS=belajar
  DB_NAME=mern
  DB_PORT=3306
  PORT=5000
  "@ | Out-File -FilePath .env -Encoding utf8
  ```

### 2.3 Jalankan Backend
```bash
npm run dev
```

**Output yang diharapkan:**
```
✅ Database connected successfully
🚀 Server running on http://localhost:5000
```

**Biarkan terminal ini terbuka!** Jangan tutup.

---

## 🎨 Step 3: Setup Frontend

### 3.1 Install Dependencies
Buka **Terminal/PowerShell BARU** (jangan tutup yang backend) dan jalankan:

```bash
cd frontend
npm install
```

Tunggu sampai selesai (biasanya 2-3 menit untuk pertama kali).

### 3.2 Jalankan Frontend
```bash
npm start
```

**Output yang diharapkan:**
- Browser akan otomatis terbuka di `http://localhost:3000`
- Atau buka manual: http://localhost:3000

---

## ✅ Step 4: Test Aplikasi

1. **Buka browser** di `http://localhost:3000`
2. **Anda akan melihat:**
   - Judul "MariaDB Todo App"
   - Input field "Add todo..."
   - Tombol "Add"
   - 3 todo sample yang sudah ada dari database

3. **Test fitur:**
   - ✅ **Tambah todo:** Ketik di input, klik "Add"
   - ✅ **Mark as Done:** Klik tombol "Done" pada todo
   - ✅ **Delete:** Klik tombol "Delete" pada todo

---

## 🐛 Troubleshooting

### Backend tidak bisa connect ke database
**Error:** `❌ Database connection error`

**Solusi:**
1. Pastikan MariaDB service berjalan
2. Cek file `.env` di folder `backend` sudah benar
3. Pastikan user `belajar` dengan password `belajar` ada
4. Test koneksi manual:
   ```bash
   mysql -u belajar -p
   # Masukkan password: belajar
   ```

### Port 5000 sudah digunakan
**Error:** `Port 5000 is already in use`

**Solusi:**
1. Tutup aplikasi lain yang menggunakan port 5000
2. Atau ubah PORT di `.env` menjadi `5001` atau port lain
3. Jangan lupa update `frontend/src/api.js` jika port berubah

### Frontend tidak bisa connect ke backend
**Error:** `Failed to load todos` atau CORS error

**Solusi:**
1. Pastikan backend sudah running di terminal
2. Pastikan backend running di `http://localhost:5000`
3. Cek file `frontend/src/api.js` baseURL sudah benar

### npm install error
**Error:** Permission denied atau network error

**Solusi:**
1. Pastikan Node.js sudah terinstall: `node --version`
2. Update npm: `npm install -g npm@latest`
3. Clear cache: `npm cache clean --force`
4. Coba lagi: `npm install`

---

## 📋 Checklist

- [x] Database `mern` sudah dibuat
- [x] Tabel `todos` sudah ada
- [ ] Backend dependencies terinstall (`npm install` di folder backend)
- [ ] File `.env` sudah dibuat di folder backend
- [ ] Backend running di `http://localhost:5000`
- [ ] Frontend dependencies terinstall (`npm install` di folder frontend)
- [ ] Frontend running di `http://localhost:3000`
- [ ] Aplikasi bisa menampilkan todos
- [ ] Aplikasi bisa menambah todo baru
- [ ] Aplikasi bisa mark todo as done
- [ ] Aplikasi bisa delete todo

---

## 🎯 Next Steps Setelah Aplikasi Running

1. **Test semua fitur CRUD:**
   - Create (tambah todo)
   - Read (lihat list todos)
   - Update (mark as done)
   - Delete (hapus todo)

2. **Cek di database:**
   ```sql
   mysql -u belajar -p
   USE mern;
   SELECT * FROM todos;
   ```
   Data yang ditambah dari aplikasi akan muncul di sini!

3. **Explore kode:**
   - Backend: `backend/routes/todos.js` - API endpoints
   - Frontend: `frontend/src/App.js` - Main component
   - Frontend: `frontend/src/components/` - UI components

---

## 💡 Tips

- **Jalankan backend dan frontend di terminal terpisah** agar mudah melihat log
- **Jangan tutup terminal** saat aplikasi running
- **Refresh browser** jika ada perubahan di frontend
- **Backend auto-reload** dengan nodemon (tidak perlu restart manual)

---

**Selamat! Aplikasi Todo Anda sudah siap digunakan! 🎉**

