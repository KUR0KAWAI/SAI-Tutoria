import apiClient from './apiClient';

export interface RoleDto {
    id: string;
    nombre: string;
}

export const rolesService = {
    getAll: async (config?: any): Promise<RoleDto[]> => {
        const response = await apiClient.get<any[]>('/gestion-usuarios/roles', config);
        // Map API response which uses 'rolid' instead of 'id'
        return response.data.map(item => ({
            id: item.rolid || item.id,
            nombre: item.nombre
        }));
    }
};
