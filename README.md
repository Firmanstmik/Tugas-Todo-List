# MariaDB Todo App

A full-stack Todo application built with the MERN stack (MariaDB, Express, React, Node.js).

## Project Structure

```
.
├── backend/          # Node.js + Express backend
├── frontend/         # React frontend
├── init.sql          # Database initialization script
└── README.md         # This file
```

## Prerequisites

- Node.js (v14 or higher)
- MariaDB (or MySQL) server
- npm or yarn

## Database Setup

1. Make sure MariaDB is running on your system.

2. Create the database and table by running the initialization script:

```bash
mysql -u belajar -p < init.sql
```

Or if you're using root user:

```bash
mysql -u root -p < init.sql
```

**Note:** The default database credentials are:
- Host: `localhost`
- User: `belajar`
- Password: `belajar`
- Database: `mern`
- Port: `3306`

If you need to use different credentials, update the `.env` file in the backend folder.

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example` if available, or create manually):
```bash
DB_HOST=localhost
DB_USER=belajar
DB_PASS=belajar
DB_NAME=mern
DB_PORT=3306
PORT=5000
```

4. Start the backend server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will open in your browser at `http://localhost:3000`

## Running the Application

### Option 1: Manual Setup (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```

### Option 2: Docker Compose (Recommended for Production)

See the [Docker Setup](#docker-setup) section below.

## API Endpoints

The backend provides the following REST API endpoints:

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
  - Body: `{ "title": "Your todo title" }`
- `PUT /api/todos/:id` - Update a todo
  - Body: `{ "title": "Updated title" }` or `{ "completed": true }` or both
- `DELETE /api/todos/:id` - Delete a todo

### Testing API with curl

```bash
# Get all todos
curl http://localhost:5000/api/todos

# Create a todo
curl -X POST -H "Content-Type: application/json" -d '{"title":"Test Todo"}' http://localhost:5000/api/todos

# Update a todo (toggle completion)
curl -X PUT -H "Content-Type: application/json" -d '{"completed":true}' http://localhost:5000/api/todos/1

# Delete a todo
curl -X DELETE http://localhost:5000/api/todos/1
```

## Docker Setup

The project includes Docker support for easy deployment.

### Prerequisites for Docker

- Docker
- Docker Compose

### Running with Docker Compose

1. Make sure you're in the project root directory.

2. Start all services (MariaDB, Backend, Frontend):
```bash
docker-compose up -d
```

3. Initialize the database:
```bash
docker-compose exec mariadb mysql -u belajar -pbelajar < /docker-entrypoint-initdb.d/init.sql
```

Or manually:
```bash
docker-compose exec mariadb mysql -u belajar -pbelajar mern < init.sql
```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

5. Stop all services:
```bash
docker-compose down
```

### Docker Services

- **mariadb**: MariaDB database server
- **backend**: Node.js + Express API server
- **frontend**: React application (served via nginx)

## Troubleshooting

### Database Connection Issues

1. **Check if MariaDB is running:**
   ```bash
   # On Linux/Mac
   sudo systemctl status mariadb
   
   # On Windows
   # Check Services or use MySQL Workbench
   ```

2. **Verify database credentials:**
   - Check the `.env` file in the backend folder
   - Ensure the user `belajar` exists and has the correct password
   - Verify the database `mern` exists

3. **Create user if needed:**
   ```sql
   CREATE USER 'belajar'@'localhost' IDENTIFIED BY 'belajar';
   GRANT ALL PRIVILEGES ON mern.* TO 'belajar'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Port Already in Use

If port 5000 or 3000 is already in use:

1. **Backend:** Change `PORT` in `backend/.env`
2. **Frontend:** Update `baseURL` in `frontend/src/api.js` to match the new backend port

### CORS Errors

If you see CORS errors in the browser console, make sure:
- The backend is running on port 5000
- The frontend is running on port 3000
- CORS is enabled in `backend/server.js` (it should be by default)

## Features

- ✅ Create new todos
- ✅ View all todos
- ✅ Mark todos as completed
- ✅ Delete todos
- ✅ Real-time updates
- ✅ Clean, modern UI
- ✅ Responsive design

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MariaDB** - Relational database
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **React** - UI library
- **Axios** - HTTP client
- **CSS3** - Styling

## Development

### Code Quality

The project includes ESLint and Prettier configurations:

- **Backend:** `.eslintrc.json` and `.prettierrc` in `backend/`
- **Frontend:** ESLint is included with create-react-app

### Project Structure Details

**Backend:**
- `server.js` - Main server file
- `db.js` - Database connection pool
- `routes/todos.js` - Todo API routes
- `.env` - Environment variables (not in git)

**Frontend:**
- `src/App.js` - Main React component
- `src/api.js` - Axios API client
- `src/components/TodoForm.js` - Form to add todos
- `src/components/TodoList.js` - List of todos with actions

## License

This project is open source and available for educational purposes.

## Contributing

Feel free to submit issues and enhancement requests!

