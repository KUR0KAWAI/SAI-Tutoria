import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { ROUTES } from '../core/routesConfig';
import RequireAuth from '../auth/RequireAuth';
import MainLayout from '../Layout/MainLayout';

// Pages
import LoginPage from '../Pages/LoginPage';
import InicioPage from '../Pages/InicioPage';
import LoadingScreen from '../Pages/LoadingScreen';
import NotaParcialPage from '../Pages/NotaParcialPage';
import DisabledFeaturePage from '../Pages/DisabledFeaturePage';
import UsuariosPage from '../Pages/UsuariosPage';
import AsignarTutoriasPage from '../Pages/AsignarTutoriasPage';
import CronogramaAnexosPage from '../Pages/CronogramaAnexosPage';

import ReporteTutoriasPage from '../Pages/ReporteTutoriasPage';
import EstadisticasTutoriasPage from '../Pages/EstadisticasTutoriasPage';

const AppRouter = () => {
    const { isLoading, user } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path={ROUTES.LOGIN} element={user ? <Navigate to={ROUTES.INICIO} replace /> : <LoginPage />} />

                {/* Protected Routes */}
                <Route element={<RequireAuth />}>
                    <Route path="/" element={<Navigate to={ROUTES.INICIO} replace />} />

                    {/* Active Feature Routes */}
                    <Route path={ROUTES.INICIO} element={<MainLayout><InicioPage /></MainLayout>} />
                    <Route path={ROUTES.NOTA_PARCIAL} element={<MainLayout><NotaParcialPage /></MainLayout>} />
                    <Route path={ROUTES.USUARIOS} element={<MainLayout><UsuariosPage /></MainLayout>} />
                    <Route path={ROUTES.ASIGNAR_TUTORIAS} element={<MainLayout><AsignarTutoriasPage /></MainLayout>} />
                    <Route path={ROUTES.CRONOGRAMA_ANEXOS} element={<MainLayout><CronogramaAnexosPage /></MainLayout>} />
                    <Route path={ROUTES.VISUALIZACION_TUTORIAS} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.GRAFICOS_DW} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.ESTADISTICAS_TUTORIAS} element={<MainLayout><EstadisticasTutoriasPage /></MainLayout>} />
                    <Route path={ROUTES.REPORTE_TUTORIAS} element={<MainLayout><ReporteTutoriasPage /></MainLayout>} />

                    {/* Disabled Feature Routes */}
                    <Route path={ROUTES.FICHA_REGISTRO} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.CONTRATOS} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.EVALUACION_INTEGRAL} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.COMPETENCIAS} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.DISTRIBUIDOR} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.REGISTRAR_EVALUADOR} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.HORARIOS_CLASES} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.HORARIOS_SINCRONICOS} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.NOMINA_ESTUDIANTES} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.CORRECCION_NOTAS} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.ATRASO_NOTAS} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.ACTAS_NOTAS} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.ACTAS_NOTAS_FIRMA} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.BIBLIOTECA} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.BIBLIOTECAS_VIRTUALES} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.ASISTENCIA} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.PROGRAMA_ANALITICO} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.SILABO_ASIGNATURA} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.SEGUIMIENTO_SILABO} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.REPORTE_PLAN_ANALITICO} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.CUMPLIMIENTO_SEGUIMIENTO} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.MODULO_PRACTICAS} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                    <Route path={ROUTES.MODULO_VINCULACION} element={<MainLayout><DisabledFeaturePage /></MainLayout>} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to={ROUTES.INICIO} replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
