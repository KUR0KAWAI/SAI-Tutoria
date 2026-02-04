import { useAuth } from '../auth/useAuth';
import './InicioPage.css';

const InicioPage = () => {
    const { user } = useAuth();

    return (
        <div className="inicio-page">
            <div className="inicio-header">
                <div className="header-title-row">
                    <h2 className="page-title">Página Principal</h2>
                    <span className="page-subtitle">Perfil Docentes</span>
                </div>
                <div className="breadcrumb">Inicio · Perfil ·</div>
            </div>

            <div className="inicio-grid">
                {/* Lateral Sidebar */}
                <div className="profile-sidebar">
                    <div className="card teacher-card">
                        <div className="teacher-avatar">
                            <img
                                src="https://sai.utb.edu.ec/aplicaciones/estudiantes/recursos/fotos/usuario.jpg?889019"
                                alt="Foto Profesor"
                            />
                        </div>
                        <h3 className="teacher-name">{user?.fullName || 'Nombre del Profesor'}</h3>
                        <span className="teacher-role">{user?.role || 'DOCENTE'}</span>

                        <div className="teacher-chips">
                            {user?.roles && user.roles.length > 0 ? (
                                user.roles.map((r, idx) => (
                                    <span key={idx} className="chip">{r}</span>
                                ))
                            ) : (
                                <span className="chip">{user?.role || 'Docente'}</span>
                            )}
                        </div>

                        <ul className="teacher-internal-menu">
                            <li className="menu-item active">
                                <i className="bi bi-person"></i> Perfil Docentes
                            </li>
                            <li className="menu-item">
                                <i className="bi bi-gear"></i> Configuración de la Cuenta
                            </li>
                            <li className="menu-item">
                                <i className="bi bi-check2-square"></i> Tareas
                            </li>
                            <li className="menu-item">
                                <i className="bi bi-question-circle"></i> Ayuda
                            </li>
                        </ul>
                    </div>

                    <div className="card links-small-card">
                        <a href="https://utb.edu.ec" target="_blank" rel="noreferrer" className="small-link">
                            <i className="bi bi-globe"></i> www.utb.edu.ec
                        </a>
                        <div className="small-link">
                            <i className="bi bi-laptop"></i> Servicios Académicos
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="dashboard-content">
                    {/* Bibliotecas Card */}
                    <div className="card dashboard-card">
                        <div className="card-header-green">
                            <div className="header-text">
                                <h3>BIBLIOTECAS</h3>
                                <span>Universidad Técnica de Babahoyo</span>
                            </div>
                            <i className="bi bi-book"></i>
                        </div>
                        <div className="card-body">
                            <div className="biblioteca-grid">
                                <div className="biblio-item">
                                    <img src="https://sai.utb.edu.ec/aplicaciones/estudiantes/images/biblioteca/horarios.png" alt="Horarios" />
                                    <span>HORARIOS BIBLIOTECAS</span>
                                </div>
                                <div className="biblio-item">
                                    <img src="https://sai.utb.edu.ec/aplicaciones/estudiantes/images/biblioteca/catalogo.png" alt="Catálogo" />
                                    <span>CATÁLOGO DE LIBROS</span>
                                </div>
                                <div className="biblio-item">
                                    <img src="https://sai.utb.edu.ec/aplicaciones/estudiantes/images/biblioteca/prestamos.png" alt="Préstamos" />
                                    <span>PRÉSTAMOS REALIZADOS</span>
                                </div>
                                <div className="biblio-item">
                                    <img src="https://sai.utb.edu.ec/aplicaciones/estudiantes/images/biblioteca/historial.png" alt="Historial" />
                                    <span>HISTORIAL DE PRÉSTAMO</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Misión & Visión */}
                    <div className="mision-vision-row">
                        <div className="card dashboard-card flex-1">
                            <div className="card-header-green">
                                <h3>MISIÓN</h3>
                                <i className="bi bi-flag"></i>
                            </div>
                            <div className="card-body card-text">
                                La Universidad Técnica de Babahoyo es un centro de Educación Superior que genera, aplica y difunde la formación profesional competente y humanista a través de las funciones sustantivas, socialmente responsable, para elevar la calidad de vida de la sociedad y su entorno ecológico ambiental.
                            </div>
                        </div>
                        <div className="card dashboard-card flex-1">
                            <div className="card-header-green">
                                <h3>VISIÓN</h3>
                                <i className="bi bi-eye"></i>
                            </div>
                            <div className="card-body card-text">
                                La Universidad Técnica de Babahoyo al 2025, será una Institución de Educación Superior con liderazgo y acreditación nacional, integrada al desarrollo de la sociedad, impulsando la academia, investigación y vinculación; comprometida con la innovación y el emprendimiento, y la práctica de los valores morales, éticos y cívicos.
                            </div>
                        </div>
                    </div>

                    {/* Contáctenos */}
                    <div className="card dashboard-card">
                        <div className="card-header-green">
                            <div className="header-text">
                                <h3>CONTÁCTENOS</h3>
                                <span>Universidad Técnica de Babahoyo</span>
                            </div>
                            <i className="bi bi-geo-alt"></i>
                        </div>
                        <div className="card-body no-padding">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.5912444146313!2d-79.51341062503253!3d-1.8012069981816738!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902d1396b12a873d%3A0x6e2f4f2a336fba2!2sUniversidad%20T%C3%A9cnica%20de%20Babahoyo!5e0!3m2!1ses-419!2sec!4v1700000000000!5m2!1ses-419!2sec"
                                width="100%"
                                height="250"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>

                    {/* Footer Enlaces */}
                    <div className="card dashboard-card">
                        <div className="card-header-green">
                            <div className="header-text">
                                <h3>ENLACES DE INTERÉS</h3>
                                <span>Universidad Técnica de Babahoyo</span>
                            </div>
                            <i className="bi bi-link-45deg"></i>
                        </div>
                        <div className="card-body">
                            <div className="enlaces-grid">
                                <div className="enlaces-col col-1">
                                    <img src="https://sai.utb.edu.ec/aplicaciones/estudiantes/images/gobierno/ces.png" alt="CES" />
                                    <img src="https://sai.utb.edu.ec/aplicaciones/estudiantes/images/gobierno/senplades.png" alt="Senplades" />
                                </div>
                                <div className="enlaces-col">
                                    <img src="https://sai.utb.edu.ec/aplicaciones/estudiantes/images/gobierno/ceaaces.png" alt="Ceaaces" />
                                </div>
                                <div className="enlaces-col">
                                    <img src="https://sai.utb.edu.ec/aplicaciones/estudiantes/images/gobierno/nivelacion.png" alt="Nivelación" />
                                </div>
                                <div className="enlaces-col">
                                    <img src="https://sai.utb.edu.ec/aplicaciones/estudiantes/images/gobierno/senescyt.png" alt="Senescyt" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InicioPage;
