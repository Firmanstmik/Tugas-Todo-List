# 📚 Panduan Menambahkan Halaman Register dan Login (Versi Sederhana)

Panduan ini menjelaskan langkah-langkah untuk menambahkan fitur register dan login ke aplikasi Todo List MERN dengan versi yang sederhana dan mudah dipahami.

---

## 📋 Daftar Isi

1. [Persiapan Database](#1-persiapan-database)
2. [Setup Backend](#2-setup-backend)
3. [Setup Frontend](#3-setup-frontend)
4. [Testing](#4-testing)

---

## 1. Persiapan Database

### 1.1 Buat Tabel Users

Buat file migration SQL: `backend/migrations/create_users_table.sql`

```sql
-- Buat tabel users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tambahkan kolom user_id ke tabel todos
ALTER TABLE todos ADD COLUMN IF NOT EXISTS user_id INT;
ALTER TABLE todos ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Buat index untuk mempercepat query
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
```

### 1.2 Jalankan Migration

Jalankan SQL di atas di database MariaDB Anda.

---

## 2. Setup Backend

### 2.1 Install Dependencies

```bash
cd backend
npm install bcryptjs jsonwebtoken
```

### 2.2 Buat File Middleware Auth

Buat file: `backend/middleware/auth.js`

```javascript
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware untuk verifikasi JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded; // decoded berisi { id, username, email, role }
    next();
  });
};

// Middleware untuk cek apakah user adalah admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  
  next();
};

module.exports = { authenticateToken, requireAdmin };
```

### 2.3 Buat File Routes Auth

Buat file: `backend/routes/auth.js`

```javascript
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Register - Daftar user baru
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validasi input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Cek apakah user sudah ada
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user baru
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username.trim(), email.trim().toLowerCase(), hashedPassword]
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login - Masuk ke aplikasi
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Cari user berdasarkan email
    const users = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Verifikasi password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

module.exports = router;
```

### 2.4 Buat Routes Admin (Opsional - untuk fitur admin)

Buat file: `backend/routes/admin.js`

```javascript
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Semua routes admin memerlukan authentication dan admin role
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/users - Get semua users (hanya admin)
router.get('/users', async (req, res) => {
  try {
    const users = await pool.query(
      'SELECT id, username, email, role, created_at FROM users ORDER BY id DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/admin/todos - Get semua todos dari semua users (hanya admin)
router.get('/todos', async (req, res) => {
  try {
    const todos = await pool.query(`
      SELECT t.*, u.username as owner 
      FROM todos t 
      LEFT JOIN users u ON t.user_id = u.id 
      ORDER BY t.id DESC
    `);
    res.json(todos);
  } catch (error) {
    console.error('Error fetching all todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// GET /api/admin/stats - Get statistik aplikasi (hanya admin)
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalTodos = await pool.query('SELECT COUNT(*) as count FROM todos');
    const completedTodos = await pool.query('SELECT COUNT(*) as count FROM todos WHERE completed = true');
    
    res.json({
      users: Number(totalUsers[0]?.count || 0),
      todos: Number(totalTodos[0]?.count || 0),
      completed: Number(completedTodos[0]?.count || 0),
      pending: Number(totalTodos[0]?.count || 0) - Number(completedTodos[0]?.count || 0)
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
```

### 2.5 Update server.js

Tambahkan routes auth dan admin di `backend/server.js`:

```javascript
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// ... kode lainnya ...

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
```

### 2.6 Update Routes Todos

Update `backend/routes/todos.js` untuk filter berdasarkan user:

```javascript
const { authenticateToken } = require('../middleware/auth');

// Semua routes memerlukan authentication
router.use(authenticateToken);

// GET /api/todos - Get todos milik user yang login
router.get('/', async (req, res) => {
  try {
    const todos = await pool.query(
      'SELECT * FROM todos WHERE user_id = ? ORDER BY id DESC',
      [req.user.id]
    );
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// POST /api/todos - Create todo baru
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    const result = await pool.query(
      'INSERT INTO todos (title, completed, user_id) VALUES (?, ?, ?)',
      [title, false, req.user.id]
    );
    
    const newTodo = await pool.query('SELECT * FROM todos WHERE id = ?', [result.insertId]);
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
    
    // Pastikan todo milik user yang login
    const existingTodo = await pool.query(
      'SELECT * FROM todos WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!existingTodo || existingTodo.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await pool.query(
      'UPDATE todos SET title = ?, completed = ? WHERE id = ? AND user_id = ?',
      [title, completed, id, req.user.id]
    );

    const updatedTodo = await pool.query('SELECT * FROM todos WHERE id = ?', [id]);
    res.json(updatedTodo[0]);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// DELETE /api/todos/:id - Delete todo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Pastikan todo milik user yang login
    const existingTodo = await pool.query(
      'SELECT * FROM todos WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!existingTodo || existingTodo.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await pool.query('DELETE FROM todos WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});
```

---

## 3. Setup Frontend

### 3.1 Install Dependencies

```bash
cd frontend
npm install react-router-dom axios
```

### 3.2 Buat Auth Context

Buat file: `frontend/src/contexts/AuthContext.js`

```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Cek apakah user sudah login saat app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Decode token untuk mendapatkan user info (sederhana)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.id,
          username: payload.username,
          email: payload.email,
          role: payload.role
        });
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Register
  const register = async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

### 3.3 Update api.js

Update file: `frontend/src/api.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Tambahkan token ke header jika ada
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default api;
```

### 3.4 Buat Halaman Login

Buat file: `frontend/src/pages/Login.js`

```javascript
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Login</h1>
          <p>Masuk ke akun Anda</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Masukkan email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Masukkan password"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Belum punya akun? <Link to="/register">Daftar di sini</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
```

### 3.5 Buat Halaman Register

Buat file: `frontend/src/pages/Register.js`

```javascript
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(username, email, password);
    
    if (result.success) {
      alert('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Register</h1>
          <p>Buat akun baru</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              placeholder="Masukkan username"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Masukkan email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Minimal 6 karakter"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Loading...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Sudah punya akun? <Link to="/login">Login di sini</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
```

### 3.6 Buat CSS untuk Login dan Register

Buat file: `frontend/src/pages/Login.css`

```css
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%);
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h1 {
  font-size: 2rem;
  color: #0ea5e9;
  margin-bottom: 8px;
}

.auth-header p {
  color: #64748b;
  font-size: 0.95rem;
}

.auth-error {
  background: #fee2e2;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
}

.form-group input {
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #0ea5e9;
}

.auth-button {
  padding: 14px;
  background: linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  margin-top: 10px;
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 24px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.auth-footer p {
  color: #64748b;
  font-size: 0.9rem;
}

.auth-footer a {
  color: #0ea5e9;
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 480px) {
  .auth-card {
    padding: 30px 24px;
  }

  .auth-header h1 {
    font-size: 1.75rem;
  }
}
```

Buat file: `frontend/src/pages/Register.css`

```css
/* Import styles dari Login.css */
@import './Login.css';
```

### 3.7 Buat Protected Route

Buat file: `frontend/src/components/ProtectedRoute.js`

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
```

### 3.8 Buat Halaman Admin Panel (Opsional)

Buat file: `frontend/src/components/AdminPanel.js`

```javascript
import React, { useState, useEffect } from 'react';
import api from '../api';
import './AdminPanel.css';

function AdminPanel() {
  const [stats, setStats] = useState({ users: 0, todos: 0, completed: 0, pending: 0 });
  const [users, setUsers] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
    loadUsers();
    loadTodos();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadTodos = async () => {
    try {
      const response = await api.get('/admin/todos');
      setTodos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      
      {/* Statistics */}
      <div className="stats-section">
        <h3>Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.users}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.todos}</div>
            <div className="stat-label">Total Todos</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="users-section">
        <h3>All Users ({users.length})</h3>
        <div className="users-list">
          {users.length === 0 ? (
            <p>No users found</p>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* All Todos */}
      <div className="todos-section">
        <h3>All Todos ({todos.length})</h3>
        <div className="todos-list">
          {todos.length === 0 ? (
            <p>No todos found</p>
          ) : (
            <table className="todos-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Owner</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todos.map(todo => (
                  <tr key={todo.id} className={todo.completed ? 'completed' : ''}>
                    <td>{todo.id}</td>
                    <td>{todo.title}</td>
                    <td>{todo.owner || 'Unknown'}</td>
                    <td>{todo.completed ? '✓ Done' : 'Pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
```

Buat file: `frontend/src/components/AdminPanel.css`

```css
.admin-panel {
  padding: 24px;
  background: white;
  border-radius: 12px;
  margin-top: 24px;
}

.admin-panel h2 {
  color: #0ea5e9;
  margin-bottom: 24px;
}

.stats-section,
.users-section,
.todos-section {
  margin-bottom: 32px;
}

.stats-section h3,
.users-section h3,
.todos-section h3 {
  color: #1e293b;
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.users-table,
.todos-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.users-table th,
.todos-table th {
  background: #f1f5f9;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #1e293b;
}

.users-table td,
.todos-table td {
  padding: 12px;
  border-top: 1px solid #e2e8f0;
}

.users-table tr:hover,
.todos-table tr:hover {
  background: #f8fafc;
}

.todos-table tr.completed {
  opacity: 0.7;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.role-badge.admin {
  background: #fef3c7;
  color: #92400e;
}

.role-badge.user {
  background: #dbeafe;
  color: #1e40af;
}
```

### 3.9 Update App.js dengan Conditional Rendering

Update file: `frontend/src/App.js`

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import TodoApp from './components/TodoApp';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <TodoApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

### 3.10 Update TodoApp.js untuk Menampilkan Link Admin

Update `frontend/src/components/TodoApp.js` untuk menambahkan link ke admin panel:

```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import TodoForm from './TodoForm';
import TodoList from './TodoList';
import './TodoApp.css';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Load todos saat component mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/todos');
      setTodos(response.data);
    } catch (error) {
      console.error('Error loading todos:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (title) => {
    try {
      const response = await api.post('/todos', { title });
      setTodos([response.data, ...todos]);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleComplete = async (id, completed) => {
    try {
      const response = await api.put(`/todos/${id}`, { completed: !completed });
      setTodos(todos.map(todo => (todo.id === id ? response.data : todo)));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>Todo List App</h1>
          <div className="user-section">
            <p>Welcome, <strong>{user?.username}</strong>!</p>
            {isAdmin && (
              <Link to="/admin" className="admin-link">
                Admin Panel
              </Link>
            )}
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

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

export default TodoApp;
```

Update `frontend/src/components/TodoApp.css` untuk menambahkan style admin link:

```css
/* ... kode CSS sebelumnya ... */

.admin-link {
  padding: 8px 16px;
  background: #0ea5e9;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.3s;
}

.admin-link:hover {
  background: #0284c7;
}
```

### 3.9 Update TodoApp.js (Sederhana)

Update `frontend/src/components/TodoApp.js` untuk versi sederhana:

```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import TodoForm from './TodoForm';
import TodoList from './TodoList';
import './TodoApp.css';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Load todos saat component mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/todos');
      setTodos(response.data);
    } catch (error) {
      console.error('Error loading todos:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (title) => {
    try {
      const response = await api.post('/todos', { title });
      setTodos([response.data, ...todos]);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleComplete = async (id, completed) => {
    try {
      const response = await api.put(`/todos/${id}`, { completed: !completed });
      setTodos(todos.map(todo => (todo.id === id ? response.data : todo)));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>Todo List App</h1>
          <div className="user-section">
            <p>Welcome, <strong>{user?.username}</strong>!</p>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

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

export default TodoApp;
```

### 3.10 Update TodoApp.css (Sederhana)

Update `frontend/src/components/TodoApp.css` untuk versi sederhana:

```css
.App {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%);
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
}

.header h1 {
  font-size: 1.8rem;
  color: #0ea5e9;
  margin: 0;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-section p {
  margin: 0;
  color: #64748b;
}

.logout-btn {
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: #dc2626;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .user-section {
    width: 100%;
    justify-content: space-between;
  }
}
```

---

## 4. Testing

### 4.1 Test Register

1. Buka `http://localhost:3000/register`
2. Isi form: username, email, password
3. Klik "Register"
4. Seharusnya muncul pesan sukses dan redirect ke login

### 4.2 Test Login

1. Buka `http://localhost:3000/login`
2. Masukkan email dan password yang sudah didaftarkan
3. Klik "Login"
4. Seharusnya masuk ke halaman todo

### 4.3 Test Todo

1. Tambahkan todo baru
2. Pastikan todo hanya muncul untuk user yang login
3. Test toggle complete dan delete

### 4.4 Test Admin Panel

1. **Buat user admin di database:**
   ```sql
   UPDATE users SET role = 'admin' WHERE id = 1;
   ```
   (Ganti `id = 1` dengan ID user yang ingin dijadikan admin)

2. **Login sebagai admin:**
   - Login dengan email user yang sudah dijadikan admin
   - Seharusnya muncul link "Admin Panel" di header

3. **Akses Admin Panel:**
   - Klik "Admin Panel"
   - Seharusnya menampilkan:
     - Statistics (Total Users, Total Todos, Completed, Pending)
     - List semua users
     - List semua todos dari semua users

4. **Test sebagai User Biasa:**
   - Logout
   - Register user baru (otomatis role = 'user')
   - Login dengan user baru
   - Seharusnya TIDAK ada link "Admin Panel"
   - User hanya bisa lihat todos miliknya sendiri

---

## 📝 Catatan Penting

1. **JWT Secret**: Ganti `'your-secret-key'` dengan secret key yang aman di production
2. **Environment Variables**: Buat file `.env` di backend:
   ```
   JWT_SECRET=your-super-secret-key-here
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=12345
   DB_NAME=mern
   ```
3. **Password Hashing**: Menggunakan bcryptjs untuk keamanan
4. **Token Storage**: Token disimpan di localStorage (untuk production, pertimbangkan httpOnly cookies)

---

## 🎯 Fitur yang Sudah Ditambahkan

✅ Register user baru  
✅ Login dengan email & password  
✅ JWT Authentication  
✅ Protected routes  
✅ User-specific todos  
✅ Logout functionality  
✅ **Role-based access control (Admin & User)**  
✅ **Admin Panel dengan statistik dan manajemen data**  
✅ **Halaman berbeda untuk admin dan user**  

---

## 📚 Referensi

- [JWT Authentication](https://jwt.io/)
- [bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)
- [React Router](https://reactrouter.com/)

---

**Selamat!** Sekarang aplikasi Todo List Anda sudah memiliki sistem autentikasi yang lengkap! 🎉

