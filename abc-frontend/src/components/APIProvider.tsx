import React, { createContext, useContext, useState } from "react";
import axios, { AxiosInstance } from "axios";
import { ACCESS_TOKEN, API_URL, REFRESH_TOKEN } from "../constants";
import { useLoading } from "./LoadingContext";
import { useNavigate } from "react-router-dom";

const createAPI = (
    setLoading: (loading: boolean) => void,
    navigate: (path: string) => void,
    setError: (error: any) => void
) => {
    const axiosParams = {
        baseURL: API_URL
    };

    const api = axios.create(axiosParams);
    // Using a separate axios instance for refreshing logic so we don't trigger the interceptors
    const refreshApi = axios.create(axiosParams);

    const refreshToken = async () => {
        console.log("Attempting to refresh access token")
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        if (!refreshToken) {
            return Promise.reject(new Error("No refresh token in storage, abandoning token refresh"));
        }
        return refreshApi.post("/api/token/refresh", { refresh: refreshToken }).then((res) => {
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            return res.data.access;
        }).catch(error => {
            console.error("Failed to refresh access token", error);
            setError(`Failed to refresh token: ${error}`);
            return Promise.reject(error);
        });
    };

    api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem(ACCESS_TOKEN);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            setLoading(true);
            return config;
        },
        (error) => {
            console.error(error);
            setLoading(false);
            setError(error);
            return Promise.reject(error);
        }
    );

    api.interceptors.response.use(
        async (response) => {
            setLoading(false);
            return response;
        },
        async (error) => {
            const originalRequest = error.config;
            // If the access token ever expires, a 401 is returned
            if (error.response && error.response.status === 401) {
                // Instead of imploding, we're going to refresh the access token and try the original request again with the new token
                return await refreshToken().then((res) => {
                    console.log("Refreshed access token")
                    originalRequest.headers.Authorization = `Bearer ${res}`;
                    console.log("Retrying original request", originalRequest)
                    return api(originalRequest);
                }).catch(err => {
                    // ONLY if we get another 401 error does that indicate that the tokens are bad
                    // "Normal" errors that aren't auth related are sent back to the caller
                    if (err.response?.status === 401) {
                        // If for some reason the refresh fails, we need the user to login again to refill the access / refresh tokens
                        console.error('Token refresh failed:', err);
                        navigate('/login');
                        // Remove old tokens
                        localStorage.clear();
                    }
                    setError(Object.keys(err).length > 0 ? err : error); // prioritize the OG request's error, but if empty, use the parent error
                    // Return the error regardless if its a token refresh or just a regular error
                    return Promise.reject(err);
                }).finally(() => {
                    setLoading(false);
                })
            }
            setLoading(false);
            setError(error);
            return Promise.reject(error);
        }
    );

    return api;
};

interface APIContextType {
    api: AxiosInstance;
    lastError: string | null;
}

const APIContext = createContext<APIContextType | null>(null);

export const useAPI = () => {
    const context = useContext(APIContext);
    if (!context?.api) {
        throw new Error("useApi must be used within an APIProvider");
    }
    return context.api;
};

export const useLastError = () => {
    const context = useContext(APIContext);
    if (!context) {
        throw new Error("useLastError must be used within an APIProvider");
    }
    return context.lastError;
};

export const APIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setLoading } = useLoading();
    const navigate = useNavigate();
    const [lastError, setLastError] = useState<string | null>(null);
    const api = createAPI(setLoading, navigate, (error) => parseError(error));

    // Handles fancy error formatting if data was returned from the API
    const parseError = async (error: any) => {
        // Sometimes it can be a blob. I have no idea why. Backend seems correct
        if (error.response?.data instanceof Blob) {
            error.response.data = JSON.parse(await error.response.data.text());
        }
        let newError = formatErrors(error.response?.data, error?.response?.data || JSON.stringify(error)); // return the raw data OR if not present just stringify it
        // Cap to max length
        newError = newError.substring(0, 500) // max length. JS will accept this even if its out of bounds
        setLastError(newError);
        if (lastError == newError) {
            setLastError(newError + " "); // dumb hack to make the same error appear again (you could alternatively do #s)
        }
    }

    const formatErrors = (errors: any, fallback: any) => {
        // First check if valid JSON
        try {
            let parsed = JSON.parse(JSON.stringify(errors));
            // Check if jsonObject is an actual object
            if (typeof parsed !== 'object' || parsed === null) {
                throw new Error(`BAD: ${parsed}`);
            }
        } catch (e) {
            console.log("Error is not valid JSON, returning as plain string", fallback);
            return fallback;
        }
        const errorMessages: string[] = [];
        // Recursive function to traverse the error object
        const traverseErrors = (errorObj: any, parentKey = "") => {
            for (const key in errorObj) {
                const newKey = parentKey ? `${parentKey}.${key}` : key;
                if (Array.isArray(errorObj[key])) {
                    // If the value is an array, iterate through it to push messages
                    errorObj[key].forEach((message: any) => {
                        errorMessages.push(`${capitalizeFirstLetter(newKey)}: ${message}`);
                    });
                } else if (typeof errorObj[key] === 'object' && errorObj[key] !== null) {
                    // If the value is an object, recurse into it
                    traverseErrors(errorObj[key], newKey);
                } else {
                    // If the value is a primitive, add it to the messages
                    errorMessages.push(`${capitalizeFirstLetter(newKey)}: ${errorObj[key]}`);
                }
            }
        };
        traverseErrors(errors);
        return errorMessages.join('\n');
    };

    const capitalizeFirstLetter = (string: string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return (
        <APIContext.Provider value={{ api, lastError }}>
            {children}
        </APIContext.Provider>
    );
};
