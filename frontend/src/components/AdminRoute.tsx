import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import api from "../api"
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants"
import { useState, useEffect } from "react"
import { Box } from '@mui/material';
import { Outlet } from "react-router-dom";
import ABCBar from "./ABCBar"

// Sends the user to the login screen if they're not authorized
function AdminRoute() {
    const navigator = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false))
    });

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN)
        try {
            const res = await api.post("/api/token/refresh/", { refresh: refreshToken });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } catch (error) {
            console.error(error);
            setIsAuthorized(false);
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthorized(false);
            return;
        }
        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;

        if (!!tokenExpiration && tokenExpiration < now) {
            await refreshToken();
        } else {
            setIsAuthorized(true);
        }
    };

    if (isAuthorized !== true) {
        if (isAuthorized === false) {
            navigator("/login", { viewTransition: true });
        }
        return <div>Authenticating...</div>
    }
    return (
        <>
            <ABCBar />
            {/* Page Content with animation */}
            <Box component="div" sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', px: 10 }}>
                <Outlet />
            </Box>
        </>
    );
}

export default AdminRoute
