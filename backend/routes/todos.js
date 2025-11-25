const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/todos - Get all todos
router.get('/', async (req, res) => {
  console.log('📥 GET /api/todos - Request received');
  console.log('   Time:', new Date().toISOString());
  
  // Set headers first
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    console.log('🔍 Step 1: Testing database connection...');
    
    // Test database connection first
    let conn;
    try {
      conn = await pool.getConnection();
      console.log('✅ Database connection acquired');
      conn.release();
    } catch (connError) {
      console.error('❌ Cannot get database connection:', connError.message);
      console.error('   Error code:', connError.code);
      console.error('   Error stack:', connError.stack);
      return res.status(500).json({ 
        error: 'Database connection failed',
        details: connError.message,
        code: connError.code,
        suggestion: 'Check if MariaDB is running and credentials are correct in .env file',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('🔍 Step 2: Executing database query...');
    
    // Create timeout promise (8 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        console.error('⏱️ Query timeout after 8 seconds');
        reject(new Error('Database query timeout'));
      }, 8000);
    });
    
    // Execute query with timeout
    let rows;
    try {
      rows = await Promise.race([
        pool.query('SELECT * FROM todos ORDER BY id DESC'),
        timeoutPromise
      ]);
      console.log('✅ Query executed successfully');
    } catch (queryError) {
      console.error('❌ Query execution failed:', queryError.message);
      console.error('   Error code:', queryError.code);
      throw queryError;
    }
    
    // Ensure response is always an array
    const todos = Array.isArray(rows) ? rows : [];
    console.log('✅ Query successful. Found', todos.length, 'todos');
    
    // Log sample data if any
    if (todos.length > 0) {
      console.log('   Sample todo:', JSON.stringify(todos[0]));
    }
    
    res.json(todos);
  } catch (error) {
    console.error('❌ Error fetching todos:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    console.error('   Stack:', error.stack);
    
    // Provide more specific error messages
    let statusCode = 500;
    let errorResponse = {
      error: error.message || 'Failed to fetch todos',
      code: error.code,
      timestamp: new Date().toISOString()
    };
    
    if (error.message === 'Database query timeout') {
      errorResponse.error = 'Query timeout. Database might be slow or unresponsive.';
      errorResponse.suggestion = 'Check database performance and connection. Increase timeout if needed.';
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorResponse.error = 'Database access denied. Check credentials in .env file.';
      errorResponse.suggestion = 'Verify DB_USER and DB_PASS in backend/.env';
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      errorResponse.error = 'Database connection failed. Check if MariaDB is running.';
      errorResponse.suggestion = 'Start MariaDB service: net start MySQL (Windows) or systemctl start mariadb (Linux)';
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      errorResponse.error = 'Database not found. Check database name in .env file.';
      errorResponse.suggestion = 'Create database: CREATE DATABASE mern;';
    } else {
      errorResponse.suggestion = 'Check terminal server for detailed error logs';
    }
    
    res.status(statusCode).json(errorResponse);
  }
});

// POST /api/todos - Create a new todo
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;

    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await pool.query(
      'INSERT INTO todos (title, completed) VALUES (?, ?)',
      [title.trim(), false]
    );

    // Fetch the inserted todo
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

// PUT /api/todos/:id - Update a todo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    // Check if todo exists
    const existingTodo = await pool.query(
      'SELECT * FROM todos WHERE id = ?',
      [id]
    );

    if (existingTodo.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Build update query dynamically
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

    // Fetch updated todo
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

// DELETE /api/todos/:id - Delete a todo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if todo exists
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

