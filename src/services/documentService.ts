import apiClient from './apiClient';

export const documentService = {
    /**
     * Sube un archivo PDF al servidor.
     * Endpoint: POST /api/documentos
     */
    uploadDocument: async (
        file: File,
        cronogramaId: number,
        asignaturaId: number,
        tipoDocumentoId: number,
        semestrePeriodoId: number,
        seccionId: number
    ) => {
        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('cronogramaid', String(cronogramaId));
        formData.append('asignaturaid', String(asignaturaId));
        formData.append('tipodocumentoid', String(tipoDocumentoId));
        formData.append('semestreperiodoid', String(semestrePeriodoId));
        formData.append('seccionid', String(seccionId));

        // IMPORTANT: We use a separate header config to override the default application/json
        // Setting Content-Type to undefined allows Axios to correctly set it with the boundary for FormData
        const response = await apiClient.post('/documentos', formData, {
            headers: {
                'Content-Type': undefined as any
            }
        });

        return response.data;
    },

    /**
     * Obtiene la lista de documentos del docente.
     * Endpoint: GET /api/documentos
     */
    getDocuments: async () => {
        const response = await apiClient.get('/documentos');
        return response.data;
    },
};
