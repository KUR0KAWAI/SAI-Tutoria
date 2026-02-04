import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tutoriasService } from '../services/tutoriasService';

interface TutoriaRowProps {
    estudiante: any;
    refreshData: () => void;
}

const TutoriaRow = ({ estudiante, refreshData }: TutoriaRowProps) => {
    const [expanded, setExpanded] = useState(false);
    const [sesiones, setSesiones] = useState<any[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Initial Registration Form
    const [isRegistering, setIsRegistering] = useState(false);
    const [initObjetivo, setInitObjetivo] = useState('');
    const [initCantidad, setInitCantidad] = useState(3);

    // New Session Form
    const [newSessionDate, setNewSessionDate] = useState(new Date().toISOString().split('T')[0]);
    const [newSessionMotivo, setNewSessionMotivo] = useState('');
    const [newSessionObs, setNewSessionObs] = useState('');
    const [savingSession, setSavingSession] = useState(false);

    const toggleExpand = async () => {
        if (!expanded && estudiante.tieneTutoria) {
            setLoadingDetails(true);
            try {
                const sessions = await tutoriasService.getSesionesTutoria(estudiante.tutoriaId);
                setSesiones(sessions);
            } catch (error) {
                console.error("Error loading sessions:", error);
            } finally {
                setLoadingDetails(false);
            }
        }
        setExpanded(!expanded);
    };

    const handleRegisterTutoria = async () => {
        try {
            await tutoriasService.registrarTutoriaPadre({
                alumnoId: estudiante.alumnoId,
                asignaturaId: estudiante.asignaturaId,
                objetivo: initObjetivo,
                cantidad: initCantidad
            });
            alert('Tutoría registrada exitosamente');
            setIsRegistering(false);
            refreshData(); // Reload parent list to update 'tieneTutoria' status
        } catch (error) {
            alert('Error al registrar tutoría');
        }
    };

    const handleSaveSession = async () => {
        setSavingSession(true);
        try {
            await tutoriasService.registrarSesion(estudiante.tutoriaId, {
                fecha: newSessionDate,
                motivo: newSessionMotivo,
                observaciones: newSessionObs,
                estado: 'Realizada'
            });
            alert('Sesión guardada');
            // Refresh sessions
            const sessions = await tutoriasService.getSesionesTutoria(estudiante.tutoriaId);
            setSesiones(sessions);
            setNewSessionMotivo('');
            setNewSessionObs('');
        } catch (error) {
            alert('Error al guardar sesión');
        } finally {
            setSavingSession(false);
        }
    };

    if (!estudiante.tieneTutoria) {
        return (
            <>
                <tr>
                    <td>{estudiante.alumnoNombre}</td>
                    <td>{estudiante.asignaturaNombre}</td>
                    <td>{estudiante.seccionNombre}</td>
                    <td>
                        {isRegistering ? (
                            <div className="flex gap-2 items-center">
                                <small>Completando...</small>
                            </div>
                        ) : (
                            <button
                                className="btn-sm btn-primary"
                                onClick={() => setIsRegistering(true)}
                            >
                                Registrar Tutoría
                            </button>
                        )}
                    </td>
                </tr>
                {isRegistering && (
                    <tr className="bg-gray-50">
                        <td colSpan={4} className="p-4">
                            <div className="p-4 border rounded bg-white">
                                <h5>Nueva Tutoría</h5>
                                <div className="grid grid-cols-2 gap-4 my-2">
                                    <div>
                                        <label className="block text-sm mb-1">Objetivo General</label>
                                        <input
                                            type="text"
                                            className="form-input w-full"
                                            value={initObjetivo}
                                            onChange={e => setInitObjetivo(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1">Sesiones Requeridas</label>
                                        <input
                                            type="number"
                                            className="form-input w-full"
                                            value={initCantidad}
                                            min={1}
                                            onChange={e => setInitCantidad(Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button className="btn-sm btn-secondary" onClick={() => setIsRegistering(false)}>Cancelar</button>
                                    <button className="btn-sm btn-primary" onClick={handleRegisterTutoria}>Guardar</button>
                                </div>
                            </div>
                        </td>
                    </tr>
                )}
            </>
        );
    }

    return (
        <>
            <tr className={expanded ? "bg-blue-50" : ""}>
                <td>{estudiante.alumnoNombre}</td>
                <td>{estudiante.asignaturaNombre}</td>
                <td>{estudiante.seccionNombre}</td>
                <td>
                    <button onClick={toggleExpand} className="btn-icon">
                        {expanded ? <i className="bi bi-chevron-up"></i> : <i className="bi bi-chevron-down"></i>}
                    </button>
                </td>
            </tr>
            {expanded && (
                <tr>
                    <td colSpan={4} className="p-0">
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="expanded-panel flex gap-4 p-4 bg-gray-50"
                        >
                            {/* Left: History */}
                            <div className="flex-1 border-r pr-4">
                                <h5 className="mb-3 font-semibold text-gray-700">Historial de Sesiones</h5>
                                {loadingDetails ? (
                                    <p>Cargando sesiones...</p>
                                ) : (
                                    <div className="space-y-3">
                                        {sesiones.map(ses => (
                                            <div key={ses.id} className="p-3 bg-white rounded shadow-sm border-l-4 border-green-500">
                                                <div className="flex justify-between">
                                                    <strong>{ses.fecha}</strong>
                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Realizada</span>
                                                </div>
                                                <p className="text-sm mt-1"><strong>Motivo:</strong> {ses.motivo}</p>
                                                {ses.observaciones && <p className="text-sm text-gray-500 italic">{ses.observaciones}</p>}
                                            </div>
                                        ))}
                                        {sesiones.length === 0 && <p className="text-gray-500 italic">No hay sesiones registradas.</p>}
                                    </div>
                                )}
                            </div>

                            {/* Right: New Session Form */}
                            {(sesiones.length < estudiante.tutoriasRequeridas) && (
                                <div className="w-1/3 pl-2 flex flex-col gap-3">
                                    <button
                                        className="btn-sm btn-primary w-max mb-2"
                                        onClick={() => {/* Toggle or Focus logic if needed, strictly just specific layout requested */ }}
                                    >
                                        Registrar nueva tutoría
                                    </button>

                                    <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                                        <label className="block text-sm font-medium mb-1 text-gray-700">Fecha de Sesión</label>
                                        <input
                                            type="date"
                                            className="form-input w-full mb-3"
                                            value={newSessionDate}
                                            onChange={e => setNewSessionDate(e.target.value)}
                                        />

                                        <label className="block text-sm font-medium mb-1 text-gray-700">Motivo</label>
                                        <input
                                            type="text"
                                            className="form-input w-full mb-3"
                                            placeholder="Ej. Refuerzo de lógica"
                                            value={newSessionMotivo}
                                            onChange={e => setNewSessionMotivo(e.target.value)}
                                        />

                                        <label className="block text-sm font-medium mb-1 text-gray-700">Observaciones</label>
                                        <textarea
                                            className="form-input w-full mb-3"
                                            rows={2}
                                            placeholder="Detalles de la sesión..."
                                            value={newSessionObs}
                                            onChange={e => setNewSessionObs(e.target.value)}
                                        />

                                        <button
                                            className="btn-primary w-full"
                                            onClick={handleSaveSession}
                                            disabled={savingSession}
                                        >
                                            {savingSession ? 'Guardando...' : 'Guardar tutoría'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </td>
                </tr>
            )}
        </>
    );
};

export default TutoriaRow;
