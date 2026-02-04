export const formatDate = (date: string | Date | number): string => {
    const d = new Date(date);
    return d.toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const formatDateTime = (date: string | Date | number): string => {
    const d = new Date(date);
    return d.toLocaleString('es-EC', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};
