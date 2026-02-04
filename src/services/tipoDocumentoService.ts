import apiClient from './apiClient';
import type { TipoDocumentoDto } from '../models/entities';

export const tipoDocumentoService = {
    getAll: async () => {
        const response = await apiClient.get<TipoDocumentoDto[]>('/cronograma/tipo-documento');
        return response.data;
    },

    create: async (data: Omit<TipoDocumentoDto, 'tipodocumentoid'>) => {
        const response = await apiClient.post<TipoDocumentoDto>('/cronograma/tipo-documento', data);
        return response.data;
    },

    update: async (id: number, data: Partial<TipoDocumentoDto>) => {
        const response = await apiClient.put<any>(`/cronograma/tipo-documento/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await apiClient.delete(`/cronograma/tipo-documento/${id}`);
        return response.data;
    }
};
