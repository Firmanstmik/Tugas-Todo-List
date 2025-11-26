import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './TodoList.css';

export default function TodoList({ todos, toggleComplete, deleteTodo, onEdit }) {
  const { isAdmin } = useAuth();
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = (id) => {
    setDeletingId(id);
    setTimeout(() => {
      deleteTodo(id);
      setDeletingId(null);
    }, 300);
  };

  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">✨</div>
        <p>No todos yet. Add one above!</p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className={`todo-item ${todo.completed ? 'completed' : ''} ${deletingId === todo.id ? 'deleting' : ''}`}
        >
          <div className="todo-content">
            <span className="todo-title">{todo.title}</span>
            {isAdmin && todo.owner_username && (
              <span className="todo-owner">by {todo.owner_username}</span>
            )}
          </div>
          <div className="todo-actions">
            {isAdmin && onEdit && (
              <button
                className="edit-button"
                onClick={() => onEdit(todo)}
                title="Edit todo"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span>Edit</span>
              </button>
            )}
            <button
              className="done-button"
              onClick={() => toggleComplete(todo.id, todo.completed)}
              title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {todo.completed ? (
                  <path d="M18 6L6 18M6 6l12 12"></path>
                ) : (
                  <polyline points="20 6 9 17 4 12"></polyline>
                )}
              </svg>
              <span>{todo.completed ? 'Undo' : 'Done'}</span>
            </button>
            <button
              className="delete-button"
              onClick={() => handleDelete(todo.id)}
              disabled={deletingId === todo.id}
              title="Delete todo"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

