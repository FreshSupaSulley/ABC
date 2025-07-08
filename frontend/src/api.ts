import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

// We use https://www.npmjs.com/package/axios-auth-refresh to handle JWT token refreshing
const api = axios.create();

// Add token to each request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const refreshAuthLogic = async (failedRequest: any ) => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);

    try {
        const response = await axios.post("/api/token/refresh/", {
            refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem(ACCESS_TOKEN, newAccessToken);

        failedRequest.response.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return Promise.resolve();
    } catch (error) {
        // Ugly redirect to login screen
        window.location.href = "/logout";
        console.error("Token refresh failed", error);
        return Promise.reject(error);
    }
};

createAuthRefreshInterceptor(api, refreshAuthLogic);
export default api;
