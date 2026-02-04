export const loginValidator = (username: string, password: string) => {
    const errors: string[] = [];
    if (!username) errors.push('El usuario es requerido');
    if (!password) errors.push('La contraseña es requerida');
    if (password && password.length < 4) errors.push('La contraseña debe tener al menos 4 caracteres');
    return {
        isValid: errors.length === 0,
        errors
    };
};
