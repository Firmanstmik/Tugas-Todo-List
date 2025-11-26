const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/users - Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    console.log('📥 GET /api/admin/users - Request received');
    
    const users = await pool.query(
      'SELECT id, username, email, role, created_at FROM users ORDER BY id DESC'
    );
    
    console.log(`✅ Fetched ${users.length} users for admin`);
    if (users.length > 0) {
      console.log('   Sample user:', JSON.stringify(users[0], null, 2));
    }
    
    res.json(Array.isArray(users) ? users : []);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch users', 
      details: error.message 
    });
  }
});

// GET /api/admin/stats - Get statistics (admin only)
router.get('/stats', async (req, res) => {
  try {
    console.log('📥 GET /api/admin/stats - Request received');
    
    console.log('🔍 Executing statistics queries...');
    
    const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('   Total Users Query Result:', totalUsers);
    
    const totalTodos = await pool.query('SELECT COUNT(*) as count FROM todos');
    console.log('   Total Todos Query Result:', totalTodos);
    
    const completedTodos = await pool.query('SELECT COUNT(*) as count FROM todos WHERE completed = true');
    console.log('   Completed Todos Query Result:', completedTodos);
    
    const usersByRole = await pool.query(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );
    console.log('   Users By Role Query Result:', usersByRole);

    // Convert BigInt to Number for JSON serialization
    const totalUsersCount = totalUsers && totalUsers[0] ? Number(totalUsers[0].count) : 0;
    const totalTodosCount = totalTodos && totalTodos[0] ? Number(totalTodos[0].count) : 0;
    const completedTodosCount = completedTodos && completedTodos[0] ? Number(completedTodos[0].count) : 0;
    
    // Process usersByRole to ensure count is a number
    const processedUsersByRole = Array.isArray(usersByRole) && usersByRole.length > 0
      ? usersByRole.map(item => ({
          role: item.role || 'user',
          count: Number(item.count || 0)
        }))
      : [];

    const stats = {
      users: {
        total: totalUsersCount,
        byRole: processedUsersByRole
      },
      todos: {
        total: totalTodosCount,
        completed: completedTodosCount,
        pending: totalTodosCount - completedTodosCount
      }
    };

    console.log('✅ Stats fetched successfully:');
    console.log('   Total Users:', totalUsersCount, '(type:', typeof totalUsersCount, ')');
    console.log('   Total Todos:', totalTodosCount, '(type:', typeof totalTodosCount, ')');
    console.log('   Completed Todos:', completedTodosCount, '(type:', typeof completedTodosCount, ')');
    console.log('   Pending Todos:', stats.todos.pending, '(type:', typeof stats.todos.pending, ')');
    console.log('   Users by Role:', JSON.stringify(processedUsersByRole, null, 2));
    console.log('   Final Stats Object:', JSON.stringify(stats, null, 2));
    
    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch statistics', 
      details: error.message 
    });
  }
});

// GET /api/admin/todos - Get all todos (admin only)
router.get('/todos', async (req, res) => {
  try {
    console.log('📥 GET /api/admin/todos - Request received');
    console.log('   User ID:', req.user.id);
    console.log('   User Role:', req.user.role);
    
    const todos = await pool.query(
      `SELECT t.*, u.username as owner_username 
       FROM todos t 
       LEFT JOIN users u ON t.user_id = u.id 
       ORDER BY t.id DESC`
    );
    
    console.log(`✅ Fetched ${todos.length} todos for admin`);
    if (todos.length > 0) {
      console.log('   Sample todo:', JSON.stringify(todos[0], null, 2));
    }
    
    res.json(Array.isArray(todos) ? todos : []);
  } catch (error) {
    console.error('❌ Error fetching todos:', error);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch todos', details: error.message });
  }
});

// PUT /api/admin/users/:id/role - Update user role (admin only)
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
    }

    // Prevent admin from removing their own admin role
    if (parseInt(id) === req.user.id && role === 'user') {
      return res.status(400).json({ error: 'Cannot remove your own admin role' });
    }

    const result = await pool.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [id]
    );

    res.json({
      message: 'User role updated successfully',
      user: updatedUser[0] || {}
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// POST /api/admin/users - Create new user (admin only)
router.post('/users', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const validRole = role && ['user', 'admin'].includes(role) ? role : 'user';

    // Check if user already exists
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

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username.trim(), email.trim().toLowerCase(), hashedPassword, validRole]
    );

    // Get created user
    const newUser = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: newUser[0] || {}
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/admin/users/:id - Update user (admin only)
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [id]
    );

    if (!existingUser || existingUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = [];
    const values = [];

    if (username !== undefined) {
      if (username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters long' });
      }
      updates.push('username = ?');
      values.push(username.trim());
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      // Check if email is already taken by another user
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email.trim().toLowerCase(), id]
      );
      if (emailCheck && emailCheck.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      updates.push('email = ?');
      values.push(email.trim().toLowerCase());
    }

    if (password !== undefined) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (role !== undefined) {
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
      }
      // Prevent admin from removing their own admin role
      if (parseInt(id) === req.user.id && role === 'user') {
        return res.status(400).json({ error: 'Cannot remove your own admin role' });
      }
      updates.push('role = ?');
      values.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const updatedUser = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [id]
    );

    res.json({
      message: 'User updated successfully',
      user: updatedUser[0] || {}
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/admin/users/:id - Delete user (admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;

