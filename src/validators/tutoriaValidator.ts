export const tutoriaValidator = (data: any) => {
    const errors: string[] = [];
    if (!data.estudianteId) errors.push('El estudiante es requerido');
    if (!data.tema) errors.push('El tema de la tutoría es requerido');
    if (!data.fecha) errors.push('La fecha es requerida');
    return {
        isValid: errors.length === 0,
        errors
    };
};
