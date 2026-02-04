export const getFileExtension = (filename: string): string => {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

export const sanitizeFileName = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^\w\s.-]/g, '')
        .replace(/\s+/g, '-');
};
