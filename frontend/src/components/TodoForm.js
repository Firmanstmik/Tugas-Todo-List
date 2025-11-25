import React, { useState } from 'react';
import './TodoForm.css';

export default function TodoForm({ addTodo }) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addTodo(title);
      setTitle(''); // Clear input after successful submission
    } catch (error) {
      console.error('Error submitting todo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="todo-input"
        placeholder="Add todo..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isSubmitting}
      />
      <button
        type="submit"
        className="add-button"
        disabled={isSubmitting || !title.trim()}
      >
        <span>{isSubmitting ? 'Adding...' : '➕ Add Todo'}</span>
      </button>
    </form>
  );
}

