import { useState, useEffect } from 'react';
import { tutoriasService } from '../services/tutoriasService';
import { useAuth } from '../auth/useAuth';

interface TutoriaModalProps {
    estudiante: any;
    onClose: () => void;
    onUpdate: () => void;
}

const TutoriaModal = ({ estudiante, onClose, onUpdate }: TutoriaModalProps) => {
    const { user } = useAuth(); // Get current user

    // Determine initial view based on whether the student has a tutoria assigned
    const [view, setView] = useState<'register' | 'manage'>(estudiante.tieneTutoria ? 'manage' : 'register');
    const [loading, setLoading] = useState(false);

    // Header Data & Editing State
    const [headerData, setHeaderData] = useState({
        objetivo: estudiante.objetivo || 'Refuerzo Académico General',
        cantidad: estudiante.tutoriasRequeridas || 3
    });
    const [isEditingHeader, setIsEditingHeader] = useState(false);
    const [tempHeader, setTempHeader] = useState({ objetivo: '', cantidad: 0 });

    const handleEditHeader = () => {
        setTempHeader({ ...headerData });
        setIsEditingHeader(true);
    };

    const handleSaveHeader = async () => {
        // Validation
        if (!tempHeader.objetivo) return alert("El objetivo es requerido");
        if (tempHeader.cantidad < 1) return alert("La cantidad debe ser mayor a 0");
        if (tempHeader.cantidad < sesiones.length) return alert("La cantidad requerida no puede ser menor al número de sesiones registradas actual (" + sesiones.length + ")");

        setLoading(true);
        try {
            await tutoriasService.actualizarTutoriaPadre(estudiante.tutoriaId, tempHeader);
            setHeaderData(tempHeader);
            // Update local object reference if needed for other computations
            estudiante.tutoriasRequeridas = tempHeader.cantidad;
            setIsEditingHeader(false);
            onUpdate();
        } catch (error) {
            alert("Error al actualizar la cabecera");
        } finally {
            setLoading(false);
        }
    };

    // Data for Management View
    const [sesiones, setSesiones] = useState<any[]>([]);
    const [estadosMap, setEstadosMap] = useState<any[]>([]);

    // Form States - Parent Registration
    const [objetivo, setObjetivo] = useState('');
    const [cantidad, setCantidad] = useState(3);

    // Form States - New Session
    const [sessDate, setSessDate] = useState(new Date().toISOString().split('T')[0]);
    const [sessMotivo, setSessMotivo] = useState('');
    const [sessObs, setSessObs] = useState('');

    useEffect(() => {
        if (view === 'manage' && estudiante.tutoriaId) {
            loadSesiones();
            loadEstados();
        }
    }, [view]);

    const loadEstados = async () => {
        try {
            const data = await tutoriasService.getEstadosTutoria();
            setEstadosMap(data);
        } catch (error) {
            console.error("Error loading states", error);
        }
    };

    const loadSesiones = async () => {
        setLoading(true);
        try {
            const data = await tutoriasService.getSesionesTutoria(estudiante.tutoriaId);
            setSesiones(data);
        } catch (error) {
            console.error("Error loading sessions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterParent = async () => {
        if (!objetivo) return alert("Ingrese un objetivo");

        setLoading(true);
        try {
            const payload = {
                tutoriaid: estudiante.tutoriaId, // From provided endpoint spec
                objetivotutoria: objetivo,
                tutorias_requeridas: cantidad
            };

            await tutoriasService.registrarTutoriaPadre(payload);

            // Mock update locally to switch view without full page reload if desired, 
            // but we call onUpdate to refresh parent list primarily.
            // For smoother UX, we can assume success and switch view:
            estudiante.tieneTutoria = true;
            estudiante.tutoriasRequeridas = cantidad;
            estudiante.objetivo = objetivo;

            // Fix: Update header data state so it reflects immediately
            setHeaderData({
                objetivo: objetivo,
                cantidad: cantidad
            });

            setView('manage');
            onUpdate(); // Refresh background list
        } catch (error) {
            console.error(error);
            alert("Error al registrar");
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSession = async () => {
        if (!sessMotivo) return alert("Ingrese un motivo");

        // Validate date is not in the past relative to today
        const today = new Date();
        // Adjust for timezone offset to get local YYYY-MM-DD
        const localToday = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

        if (sessDate < localToday) {
            return alert("La fecha no puede ser anterior a la actual");
        }

        setLoading(true);
        try {
            // Call the service with the new payload structure
            await tutoriasService.registrarSesion({
                tutoriaid: estudiante.tutoriaId,
                fechatutoria: sessDate,
                motivotutoria: sessMotivo,
                observaciones: sessObs
            });

            // Manually update local state because mock service doesn't persist
            // Create a new session object for local state update
            const newSessionForState = {
                id: Date.now(), // Temporary ID for local state
                fecha: sessDate,
                motivo: sessMotivo,
                observaciones: sessObs,
                estado: 'Pendiente', // Default state per requirement
                estadoId: 1
            };
            setSesiones([...sesiones, newSessionForState]);

            setSessMotivo('');
            setSessObs('');
            // loadSesiones(); // Removed re-fetch to keep the local update visible
            onUpdate();
        } catch (error) {
            alert("Error al registrar sesión");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSession = async (sesionId: number) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar esta sesión?")) return;

        setLoading(true);
        try {
            await tutoriasService.eliminarSesion(sesionId);
            // Update local state by filtering out the deleted session
            setSesiones(prev => prev.filter(s => s.id !== sesionId));
            onUpdate();
        } catch (error) {
            alert("Error al eliminar la sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className={`modal-content ${view === 'register' ? 'modal-narrow' : ''}`}>
                <div className="modal-header">
                    <h4>Gestión de Tutoría: {estudiante.alumnoNombre}</h4>
                    <button className="btn-close-modal" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {view === 'register' ? (
                        <div className="register-parent-form">
                            <h5 className="mb-3">Asignar Tutoría Obligatoria</h5>
                            <div className="form-group mb-3">
                                <label>Objetivo de las tutorías</label>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    value={objetivo}
                                    onChange={e => setObjetivo(e.target.value)}
                                />
                            </div>
                            <div className="form-group mb-4">
                                <label>Cantidad de tutorías requeridas</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    min={1}
                                    max={10}
                                    value={cantidad}
                                    onChange={e => setCantidad(Number(e.target.value))}
                                />
                            </div>
                            <button
                                className="btn-primary w-full"
                                onClick={handleRegisterParent}
                                disabled={loading}
                            >
                                {loading ? 'Registrando...' : 'Guardar y Continuar'}
                            </button>
                        </div>
                    ) : (
                        <div className="manage-view">
                            {/* Editable Header Section */}
                            <div className="progress-info mb-4 relative">
                                {isEditingHeader ? (
                                    <div className="edit-header-container">
                                        <div className="edit-fields-row">
                                            <div className="field-group grow">
                                                <label>Objetivo</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={tempHeader.objetivo}
                                                    onChange={e => setTempHeader({ ...tempHeader, objetivo: e.target.value })}
                                                />
                                            </div>
                                            <div className="field-group fixed-width">
                                                <label>Cant. Requerida</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    min={sesiones.length}
                                                    value={tempHeader.cantidad}
                                                    onChange={e => setTempHeader({ ...tempHeader, cantidad: Number(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                        <div className="header-actions">
                                            <button className="btn-action-save" onClick={handleSaveHeader}>
                                                Guardar
                                            </button>
                                            <button className="btn-action-cancel" onClick={() => setIsEditingHeader(false)}>
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-start">
                                        <div className="w-full">
                                            <div className="flex justify-between items-center mb-2">
                                                <h5 className="m-0 text-dark font-bold">
                                                    Objetivo: <span className="font-normal text-gray-700 text-base">{headerData.objetivo}</span>
                                                </h5>
                                                <button
                                                    className="btn-icon text-blue-600 hover:text-blue-800"
                                                    onClick={handleEditHeader}
                                                    title="Editar Objetivo y Cantidad"
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                            </div>

                                            <div className="flex justify-between text-sm mb-1">
                                                <strong>Progreso: {sesiones.length} / {headerData.cantidad} Sesiones</strong>
                                                <span className="text-gray-500">{Math.round((sesiones.length / headerData.cantidad) * 100)}%</span>
                                            </div>
                                            <div className="progress-bar-bg">
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{ width: `${Math.min((sesiones.length / headerData.cantidad) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="modal-grid-layout">
                                {/* Left: History */}
                                <div className="history-panel">
                                    <h5 className="panel-title">Historial de Sesiones</h5>
                                    <div className="history-list">
                                        {sesiones.map((ses, idx) => {
                                            // Filter options: Only show Realizada and Inasistencia
                                            const availableOptions = estadosMap.filter(st => st.nombre === 'Realizada' || st.nombre === 'Inasistencia');
                                            // Fallback for locking if ID is missing but name matches
                                            // Removed duplicate logic 
                                            // USER REQUEST: "solo son realizada e inasistencia".
                                            // AND "pendiente e incompleta son valores que manda la api pero no deben aparecer... solo son para mostrar"
                                            // implies Incompleta is a locked final state.
                                            // Inasistencia was previously considered locked? 
                                            // In the screenshot, Inasistencia is in the dropdown. 
                                            // If Inasistencia is selected, can it be changed? 
                                            // Previous logic: isLocked = ses.estadoId === 5 || ses.estado === 'Incompleta' || ses.estado === 'Inasistencia';
                                            // If "Inasistencia" is now a valid option to *select*, it shouldn't be locked immediately upon existing?
                                            // BUT user said: "marcar realizada e inasistencia".
                                            // If I mark it Inasistencia, it stays editable? 
                                            // The previous logic locked 'Inasistencia'. 
                                            // Let's assume Inasistencia is an editable state OR a final state that we can transition TO.
                                            // If I transition TO Inasistencia, does it become locked? 
                                            // "marcar realizada e inasistencia... pendiente e incompleta... no deben aparecer"
                                            // I will remove 'Inasistencia' from isLocked checks to allow selecting it and potentially changing it if needed, OR user might want it locked.
                                            // However, to SELECT it, it must be available. 
                                            // If I select it and save, and it locks, that's fine. 
                                            // But if I can't change it back, that might be annoying.
                                            // Given "Incompleta" is the one explicitly mentioned as "solo mostrar", I will assume Inasistencia is a valid outcome we set.

                                            // Wait, user earlier said: "DELETE... disable for Incompleta or Inasistencia".
                                            // This suggests Inasistencia might be a "final" state.
                                            // But now it's in the dropdown.
                                            // If it's in the dropdown, I should be able to select it from Pendiente.
                                            // Once saved, if it's locked, I can't edit it. 
                                            // I will leave logic for locking "Incompleta" and ID 5. 
                                            // I'll assume "Inasistencia" returned by API is NOT ID 5 (which is Incompleta).
                                            // So I will remove 'Inasistencia' from the string check in isLocked, so it renders as a Select with Inasistencia selected.

                                            const isLocked = ses.estadoId === 5 || ses.estado === 'Incompleta';

                                            const formatDateForHistory = (dateString: string) => {
                                                if (!dateString) return '';
                                                try {
                                                    const parts = dateString.split('T')[0].split('-');
                                                    if (parts.length < 3) return dateString;
                                                    const year = parseInt(parts[0]);
                                                    const month = parseInt(parts[1]) - 1;
                                                    const day = parseInt(parts[2]);

                                                    const date = new Date(year, month, day);

                                                    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                                                    const months = ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'];

                                                    return `${days[date.getDay()]} ${day} de ${months[month]} del ${year}`;
                                                } catch (e) {
                                                    return dateString;
                                                }
                                            };

                                            return (
                                                <div key={idx} className={`history-card relative ${isLocked ? 'history-card-inasistencia' : ''}`}>
                                                    <div className="hc-header">
                                                        <span className="hc-date">{formatDateForHistory(ses.fecha)}</span>
                                                        {/* Status Selector or Badge */}
                                                        {isLocked ? (
                                                            <span className="badge badge-danger px-3 py-1 rounded bg-red-100 text-red-700 font-bold border border-red-200">
                                                                {ses.estado}
                                                            </span>
                                                        ) : (
                                                            <select
                                                                className={`status-select ${ses.estado === 'Realizada' ? 'status-success' : 'status-warning'}`}
                                                                value={ses.estadoId || ''}
                                                                onChange={(e) => {
                                                                    const newId = Number(e.target.value);
                                                                    const newStateObj = estadosMap.find(st => st.estadotutoriaid === newId);
                                                                    const newSesiones = [...sesiones];
                                                                    newSesiones[idx].estadoId = newId;
                                                                    if (newStateObj) newSesiones[idx].estado = newStateObj.nombre;
                                                                    newSesiones[idx].isModified = true;
                                                                    setSesiones(newSesiones);
                                                                }}
                                                            >
                                                                {/* Show Pendiente as allowed current value if it's the current state */}
                                                                {ses.estadoId === 1 && <option value={1} hidden>Pendiente</option>}

                                                                {availableOptions.map(st => (
                                                                    <option key={st.estadotutoriaid} value={st.estadotutoriaid}>
                                                                        {st.nombre}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>
                                                    <div className="hc-body mb-2">
                                                        <strong>{ses.motivo}</strong>
                                                        {ses.observaciones && <p>{ses.observaciones}</p>}
                                                    </div>

                                                    <div className="flex justify-end items-center gap-2 mt-2">
                                                        {/* Delete Button - Only if not Incompleta/Inasistencia */}
                                                        {!(ses.estado === 'Incompleta' || ses.estado === 'Inasistencia') && (
                                                            <button
                                                                className="btn-delete-session text-red-600"
                                                                onClick={() => handleDeleteSession(ses.id)}
                                                                title="Eliminar sesión"
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        )}

                                                        {/* Save Button for individual session */}
                                                        {ses.isModified && (
                                                            <button
                                                                className="btn-sm btn-primary"
                                                                onClick={async () => {
                                                                    try {
                                                                        await tutoriasService.actualizarSesion(ses.id, {
                                                                            tutoriaid: ses.tutoriaId,
                                                                            fechatutoria: ses.fecha,
                                                                            motivotutoria: ses.motivo,
                                                                            observaciones: ses.observaciones,
                                                                            estadotutoriaid: ses.estadoId
                                                                        });

                                                                        const newSesiones = [...sesiones];
                                                                        delete newSesiones[idx].isModified;
                                                                        setSesiones(newSesiones);
                                                                        alert("Estado actualizado");
                                                                        onUpdate();
                                                                    } catch (error) {
                                                                        console.error(error);
                                                                        alert("Error al actualizar");
                                                                    }
                                                                }}
                                                            >
                                                                Guardar
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {sesiones.length === 0 && <p className="text-muted">No hay sesiones registradas.</p>}
                                    </div>
                                </div>

                                {/* Right: New Session */}
                                <div className="new-session-panel">
                                    {(sesiones.length < (estudiante.tutoriasRequeridas || 3)) ? (
                                        <>
                                            <h5 className="panel-title">Registrar Nueva Sesión</h5>
                                            <div className="form-group mb-2">
                                                <label>Fecha</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={sessDate}
                                                    onChange={e => setSessDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group mb-2">
                                                <label>Motivo</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Ej. Refuerzo"
                                                    value={sessMotivo}
                                                    onChange={e => setSessMotivo(e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group mb-3">
                                                <label>Observaciones (Opcional)</label>
                                                <textarea
                                                    className="form-control"
                                                    rows={2}
                                                    value={sessObs}
                                                    onChange={e => setSessObs(e.target.value)}
                                                />
                                            </div>
                                            <button
                                                className="btn-primary w-full"
                                                onClick={handleRegisterSession}
                                                disabled={loading}
                                            >
                                                {loading ? 'Guardando...' : 'Registrar Sesión'}
                                            </button>
                                        </>
                                    ) : (
                                        <div className="completion-message">
                                            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '2rem' }}></i>
                                            <p>Se han completado todas las tutorías requeridas.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TutoriaModal;
