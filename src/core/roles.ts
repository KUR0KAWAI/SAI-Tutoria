export const Role = {
    DOCENTE: 'DOCENTE',
    COORDINADOR: 'COORDINADOR',
    ADMIN: 'ADMIN'
} as const;

export type RoleValue = typeof Role[keyof typeof Role];
