import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './TodoApp.css';
import AnalogClock from './AnalogClock';
import TodoForm from './TodoForm';
import TodoList from './TodoList';
import EditTodoModal from './EditTodoModal';
import ToastContainer from './ToastContainer';
import AdminPanel from './AdminPanel';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../contexts/AuthContext';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingTodo, setEditingTodo] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toasts, showToast, removeToast } = useToast();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Load todos from API
  const loadTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/todos');
      setTodos(response.data);
    } catch (err) {
      console.error('Error loading todos:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError('Failed to load todos. Make sure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load todos on component mount
  useEffect(() => {
    loadTodos();
  }, []);

  // Add a new todo
  const addTodo = async (title) => {
    try {
      const response = await api.post('/todos', { title });
      setTodos([response.data, ...todos]);
      showToast(`🎉 Todo "${title}" berhasil ditambahkan!`, 'success');
    } catch (err) {
      console.error('Error adding todo:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError('Failed to add todo');
        showToast('❌ Gagal menambahkan todo. Silakan coba lagi!', 'error');
      }
    }
  };

  // Toggle todo completion status
  const toggleComplete = async (id, completed) => {
    try {
      const todo = todos.find(t => t.id === id);
      const response = await api.put(`/todos/${id}`, { completed: !completed });
      setTodos(todos.map(todo => (todo.id === id ? response.data : todo)));
      
      if (!completed) {
        showToast(`🎉 Yeay! Todo "${todo.title}" selesai!`, 'success');
      } else {
        showToast(`📝 Todo "${todo.title}" dikembalikan ke pending.`, 'info');
      }
    } catch (err) {
      console.error('Error updating todo:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError('Failed to update todo');
        showToast('❌ Gagal mengupdate todo. Silakan coba lagi!', 'error');
      }
    }
  };

  // Delete a todo
  const deleteTodo = async (id) => {
    try {
      const todo = todos.find(t => t.id === id);
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
      showToast(`🗑️ Todo "${todo.title}" berhasil dihapus!`, 'success');
    } catch (err) {
      console.error('Error deleting todo:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError('Failed to delete todo');
        showToast('❌ Gagal menghapus todo. Silakan coba lagi!', 'error');
      }
    }
  };

  // Edit a todo (admin only)
  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (id, updatedData) => {
    try {
      const todo = todos.find(t => t.id === id);
      const response = await api.put(`/todos/${id}`, updatedData);
      setTodos(todos.map(todo => (todo.id === id ? response.data : todo)));
      
      const statusText = updatedData.completed ? 'diselesaikan' : 'diupdate';
      showToast(`✨ Todo "${todo?.title || 'Unknown'}" berhasil ${statusText}!`, 'success');
      
      setIsEditModalOpen(false);
      setEditingTodo(null);
    } catch (err) {
      console.error('Error updating todo:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError('Failed to update todo');
        showToast('❌ Gagal mengupdate todo. Silakan coba lagi!', 'error');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="App">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="container">
        <div className="app-header">
          <AnalogClock />
          <div className="header-content">
            <h1 className="app-title">MariaDB Todo App</h1>
            {user && (
              <>
                <div className="user-info">
                  Welcome, <strong>{user.username}</strong>!
                  {isAdmin && (
                    <span className="role-badge admin">Admin</span>
                  )}
                  {!isAdmin && (
                    <span className="role-badge user">User</span>
                  )}
                </div>
                <button className="logout-button" onClick={handleLogout}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
        
        {isAdmin && <AdminPanel />}
        
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <TodoForm addTodo={addTodo} />
        
        {/* Only show TodoList for non-admin users, admin can see todos in AdminPanel */}
        {!isAdmin && (
          <>
            {loading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading todos...</p>
              </div>
            ) : (
              <TodoList
                todos={todos}
                toggleComplete={toggleComplete}
                deleteTodo={deleteTodo}
                onEdit={null}
              />
            )}
          </>
        )}

        {isAdmin && (
          <EditTodoModal
            todo={editingTodo}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingTodo(null);
            }}
            onSave={handleSaveEdit}
          />
        )}
      </div>
    </div>
  );
}

export default TodoApp;

