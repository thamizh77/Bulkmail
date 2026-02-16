/**
 * Layout Component
 * Main layout wrapper with navigation sidebar
 */

import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">📧 Bulk Mail</h1>
        </div>
        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            History
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
