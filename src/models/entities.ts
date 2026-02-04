export interface UserDto {
    id?: string | number;
    profesorId?: string | number;
    username: string;
    fullName: string;
    role: string;
    email: string;
    avatarUrl?: string;
    roles?: string[];
}

export interface AlumnoDto {
    id: string;
    cedula: string;
    nombres: string;
    apellidos: string;
    carrera: string;
    ciclo: string;
}

export interface ProfesorDto {
    id: string;
    nombres: string;
    apellidos: string;
    especialidad: string;
}



export interface PeriodoDto {
    id: string;
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    estado?: string;
}

export interface SemestreDto {
    id: string;
    nivel: string; // e.g. "Nivel 3"
}

export interface SemestrePeriodoDto {
    id: string;
    semestreId: string;
    periodoId: string;
    estado: string;
}

export interface AsignaturaDto {
    id: string;
    nombre: string;
    codigo: string; // e.g. "XXX-YYY-301"
}

export interface AlumnoAsignaturaDto {
    id: string;
    alumnoId: string;
    asignaturaId: string;
    seccionId: string;
    semestrePeriodoId: string;
    fechaRegistro: string;
}

export interface NotaParcialDto {
    id: string; // The row ID
    notaid?: number;
    alumnoid: string | number;
    alumno_nombre?: string;
    asignaturaid: string | number;
    asignatura_nombre?: string;
    semestreperiodoid?: string | number;
    periodoid?: string | number;
    periodo_nombre?: string;
    semestreid?: string | number;
    nivel?: string;
    fecha: string;
    notap1: number;
    notap2: number | null;
    profesorid?: string | number;
    profesor_nombre?: string;
    seccionid?: string | number;
    seccion_nombre?: string;
}

export interface EstudianteRiesgoDto {
    id: string | number;
    alumnoId: string | number;
    alumnoNombre: string;
    asignaturaId: string | number;
    asignaturaNombre: string;
    notaP1: number;
    profesorId: string | number;
    profesorNombre: string;
    seccionId: string | number;
    seccionNombre: string;
    notaid?: number;
    jornada?: 'Matutina' | 'Vespertina' | 'Nocturna';
    email?: string;
}



export interface TutoriaDto {
    id: string | number;
    tutoriaid?: number;
    fecha: string;
    alumnoid: string | number;
    alumno_nombre?: string;
    profesorid: string | number;
    profesor_nombre?: string;
    asignaturaid: string | number;
    asignatura_nombre?: string;
    seccionid: string | number;
    seccion_nombre?: string;
    notaid?: number;
    objetivotutoria?: string;
    estadotutoriaid?: number;
    estado_nombre?: string;
    fechatutoria?: string;
    observaciones?: string;
    estado?: 'Pendiente' | 'Realizada' | 'Cancelada';

    // Legacy support or virtual fields
    alumnoNombre?: string;
    profesorNombre?: string;
    asignaturaNombre?: string;
}



export interface CronogramaAnexoDto {
    cronogramaid: number;
    periodoid: number;
    tipodocumentoid: number;
    descripcion: string;
    fechalimite: string;
    estado: string;
    periodo_nombre?: string;
    tipo_documento_nombre?: string;
}

export interface TipoDocumentoDto {
    tipodocumentoid?: number; // Optional for creation
    nombre: string;
    descripcion: string;
    estado: string;
}

export interface PeriodoSimplificadoDto {
    periodoid: number;
    nombre: string;
}
