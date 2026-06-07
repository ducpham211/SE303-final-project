import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'

/**
 * ProtectedRoute — wraps routes that require authentication and/or a specific role.
 *
 * Usage:
 *   <Route path="/admin/*" element={<ProtectedRoute roles={['ADMIN']}><AdminPage /></ProtectedRoute>} />
 *   <Route path="/owner/*" element={<ProtectedRoute roles={['OWNER']}><OwnerPage /></ProtectedRoute>} />
 *   <Route path="/tin-nhan" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
 *
 * Behaviour:
 *   - Not logged in → redirect to /dang-nhap
 *   - Logged in but wrong role → redirect to / (home — role-aware dashboard)
 *   - Logged in with correct role → render children
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const { isLoggedIn, user } = useAuthStore()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  if (roles.length > 0) {
    const userRole = user?.role || ''
    // BE stores role as 'ADMIN', 'OWNER', 'PLAYER' (no ROLE_ prefix after our decode)
    const hasRole = roles.some(r =>
      userRole === r || userRole === `ROLE_${r}` || userRole?.replace('ROLE_', '') === r
    )
    if (!hasRole) {
      return <Navigate to="/" replace />
    }
  }

  return children
}
