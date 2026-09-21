import React from 'react';
import { useApp } from '../../context/AppContext';

export const Toast: React.FC = () => {
  const { notification } = useApp();

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3">
      <div className="bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10">
        <span className={`material-symbols-outlined ${
          notification.type === 'error' ? 'text-error' : 
          notification.type === 'success' ? 'text-secondary-container' : 'text-primary'
        }`}>
          {notification.type === 'error' ? 'error' : notification.type === 'success' ? 'check_circle' : 'info'}
        </span>
        <span className="font-body-md text-body-md">{notification.message}</span>
      </div>
    </div>
  );
};
