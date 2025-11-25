import React from 'react';
import './Toast.css';

export default function Toast({ message, type = 'success', onClose }) {
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className="toast-icon">{icons[type]}</span>
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
}

