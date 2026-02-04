import type { UserDto } from '../models/entities';
import apiClient from './apiClient';

// Mock auth service for demonstration
export const authService = {
    login: async (username: string, password: string): Promise<{ user: UserDto; token: string }> => {
        const response = await apiClient.post<any>('/login', { usuario: username, password });
        const data = response.data;

        // Based on console log: response.data.user.user contains the fields
        const backendUser = data.user?.user || data.user || data;
        const token = data.user?.token || data.token;

        const firstName = backendUser.nombre || backendUser.nombres || '';
        const lastName = backendUser.apellidos || backendUser.apellido || '';
        const mappedFullName = backendUser.nombre_completo || backendUser.fullName ||
            (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName);

        return {
            user: {
                id: backendUser.id,
                profesorId: backendUser.profesorid || backendUser.profesorId, // Map backend field
                username: backendUser.usuario || backendUser.username,
                fullName: mappedFullName || 'Usuario',
                role: backendUser.rol || backendUser.role,
                email: backendUser.correoinstitucional || backendUser.email,
                avatarUrl: backendUser.avatar_url || backendUser.avatarUrl,
                roles: backendUser.roles || []
            },
            token: token
        };
    },

    getCurrentUser: async () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getUserInfo: async (username: string) => {
        const response = await apiClient.get<any>(`/usuarios/${username}`);
        const data = response.data;
        const u = data.user?.user || data.user || data;

        const firstName = u.nombre || u.nombres || '';
        const lastName = u.apellidos || u.apellido || '';
        const mappedFullName = u.nombre_completo || u.fullName ||
            (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName);

        return {
            username: u.usuario || u.username,
            fullName: mappedFullName || 'Usuario',
            role: u.rol || u.role,
            email: u.correoinstitucional || u.email,
            avatarUrl: u.avatar_url || u.avatarUrl,
            roles: u.roles || []
        } as UserDto;
    },

    validateSession: async (): Promise<UserDto> => {
        const response = await apiClient.get<any>('/auth/validate');
        const data = response.data;
        const u = data.user?.user || data.user || data;

        const firstName = u.nombre || u.nombres || '';
        const lastName = u.apellidos || u.apellido || '';
        const mappedFullName = u.nombre_completo || u.fullName ||
            (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName);

        return {
            id: u.id,
            profesorId: u.profesorid || u.profesorId, // Map backend field
            username: u.usuario || u.username,
            fullName: mappedFullName || 'Usuario',
            role: u.rol || u.role,
            email: u.correoinstitucional || u.email,
            avatarUrl: u.avatar_url || u.avatarUrl,
            roles: u.roles || []
        } as UserDto;
    },

    logout: async () => {
        // API logic for logout if session is server-side
    }
};
