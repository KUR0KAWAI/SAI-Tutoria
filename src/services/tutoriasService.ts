import apiClient from './apiClient';
import type { TutoriaDto } from '../models/entities';

// Local mock storage to avoid self-reference issues in object literal
// Local mock storage removed

const toTitleCase = (str: string = '') => {
    if (!str) return '';
    return str
        .toLowerCase()
        .split(' ')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const tutoriasService = {
    getAll: async () => {
        const response = await apiClient.get<TutoriaDto[]>('/tutorias');
        return response.data;
    },
    getByAlumno: async (alumnoId: string) => {
        const response = await apiClient.get<TutoriaDto[]>(`/tutorias/alumno/${alumnoId}`);
        return response.data;
    },
    create: async (data: Omit<TutoriaDto, 'id'>) => {
        const response = await apiClient.post<TutoriaDto>('/tutorias', data);
        return response.data;
    },
    updateStatus: async (id: string, estado: TutoriaDto['estado']) => {
        const response = await apiClient.patch<TutoriaDto>(`/tutorias/${id}/status`, { estado });
        return response.data;
    },

    // --- Módulo Asignar Tutorías ---

    // --- Módulo Asignar Tutorías ---
    // Obtener estudiantes con nota < 7 en el periodo/nivel dado
    getCandidatosRiesgo: async (semestrePeriodoId: string) => {
        const response = await apiClient.get<any[]>('/tutorias/candidatos', {
            params: { semestrePeriodoId }
        });

        return response.data.map(item => ({
            id: item.notaid || item.id,
            alumnoId: item.alumnoid || item.alumnoId,
            alumnoNombre: toTitleCase(item.alumno_nombre || item.alumnoNombre),
            asignaturaId: item.asignaturaid || item.asignaturaId,
            asignaturaNombre: item.asignatura_nombre || item.asignaturaNombre,
            notaP1: item.notap1 || item.notaP1,
            profesorId: item.profesorid || item.profesorId,
            profesorNombre: toTitleCase(item.profesor_nombre || item.profesorNombre),
            seccionId: item.seccionid,
            seccionNombre: item.seccion_nombre,
            notaid: item.notaid,
            jornada: item.jornada || item.seccion_nombre, // Fallback to seccion_nombre if jornada not present
            email: item.email
        }));
    },


    // Guardar la asignación
    asignarTutoria: async (assignment: { alumnoid: string | number, profesorid: string | number, asignaturaid: string | number, seccionid: string | number, notaid: string | number, fecha: string }) => {
        const response = await apiClient.post('/tutorias', assignment);
        return response.data;
    },



    // Enviar correo (mock) -> Update to real API
    enviarCorreoNotificacion: async (alumnoEmail: string) => {
        const response = await apiClient.post('/notifications/send-email', { email: alumnoEmail });
        return response.data;
    },

    // Historial de asignaciones
    getHistorialAsignaciones: async () => {
        const response = await apiClient.get<any[]>('/tutorias/historial');
        return response.data.map(item => ({
            id: item.tutoriaid || item.id,
            tutoriaid: item.tutoriaid,
            fecha: item.fechatutoria || item.fecha,
            fechatutoria: item.fechatutoria,
            alumnoid: item.alumnoid,
            alumno_nombre: toTitleCase(item.alumno_nombre),
            profesorid: item.profesorid,
            profesor_nombre: toTitleCase(item.profesor_nombre),
            asignaturaid: item.asignaturaid,
            asignatura_nombre: item.asignatura_nombre,
            seccionid: item.seccionid,
            seccion_nombre: item.seccion_nombre,
            notaid: item.notaid,
            estadotutoriaid: item.estadotutoriaid,
            estado_nombre: item.estado_nombre || item.estado,
            objetivotutoria: item.objetivotutoria,
            observaciones: item.observaciones,
            estado: item.estado,
            // Virtual/Legacy support
            alumnoNombre: toTitleCase(item.alumno_nombre),
            profesorNombre: toTitleCase(item.profesor_nombre),
            asignaturaNombre: item.asignatura_nombre
        }));
    },





    // --- Módulo Cronograma de Anexos ---

    getCronograma: async () => {
        const response = await apiClient.get<import('../models/entities').CronogramaAnexoDto[]>('/cronograma');
        return response.data;
    },

    saveCronograma: async (data: Omit<import('../models/entities').CronogramaAnexoDto, 'cronogramaid'>) => {
        const response = await apiClient.post<import('../models/entities').CronogramaAnexoDto>('/cronograma', data);
        return response.data;
    },

    updateCronograma: async (id: number, data: Partial<import('../models/entities').CronogramaAnexoDto>) => {
        const response = await apiClient.put<import('../models/entities').CronogramaAnexoDto>(`/cronograma/${id}`, data);
        return response.data;
    },

    deleteCronograma: async (id: number) => {
        await apiClient.delete(`/cronograma/${id}`);
    },

    // --- Módulo Reporte Tutorías ---
    getAsignaturasDocente: async (semestrePeriodoId: string, profesorId: string) => {
        const response = await apiClient.get<any[]>('/reportes-tutoria/asignaturas', {
            params: { semestreperiodoid: semestrePeriodoId, profesorid: profesorId }
        });
        return response.data;
    },

    getTiposDocumentoReporte: async () => {
        const response = await apiClient.get<any[]>('/reportes-tutoria/tipos-documento');
        return response.data;
    },

    getEstudiantesRiesgo: async (semestrePeriodoId: string, profesorId: string) => {
        const response = await apiClient.get<any[]>('/reportes-tutoria/estudiantes-riesgo', {
            params: { semestreperiodoid: semestrePeriodoId, profesorid: profesorId }
        });

        return response.data.map(item => ({
            id: item.notaid,
            alumnoId: item.alumnoid,
            alumnoNombre: toTitleCase(item.alumno_nombre),
            asignaturaNombre: toTitleCase(item.asignatura_nombre || item.asignatura_codigo),
            profesorNombre: "",
            nota: item.notap1,
            asignaturaId: item.asignaturaid,
            seccionId: item.seccionid,
            seccionNombre: item.seccion_nombre,

            // Map real data from backend
            tieneTutoria: !!(item.tutoriaid && item.objetivotutoria && item.tutorias_requeridas),
            tutoriaId: item.tutoriaid,
            tutoriasRequeridas: item.tutorias_requeridas,
            objetivo: item.objetivotutoria,
            tutoriasRealizadas: item.cantidad_sesiones || 0
        }));
    },

    registrarTutoriaPadre: async (data: {
        tutoriaid: number,
        objetivotutoria: string,
        tutorias_requeridas: number
    }) => {
        const response = await apiClient.post('/reportes-tutoria/registrar', data);
        return response.data;
    },

    getEstadosTutoria: async () => {
        const response = await apiClient.get<any[]>('/tutoria-detalle/estados');
        return response.data;
    },

    getSesionesTutoria: async (tutoriaId: number) => {
        const response = await apiClient.get<any[]>('/tutoria-detalle', {
            params: { tutoriaid: tutoriaId }
        });

        return response.data.map(item => ({
            id: item.tutoriadetalleid,
            tutoriaId: item.tutoriaid,
            fecha: item.fechatutoria,
            motivo: item.motivotutoria,
            observaciones: item.observaciones,
            estado: item.estado_nombre,
            estadoId: item.estadotutoriaid
        }));
    },

    registrarSesion: async (data: { tutoriaid: number, fechatutoria: string, motivotutoria: string, observaciones?: string }) => {
        const response = await apiClient.post('/tutoria-detalle', data);
        return response.data;
    },

    actualizarSesion: async (sesionId: number, data: { tutoriaid: number, fechatutoria: string, motivotutoria: string, observaciones?: string, estadotutoriaid: number }) => {
        const payload = {
            tutoriadetalleid: sesionId,
            tutoriaid: data.tutoriaid,
            fechatutoria: data.fechatutoria.split('T')[0],
            motivotutoria: data.motivotutoria,
            observaciones: data.observaciones || '',
            estadotutoriaid: data.estadotutoriaid
        };

        const response = await apiClient.put(`/tutoria-detalle/${sesionId}`, payload);
        return response.data;
    },

    actualizarTutoriaPadre: async (tutoriaId: number, data: { objetivo: string, cantidad: number }) => {
        const payload = {
            tutoriaid: tutoriaId,
            objetivotutoria: data.objetivo,
            tutorias_requeridas: data.cantidad
        };
        const response = await apiClient.post('/reportes-tutoria/registrar', payload);
        return response.data;
    },

    eliminarSesion: async (sesionId: number) => {
        await apiClient.delete(`/tutoria-detalle/${sesionId}`);
    }
};
