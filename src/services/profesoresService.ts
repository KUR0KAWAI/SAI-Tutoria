import apiClient from './apiClient';
import type { ProfesorDto } from '../models/entities';

export const profesoresService = {
    getAll: async (config?: any) => {
        const response = await apiClient.get<any[]>('/gestion-usuarios/docentes', config);
        // Map the API response to match our ProfesorDto interface
        return response.data.map(item => ({
            // Handle both camelCase and lowercase from API
            id: item.profesorId || item.profesorid || item.id,
            nombres: item.nombreCompleto || item.nombrecompleto || '',
            apellidos: '', // nombreCompleto already contains the full name
            especialidad: item.especialidad || ''
        }));
    },
    getById: async (id: string) => {
        const response = await apiClient.get<ProfesorDto>(`/profesores/${id}`);
        return response.data;
    }
};
