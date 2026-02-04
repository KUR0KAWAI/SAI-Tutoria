import apiClient from './apiClient';
import type { PeriodoSimplificadoDto } from '../models/entities';

export const periodosService = {
    getAll: async (): Promise<PeriodoSimplificadoDto[]> => {
        const response = await apiClient.get<PeriodoSimplificadoDto[]>('/cronograma/periodos');
        return response.data;
    }
};
