# Backend - MariaDB Todo App

Backend server for the Todo application built with Node.js, Express, and MariaDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials if needed.

4. Make sure MariaDB is running and the database is created (see root `init.sql`).

## Running

Development mode (with nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `.env`).

## API Endpoints

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo (body: `{ title: string }`)
- `PUT /api/todos/:id` - Update a todo (body: `{ title?: string, completed?: boolean }`)
- `DELETE /api/todos/:id` - Delete a todo

## Testing

You can test the API using curl:

```bash
# Get all todos
curl http://localhost:5000/api/todos

# Create a todo
curl -X POST -H "Content-Type: application/json" -d '{"title":"Test Todo"}' http://localhost:5000/api/todos

# Update a todo
curl -X PUT -H "Content-Type: application/json" -d '{"completed":true}' http://localhost:5000/api/todos/1

# Delete a todo
curl -X DELETE http://localhost:5000/api/todos/1
```

