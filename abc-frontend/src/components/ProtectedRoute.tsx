import * as React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ACCESS_TOKEN } from '../constants';

// This doesn't do anything atm
export const ProtectedRoute: React.FC = () => {
    // Kicks you out if you're not logged in
    // ^ nah, handled by refresh token logic failing, which will reroute you to /login
    // return localStorage.getItem(ACCESS_TOKEN) ? <Outlet /> : <Navigate to="/login" />;
    return <Outlet />
};
