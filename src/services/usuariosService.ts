import apiClient from './apiClient';
import type { RoleValue } from '../core/roles';

export interface Usuario {
    id: string;
    username: string;
    password?: string; // Optional for listing, required for creation
    role: string; // Display name (e.g., DOCENTE)
    roleId?: string | number; // ID for logic (e.g., 1)
    profesorId?: string; // Optional if role is not Docente, or if not linked
    profesorNombre?: string; // Virtual for display
}

// Mock initial data removed

export const usuariosService = {
    getAll: async (config?: any): Promise<Usuario[]> => {
        const response = await apiClient.get<any[]>('/gestion-usuarios/usuarios', config);
        return response.data.map(item => ({
            id: item.loginid?.toString() || item.id?.toString(),
            username: item.usuario,
            role: item.rol, // Display string
            roleId: item.rolid, // Internal ID for logic
            profesorId: item.profesorid?.toString(),
            profesorNombre: item.nombreCompleto
        } as Usuario));
    },

    create: async (usuario: any): Promise<Usuario> => {
        // Payload for POST /api/gestion-usuarios/usuarios
        const payload = {
            usuario: usuario.username,
            password: usuario.password,
            profesorid: Number(usuario.profesorId),
            rolid: Number(usuario.roleId) // Use roleId (numeric) instead of role string
        };

        const response = await apiClient.post<any>('/gestion-usuarios/usuarios', payload);
        const item = response.data;

        return {
            id: item.loginid?.toString() || item.id?.toString(),
            username: item.usuario,
            // Prioritize API response, then input role name (which we likely don't have as string because we sent ID),
            // NO, wait. The frontend sends `roleId` number. It also sends `role` string in `usuario.role`?
            // Checking Consumers: UsuariosPage sends `role: formData.role` which IS the string.
            // So we can fallback to `usuario.role` which is the role NAME string.
            role: item.rol || usuario.role || '',
            profesorId: item.profesorid?.toString(),
            profesorNombre: item.nombreCompleto
        } as Usuario;
    },

    update: async (id: string, data: Partial<Usuario> & { roleId?: string }): Promise<Usuario> => {
        // Payload for PUT /api/gestion-usuarios/usuarios/{id}
        // password is optional
        const payload: any = {
            usuario: data.username,
            rolid: Number(data.roleId) // Required for PUT
        };

        if (data.password) {
            payload.password = data.password;
        }

        const response = await apiClient.put<any>(`/gestion-usuarios/usuarios/${id}`, payload);
        const item = response.data;

        return {
            id: item.loginid?.toString() || id,
            username: item.usuario || data.username,
            role: item.rol || data.role || '',
            profesorId: item.profesorid?.toString() || data.profesorId,
            profesorNombre: item.nombreCompleto
        } as Usuario;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/gestion-usuarios/usuarios/${id}`);
    }
};
