const express = require('express');
const cors = require('cors');
const todosRoute = require('./routes/todos');
const authRoute = require('./routes/auth');
const adminRoute = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoute);
app.use('/api/todos', todosRoute);
app.use('/api/admin', adminRoute);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Todo List API Server',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      todos: {
        getAll: 'GET /api/todos',
        create: 'POST /api/todos',
        update: 'PUT /api/todos/:id',
        delete: 'DELETE /api/todos/:id'
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: {
      root: 'GET /',
      health: 'GET /health',
      todos: {
        getAll: 'GET /api/todos',
        create: 'POST /api/todos',
        update: 'PUT /api/todos/:id',
        delete: 'DELETE /api/todos/:id'
      }
    }
  });
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
