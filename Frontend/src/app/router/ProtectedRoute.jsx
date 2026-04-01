import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { usePermissions } from '../providers/PermissionsProvider';

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const { user } = useAuth();
    const { hasRole } = usePermissions();
    const location = useLocation();

    // 1. Not logged in? Kick back to login page.
    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // 2. Logged in, but wrong role? Kick to an unauthorized page (or back to login).
    if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
        console.warn(`Access Denied: User role '${user.userType}' is not in allowed roles: [${allowedRoles.join(', ')}]`);
        return <Navigate to="/" replace />; 
    }

    // 3. Logged in AND has the right role? Let them see the page.
    return <Outlet />;
};

export default ProtectedRoute;