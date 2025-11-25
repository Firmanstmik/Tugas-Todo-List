/**
 * Basic integration test for todos API
 * Run with: npm test (requires supertest to be installed)
 * 
 * To install supertest: npm install --save-dev supertest jest
 */

const request = require('supertest');
const express = require('express');
const todosRoute = require('../routes/todos');
const pool = require('../db');

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/todos', todosRoute);

describe('Todos API', () => {
  // Clean up after tests
  afterAll(async () => {
    await pool.end();
  });

  test('GET /api/todos should return 200 and JSON', async () => {
    const response = await request(app)
      .get('/api/todos')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /api/todos should create a new todo', async () => {
    const newTodo = { title: 'Test Todo' };
    
    const response = await request(app)
      .post('/api/todos')
      .send(newTodo)
      .expect(201)
      .expect('Content-Type', /json/);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test Todo');
    expect(response.body.completed).toBe(false);
  });
});

