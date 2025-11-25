# ✅ Verifikasi Arsitektur Backend

## Arsitektur Sesuai Gambar

Backend sudah **100% mengimplementasikan** arsitektur yang ditunjukkan dalam diagram:

```
┌─────────────────────────┐
│   MariaDB Database      │  ← Menyimpan data todos dalam tabel 'todos'
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Node.js + Express     │  ← Server yang menjalankan API endpoints
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   API Routes            │  ← routes/todos.js dengan operasi CRUD
│   (routes/todos.js)     │
└─────────────────────────┘
```

---

## ✅ Komponen 1: MariaDB Database

**File:** `backend/db.js`

**Fungsi:**
- ✅ Membuat connection pool ke MariaDB
- ✅ Menyimpan data todos dalam tabel `todos`
- ✅ Database: `mern`
- ✅ Tabel: `todos` dengan kolom: `id`, `title`, `completed`

**Kode:**
```javascript
const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'belajar',
  password: process.env.DB_PASS || 'belajar',
  database: process.env.DB_NAME || 'mern',  // ✅ Database mern
  port: process.env.DB_PORT || 3306,
  connectionLimit: 5,
});
```

**Status:** ✅ **SESUAI**

---

## ✅ Komponen 2: Node.js + Express

**File:** `backend/server.js`

**Fungsi:**
- ✅ Server yang menjalankan API endpoints
- ✅ Menggunakan Express framework
- ✅ Menjalankan di port 5000
- ✅ CORS enabled untuk frontend
- ✅ JSON parsing middleware

**Kode:**
```javascript
const express = require('express');
const cors = require('cors');
const todosRoute = require('./routes/todos');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/todos', todosRoute);  // ✅ Mount routes

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

**Status:** ✅ **SESUAI**

---

## ✅ Komponen 3: API Routes (routes/todos.js)

**File:** `backend/routes/todos.js`

**Fungsi:**
- ✅ Operasi CRUD lengkap untuk todos
- ✅ GET - Read semua todos
- ✅ POST - Create todo baru
- ✅ PUT - Update todo
- ✅ DELETE - Delete todo

**Endpoints yang diimplementasikan:**

### 1. GET /api/todos
```javascript
router.get('/', async (req, res) => {
  const rows = await pool.query('SELECT * FROM todos ORDER BY id DESC');
  res.json(rows);
});
```
✅ **READ** - Menampilkan daftar todos

### 2. POST /api/todos
```javascript
router.post('/', async (req, res) => {
  const result = await pool.query(
    'INSERT INTO todos (title, completed) VALUES (?, ?)',
    [title.trim(), false]
  );
  res.status(201).json(newTodo[0]);
});
```
✅ **CREATE** - Menambahkan todo baru

### 3. PUT /api/todos/:id
```javascript
router.put('/:id', async (req, res) => {
  await pool.query(
    `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  res.json(updatedTodo[0]);
});
```
✅ **UPDATE** - Mengupdate todo (title atau completed)

### 4. DELETE /api/todos/:id
```javascript
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM todos WHERE id = ?', [id]);
  res.json({ message: 'Todo deleted successfully' });
});
```
✅ **DELETE** - Menghapus todo

**Status:** ✅ **SESUAI** - Semua operasi CRUD sudah diimplementasikan

---

## 📋 Struktur File Backend

```
backend/
├── db.js              ✅ Koneksi ke MariaDB Database
├── server.js          ✅ Node.js + Express Server
├── routes/
│   └── todos.js       ✅ API Routes dengan operasi CRUD
├── package.json       ✅ Dependencies (express, mariadb, cors)
└── .env               ✅ Konfigurasi database
```

---

## ✅ Kesimpulan

**Backend sudah 100% sesuai dengan arsitektur yang ditunjukkan:**

| Komponen | Status | File | Fungsi |
|----------|--------|------|--------|
| **MariaDB Database** | ✅ | `db.js` | Menyimpan data todos dalam tabel 'todos' |
| **Node.js + Express** | ✅ | `server.js` | Server yang menjalankan API endpoints |
| **API Routes** | ✅ | `routes/todos.js` | Operasi CRUD untuk todos |

**Semua komponen sudah terhubung dengan benar:**
- ✅ `server.js` menggunakan `routes/todos.js`
- ✅ `routes/todos.js` menggunakan `db.js` (connection pool)
- ✅ `db.js` terhubung ke MariaDB database `mern`
- ✅ Semua operasi CRUD sudah diimplementasikan

---

## 🧪 Testing

Untuk memverifikasi, test endpoint berikut:

```bash
# GET - Read todos
curl http://localhost:5000/api/todos

# POST - Create todo
curl -X POST -H "Content-Type: application/json" \
  -d '{"title":"Test Todo"}' \
  http://localhost:5000/api/todos

# PUT - Update todo
curl -X PUT -H "Content-Type: application/json" \
  -d '{"completed":true}' \
  http://localhost:5000/api/todos/1

# DELETE - Delete todo
curl -X DELETE http://localhost:5000/api/todos/1
```

Semua endpoint harus mengembalikan response yang sesuai! ✅

