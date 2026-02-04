import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../auth/useAuth';
import { tutoriasService } from '../services/tutoriasService';
import { notaParcialService } from '../services/notaParcialService';
import { documentService } from '../services/documentService';
import TutoriaModal from '../components/TutoriaModal';
import './ReporteTutoriasPage.css';

const ReporteTutoriasPage = () => {
    const { user } = useAuth();

    // --- States for Section 1: Tutorías Obligatorias ---
    const [periodos, setPeriodos] = useState<any[]>([]);
    const [selPeriodo, setSelPeriodo] = useState('');
    const [selSemestre, setSelSemestre] = useState('');
    const [estudiantesRiesgo, setEstudiantesRiesgo] = useState<any[]>([]);
    const [loadingRiesgo, setLoadingRiesgo] = useState(false);
    const [selectedEstudiante, setSelectedEstudiante] = useState<any>(null);

    // --- States for Section 2: Subir Reporte ---
    const [formPeriodo, setFormPeriodo] = useState('');
    const [formSemestre, setFormSemestre] = useState('');
    // formAsignatura will now store "asignaturaId|seccionId"
    const [formAsignaturaVal, setFormAsignaturaVal] = useState('');
    const [docenteAsignaturas, setDocenteAsignaturas] = useState<any[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [tiposDocumento, setTiposDocumento] = useState<any[]>([]);
    const [formTipoDocumento, setFormTipoDocumento] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

    // New state for cronogramas to find the correct ID
    const [cronogramas, setCronogramas] = useState<any[]>([]);

    // --- States for Section 3: Mis Reportes ---
    const [misReportes, setMisReportes] = useState<any[]>([]);

    // --- Derived Data ---
    const uniquePeriodos = useMemo(() => {
        const pMap = new Map();
        periodos.forEach(item => {
            // Use the raw periodoid from the API response
            const pid = String(item.periodoid || item.periodoId || item.id);
            if (!pMap.has(pid)) {
                pMap.set(pid, {
                    id: pid,
                    nombre: item.periodo_nombre || item.nombre
                });
            }
        });
        return Array.from(pMap.values());
    }, [periodos]);

    const semestres = useMemo(() => {
        if (!selPeriodo) return [];
        return periodos
            .filter(p => String(p.periodoid || p.periodoId || p.id) === selPeriodo)
            .map(p => ({
                id: String(p.semestreperiodoid || p.id),
                nivel: p.nivel || `Nivel ${p.semestreid || p.semestreId}`
            }));
    }, [periodos, selPeriodo]);

    const formSemestres = useMemo(() => {
        if (!formPeriodo) return [];
        return periodos
            .filter(p => String(p.periodoid || p.periodoId || p.id) === formPeriodo)
            .map(p => ({
                id: String(p.semestreperiodoid || p.id),
                nivel: p.nivel || `Nivel ${p.semestreid || p.semestreId}`
            }));
    }, [periodos, formPeriodo]);

    // --- Effects ---
    useEffect(() => {
        loadInitialData();
        loadMisReportes(); // Habilitado: GET /api/documentos ya es funcional
    }, []);

    // Load subjects when formPeriodo or formSemestre changes
    useEffect(() => {
        const fetchAsignaturas = async () => {
            if (formPeriodo && formSemestre && user) {
                setLoadingSubjects(true);
                try {
                    const profesorId = user.profesorId || user.id; // Fallback
                    if (profesorId) {
                        const subjects = await tutoriasService.getAsignaturasDocente(
                            formSemestre,
                            String(profesorId)
                        );
                        setDocenteAsignaturas(subjects);
                    }
                } catch (error) {
                    console.error("Error fetching subjects:", error);
                    setDocenteAsignaturas([]);
                } finally {
                    setLoadingSubjects(false);
                }
            } else {
                setDocenteAsignaturas([]);
            }
        };
        fetchAsignaturas();
    }, [formPeriodo, formSemestre, user]);

    const loadInitialData = async () => {
        try {
            const [psData, tiposData, cronoData] = await Promise.all([
                notaParcialService.getPeriodos(),
                tutoriasService.getTiposDocumentoReporte(),
                tutoriasService.getCronograma()
            ]);
            setPeriodos(psData);
            setTiposDocumento(tiposData);
            setCronogramas(cronoData);
        } catch (error) {
            console.error("Error loading initial data:", error);
        }
    };

    const loadMisReportes = async () => {
        try {
            const response = await documentService.getDocuments();
            // Assuming the API returns documentation list in response.data or response is the list
            const data = Array.isArray(response) ? response : (response.data || []);
            setMisReportes(data);
        } catch (error) {
            console.error("Error loading reports:", error);
        }
    };

    // --- Section 1 Handlers ---
    const handleListarFormatos = async () => {
        if (!selSemestre || !user) return;
        setLoadingRiesgo(true);
        try {
            const profesorId = user.profesorId || user.id;
            if (profesorId) {
                const data = await tutoriasService.getEstudiantesRiesgo(selSemestre, String(profesorId));
                setEstudiantesRiesgo(data);
            }
        } catch (error) {
            console.error("Error loading risk students:", error);
            setEstudiantesRiesgo([]);
        } finally {
            setLoadingRiesgo(false);
        }
    };

    // --- Section 2 Handlers (Drag & Drop) ---
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'application/pdf') {
            setFile(droppedFile);
        } else {
            alert("Solo se permiten archivos PDF.");
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
        } else {
            alert("Solo se permiten archivos PDF.");
        }
    };

    const handleSaveReporte = async () => {
        if (!formPeriodo || !formSemestre || !formAsignaturaVal || !formTipoDocumento || !file) {
            alert("Por favor complete todos los campos y suba un archivo.");
            return;
        }

        // Logic to find cronogramaId
        // Needs to match periodoid AND tipodocumentoid
        // formPeriodo is ID from periodos list (likely unique period ID or similar)
        // But checking uniquePeriodos logic: pid = item.periodoId.
        // Let's assume formPeriodo is the actual DB ID for period.

        const selectedCronograma = cronogramas.find(c =>
            String(c.periodoid) === formPeriodo &&
            String(c.tipodocumentoid) === formTipoDocumento
        );

        if (!selectedCronograma) {
            alert("No se encontró un cronograma activo para este periodo y tipo de documento.");
            return;
        }

        // Parse asignaturaId and seccionId
        const [asignaturaId, seccionId] = formAsignaturaVal.split('|');

        // formSemestre contains the semestreperiodoid, which is now passed correctly to the service
        const semestrePeriodoId = Number(formSemestre);

        setUploading(true);
        try {
            const response = await documentService.uploadDocument(
                file,
                selectedCronograma.cronogramaid,
                Number(asignaturaId),
                Number(formTipoDocumento),
                semestrePeriodoId,
                Number(seccionId)
            );

            alert(response.message || "Documento subido correctamente.");
            setFile(null);
            setFormAsignaturaVal('');
            setFormTipoDocumento('');

            const fileInput = document.getElementById('fileInput') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            loadMisReportes(); // Refresh list enabled
        } catch (error: any) {
            console.error("Error saving report:", error);
            const errorMsg = error.response?.data?.message || "Error al subir el documento. Verifique los datos e intente nuevamente.";
            alert(errorMsg);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="reporte-tutorias-page">
            <div className="page-header-styled">
                <h2 className="page-title">Reporte de Tutorías</h2>
                <div className="breadcrumb">Gestión Académica - Reporte de Tutorías</div>
            </div>

            {/* SECTION 1: Tutorías Obligatorias */}
            <div className="card-section">
                <div className="card-header-styled">
                    <h3>Tutorías Obligatorias</h3>
                </div>
                <div className="card-body">
                    <div className="filters-grid">
                        <div className="filter-group">
                            <label>Periodo Académico</label>
                            <select className="form-select" value={selPeriodo} onChange={e => setSelPeriodo(e.target.value)}>
                                <option value="">-- Seleccione --</option>
                                {uniquePeriodos.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Nivel</label>
                            <select className="form-select" value={selSemestre} onChange={e => setSelSemestre(e.target.value)}>
                                <option value="">-- Seleccione --</option>
                                {semestres.map(s => (
                                    <option key={s.id} value={s.id}>{s.nivel}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label style={{ visibility: 'hidden' }}>Align</label>
                            <button className="btn-primary" onClick={handleListarFormatos} disabled={loadingRiesgo || !selSemestre}>
                                {loadingRiesgo ? 'Cargando...' : 'Listar Estudiantes'}
                            </button>
                        </div>
                    </div>

                    {estudiantesRiesgo.length > 0 && (
                        <div className="table-responsive mt-4">
                            <table className="custom-table" style={{ marginTop: '20px' }}>
                                <thead>
                                    <tr>
                                        <th>Estudiante</th>
                                        <th>Asignatura</th>
                                        <th>Sección</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {estudiantesRiesgo.map((est, idx) => (
                                        <tr key={est.id || idx}>
                                            <td>{est.alumnoNombre}</td>
                                            <td>{est.asignaturaNombre}</td>
                                            <td>{est.seccionNombre}</td>
                                            <td>
                                                <button
                                                    className="btn-icon-action"
                                                    onClick={() => setSelectedEstudiante(est)}
                                                    title={est.tieneTutoria ? "Ver Gestión" : "Registrar Tutoría"}
                                                >
                                                    {est.tieneTutoria ? (
                                                        <><i className="bi bi-eye"></i> Ver</>
                                                    ) : (
                                                        <><i className="bi bi-plus-circle"></i> Registrar Tutoría</>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Gestión */}
            {selectedEstudiante && (
                <TutoriaModal
                    estudiante={selectedEstudiante}
                    onClose={() => setSelectedEstudiante(null)}
                    onUpdate={() => {
                        handleListarFormatos();
                    }}
                />
            )}

            {/* SECTION 2: Subir Reporte */}
            <AnimatePresence>
                <div className="card-section">
                    <div className="card-header-styled">
                        <h3>Subir reporte de tutoría</h3>
                    </div>
                    <div className="card-body">
                        <div className="filters-grid mb-4" style={{ marginBottom: '20px' }}>
                            <div className="filter-group">
                                <label>Periodo</label>
                                <select className="form-select" value={formPeriodo} onChange={e => setFormPeriodo(e.target.value)}>
                                    <option value="">-- Seleccione --</option>
                                    {uniquePeriodos.map(p => (
                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Nivel</label>
                                <select className="form-select" value={formSemestre} onChange={e => setFormSemestre(e.target.value)}>
                                    <option value="">-- Seleccione --</option>
                                    {formSemestres.map(s => (
                                        <option key={s.id} value={s.id}>{s.nivel}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Asignatura</label>
                                <select
                                    className="form-select"
                                    value={formAsignaturaVal}
                                    onChange={e => setFormAsignaturaVal(e.target.value)}
                                    disabled={loadingSubjects || !formSemestre}
                                >
                                    <option value="">-- Seleccione --</option>
                                    {docenteAsignaturas.map(asig => (
                                        <option key={`${asig.asignaturaid}-${asig.seccionid}`} value={`${asig.asignaturaid}|${asig.seccionid}`}>
                                            {asig.nombre} - {asig.seccion_nombre}
                                        </option>
                                    ))}
                                </select>
                                {loadingSubjects && <small className="text-muted loading-helper">Cargando asignaturas...</small>}
                            </div>
                            <div className="filter-group">
                                <label>Tipo de Documento</label>
                                <select className="form-select" value={formTipoDocumento} onChange={e => setFormTipoDocumento(e.target.value)}>
                                    <option value="">-- Seleccione --</option>
                                    {tiposDocumento.map(td => (
                                        <option key={td.tipodocumentoid} value={td.tipodocumentoid}>
                                            {td.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="upload-area">
                            <label className="filter-group mb-2" style={{ display: 'none' }}>
                                {/* Label hidden as requested in previous iterations or purely optional */}
                                <label>URL (Opcional)</label>
                                <input type="text" className="form-input" placeholder="https://..." />
                            </label>

                            <motion.div
                                className={`drop-zone ${isDragging ? 'active' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                animate={{ scale: isDragging ? 1.02 : 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <i className="bi bi-cloud-arrow-up"></i>
                                {file ? (
                                    <div className="file-info">
                                        <i className="bi bi-file-earmark-pdf text-danger me-2"></i>
                                        {file.name}
                                    </div>
                                ) : (
                                    <>
                                        <p>Arrastre y suelte el documento PDF aquí</p>
                                        <small>O haga clic para seleccionar</small>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    style={{ display: 'none' }}
                                    id="fileInput"
                                    onChange={handleFileSelect}
                                />
                                <label htmlFor="fileInput" className="btn-primary" style={{ marginTop: '10px', cursor: 'pointer' }}>
                                    Seleccionar Archivo
                                </label>
                            </motion.div>
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <button className="btn-primary" onClick={handleSaveReporte} disabled={uploading}>
                                {uploading ? 'Guardando...' : 'Guardar reporte'}
                            </button>
                        </div>
                    </div>
                </div>
            </AnimatePresence>

            {/* SECTION 3: Mis Reportes */}
            <div className="card-section">
                <div className="card-header-styled">
                    <h3>Mis reportes</h3>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Periodo</th>
                                    <th>Nivel</th>
                                    <th>Asignatura</th>
                                    <th>Formato</th>
                                    <th>Archivo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {misReportes.length === 0 ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center' }}>No hay reportes subidos.</td></tr>
                                ) : (
                                    misReportes.map((rep) => (
                                        <tr key={rep.id}>
                                            <td>{rep.fecha}</td>
                                            <td>{rep.periodo}</td>
                                            <td>{rep.nivel}</td>
                                            <td>{rep.asignatura}</td>
                                            <td>{rep.formato}</td>
                                            <td>
                                                <a
                                                    href={rep.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: '#0d9488', textDecoration: 'none', fontWeight: 'bold' }}
                                                >
                                                    <i className="bi bi-file-earmark-pdf"></i> {rep.archivo}
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReporteTutoriasPage;
