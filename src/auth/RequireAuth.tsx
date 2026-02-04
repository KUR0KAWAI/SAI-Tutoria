import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';
import { ROUTES } from '../core/routesConfig';

const RequireAuth = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return null; // The LoadingScreen will handle this at App.tsx level
    }

    if (!user) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    return <Outlet />;
};

export default RequireAuth;
