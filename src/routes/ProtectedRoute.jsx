import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="page-loading">Đang tải...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ from: location }}
      />
    );
  }

  if (
    allowedRoles?.length &&
    !allowedRoles.includes(user?.roleCode)
  ) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
