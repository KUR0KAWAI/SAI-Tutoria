export const alumnoValidator = (data: any) => {
    const errors: string[] = [];
    if (!data.cedula) errors.push('La cédula es requerida');
    if (!data.nombres) errors.push('Los nombres son requeridos');
    return {
        isValid: errors.length === 0,
        errors
    };
};
