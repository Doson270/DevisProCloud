import React from 'react';

export function Toast({ message, type }) {
  if (!message) return null;

  return (
    <div className={`toast-container no-print ${type}`}>
      <div className="toast-icon">
        {type === 'success' ? '✅' : '⚠️'}
      </div>
      <div className="toast-message">{message}</div>
    </div>
  );
}