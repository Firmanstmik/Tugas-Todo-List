

## 🎯 3 Langkah Setup

### 1️⃣ Setup Database (Sekali Saja)

```bash
mysql -u root -p 
```

✅ Database `mern` dan tabel `todos` sudah dibuat!

---

### 2️⃣ Jalankan Backend

Buka **Terminal 1**:

```bash
cd backend
npm install
npm run dev
```

**Tunggu sampai muncul:**
```
✅ Database connected successfully
🚀 Server running on http://localhost:5000
```

⚠️ **Jangan tutup terminal ini!**

---

### 3️⃣ Jalankan Frontend

Buka **Terminal 2** (terminal baru):

```bash
cd frontend
npm install
npm start
```

**Browser akan otomatis terbuka di:** http://localhost:3000

⚠️ **Jangan tutup terminal ini juga!**

---

## ✅ Selesai!

Aplikasi Todo List sudah berjalan! 🎉

---

## 🐛 Ada Masalah?

### Error: Database connection error
→ Pastikan MariaDB service berjalan  
→ Cek file `.env` di folder `backend` sudah ada

### Error: Port 5000 already in use
→ Tutup aplikasi lain yang pakai port 5000  
→ Atau ubah PORT di `.env`

### Error: npm install gagal
→ Cek koneksi internet  
→ Coba: `npm cache clean --force` lalu `npm install` lagi

---

## 📚 Butuh Panduan Lengkap?



