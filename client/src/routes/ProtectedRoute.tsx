import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute() {
  const status = useAuthStore((state) => state.status);
  const location = useLocation();
  if (status === 'loading') return <main aria-busy="true" className="page-state">Restoring your session…</main>;
  if (status !== 'authenticated') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
