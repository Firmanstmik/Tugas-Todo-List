import React, { useState, useEffect } from 'react';
import './App.css';
import api from './api';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import ToastContainer from './components/ToastContainer';
import { useToast } from './hooks/useToast';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toasts, showToast, removeToast } = useToast();

  // Load todos from API
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

  // Load todos on component mount
  useEffect(() => {
    loadTodos();
  }, []);

  // Add a new todo
  const addTodo = async (title) => {
    try {
      const response = await api.post('/todos', { title });
      setTodos([response.data, ...todos]);
      showToast(`✅ Todo "${title}" berhasil ditambahkan!`, 'success');
    } catch (err) {
      console.error('Error adding todo:', err);
      setError('Failed to add todo');
      showToast('❌ Gagal menambahkan todo. Silakan coba lagi!', 'error');
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
      setError('Failed to update todo');
      showToast('❌ Gagal mengupdate todo. Silakan coba lagi!', 'error');
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
      setError('Failed to delete todo');
      showToast('❌ Gagal menghapus todo. Silakan coba lagi!', 'error');
    }
  };

  return (
    <div className="App">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
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
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading todos...</p>
          </div>
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

