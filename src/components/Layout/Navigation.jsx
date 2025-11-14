// src/components/Layout/Navigation.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';

const Navigation = () => {
  const { user } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return null; // Don't show navigation when not logged in
  }

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/">📝 Smart To-Do List</Link>
        </div>
        
        <div className="nav-links">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
          >
            Dashboard
          </Link>
          <Link 
            to="/calendar" 
            className={location.pathname === '/calendar' ? 'nav-link active' : 'nav-link'}
          >
            Calendar
          </Link>
        </div>

        <div className="nav-user">
          <span className="user-info">
            Hello, {user.displayName || user.email}!
          </span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;