import React, { useState } from 'react';
import './TodoList.css';

export default function TodoList({ todos, toggleComplete, deleteTodo }) {
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
          <span className="todo-title">{todo.title}</span>
          <div className="todo-actions">
            <button
              className="done-button"
              onClick={() => toggleComplete(todo.id, todo.completed)}
            >
              <span>{todo.completed ? '✓ Undo' : '✓ Done'}</span>
            </button>
            <button
              className="delete-button"
              onClick={() => handleDelete(todo.id)}
              disabled={deletingId === todo.id}
            >
              <span>🗑️ Delete</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

