import React from 'react';
import { useAuth } from '../app/providers/AuthProvider';

/**
 * Gate Component: Conditionally renders UI elements based on user roles or permissions.
 * * Usage Example:
 * <Gate allowedRoles={['SUPER_ADMIN', 'COMPANY_ADMIN']}>
 * <button>Delete Project</button>
 * </Gate>
 */
const Gate = ({ allowedRoles = [], children, fallback = null }) => {
    const { user } = useAuth();

    // If no user is logged in, show the fallback (usually null/nothing)
    if (!user) return fallback;

    // Extract role safely (accounting for different backend structures)
    const userRole = user.userType || user.role?.name;

    // Check if the user's role is in the allowed array
    const hasAccess = allowedRoles.includes(userRole);

    return hasAccess ? <>{children}</> : fallback;
};

export default Gate;