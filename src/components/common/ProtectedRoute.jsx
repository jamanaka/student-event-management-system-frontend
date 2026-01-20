import React from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAuthenticated, useIsAdmin } from '../../store/useAuthStore';

const ProtectedRoute = ({ children, requireAdmin = false, requireUser = false }) => {
  const isAuthenticated = useIsAuthenticated();
  const isAdmin = useIsAdmin();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/users/dashboard" replace />;
  }

  // If this route requires a regular user (not admin) and user is admin, redirect to admin dashboard
  if (requireUser && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

