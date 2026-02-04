import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import NotificationBell from '../components/NotificationBell/NotificationBell';
import './HeaderNav.css';

interface HeaderNavProps {
    toggleSidebar: () => void;
}

const HeaderNav = ({ toggleSidebar }: HeaderNavProps) => {
    const { user, logout } = useAuth();

    return (
        <header className="header-nav">
            <div className="header-left">
                <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
                    <i className="bi bi-list"></i>
                </button>
                <Link to="/" className="logo-link">
                    <img
                        src="https://sai.utb.edu.ec/aplicaciones/estudiantes/images/layout4/Saidutb-Logo.png"
                        alt="SAI UTB Logo"
                        className="header-logo"
                    />
                </Link>
            </div>

            <div className="header-right">
                <NotificationBell />
                <div className="user-profile-group">
                    <div className="user-info-text">
                        <span className="user-display-name">
                            {user ? user.fullName : 'Cargando...'}
                        </span>
                    </div>
                    <div className="user-avatar-wrapper">
                        <img
                            src="https://sai.utb.edu.ec/aplicaciones/estudiantes/recursos/fotos/usuario.jpg?889019"
                            alt="User"
                            className="header-user-avatar"
                        />
                    </div>

                    {/* Dropdown Menu */}
                    <div className="header-dropdown">
                        <div className="dropdown-item" onClick={() => console.log('Perfil')}>
                            <i className="bi bi-person"></i>
                            <span>Mi Perfil</span>
                        </div>
                        <div className="dropdown-item" onClick={() => console.log('Cambiar')}>
                            <i className="bi bi-people"></i>
                            <span>Cambiar Usuario</span>
                        </div>
                        <div className="dropdown-item" onClick={logout}>
                            <i className="bi bi-lock"></i>
                            <span>Cerrar Sesión</span>
                        </div>
                        <div className="dropdown-item" onClick={logout}>
                            <i className="bi bi-key"></i>
                            <span>Salir</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default HeaderNav;
