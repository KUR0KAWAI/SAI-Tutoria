# Carpeta de Imágenes

Esta carpeta contiene las imágenes utilizadas en el proyecto SAI-Tutoria.

## Estructura

- `src/assets/images/` - Imágenes que se importan en componentes React
  - Uso: `import logo from '@/assets/images/logo.png'`
  - Se procesan por Vite y se optimizan en el build

- `public/images/` - Imágenes estáticas accesibles directamente
  - Uso: `<img src="/images/foto.jpg" />`
  - Se copian tal cual al build final

## Recomendaciones

1. **Logos y iconos del proyecto**: `src/assets/images/`
2. **Fotos de usuarios o contenido dinámico**: `public/images/`
3. **Imágenes de fondo o decorativas**: `src/assets/images/`

## Formatos soportados

- PNG, JPG, JPEG, SVG, WebP, GIF
