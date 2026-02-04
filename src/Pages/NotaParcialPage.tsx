import { useState, useEffect, useMemo, useCallback } from 'react';
import { notaParcialService } from '../services/notaParcialService';
import type {
    AsignaturaDto,
    NotaParcialDto,
    AlumnoDto,
    ProfesorDto
} from '../models/entities';
import ActionModal from '../components/ActionModal';
import './NotaParcialPage.css';

// Utility to capitalize first letter of each word
const toTitleCase = (str: string) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
};

const NotaParcialPage = () => {
    // 1. Raw Data from API (The "Source of Truth")
    const [allPeriodoSemestres, setAllPeriodoSemestres] = useState<any[]>([]);
    const [filteredAsignaturas, setFilteredAsignaturas] = useState<AsignaturaDto[]>([]);
    const [secciones, setSecciones] = useState<any[]>([]);
    const [allAlumnos, setAllAlumnos] = useState<AlumnoDto[]>([]);
    const [allProfesores, setAllProfesores] = useState<ProfesorDto[]>([]);
    const [notasRecords, setNotasRecords] = useState<NotaParcialDto[]>([]);

    // 2. Selections
    const [selPeriodo, setSelPeriodo] = useState('');
    const [selSemestre, setSelSemestre] = useState('');
    const [selSeccion, setSelSeccion] = useState('');
    const [selAsignatura, setSelAsignatura] = useState('');
    const [selProfesor, setSelProfesor] = useState('');
    const [selAlumno, setSelAlumno] = useState('');
    const [filtSelPeriodo, setFiltSelPeriodo] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    // 3. Form fields
    const [notaP1, setNotaP1] = useState<string>('');
    const [notaP2, setNotaP2] = useState<string>('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'confirm' | 'error' | 'update' | 'delete' | 'add';
        onConfirm?: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });

    const showModal = (
        title: string,
        message: string,
        type: 'success' | 'confirm' | 'error' | 'update' | 'delete' | 'add' = 'success',
        onConfirm?: () => void
    ) => {
        setModalConfig({ isOpen: true, title, message, type, onConfirm });
    };

    // Simplified closeModal to avoid complex resets during animation
    const handleCloseModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

    // 4. DERIVED DATA (Fast & Reactive)
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

    // 5. Initial Load
    useEffect(() => {
        let isMounted = true;
        const loadInitialData = async () => {
            console.log('%c[NotaParcialPage] Mounting - Requesting Periods, Students and Grades...', 'color: #f59e0b; font-weight: bold');
            setIsLoading(true);
            try {
                // Parallel fetch of independent data
                const [psData, alData, nData] = await Promise.all([
                    notaParcialService.getPeriodos(),
                    notaParcialService.getAlumnos(),
                    notaParcialService.getNotasParciales()
                ]);

                if (!isMounted) return;

                // Sync updates to reduce re-renders
                setAllPeriodoSemestres(psData);
                setAllAlumnos(alData);
                setNotasRecords(nData);

                // Efficient Auto-selection for Period
                const pMap = new Map();
                psData.forEach((item: any) => {
                    const pid = String(item.periodoId);
                    if (!pMap.has(pid)) pMap.set(pid, item);
                });

                if (pMap.size === 1) {
                    const firstPeriodId = Array.from(pMap.keys())[0];
                    setSelPeriodo(firstPeriodId);

                    // Direct Level derivation for single period
                    const matchedLevels = psData
                        .filter((p: any) => String(p.periodoId) === firstPeriodId)
                        .map((p: any) => ({ id: String(p.semestreperiodoid), nivel: p.nivel }));

                    if (matchedLevels.length === 1) {
                        setSelSemestre(matchedLevels[0].id);
                        // Trigger section fetch immediately
                        fetchSections(matchedLevels[0].id);
                    }
                }
            } catch (error) {
                console.error("Initial load error", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        loadInitialData();
        return () => { isMounted = false; };
    }, []);

    // 6. Refactored fetchers (Async but direct)
    const fetchSections = useCallback(async (semId: string) => {
        if (!semId) return;
        try {
            const secs = await notaParcialService.getSecciones(semId);
            setSecciones(secs);
            if (secs.length === 1) handleSeccionChange(secs[0].id, semId);
        } catch (err) { console.error(err); }
    }, []);

    // 7. Selection Handlers
    const handlePeriodoChange = (id: string) => {
        setSelPeriodo(id);
        setSelSemestre('');
        setSecciones([]);
        setFilteredAsignaturas([]);
        setAllProfesores([]);
        setSelAlumno('');
        resetFormInputs();
    };

    const handleSemestreChange = (semId: string) => {
        setSelSemestre(semId);
        setSelSeccion('');
        setSecciones([]);
        setFilteredAsignaturas([]);
        setAllProfesores([]);
        setSelAlumno('');
        resetFormInputs();
        if (semId) fetchSections(semId);
    };

    const handleSeccionChange = async (secId: string, customSemId?: string) => {
        const sId = customSemId || selSemestre;
        setSelSeccion(secId);
        setSelAsignatura('');
        setFilteredAsignaturas([]);
        setAllProfesores([]);
        resetFormInputs();

        if (secId && sId) {
            setIsLoading(true);
            try {
                const asigs = await notaParcialService.getAsignaturas(sId, secId);
                setFilteredAsignaturas(asigs);
            } catch (err) {
                console.error(err);
            } finally { setIsLoading(false); }
        }
    };

    const handleAsignaturaChange = async (asigId: string) => {
        setSelAsignatura(asigId);
        setSelProfesor('');
        setAllProfesores([]);
        setSelAlumno('');
        resetFormInputs();

        if (asigId && selSemestre && selSeccion) {
            setIsLoading(true);
            try {
                // Using corrected parameters: semestrePeriodoId, asignaturaId, seccionid
                const teachers = await notaParcialService.getDocentes(selSemestre, asigId, selSeccion);
                setAllProfesores(teachers);
            } catch (err) {
                console.error("Error loading teachers", err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const resetFormInputs = () => {
        setNotaP1('');
        setNotaP2('');
        setFecha(new Date().toISOString().split('T')[0]);
    };

    // CRUD Actions
    const handleSave = async () => {
        if (!selAlumno || !selAsignatura || !selProfesor || !selSemestre || !notaP1 || !fecha) return;

        setIsLoading(true);
        try {
            const payload = {
                semestreperiodoid: parseInt(selSemestre),
                seccionid: parseInt(selSeccion),
                asignaturaid: parseInt(selAsignatura),
                profesorid: parseInt(selProfesor),
                alumnoid: parseInt(selAlumno),
                notap1: parseFloat(notaP1),
                notap2: notaP2 ? parseFloat(notaP2) : null,
                fecha: fecha,
            };

            if (editingId) {
                await notaParcialService.updateNotaParcial(editingId, payload);
            } else {
                await notaParcialService.saveNotaParcial(payload);
            }

            // Refresh list and reset
            const updatedList = await notaParcialService.getNotasParciales();
            setNotasRecords(updatedList);
            handleFullReset();
            showModal(
                editingId ? "Actualización Exitosa" : "Registro Exitoso",
                editingId ? "Has actualizado la nota correctamente." : "Has registrado la nota correctamente.",
                editingId ? 'update' : 'add'
            );
        } catch (error) {
            console.error("Save error:", error);
            showModal("Error", "No se pudo procesar la solicitud. Por favor, intente de nuevo.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (nota: any) => {
        // En modo edición solo permitimos cambiar notas, así que usamos los datos
        // que ya vienen en el registro de la tabla sin llamar a la API.
        const id = nota.notaid || nota.id || nota.notaparcialid || '';
        setEditingId(String(id));

        // 1. Resolvemos el ID interno (semestreperiodoid) usando el cache local
        // El registro de la tabla tiene periodoid y semestreid, pero necesitamos el ID de relación.
        const pId = String(nota.periodoid || '');
        const sId = String(nota.semestreid || '');

        const psMatch = allPeriodoSemestres.find(ps =>
            String(ps.periodoId || ps.periodoid) === pId &&
            String(ps.semestreid) === sId
        );

        const uiSemestreId = psMatch ? String(psMatch.semestreperiodoid || psMatch.id) : String(nota.semestreperiodoid || '');

        // 2. Cargamos los IDs seleccionados
        setSelPeriodo(pId);
        setSelSemestre(uiSemestreId);
        setSelSeccion(String(nota.seccionid || ''));
        setSelAsignatura(String(nota.asignaturaid || ''));
        setSelProfesor(String(nota.profesorid || ''));
        setSelAlumno(String(nota.alumnoid || ''));

        // 3. Inyectamos los nombres en las listas para los selects deshabilitados
        if (nota.seccion_nombre) {
            setSecciones([{ id: String(nota.seccionid), nombre: nota.seccion_nombre }]);
        }
        if (nota.asignatura_nombre) {
            setFilteredAsignaturas([{
                id: String(nota.asignaturaid),
                nombre: nota.asignatura_nombre,
                codigo: ''
            }]);
        }
        if (nota.profesor_nombre) {
            setAllProfesores([{
                id: String(nota.profesorid),
                nombres: nota.profesor_nombre,
                apellidos: '',
                especialidad: '' // Fix lint: falta especialidad
            }]);
        }

        // 4. Establecemos notas y fecha actual
        setNotaP1((nota.notap1 ?? 0).toString());
        setNotaP2(nota.notap2 !== null ? nota.notap2.toString() : '');
        setFecha(new Date().toISOString().split('T')[0]);
    };

    const handleDelete = (notaId: string | number) => {
        const record = notasRecords.find(n => (n.notaid || n.id) == notaId);
        const name = record?.alumno_nombre ? toTitleCase(record.alumno_nombre) : "el estudiante";
        const subject = record?.asignatura_nombre || "la materia";
        const section = record?.seccion_nombre || "sección";
        const level = record?.nivel || "Nivel";
        const period = record?.periodo_nombre || "periodo";

        showModal(
            "Confirmar Eliminación",
            `¿Está seguro de que desea eliminar permanentemente este registro?\n\n` +
            `• Estudiante: ${name}\n` +
            `• Materia: ${subject}\n` +
            `• Sección: ${section} (${level})\n` +
            `• Periodo: ${period}\n\n` +
            `Esta acción no se puede deshacer.`,
            "confirm",
            async () => {
                try {
                    await notaParcialService.deleteNotaParcial(notaId);
                    setNotasRecords(prev => prev.filter(n => (n.notaid || n.id) != notaId));
                    showModal("Eliminación Exitosa", "La nota ha sido eliminada correctamente.", "delete");
                } catch (error) {
                    showModal("Error", "No se pudo eliminar la nota.", "error");
                }
            }
        );
    };

    const handleRefreshTable = async () => {
        setIsLoading(true);
        try {
            const freshNotes = await notaParcialService.getNotasParciales();
            setNotasRecords(freshNotes);
        } catch (err) {
            console.error("Refresh error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFullReset = () => {
        setEditingId(null);
        setSelPeriodo('');
        setSelSemestre('');
        setSecciones([]);
        setSelAsignatura('');
        setFilteredAsignaturas([]);
        setSelProfesor('');
        setAllProfesores([]);
        setSelAlumno('');
        resetFormInputs();
    };

    const isButtonEnabled = selPeriodo && selSemestre && selAsignatura && selProfesor && selAlumno && notaP1 !== '';

    const isClearEnabled = [
        selPeriodo, selSemestre, selSeccion, selAsignatura,
        selProfesor, selAlumno, notaP1, notaP2, fecha
    ].filter(val => val !== '').length >= 2;

    return (
        <div className="nota-parcial-page">
            <div className="nota-parcial-header">
                <div className="header-title-row">
                    <h2 className="page-title">Gestión de Notas Parciales</h2>
                    <span className="page-subtitle">Docente</span>
                </div>
                <div className="breadcrumb">Inicio · Notas Parciales ·</div>
            </div>

            <div className="nota-parcial-grid">
                {/* Form Card */}
                <div className="card dashboard-card">
                    <div className="card-header-green">
                        <h3>{editingId ? "EDITAR NOTA" : "REGISTRAR NUEVA NOTA"}</h3>
                        <i className={editingId ? "bi bi-pencil-square" : "bi bi-plus-circle"}></i>
                    </div>
                    <div className="card-body">
                        <div className="form-selection-grid">
                            {/* Nivel 1: Periodo */}
                            <div className="form-group">
                                <label>Periodo Académico *</label>
                                <select
                                    className="form-control"
                                    value={selPeriodo}
                                    disabled={!!editingId} // In edit mode, disable selections
                                    onChange={(e) => handlePeriodoChange(e.target.value)}
                                >
                                    <option value="">Seleccione Periodo</option>
                                    {periodos.map(p => (
                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Nivel 2: Nivel (Semestre) */}
                            <div className="form-group">
                                <label>Nivel *</label>
                                <select
                                    className="form-control"
                                    value={selSemestre}
                                    disabled={!!editingId || !selPeriodo}
                                    onChange={(e) => handleSemestreChange(e.target.value)}
                                >
                                    <option value="">Seleccione Nivel</option>
                                    {semestres.map(s => (
                                        <option key={s.id} value={s.id}>{s.nivel}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sección */}
                            <div className="form-group">
                                <label>Sección *</label>
                                <select
                                    className="form-control"
                                    value={selSeccion}
                                    disabled={!!editingId || !selSemestre}
                                    onChange={(e) => handleSeccionChange(e.target.value)}
                                >
                                    <option value="">Seleccione Sección</option>
                                    {secciones.map(sec => (
                                        <option key={sec.id} value={sec.id}>{sec.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Nivel 3: Asignatura */}
                            <div className="form-group">
                                <label>Asignatura *</label>
                                <select
                                    className="form-control"
                                    value={selAsignatura}
                                    disabled={!!editingId || !selSeccion}
                                    onChange={(e) => handleAsignaturaChange(e.target.value)}
                                >
                                    <option value="">Seleccione Asignatura</option>
                                    {filteredAsignaturas.map(a => (
                                        <option key={a.id} value={a.id}>{a.nombre} ({a.codigo})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Docente Selection */}
                            <div className="form-group">
                                <label>Docente *</label>
                                <select
                                    className="form-control"
                                    value={selProfesor}
                                    disabled={!!editingId || !selAsignatura}
                                    onChange={(e) => setSelProfesor(e.target.value)}
                                >
                                    <option value="">Seleccione Docente</option>
                                    {allProfesores.map(doc => (
                                        <option key={doc.id} value={doc.id}>
                                            {toTitleCase(`${doc.nombres} ${doc.apellidos}`)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Nivel 4: Estudiante */}
                            <div className="form-group">
                                <label>Estudiante *</label>
                                <select
                                    className="form-control"
                                    value={selAlumno}
                                    disabled={!!editingId || !selProfesor}
                                    onChange={(e) => setSelAlumno(e.target.value)}
                                >
                                    <option value="">Seleccione Estudiante</option>
                                    {allAlumnos.map(al => (
                                        <option key={al.id} value={al.id}>
                                            {toTitleCase(`${al.nombres} ${al.apellidos}`)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Nivel 5: Notas y Fecha */}
                        <div className="notas-inputs-row">
                            <div className="form-group">
                                <label>Nota Parcial 1 *</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    max="10"
                                    disabled={!selAlumno && !editingId}
                                    value={notaP1}
                                    onChange={(e) => setNotaP1(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Nota Parcial 2 (Opcional)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    max="10"
                                    disabled={!selAlumno && !editingId}
                                    value={notaP2}
                                    onChange={(e) => setNotaP2(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Fecha Registro</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    min={new Date().toISOString().split('T')[0]} // Solo desde hoy en adelante
                                    disabled={!selAlumno && !editingId}
                                    value={fecha}
                                    onChange={(e) => setFecha(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                className="btn-secondary"
                                onClick={handleFullReset}
                                disabled={!editingId && !isClearEnabled}
                            >
                                {editingId ? "Cancelar" : "Limpiar"}
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleSave}
                                disabled={!isButtonEnabled || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <i className="bi bi-arrow-clockwise spin" style={{ marginRight: '8px' }}></i>
                                        PROCESANDO...
                                    </>
                                ) : (
                                    editingId ? "ACTUALIZAR NOTA" : "GUARDAR NOTA"
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* List Table Card */}
                <div className="card dashboard-card">
                    <div className="card-header-green table-header-flex">
                        <div className="header-title">
                            <h3>MIS NOTAS PARCIALES</h3>
                            <i className="bi bi-table"></i>
                        </div>

                        <div className="table-header-actions">
                            <div className="table-filter-container">
                                <label>Filtrar por Periodo:</label>
                                <select
                                    className="form-control filter-select"
                                    value={filtSelPeriodo}
                                    onChange={(e) => setFiltSelPeriodo(e.target.value)}
                                >
                                    <option value="">Todos los Periodos</option>
                                    {periodos.map(p => (
                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                className="btn-refresh"
                                title="Recargar tabla"
                                onClick={handleRefreshTable}
                                disabled={isLoading}
                            >
                                <i className={`bi bi-arrow-clockwise ${isLoading ? 'spin' : ''}`}></i>
                            </button>
                        </div>
                    </div>
                    <div className="card-body no-padding">
                        <div className="table-container">
                            <table className="nota-table">
                                <thead>
                                    <tr>
                                        {!filtSelPeriodo && <th>Periodo</th>}
                                        <th>Asignatura</th>
                                        <th>Nivel</th>
                                        <th>Sección</th>
                                        <th>Docente</th>
                                        <th>Estudiante</th>
                                        <th>Nota P1</th>
                                        <th>Nota P2</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notasRecords
                                        .filter(record => !filtSelPeriodo || String(record.periodoid) === filtSelPeriodo)
                                        .map((record) => (
                                            <tr key={record.notaid || record.id}>
                                                {!filtSelPeriodo && <td>{record.periodo_nombre || '-'}</td>}
                                                <td>{record.asignatura_nombre || record.asignaturaid}</td>
                                                <td>{record.nivel || '-'}</td>
                                                <td>{record.seccion_nombre || '-'}</td>
                                                <td>{toTitleCase(String(record.profesor_nombre || '')) || record.profesorid}</td>
                                                <td>{toTitleCase(String(record.alumno_nombre || '')) || record.alumnoid}</td>
                                                <td style={{ fontWeight: 600 }}>{record.notap1?.toFixed(2)}</td>
                                                <td>{record.notap2 !== null ? record.notap2?.toFixed(2) : '-'}</td>
                                                <td className="actions-cell">
                                                    <button className="btn-icon btn-edit" title="Editar" onClick={() => handleEdit(record)}>
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button className="btn-icon btn-delete" title="Eliminar" onClick={() => handleDelete(record.notaid || record.id || '')}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <ActionModal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                onClose={handleCloseModal}
                onConfirm={modalConfig.onConfirm}
            />
        </div>
    );
};

export default NotaParcialPage;
