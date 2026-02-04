import { createContext, type ReactNode, useState, useEffect } from 'react';
import type { UserDto } from '../models/entities';
import { authService } from '../services/authService';

interface AuthContextType {
    user: UserDto | null;
    role: string | null;
    isLoading: boolean;
    login: (user: UserDto, token: string) => void;
    logout: () => void;
    setUser: (user: UserDto | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUserState] = useState<UserDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await authService.validateSession();
                    setUserState(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                } catch (error: any) {
                    console.error("Error validando sesión", error);
                    if (error.response?.status === 401) {
                        logout();
                    }
                }
            }

            // Restore loading time for the loading screen requirement
            setTimeout(() => {
                setIsLoading(false);
            }, 1000); // Reduced a bit since validation adds some latency
        };

        validateToken();
    }, []);

    const login = (userData: UserDto, token: string) => {
        setUserState(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
    };

    const logout = () => {
        setUserState(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const setUser = (userData: UserDto | null) => {
        setUserState(userData);
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            localStorage.removeItem('user');
        }
    };

    return (
        <AuthContext.Provider value={{ user, role: user?.role || null, isLoading, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
