import React, { createContext, useContext, useState, PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';

const LoadingContext = createContext<{
    loading: boolean;
    setLoading: (loading: boolean) => void;
} | undefined>(undefined);

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
};

// Update to use PropsWithChildren
export const LoadingProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [loading, setLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
            {children}
            <Outlet />
        </LoadingContext.Provider>
    );
};
