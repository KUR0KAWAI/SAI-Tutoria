import { useState, useEffect, useMemo } from 'react';

import { tutoriasService } from '../services/tutoriasService';
import { notaParcialService } from '../services/notaParcialService';
import type {
    EstudianteRiesgoDto,
    TutoriaDto
} from '../models/entities';

import './AsignarTutoriasPage.css';

interface AlertState {
    type: 'success' | 'error' | null;
    message: string;
}

const AsignarTutoriasPage = () => {
    // Selectors Data
    const [allPeriodoSemestres, setAllPeriodoSemestres] = useState<any[]>([]);

    // Filter Selection
    const [selPeriodo, setSelPeriodo] = useState('');
    const [selSemestre, setSelSemestre] = useState('');

    // DERIVED DATA (Reactive)
    const periodos = useMemo(() => {
        const pMap = new Map();
        allPeriodoSemestres.forEach(item => {
            const pid = String(item.periodoId);
            if (!pMap.has(pid)) {
                pMap.set(pid, { id: pid, nombre: item.periodo_nombre });
            }
        });
        return Array.from(pMap.values());
    }, [allPeriodoSemestres]);

    const semestres = useMemo(() => {
        if (!selPeriodo) return [];
        return allPeriodoSemestres
            .filter(p => String(p.periodoId) === selPeriodo)
            .map(p => ({
                id: String(p.semestreperiodoid),
                nivel: p.nivel
            }));
    }, [allPeriodoSemestres, selPeriodo]);

    // Results Data
    const [candidatos, setCandidatos] = useState<EstudianteRiesgoDto[]>([]);
    const [historial, setHistorial] = useState<TutoriaDto[]>([]);

    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState<AlertState>({ type: null, message: '' });


    // Collapsible States


    const [openSections, setOpenSections] = useState({
        Matutina: true,
        Vespertina: true,
        Nocturna: true
    });

    // Initial Load
    useEffect(() => {
        let isMounted = true;
        const loadInit = async () => {
            console.log('%c[AsignarTutoriasPage] Montando - Solicitando Periodos, Estudiantes y Calificaciones...', 'color: #f59e0b; font-weight: bold');
            setIsLoading(true);
            try {
                const psData = await notaParcialService.getPeriodos();
                if (!isMounted) return;
                setAllPeriodoSemestres(psData);

                // Auto-selection for Period
                const pMap = new Map();
                psData.forEach((item: any) => {
                    const pid = String(item.periodoId);
                    if (!pMap.has(pid)) pMap.set(pid, item);
                });

                if (pMap.size === 1) {
                    const firstPeriodId = Array.from(pMap.keys())[0];
                    setSelPeriodo(firstPeriodId);
                }

                // Load history
                loadHistorial();
            } catch (err) {
                console.error(err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        loadInit();
        return () => { isMounted = false; };
    }, []);


    const loadHistorial = async () => {
        try {
            const hist = await tutoriasService.getHistorialAsignaciones();
            setHistorial(hist);
        } catch (err) {
            console.error("Error loading history", err);
        }
    };

    // Filter Logic
    const handleSearch = async () => {
        if (!selPeriodo || !selSemestre) return;
        setIsLoading(true);
        setAlert({ type: null, message: '' });
        try {
            const results = await tutoriasService.getCandidatosRiesgo(selSemestre);

            setCandidatos(results);
            if (results.length === 0) {
                showAlert('success', 'No se encontraron estudiantes en riesgo para este nivel.');
            }
        } catch (err) {
            showAlert('error', 'Error al cargar estudiantes.');
        } finally {
            setIsLoading(false);
        }
    };

    // Assign Logic
    const handleAssign = async (student: EstudianteRiesgoDto) => {
        if (!confirm(`¿Asignar tutoría a ${student.alumnoNombre}? Se enviará un correo de notificación.`)) return;


        try {
            setIsLoading(true);

            // 1. Save assignment
            await tutoriasService.asignarTutoria({
                alumnoid: student.alumnoId,
                asignaturaid: student.asignaturaId,
                profesorid: student.profesorId,
                seccionid: student.seccionId,
                notaid: student.notaid || 0,
                fecha: new Date().toISOString().split('T')[0]
            });



            // 2. Send Email
            if (student.email) {
                await tutoriasService.enviarCorreoNotificacion(student.email);
            }

            // 3. Update Lists
            // Remove from candidates
            setCandidatos(prev => prev.filter(c => c.id !== student.id));
            // Add to history (reload)
            await loadHistorial();

            showAlert('success', `Tutoría asignada a ${student.alumnoNombre} y correo enviado.`);
        } catch (err) {
            showAlert('error', 'Error al asignar tutoría o enviar correo.');
        } finally {
            setIsLoading(false);
        }
    };
    const handleResendEmail = async (tutoria: TutoriaDto) => {
        if (!confirm(`¿Reenviar notificación por correo a ${tutoria.alumno_nombre || tutoria.alumnoNombre}?`)) return;
        try {
            // Use existing email from student info if available, otherwise mock-replacement
            const studentName = tutoria.alumno_nombre || tutoria.alumnoNombre || 'Estudiante';
            await tutoriasService.enviarCorreoNotificacion(studentName.toLowerCase().replace(' ', '.') + "@utb.edu.ec");
            showAlert('success', 'Correo reenviado exitosamente.');
        } catch (err) {
            showAlert('error', 'No se pudo enviar el correo.');
        }
    };

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };


    const showAlert = (type: 'success' | 'error', message: string) => {

        setAlert({ type, message });
        setTimeout(() => setAlert({ type: null, message: '' }), 5000); // Auto dismiss
    };

    // Grouping by Jornada/Seccion
    const groupedStudents = {
        Matutina: candidatos.filter(c => c.jornada === 'Matutina' || c.seccionNombre === 'Mañana'),
        Vespertina: candidatos.filter(c => c.jornada === 'Vespertina' || c.seccionNombre === 'Tarde'),
        Nocturna: candidatos.filter(c => c.jornada === 'Nocturna' || c.seccionNombre === 'Noche')
    };


    const renderCandidateTable = (students: EstudianteRiesgoDto[]) => (
        <div className="table-responsive">
            <table className="custom-table">
                <thead>
                    <tr>
                        <th>Alumno</th>
                        <th>Asignatura</th>
                        <th>Nota P1</th>
                        <th>Profesor</th>
                        <th>Acción</th>


                    </tr>
                </thead>
                <tbody>
                    {students.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center' }}>No hay estudiantes en esta jornada.</td></tr>
                    ) : (


                        students.map(st => (
                            <tr key={st.id}>
                                <td>{st.alumnoNombre}</td>
                                <td>{st.asignaturaNombre}</td>
                                <td style={{ color: '#C53030', fontWeight: 'bold' }}>{st.notaP1}</td>
                                <td>{st.profesorNombre}</td>
                                <td>
                                    <button className="btn-assign" onClick={() => handleAssign(st)}>
                                        <i className="bi bi-check-circle"></i> Asignar
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="asignar-tutorias-page">
            <div className="page-header-styled">
                <div className="header-title-row">
                    <h2 className="page-title">Página Asignar Tutorías</h2>
                </div>
                <div className="breadcrumb">Módulo de Tutorías - Asignar Tutorías</div>

                <div className="message-area">
                    {alert.type && (
                        <div className={`alert-box alert-${alert.type}`}>
                            <i className={`bi ${alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
                            {alert.message}
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Section */}
            <div className="filter-card">
                <div className="card-header-styled">
                    <h3><i className="bi bi-funnel"></i> Criterios de Búsqueda</h3>
                </div>
                <div className="filters-grid">
                    <div className="filter-group">
                        <label>Periodo Académico</label>
                        <select className="form-select" value={selPeriodo} onChange={e => setSelPeriodo(e.target.value)}>
                            <option value="">Seleccione Periodo</option>
                            {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Nivel / Semestre</label>
                        <select className="form-select" value={selSemestre} onChange={e => setSelSemestre(e.target.value)}>
                            <option value="">Seleccione Nivel</option>
                            {semestres.map(s => <option key={s.id} value={s.id}>{s.nivel}</option>)}
                        </select>
                    </div>
                    <button
                        className="btn-filter"
                        onClick={handleSearch}
                        disabled={!selPeriodo || !selSemestre || isLoading}
                    >
                        {isLoading ? 'Buscando...' : 'Mostrar Estudiantes'}
                    </button>
                </div>
            </div>

            {/* Results Section */}
            <div className="results-card">
                <div className="card-header-styled">
                    <h3><i className="bi bi-people"></i> Estudiantes en Riesgo </h3>
                </div>

                {/* Jornada Sections */}
                {(['Matutina', 'Vespertina', 'Nocturna'] as const).map(jornada => (
                    <div className="jornada-section" key={jornada}>
                        <div className="jornada-header" onClick={() => toggleSection(jornada)}>
                            <div className="jornada-title">
                                <span className={`toggle-icon ${openSections[jornada] ? 'open' : ''}`}>
                                    <i className="bi bi-chevron-down"></i>
                                </span>
                                {jornada}
                                <span className="badge-count">
                                    {groupedStudents[jornada].length}
                                </span>
                            </div>
                        </div>
                        <div className={`jornada-content ${openSections[jornada] ? 'open' : ''}`}>
                            {renderCandidateTable(groupedStudents[jornada])}
                        </div>
                    </div>
                ))}
            </div>

            {/* History Section */}
            <div className="history-card">
                <div className="card-header-styled">
                    <h3><i className="bi bi-clock-history"></i> Tutorías Ya Asignadas</h3>
                </div>
                <div className="table-responsive">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Alumno</th>
                                <th>Profesor</th>
                                <th>Asignatura</th>
                                <th>Fecha</th>
                                <th>Objetivo</th>
                                <th>Observaciones</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historial.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>No hay historial de asignaciones.</td></tr>
                            ) : (
                                historial.map(hist => (
                                    <tr key={hist.id}>
                                        <td>{hist.alumno_nombre || hist.alumnoNombre}</td>
                                        <td>{hist.profesor_nombre || hist.profesorNombre}</td>
                                        <td>{hist.asignatura_nombre || hist.asignaturaNombre}</td>
                                        <td>{hist.fechatutoria || hist.fecha}</td>
                                        <td>{hist.objetivotutoria || '-'}</td>

                                        <td>{hist.observaciones || '-'}</td>
                                        <td>
                                            <span className={`status-badge status-${(hist.estado_nombre || '').toLowerCase()}`}>
                                                {hist.estado_nombre || 'Pendiente'}
                                            </span>
                                        </td>

                                        <td>
                                            <button className="btn-notify" onClick={() => handleResendEmail(hist)}>
                                                <i className="bi bi-envelope"></i> Reenviar Aviso
                                            </button>
                                        </td>
                                    </tr>
                                ))

                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AsignarTutoriasPage;
