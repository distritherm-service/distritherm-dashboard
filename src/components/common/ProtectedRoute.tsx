import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  /** Liste des rôles autorisés pour accéder à la route */
  allowedRoles?: Array<'ADMIN' | 'COMMERCIAL' | 'CLIENT'>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const normalizeRole = (r?: string) => (r || '').toUpperCase();

  if (
    isAuthenticated &&
    allowedRoles &&
    allowedRoles.length > 0 &&
    user &&
    !allowedRoles.map(normalizeRole).includes(normalizeRole(user.role))
  ) {
    return <Navigate to="/login" replace />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute; 