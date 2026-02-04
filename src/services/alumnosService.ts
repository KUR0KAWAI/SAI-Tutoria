import apiClient from './apiClient';
import type { AlumnoDto } from '../models/entities';

export const alumnosService = {
    getAll: async () => {
        const response = await apiClient.get<AlumnoDto[]>('/alumnos');
        return response.data;
    },
    getById: async (id: string) => {
        const response = await apiClient.get<AlumnoDto>(`/alumnos/${id}`);
        return response.data;
    },
    create: async (data: Omit<AlumnoDto, 'id'>) => {
        const response = await apiClient.post<AlumnoDto>('/alumnos', data);
        return response.data;
    }
};
