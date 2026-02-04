import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { ROUTES } from '../core/routesConfig';
import { Role } from '../core/roles';
import { useState } from 'react';
import './Sidebar.css';

interface SidebarProps {
    isCollapsed: boolean;
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
    const { user } = useAuth();
    const [isTutoriaOpen, setIsTutoriaOpen] = useState(true);

    const isCoordinador = user?.role === Role.COORDINADOR;
    const isDocente = user?.role === Role.DOCENTE;

    const menuItems = [
        { path: ROUTES.INICIO, label: 'Inicio', icon: 'bi bi-house-door' },
        { path: ROUTES.FICHA_REGISTRO, label: 'Ficha de Registro', icon: 'bi bi-person-circle' },
        { path: ROUTES.CONTRATOS, label: 'Contratos', icon: 'bi bi-file-earmark' },
        { path: ROUTES.EVALUACION_INTEGRAL, label: 'Evaluación Integral Docente', icon: 'bi bi-pencil' },
        { path: ROUTES.COMPETENCIAS, label: 'Evaluación de Competencias', icon: 'bi bi-check-circle' },
        { path: ROUTES.DISTRIBUIDOR, label: 'Distributivo de Docentes', icon: 'bi bi-grid' },
        { path: ROUTES.REGISTRAR_EVALUADOR, label: 'Registrar como Evaluador Interno', icon: 'bi bi-person-plus' },
        { path: ROUTES.HORARIOS_CLASES, label: 'Horarios de Clases', icon: 'bi bi-calendar' },
        { path: ROUTES.HORARIOS_SINCRONICOS, label: 'Horarios Sincrónicos', icon: 'bi bi-clock' },
        { path: ROUTES.NOMINA_ESTUDIANTES, label: 'Nómina de Estudiantes', icon: 'bi bi-person-lines-fill' },
        { path: ROUTES.NOTA_PARCIAL, label: 'Notas Parciales', icon: 'bi bi-bookmarks' },
        { path: ROUTES.CORRECCION_NOTAS, label: 'Corrección de Notas', icon: 'bi bi-pencil-square' },
        { path: ROUTES.ATRASO_NOTAS, label: 'Atraso de Notas', icon: 'bi bi-clock-history' },
        { path: ROUTES.ACTAS_NOTAS, label: 'Actas de Notas', icon: 'bi bi-file-earmark-text' },
        { path: ROUTES.ACTAS_NOTAS_FIRMA, label: 'Actas de Notas con Firma', icon: 'bi bi-file-earmark-check' },
        { path: ROUTES.BIBLIOTECA, label: 'Biblioteca', icon: 'bi bi-book' },
        { path: ROUTES.BIBLIOTECAS_VIRTUALES, label: 'Bibliotecas Virtuales', icon: 'bi bi-cloud' },
        { path: ROUTES.ASISTENCIA, label: 'Asistencia', icon: 'bi bi-check-circle' },
        { path: ROUTES.PROGRAMA_ANALITICO, label: 'Programa Analítico De La Asignatura', icon: 'bi bi-file-earmark' },
        { path: ROUTES.SILABO_ASIGNATURA, label: 'Silabo De La Asignatura', icon: 'bi bi-file-earmark-text' },
        { path: ROUTES.SEGUIMIENTO_SILABO, label: 'Seguimiento Silabo', icon: 'bi bi-arrow-repeat' },
        { path: ROUTES.REPORTE_PLAN_ANALITICO, label: 'Reporte de Plan analítico y Silabo', icon: 'bi bi-graph-up' },
        { path: ROUTES.CUMPLIMIENTO_SEGUIMIENTO, label: 'Cumplimiento y Reporte del Seguimiento Silabo', icon: 'bi bi-check2-square' },
        { path: ROUTES.USUARIOS, label: 'Gestión de Usuarios', icon: 'bi bi-person-lines-fill' },
        { path: ROUTES.MODULO_PRACTICAS, label: 'Módulo Practicas', icon: 'bi bi-briefcase' },
        { path: ROUTES.MODULO_VINCULACION, label: 'Módulo de Vinculación', icon: 'bi bi-link' },
    ];

    const activePaths = [ROUTES.INICIO, ROUTES.NOTA_PARCIAL, ROUTES.USUARIOS];

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'active' : ''} ${!activePaths.includes(item.path) ? 'inactive' : ''}`
                        }
                    >
                        <i className={item.icon}></i>
                        <span>{item.label}</span>
                    </NavLink>
                ))}

                <div className="submenu-container">
                    <button
                        className="nav-item submenu-trigger"
                        onClick={() => setIsTutoriaOpen(!isTutoriaOpen)}
                    >
                        <div className="trigger-content">
                            <i className="bi bi-person-lines-fill"></i>
                            <span>Módulo de Tutorías</span>
                        </div>
                        <i className={`bi bi-chevron-${isTutoriaOpen ? 'up' : 'down'}`}></i>
                    </button>

                    {isTutoriaOpen && (
                        <div className="submenu-list">
                            {(isCoordinador || (user?.roles?.includes(Role.COORDINADOR))) && (
                                <div className="role-group">
                                    <small className="role-label">{Role.COORDINADOR}</small>
                                    <NavLink to={ROUTES.ASIGNAR_TUTORIAS} className={({ isActive }) => `sub-item ${isActive ? 'active' : ''}`}>
                                        <i className="bi bi-pencil-square"></i>
                                        <span>Asignar Tutoría</span>
                                    </NavLink>
                                    <NavLink to={ROUTES.CRONOGRAMA_ANEXOS} className={({ isActive }) => `sub-item ${isActive ? 'active' : ''}`}>
                                        <i className="bi bi-calendar-event"></i>
                                        <span>Cronograma Anexos</span>
                                    </NavLink>
                                    <NavLink to={ROUTES.VISUALIZACION_TUTORIAS} className={({ isActive }) => `sub-item ${isActive ? 'active' : ''}`}>
                                        <i className="bi bi-eye"></i>
                                        <span>Visualización de Tutoría</span>
                                    </NavLink>
                                    <NavLink to={ROUTES.GRAFICOS_DW} className={({ isActive }) => `sub-item ${isActive ? 'active' : ''}`}>
                                        <i className="bi bi-bar-chart-fill"></i>
                                        <span>Gráficos</span>
                                    </NavLink>
                                    <NavLink to={ROUTES.ESTADISTICAS_TUTORIAS} className={({ isActive }) => `sub-item ${isActive ? 'active' : ''}`}>
                                        <i className="bi bi-pie-chart-fill"></i>
                                        <span>Estadísticas Tutoría</span>
                                    </NavLink>
                                </div>
                            )}

                            {(isDocente || (user?.roles?.includes(Role.DOCENTE))) && (
                                <div className="role-group">
                                    <small className="role-label">{Role.DOCENTE}</small>
                                    <NavLink to={ROUTES.REPORTE_TUTORIAS} className={({ isActive }) => `sub-item ${isActive ? 'active' : ''}`}>
                                        <i className="bi bi-file-earmark-text"></i>
                                        <span>Reporte de Tutoría</span>
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
