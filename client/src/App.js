/**
 * Main App Component
 * Handles routing and authentication flow
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Layout from './components/Layout';

// Check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Route (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      {/* Login - Public, redirects if authenticated */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected routes with layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="history" element={<History />} />
      </Route>

      {/* Catch all - redirect to dashboard or login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
