# 🎓 Panduan Lengkap: Membuat MariaDB Todo App dari Nol

Panduan ini akan mengajarkan Anda membuat aplikasi Todo List fullstack **dari awal** menggunakan MERN Stack. Ikuti setiap langkah dengan teliti!

---

## 📋 Daftar Isi

1. [Persiapan](#1-persiapan)
2. [Membuat Struktur Project](#2-membuat-struktur-project)
3. [Setup Database MariaDB](#3-setup-database-mariadb)
4. [Membuat Backend (Node.js + Express)](#4-membuat-backend-nodejs--express)
5. [Membuat Frontend (React)](#5-membuat-frontend-react)
6. [Menghubungkan Frontend ke Backend](#6-menghubungkan-frontend-ke-backend)
7. [Testing Aplikasi](#7-testing-aplikasi)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Persiapan

### Software yang Harus Diinstall

1. **Node.js** (versi 14 atau lebih tinggi)
   - Download: https://nodejs.org/
   - Install seperti biasa
   - Verifikasi: Buka Command Prompt, ketik `node --version`

2. **MariaDB** (atau MySQL)
   - Download: https://mariadb.org/download/
   - Atau gunakan XAMPP
   - Pastikan service berjalan

3. **Text Editor**
   - VS Code: https://code.visualstudio.com/
   - Atau editor lain

### Verifikasi Instalasi

Buka **Command Prompt** atau **PowerShell**, jalankan:

```bash
node --version    # Harus menampilkan versi (contoh: v18.17.0)
npm --version     # Harus menampilkan versi (contoh: 9.6.7)
```

✅ Jika kedua perintah menampilkan versi, Anda siap melanjutkan!

---

## 2. Membuat Struktur Project

### Langkah 1: Buat Folder Project

1. Buat folder baru dengan nama: `todo-app-mern`
2. Buka folder tersebut di VS Code atau text editor

### Langkah 2: Buat Struktur Folder

Di dalam folder `todo-app-mern`, buat 2 folder:
- `backend` (untuk server Node.js)
- `frontend` (untuk aplikasi React)

**Cara membuat:**
- Klik kanan → New Folder → `backend`
- Klik kanan → New Folder → `frontend`

**Struktur saat ini:**
```
todo-app-mern/
├── backend/
└── frontend/
```

✅ Struktur folder siap!

---

## 3. Setup Database MariaDB

### Langkah 1: Buat Database

1. Buka **HeidiSQL**, **phpMyAdmin**, atau **Command Line MariaDB**
2. Login dengan user `root` atau buat user baru

3. Jalankan perintah SQL berikut:

```sql
-- Buat database
CREATE DATABASE mern;

-- Pilih database
USE mern;

-- Buat tabel todos
CREATE TABLE todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Langkah 2: Buat User Database (Opsional)

Jika ingin membuat user khusus (disarankan):

```sql
-- Buat user
CREATE USER 'belajar'@'localhost' IDENTIFIED BY 'belajar';

-- Beri hak akses
GRANT ALL PRIVILEGES ON mern.* TO 'belajar'@'localhost';

-- Refresh privileges
FLUSH PRIVILEGES;
```

### Langkah 3: Insert Data Sample (Opsional)

```sql
INSERT INTO todos (title, completed) VALUES
    ('Belajar MERN Stack', FALSE),
    ('Buat aplikasi Todo', FALSE),
    ('Setup database MariaDB', TRUE);
```

### Langkah 4: Verifikasi

```sql
SELECT * FROM todos;
```

Harus menampilkan data yang sudah di-insert.

✅ **Database siap digunakan!**

---

## 4. Membuat Backend (Node.js + Express)

### Langkah 1: Inisialisasi Project Backend

1. Buka **Command Prompt** atau **PowerShell**
2. Masuk ke folder `backend`:

```bash
cd backend
```

3. Inisialisasi project Node.js:

```bash
npm init -y
```

File `package.json` akan dibuat otomatis.

### Langkah 2: Install Dependencies

Install package yang diperlukan:

```bash
npm install express cors mariadb dotenv
```

**Penjelasan package:**
- `express`: Framework web untuk Node.js
- `cors`: Untuk mengizinkan frontend mengakses API
- `mariadb`: Driver untuk koneksi ke MariaDB
- `dotenv`: Untuk membaca file .env

Install nodemon untuk development (auto-reload):

```bash
npm install --save-dev nodemon
```

### Langkah 3: Update package.json

Buka file `package.json`, tambahkan script:

```json
{
  "name": "todo-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "mariadb": "^3.2.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### Langkah 4: Buat File .env

Di folder `backend`, buat file baru dengan nama `.env`

**Isi file .env:**
```
DB_HOST=localhost
DB_USER=belajar
DB_PASS=belajar
DB_NAME=mern
DB_PORT=3306
PORT=5000
```

**Catatan:** Jika menggunakan user `root`, ubah `DB_USER=root` dan `DB_PASS` sesuai password root Anda.

### Langkah 5: Buat File db.js

Di folder `backend`, buat file baru: `db.js`

**Isi file db.js:**
```javascript
const mariadb = require('mariadb');
require('dotenv').config();

// Buat connection pool
const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'belajar',
  password: process.env.DB_PASS || 'belajar',
  database: process.env.DB_NAME || 'mern',
  port: process.env.DB_PORT || 3306,
  connectionLimit: 5,
});

// Test koneksi
pool.getConnection()
  .then(conn => {
    console.log('✅ Database connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
  });

module.exports = pool;
```

**Penjelasan:**
- `createPool`: Membuat pool koneksi ke database
- `process.env`: Membaca nilai dari file .env
- `getConnection`: Test apakah koneksi berhasil

### Langkah 6: Buat Folder routes

Di folder `backend`, buat folder baru: `routes`

### Langkah 7: Buat File routes/todos.js

Di folder `routes`, buat file: `todos.js`

**Isi file routes/todos.js:**
```javascript
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/todos - Ambil semua todos
router.get('/', async (req, res) => {
  try {
    const rows = await pool.query('SELECT * FROM todos ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// POST /api/todos - Tambah todo baru
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;

    // Validasi
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await pool.query(
      'INSERT INTO todos (title, completed) VALUES (?, ?)',
      [title.trim(), false]
    );

    // Ambil todo yang baru dibuat
    const newTodo = await pool.query(
      'SELECT * FROM todos WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newTodo[0]);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// PUT /api/todos/:id - Update todo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    // Cek apakah todo ada
    const existingTodo = await pool.query(
      'SELECT * FROM todos WHERE id = ?',
      [id]
    );

    if (existingTodo.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Build query update
    const updates = [];
    const values = [];

    if (title !== undefined) {
      if (title.trim() === '') {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      updates.push('title = ?');
      values.push(title.trim());
    }

    if (completed !== undefined) {
      updates.push('completed = ?');
      values.push(completed);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    await pool.query(
      `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Ambil todo yang sudah diupdate
    const updatedTodo = await pool.query(
      'SELECT * FROM todos WHERE id = ?',
      [id]
    );

    res.json(updatedTodo[0]);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// DELETE /api/todos/:id - Hapus todo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah todo ada
    const existingTodo = await pool.query(
      'SELECT * FROM todos WHERE id = ?',
      [id]
    );

    if (existingTodo.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await pool.query('DELETE FROM todos WHERE id = ?', [id]);

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

module.exports = router;
```

**Penjelasan:**
- `router.get('/')`: Endpoint untuk mengambil semua todos
- `router.post('/')`: Endpoint untuk menambah todo baru
- `router.put('/:id')`: Endpoint untuk update todo (id dari URL parameter)
- `router.delete('/:id')`: Endpoint untuk hapus todo
- `pool.query()`: Menjalankan query SQL
- `async/await`: Untuk menangani operasi asynchronous

### Langkah 8: Buat File server.js

Di folder `backend`, buat file: `server.js`

**Isi file server.js:**
```javascript
const express = require('express');
const cors = require('cors');
const todosRoute = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // URL frontend
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/todos', todosRoute);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
```

**Penjelasan:**
- `express()`: Membuat aplikasi Express
- `cors()`: Mengizinkan frontend mengakses API
- `app.use('/api/todos', todosRoute)`: Mount routes di path `/api/todos`
- `app.listen()`: Menjalankan server di port tertentu

### Langkah 9: Test Backend

1. Buka **Command Prompt** di folder `backend`
2. Jalankan:

```bash
npm run dev
```

**Output yang diharapkan:**
```
✅ Database connected successfully
🚀 Server running on http://localhost:5000
```

3. Test endpoint dengan browser atau curl:
   - Buka: http://localhost:5000/health
   - Harus menampilkan: `{"status":"OK","message":"Server is running"}`

4. Test API todos:
   - Buka: http://localhost:5000/api/todos
   - Harus menampilkan array todos (JSON)

✅ **Backend selesai!**

**Struktur backend saat ini:**
```
backend/
├── .env
├── db.js
├── package.json
├── routes/
│   └── todos.js
└── server.js
```

---

## 5. Membuat Frontend (React)

### Langkah 1: Buat React App

1. Buka **Command Prompt** atau **PowerShell**
2. Masuk ke folder `frontend`:

```bash
cd frontend
```

3. Buat React app menggunakan create-react-app:

```bash
npx create-react-app . --yes
```

**Catatan:** Tanda titik (`.`) berarti membuat di folder saat ini.

**Tunggu sampai selesai** (biasanya 2-3 menit).

### Langkah 2: Install Axios

Axios digunakan untuk HTTP request ke backend:

```bash
npm install axios
```

### Langkah 3: Buat File src/api.js

Di folder `src`, buat file baru: `api.js`

**Isi file src/api.js:**
```javascript
import axios from 'axios';

// Konfigurasi axios dengan base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export default api;
```

**Penjelasan:**
- `axios.create()`: Membuat instance axios dengan konfigurasi default
- `baseURL`: URL dasar untuk semua request
- Semua request akan otomatis menggunakan URL ini

### Langkah 4: Buat Folder src/components

Di folder `src`, buat folder: `components`

### Langkah 5: Buat File src/components/TodoForm.js

Di folder `components`, buat file: `TodoForm.js`

**Isi file src/components/TodoForm.js:**
```javascript
import React, { useState } from 'react';
import './TodoForm.css';

export default function TodoForm({ addTodo }) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addTodo(title);
      setTitle(''); // Clear input setelah berhasil
    } catch (error) {
      console.error('Error submitting todo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="todo-input"
        placeholder="Add todo..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isSubmitting}
      />
      <button
        type="submit"
        className="add-button"
        disabled={isSubmitting || !title.trim()}
      >
        Add
      </button>
    </form>
  );
}
```

**Penjelasan:**
- `useState`: Hook untuk state management
- `handleSubmit`: Fungsi yang dipanggil saat form di-submit
- `addTodo`: Function yang diterima dari parent component (App.js)
- `disabled`: Menonaktifkan input saat sedang submit

### Langkah 6: Buat File src/components/TodoForm.css

Di folder `components`, buat file: `TodoForm.css`

**Isi file src/components/TodoForm.css:**
```css
.todo-form {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.todo-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.todo-input:focus {
  border-color: #4a90e2;
}

.todo-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.add-button {
  padding: 12px 24px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-button:hover:not(:disabled) {
  background-color: #357abd;
}

.add-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
```

### Langkah 7: Buat File src/components/TodoList.js

Di folder `components`, buat file: `TodoList.js`

**Isi file src/components/TodoList.js:**
```javascript
import React from 'react';
import './TodoList.css';

export default function TodoList({ todos, toggleComplete, deleteTodo }) {
  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <p>No todos yet. Add one above!</p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className={`todo-item ${todo.completed ? 'completed' : ''}`}
        >
          <span className="todo-title">{todo.title}</span>
          <div className="todo-actions">
            <button
              className="done-button"
              onClick={() => toggleComplete(todo.id, todo.completed)}
            >
              Done
            </button>
            <button
              className="delete-button"
              onClick={() => deleteTodo(todo.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Penjelasan:**
- `todos.map()`: Loop untuk menampilkan setiap todo
- `key={todo.id}`: Unique key untuk React
- `todo.completed ? 'completed' : ''`: Conditional class untuk styling
- `onClick`: Event handler untuk tombol

### Langkah 8: Buat File src/components/TodoList.css

Di folder `components`, buat file: `TodoList.css`

**Isi file src/components/TodoList.css:**
```css
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  transition: all 0.2s;
}

.todo-item:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.todo-item.completed {
  background-color: #e8f5e9;
  opacity: 0.8;
}

.todo-title {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.todo-item.completed .todo-title {
  text-decoration: line-through;
  color: #666;
}

.todo-actions {
  display: flex;
  gap: 8px;
}

.done-button,
.delete-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.done-button {
  background-color: #4caf50;
  color: white;
}

.done-button:hover {
  background-color: #45a049;
}

.delete-button {
  background-color: #f44336;
  color: white;
}

.delete-button:hover {
  background-color: #da190b;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
}
```

### Langkah 9: Update File src/App.js

Buka file `src/App.js`, ganti seluruh isinya dengan:

```javascript
import React, { useState, useEffect } from 'react';
import './App.css';
import api from './api';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load todos dari API
  const loadTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/todos');
      setTodos(response.data);
    } catch (err) {
      console.error('Error loading todos:', err);
      setError('Failed to load todos. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Load todos saat component mount
  useEffect(() => {
    loadTodos();
  }, []);

  // Tambah todo baru
  const addTodo = async (title) => {
    try {
      const response = await api.post('/todos', { title });
      setTodos([response.data, ...todos]);
    } catch (err) {
      console.error('Error adding todo:', err);
      setError('Failed to add todo');
    }
  };

  // Toggle status completed
  const toggleComplete = async (id, completed) => {
    try {
      const response = await api.put(`/todos/${id}`, { completed: !completed });
      setTodos(todos.map(todo => (todo.id === id ? response.data : todo)));
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Failed to update todo');
    }
  };

  // Hapus todo
  const deleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete todo');
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1 className="app-title">MariaDB Todo App</h1>
        
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <TodoForm addTodo={addTodo} />
        
        {loading ? (
          <div className="loading">Loading todos...</div>
        ) : (
          <TodoList
            todos={todos}
            toggleComplete={toggleComplete}
            deleteTodo={deleteTodo}
          />
        )}
      </div>
    </div>
  );
}

export default App;
```

**Penjelasan:**
- `useState`: State untuk todos, loading, dan error
- `useEffect`: Load todos saat component pertama kali render
- `loadTodos()`: Fetch todos dari API
- `addTodo()`: Tambah todo baru via API
- `toggleComplete()`: Update status completed
- `deleteTodo()`: Hapus todo via API
- `api.get/post/put/delete`: HTTP requests menggunakan axios

### Langkah 10: Update File src/App.css

Buka file `src/App.css`, ganti dengan:

```css
.App {
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.app-title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 2rem;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-message button {
  background: none;
  border: none;
  color: #c33;
  font-size: 20px;
  cursor: pointer;
  padding: 0 8px;
}

.error-message button:hover {
  opacity: 0.7;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}
```

### Langkah 11: Update File src/index.css

Buka file `src/index.css`, ganti dengan:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```

✅ **Frontend selesai!**

**Struktur frontend saat ini:**
```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── api.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   ├── index.css
│   └── components/
│       ├── TodoForm.js
│       ├── TodoForm.css
│       ├── TodoList.js
│       └── TodoList.css
└── package.json
```

---

## 6. Menghubungkan Frontend ke Backend

### Langkah 1: Pastikan Backend Berjalan

1. Buka **Terminal 1**
2. Masuk ke folder `backend`
3. Jalankan:

```bash
npm run dev
```

Pastikan muncul:
```
✅ Database connected successfully
🚀 Server running on http://localhost:5000
```

### Langkah 2: Jalankan Frontend

1. Buka **Terminal 2** (terminal baru)
2. Masuk ke folder `frontend`
3. Jalankan:

```bash
npm start
```

Browser akan otomatis terbuka di `http://localhost:3000`

✅ **Aplikasi sudah terhubung!**

---

## 7. Testing Aplikasi

### Test Fitur CRUD

#### 1. **Create (Tambah Todo)**
- Ketik di input: `"Belajar React"`
- Klik tombol **"Add"**
- Todo baru muncul di list

#### 2. **Read (Lihat Todos)**
- Semua todos ditampilkan otomatis
- Todo yang completed memiliki background hijau dan teks dicoret

#### 3. **Update (Mark as Done)**
- Klik tombol **"Done"** pada todo
- Todo berubah menjadi completed (background hijau, teks dicoret)

#### 4. **Delete (Hapus Todo)**
- Klik tombol **"Delete"** pada todo
- Todo langsung terhapus dari list

### Test dengan Browser DevTools

1. Buka **Developer Tools** (F12)
2. Tab **Network**
3. Lakukan aksi (tambah, update, delete)
4. Lihat request HTTP yang dikirim ke backend

### Test dengan curl (Opsional)

Buka terminal baru:

```bash
# GET todos
curl http://localhost:5000/api/todos

# POST todo
curl -X POST -H "Content-Type: application/json" -d "{\"title\":\"Test\"}" http://localhost:5000/api/todos

# PUT update
curl -X PUT -H "Content-Type: application/json" -d "{\"completed\":true}" http://localhost:5000/api/todos/1

# DELETE
curl -X DELETE http://localhost:5000/api/todos/1
```

---

## 8. Troubleshooting

### Masalah: Database Connection Error

**Error:**
```
❌ Database connection error
```

**Solusi:**
1. Pastikan MariaDB service berjalan
2. Cek file `.env` di folder `backend` sudah benar
3. Test koneksi manual: `mysql -u belajar -p`
4. Pastikan database `mern` sudah dibuat

### Masalah: CORS Error

**Error:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solusi:**
1. Pastikan di `backend/server.js` ada:
   ```javascript
   app.use(cors({
     origin: 'http://localhost:3000',
   }));
   ```
2. Restart backend server

### Masalah: Cannot Find Module

**Error:**
```
Cannot find module 'express'
```

**Solusi:**
1. Pastikan di folder yang benar (`backend` atau `frontend`)
2. Jalankan: `npm install`

### Masalah: Port Already in Use

**Error:**
```
Port 5000 is already in use
```

**Solusi:**
1. Tutup aplikasi lain yang menggunakan port 5000
2. Atau ubah PORT di `.env` menjadi port lain

---

## ✅ Checklist Akhir

Pastikan semua sudah dilakukan:

### Database
- [ ] Database `mern` sudah dibuat
- [ ] Tabel `todos` sudah dibuat
- [ ] User `belajar` sudah dibuat (atau gunakan root)

### Backend
- [ ] `npm install` sudah dijalankan
- [ ] File `.env` sudah dibuat
- [ ] File `db.js` sudah dibuat
- [ ] File `server.js` sudah dibuat
- [ ] File `routes/todos.js` sudah dibuat
- [ ] `npm run dev` berhasil (tidak ada error)

### Frontend
- [ ] `create-react-app` sudah dijalankan
- [ ] `npm install axios` sudah dijalankan
- [ ] File `api.js` sudah dibuat
- [ ] File `TodoForm.js` sudah dibuat
- [ ] File `TodoList.js` sudah dibuat
- [ ] File `App.js` sudah diupdate
- [ ] `npm start` berhasil

### Testing
- [ ] Backend running di port 5000
- [ ] Frontend running di port 3000
- [ ] Bisa tambah todo
- [ ] Bisa lihat todos
- [ ] Bisa mark as done
- [ ] Bisa delete todo

---

## 🎓 Penjelasan Konsep

### Arsitektur Aplikasi

```
┌─────────────┐
│  Frontend   │  ← React App (Port 3000)
│   (React)   │
└──────┬──────┘
       │ HTTP Request (axios)
       │
       ▼
┌─────────────┐
│   Backend   │  ← Express Server (Port 5000)
│  (Express)  │
└──────┬──────┘
       │ SQL Query
       │
       ▼
┌─────────────┐
│  MariaDB    │  ← Database
│  Database   │
└─────────────┘
```

### Flow Data

1. **User input** di form → Frontend
2. **Frontend** kirim HTTP request → Backend
3. **Backend** eksekusi SQL query → Database
4. **Database** return data → Backend
5. **Backend** return JSON → Frontend
6. **Frontend** update UI → User melihat perubahan

### CRUD Operations

- **Create:** `POST /api/todos` → Insert ke database
- **Read:** `GET /api/todos` → Select dari database
- **Update:** `PUT /api/todos/:id` → Update di database
- **Delete:** `DELETE /api/todos/:id` → Delete dari database

---

## 🎉 Selamat!

Anda sudah berhasil membuat aplikasi Todo List fullstack dari nol!

**Yang sudah dipelajari:**
- ✅ Setup database MariaDB
- ✅ Membuat REST API dengan Express
- ✅ Membuat React application
- ✅ Menghubungkan frontend dan backend
- ✅ Implementasi CRUD operations
- ✅ State management di React
- ✅ HTTP requests dengan axios

**Langkah selanjutnya:**
- Tambahkan fitur edit todo
- Tambahkan fitur filter (all, active, completed)
- Tambahkan fitur search
- Deploy ke production (Heroku, Vercel, dll)

---

**Happy Coding! 🚀**

