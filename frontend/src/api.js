import axios from "axios"
import { ACCESS_TOKEN } from "./constants"

// Base URL handled upstream
const api = axios.create()

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if(token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config;
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default api;
