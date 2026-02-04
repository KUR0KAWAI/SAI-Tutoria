import apiClient from './apiClient';
import type {
    NotaParcialDto,
    AlumnoDto
} from '../models/entities';

// Module-level cache
const cache = {
    periodosSemestres: [] as any[],
    alumnos: [] as AlumnoDto[],
    asignaturas: {} as Record<string, any[]>,
    docentes: {} as Record<string, any[]>,
    secciones: {} as Record<string, any[]>
};

// In-flight request deduplication
const inFlight: Record<string, Promise<any> | undefined> = {};

const dedupe = <T>(key: string, fetchFn: () => Promise<T>): Promise<T> => {
    if (inFlight[key]) return inFlight[key] as Promise<T>;

    const promise = fetchFn().finally(() => {
        inFlight[key] = undefined;
    });

    inFlight[key] = promise;
    return promise;
};

const toTitleCase = (str: string = '') => {
    if (!str) return '';
    return str
        .toLowerCase()
        .split(' ')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const notaParcialService = {
    // 1. Prefetch & Caching
    getPeriodos: async () => {
        if (cache.periodosSemestres.length > 0) return cache.periodosSemestres;

        return dedupe('periodos', async () => {
            const response = await apiClient.get<any[]>('/periodos');
            cache.periodosSemestres = response.data.map(p => ({
                ...p,
                id: p.id || p.periodoid || p.periodo_id,
                periodoId: p.periodoid || p.periodoId,
                periodo_nombre: p.periodo_nombre || p.nombre,
                semestreperiodoid: p.semestreperiodoid || p.id,
                nivel: p.nivel || `Nivel ${p.semestreid}`
            }));
            return cache.periodosSemestres;
        });
    },

    getAlumnos: async () => {
        if (cache.alumnos.length > 0) return cache.alumnos;

        return dedupe('alumnos', async () => {
            const response = await apiClient.get<any[]>('/alumnos');
            cache.alumnos = response.data.map(a => {
                const id = String(a.alumnoid || a.id || '');
                return {
                    ...a,
                    id: id,
                    alumnoid: id,
                    nombres: toTitleCase(a.nombre || a.nombres || ''),
                    apellidos: toTitleCase(a.apellidos || '')
                };
            });
            return cache.alumnos;
        });
    },

    // 2. Cascading with Cache
    getAsignaturas: async (semestrePeriodoId: string, seccionId: string) => {
        const cacheKey = `sem_${semestrePeriodoId}_sec_${seccionId}`;
        if (cache.asignaturas[cacheKey]) return cache.asignaturas[cacheKey];

        return dedupe(cacheKey, async () => {
            const response = await apiClient.get<any[]>('/asignaturas', {
                params: { semestrePeriodoId, seccionId }
            });
            const data = response.data.map(a => ({
                ...a,
                id: a.id || a.asignaturaid || a.asignatura_id
            }));
            cache.asignaturas[cacheKey] = data;
            return data;
        });
    },

    getDocentes: async (semestrePeriodoId: string, asignaturaId: string, seccionid: string) => {
        const cacheKey = `doc_${semestrePeriodoId}_${asignaturaId}_${seccionid}`;
        if (cache.docentes[cacheKey]) return cache.docentes[cacheKey];

        return dedupe(cacheKey, async () => {
            const response = await apiClient.get<any[]>('/docentes', {
                params: { semestrePeriodoId, asignaturaId, seccionid }
            });
            const data = response.data.map(d => ({
                ...d,
                id: d.id || d.docenteid || d.profesorid || d.profesor_id,
                profesorid: (d as any).profesorid || d.id,
                nombres: toTitleCase(d.nombres || d.nombre || ''),
                apellidos: toTitleCase(d.apellidos || '')
            }));
            cache.docentes[cacheKey] = data;
            return data;
        });
    },

    getNotasParciales: async () => {
        return dedupe('notas_parciales', async () => {
            const response = await apiClient.get<NotaParcialDto[]>('/nota-parcial');
            return response.data;
        });
    },
    saveNotaParcial: async (data: any) => {
        const response = await apiClient.post<any>('/nota-parcial', data);
        return response.data;
    },
    updateNotaParcial: async (notaid: string | number, data: any) => {
        const response = await apiClient.put<any>(`/nota-parcial/${notaid}`, data);
        return response.data;
    },
    deleteNotaParcial: async (notaid: string | number) => {
        await apiClient.delete(`/nota-parcial/${notaid}`);
    },

    getSecciones: async (semestrePeriodoId?: string) => {
        const cacheKey = semestrePeriodoId ? `sec_${semestrePeriodoId}` : 'sec_all';
        if (cache.secciones[cacheKey]) return cache.secciones[cacheKey];

        return dedupe(cacheKey, async () => {
            const response = await apiClient.get<any[]>('/secciones', {
                params: semestrePeriodoId ? { semestrePeriodoId } : {}
            });
            const data = response.data.map(s => {
                const id = String(s.id || s.seccionid || s.seccion_id || '');
                return {
                    ...s,
                    id: id,
                    seccionid: id,
                    nombre: s.nombre || s.seccion_nombre
                };
            });
            cache.secciones[cacheKey] = data;
            return data;
        });
    },

    // Helper for clearing cache if needed
    clearCache: () => {
        cache.periodosSemestres = [];
        cache.alumnos = [];
        cache.asignaturas = {};
        cache.docentes = {};
    }
};
