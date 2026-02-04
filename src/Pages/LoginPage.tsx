import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { authService } from '../services/authService';
import { ROUTES } from '../core/routesConfig';
import EmptyLayout from '../Layout/EmptyLayout';
import './LoginPage.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const response = await authService.login(username, password);
            login(response.user, response.token);
            navigate(ROUTES.INICIO);
        } catch (err: any) {
            console.error('Login error detailed:', err.response?.data);
            const backendError = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data);
            setError(backendError || err.message || 'Error al iniciar sesión');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <EmptyLayout>
            <div className="login-page-container">
                {/* Capa de Navegación (Header) - Siempre visible arriba */}
                <header className="login-header">
                    <div className="header-left">
                        <a href="https://utb.edu.ec/manuales" target="_blank" rel="noreferrer" className="manuals-link">
                            MANUALES SISTEMA ACADÉMICO INTEGRADO DE LA UTB
                        </a>
                    </div>
                    <div className="header-right">
                        <img src="https://sai.utb.edu.ec/images/LOGO_UNIVERSIDAD.png" alt="Logo Universidad" className="university-logo" />
                    </div>
                </header>

                {/* CAPA 1: Fondo (Slideshow) */}
                <div className="login-background-slideshow"></div>

                {/* CAPA 2: Cuadro negro translúcido (Mesh overlay) */}
                <div className="login-mesh-overlay"></div>

                {/* CAPA 3: Formulario (Content Layer) */}
                <main className="login-content-layer">
                    <div className="login-form-panel animate-fade-in-up">
                        <h2 className="login-title-green">INICIO DE SESIÓN</h2>

                        <div className="info-box">
                            <p><strong>Estimados usuarios,</strong></p>
                            <p>En caso de tener problemas con alguna opción del Sistema Académico Integral (SAI-UTB), borre todo el historial de su navegador, luego proceda a cerrarlo y vuelva a intentarlo.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="login-form-new">
                            <div className="input-group-new">
                                <label>Usuario</label>
                                <div className="input-wrapper-new">
                                    <i className="bi bi-person-fill"></i>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Ingrese su usuario"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group-new">
                                <label>Contraseña</label>
                                <div className="input-wrapper-new">
                                    <i className="bi bi-lock-fill"></i>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <i
                                        className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'} password-toggle`}
                                        onClick={() => setShowPassword(!showPassword)}
                                    ></i>
                                </div>
                            </div>

                            {error && <div className="login-error-msg">{error}</div>}

                            <button type="submit" className="login-btn-new" disabled={isSubmitting}>
                                {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
                            </button>
                        </form>

                        <div className="login-footer-actions">
                            <button className="action-pill" type="button">¿Olvidó su Contraseña?</button>
                            <button className="action-pill" type="button">Solicitar Usuario</button>
                        </div>
                    </div>
                </main>
            </div>
        </EmptyLayout>
    );
};

export default LoginPage;
