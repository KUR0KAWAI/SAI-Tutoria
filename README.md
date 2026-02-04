# SAI - Sistema Académico Institucional (Módulo de Tutorías)

Plataforma web para la gestión integral de tutorías académicas, reportes de asistencia, seguimiento de notas parciales y administración de usuarios.

## 🚀 Tecnologías
- **Frontend**: React + TypeScript + Vite
- **Estilos**: Vanilla CSS
- **Estado**: En desarrollo

## 📋 Funcionalidades
- **Gestión de Tutorías**: Asignación de candidatos y seguimiento de sesiones.
- **Reportes**: Generación y visualización de reportes de tutorías.
- **Notas Parciales**: Registro y consulta de calificaciones parciales.
- **Administración**: Control de usuarios y roles.

## 📋 Requisitos Previos
Antes de comenzar, asegúrate de tener instalado:
- **[Node.js](https://nodejs.org/)** (v18.0 o superior recomendada)
- **npm** (que viene incluido con Node.js)

## 🛠️ Instalación y Configuración

Sigue estos pasos para configurar el proyecto en tu entorno local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/KUR0KAWAI/SAI-Tutoria.git
cd SAI-Tutoria
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno 🔑
El proyecto requiere un archivo `.env` para conectarse a la API. Dado que este archivo contiene información sensible, no se incluye en el repositorio.

1. En la raíz del proyecto, crea un archivo llamado `.env`.
2. Copia el contenido de `.env.example` o pega lo siguiente:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```
   *Nota: Asegúrate de que la URL apunte a tu servidor backend local o de producción.*

### 4. Ejecutar en desarrollo
```bash
npm run dev
```


