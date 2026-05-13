import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function ProtectedRoute({ children, requireAdmin = false, requireVerified = false }) {
  const { isAuthenticated, isAdmin, isVerified } = useAuthStore()

  if (!isAuthenticated()) return <Navigate to="/login" replace />
  if (requireAdmin && !isAdmin()) return <Navigate to="/dashboard" replace />
  if (requireVerified && !isVerified()) return <Navigate to="/dashboard" replace />

  return children
}
