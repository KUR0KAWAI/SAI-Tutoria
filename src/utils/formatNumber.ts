export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

export const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toLocaleString('es-EC', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
};
