import { useState, useEffect } from 'react';
import { tutoriasService } from '../services/tutoriasService';
import { periodosService } from '../services/periodosService';
import { tipoDocumentoService } from '../services/tipoDocumentoService';
import type { CronogramaAnexoDto, TipoDocumentoDto } from '../models/entities';
import { exportCronogramaToPDF } from '../utils/pdfExportUtils';
import './CronogramaAnexosPage.css';
import TipoDocumentoModal from '../components/TipoDocumentoModal/TipoDocumentoModal';

interface AlertState {
    type: 'success' | 'error' | null;
    message: string;
}

const CronogramaAnexosPage = () => {
    // Data List
    const [cronograma, setCronograma] = useState<CronogramaAnexoDto[]>([]);
    const [periodos, setPeriodos] = useState<any[]>([]);
    const [tiposDocumento, setTiposDocumento] = useState<TipoDocumentoDto[]>([]);

    // Modal State for Tipo Documento
    const [showTipoModal, setShowTipoModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        cronogramaid: undefined as number | undefined,
        fechalimite: '',
        descripcion: '',
        periodoid: '',
        tipodocumentoid: ''
    });

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState<AlertState>({ type: null, message: '' });

    // Initial Load
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [cronogramaData, periodosData, tiposData] = await Promise.all([
                tutoriasService.getCronograma(),
                periodosService.getAll(),
                tipoDocumentoService.getAll()
            ]);
            setCronograma(cronogramaData);
            setPeriodos(periodosData);
            setTiposDocumento(tiposData);
        } catch (err) {
            console.error(err);
            showAlert('error', 'Error al cargar los datos.');
        } finally {
            setIsLoading(false);
        }
    };

    const loadTiposDocumento = async () => {
        try {
            const data = await tipoDocumentoService.getAll();
            setTiposDocumento(data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadCronograma = async () => {
        try {
            const data = await tutoriasService.getCronograma();
            setCronograma(data);
        } catch (err) {
            console.error(err);
            showAlert('error', 'Error al actualizar el cronograma.');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formData.fechalimite || !formData.periodoid || !formData.tipodocumentoid) {
            showAlert('error', 'Por favor complete todos los campos requeridos.');
            return;
        }

        setIsLoading(true);
        try {
            // Find type description to use as activity description if empty
            const selectedType = tiposDocumento.find(t => String(t.tipodocumentoid) === String(formData.tipodocumentoid));
            const submissionData = {
                periodoid: Number(formData.periodoid),
                tipodocumentoid: Number(formData.tipodocumentoid),
                descripcion: formData.descripcion || selectedType?.nombre || 'Entrega de Anexo',
                fechalimite: formData.fechalimite,
                estado: 'Activo'
            };

            if (formData.cronogramaid) {
                await tutoriasService.updateCronograma(formData.cronogramaid, submissionData);
                showAlert('success', 'Registro actualizado correctamente.');
            } else {
                await tutoriasService.saveCronograma(submissionData);
                showAlert('success', 'Registro creado correctamente.');
            }
            handleClean();
            loadCronograma();
        } catch (err) {
            console.error(err);
            showAlert('error', 'Error al guardar el registro.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (item: CronogramaAnexoDto) => {
        setFormData({
            cronogramaid: item.cronogramaid,
            fechalimite: item.fechalimite ? item.fechalimite.split('T')[0] : '',
            descripcion: item.descripcion,
            periodoid: String(item.periodoid),
            tipodocumentoid: String(item.tipodocumentoid)
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Está seguro de eliminar este registro?')) return;

        setIsLoading(true);
        try {
            await tutoriasService.deleteCronograma(id);
            showAlert('success', 'Registro eliminado correctamente.');
            loadCronograma();
        } catch (err) {
            console.error(err);
            showAlert('error', 'Error al eliminar el registro.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClean = () => {
        setFormData({ cronogramaid: undefined, fechalimite: '', descripcion: '', periodoid: '', tipodocumentoid: '' });
        setAlert({ type: null, message: '' });
    };

    // --- Tipo Documento CRUD Logic ---
    const handleSaveTipo = async (tipo: TipoDocumentoDto) => {
        try {
            if (tipo.tipodocumentoid) {
                await tipoDocumentoService.update(tipo.tipodocumentoid, tipo);
                showAlert('success', 'Tipo de documento actualizado.');
            } else {
                await tipoDocumentoService.create(tipo);
                showAlert('success', 'Tipo de documento creado.');
            }
            loadTiposDocumento();
        } catch (e) {
            console.error(e);
            showAlert('error', 'Error al guardar tipo de documento');
        }
    };

    const handleDeleteTipo = async (id: number) => {
        if (!confirm('¿Eliminar este tipo de documento?')) return;
        try {
            await tipoDocumentoService.delete(id);
            showAlert('success', 'Tipo de documento eliminado.');
            loadTiposDocumento();
        } catch (e) {
            console.error(e);
            showAlert('error', 'Error al eliminar');
        }
    };

    const showAlert = (type: 'success' | 'error', message: string) => {
        setAlert({ type, message });
        setTimeout(() => setAlert({ type: null, message: '' }), 5000);
    };

    const handleExportPDF = async () => {
        if (cronograma.length === 0) {
            showAlert('error', 'No hay datos para exportar.');
            return;
        }
        try {
            await exportCronogramaToPDF(cronograma);
            showAlert('success', 'PDF generado exitosamente.');
        } catch (error) {
            console.error('Error al generar PDF:', error);
            showAlert('error', 'Error al generar el PDF.');
        }
    };

    return (
        <div className="cronograma-page">
            <div className="page-header-styled">
                <div className="header-title-row">
                    <h2 className="page-title">Página Cronograma de Entrega de Anexos</h2>
                </div>
                <div className="breadcrumb">Módulo de Tutorías - Cronograma de Anexos</div>

                <div className="message-area">
                    {alert.type && (
                        <div className={`alert-box alert-${alert.type}`}>
                            <i className={`bi ${alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
                            {alert.message}
                        </div>
                    )}
                </div>
            </div>

            {/* Form Card */}
            <div className="form-card">
                <div className="card-header-styled">
                    <h3><i className="bi bi-pencil-square"></i> GESTIÓN DE ENTREGAS</h3>
                </div>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Fecha de Entrega</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <i className="bi bi-calendar-event"></i>
                            </span>
                            <input
                                type="date"
                                name="fechalimite"
                                className="form-input"
                                value={formData.fechalimite}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Periodo Académico</label>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <i className="bi bi-calendar-range"></i>
                            </span>
                            <select
                                name="periodoid"
                                className="form-input select-input"
                                value={formData.periodoid}
                                onChange={handleInputChange}
                            >
                                <option value="">-- Seleccionar Periodo --</option>
                                {periodos.map(p => (
                                    <option key={p.periodoid} value={p.periodoid}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Tipo documento</label>
                            <button
                                className="btn-link"
                                style={{ fontSize: '0.8rem', padding: 0, textDecoration: 'underline', color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer' }}
                                onClick={() => setShowTipoModal(true)}
                            >
                                <i className="bi bi-gear-fill"></i> Gestionar Tipos
                            </button>
                        </div>
                        <div className="input-wrapper">
                            <span className="input-icon">
                                <i className="bi bi-file-earmark-text"></i>
                            </span>
                            <select
                                name="tipodocumentoid"
                                className="form-input select-input"
                                value={formData.tipodocumentoid}
                                onChange={handleInputChange}
                            >
                                <option value="">-- Seleccionar Tipo de Documento --</option>
                                {tiposDocumento.map(t => (
                                    <option key={t.tipodocumentoid} value={t.tipodocumentoid}>{t.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button className="btn-clean" onClick={handleClean} disabled={isLoading}>
                            Limpiar
                        </button>
                        <button className="btn-save" onClick={handleSave} disabled={isLoading}>
                            <i className="bi bi-save"></i>
                            {formData.cronogramaid ? 'Actualizar Entrega' : 'Guardar Entrega'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="table-card">
                <div className="card-header-styled">
                    <h3><i className="bi bi-calendar-event"></i> CRONOGRAMA ESTABLECIDO</h3>
                    <button
                        className="btn-export-pdf"
                        onClick={handleExportPDF}
                        title="Exportar a PDF"
                        disabled={isLoading || cronograma.length === 0}
                    >
                        <i className="bi bi-file-earmark-pdf"></i>
                        Exportar
                    </button>
                </div>
                <div className="table-responsive">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Fecha de entrega</th>
                                <th>Documentos a presentar</th>
                                <th style={{ width: '100px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cronograma.length === 0 ? (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>
                                        No hay entregas registradas.
                                    </td>
                                </tr>
                            ) : (
                                (() => {
                                    // Group and render logic
                                    const rows: React.JSX.Element[] = [];
                                    let i = 0;

                                    while (i < cronograma.length) {
                                        const currentDate = cronograma[i].fechalimite;
                                        // Count how many items have this same date
                                        let count = 1;
                                        while (i + count < cronograma.length && cronograma[i + count].fechalimite === currentDate) {
                                            count++;
                                        }

                                        // Format Date: "dd de month de yyyy"
                                        const dateRaw = currentDate?.split('T')[0] || '';
                                        const dateObj = new Date(dateRaw + 'T12:00:00');
                                        const day = dateObj.getDate().toString().padStart(2, '0');
                                        const month = dateObj.toLocaleDateString('es-ES', { month: 'long' });
                                        const year = dateObj.getFullYear();
                                        const formattedDate = `${day} de ${month} de ${year}`;

                                        // Render the group
                                        for (let j = 0; j < count; j++) {
                                            const item = cronograma[i + j];
                                            rows.push(
                                                <tr key={item.cronogramaid}>
                                                    {j === 0 && (
                                                        <td rowSpan={count} className="date-cell">
                                                            {formattedDate}
                                                        </td>
                                                    )}
                                                    <td className="desc-cell">
                                                        <strong>{item.tipo_documento_nombre}</strong>
                                                        <br />
                                                        <small style={{ color: '#718096' }}>{item.descripcion}</small>
                                                    </td>
                                                    <td className="actions-cell">
                                                        <div className="action-buttons">
                                                            <button
                                                                className="btn-icon btn-edit"
                                                                onClick={() => handleEdit(item)}
                                                                title="Editar"
                                                            >
                                                                <i className="bi bi-pencil"></i>
                                                            </button>
                                                            <button
                                                                className="btn-icon btn-delete"
                                                                onClick={() => handleDelete(item.cronogramaid)}
                                                                title="Eliminar"
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                        i += count;
                                    }
                                    return rows;
                                })()
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            <TipoDocumentoModal
                isOpen={showTipoModal}
                onClose={() => setShowTipoModal(false)}
                tipos={tiposDocumento}
                onSave={handleSaveTipo}
                onDelete={handleDeleteTipo}
            />
        </div>
    );
};

export default CronogramaAnexosPage;

