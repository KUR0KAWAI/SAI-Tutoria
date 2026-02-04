import React, { useState, useEffect } from 'react';
import './TipoDocumentoModal.css';
import type { TipoDocumentoDto } from '../../models/entities';

interface TipoDocumentoModalProps {
    isOpen: boolean;
    onClose: () => void;
    tipos: TipoDocumentoDto[];
    onSave: (tipo: TipoDocumentoDto) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

const TipoDocumentoModal: React.FC<TipoDocumentoModalProps> = ({ isOpen, onClose, tipos, onSave, onDelete }) => {
    const [formData, setFormData] = useState<TipoDocumentoDto>({
        tipodocumentoid: undefined,
        nombre: '',
        descripcion: '',
        estado: 'Activo'
    });

    // Reset form when opening modal
    useEffect(() => {
        if (!isOpen) {
            setFormData({ tipodocumentoid: undefined, nombre: '', descripcion: '', estado: 'Activo' });
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.nombre || !formData.descripcion) {
            alert('Por favor complete todos los campos');
            return;
        }
        await onSave(formData);
        setFormData({ tipodocumentoid: undefined, nombre: '', descripcion: '', estado: 'Activo' });
    };

    const handleEditClick = (tipo: TipoDocumentoDto) => {
        setFormData(tipo);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Gestionar Tipos de Documentos</h3>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Nombre Corto</label>
                            <div className="input-wrapper">
                                <span className="input-icon">
                                    <i className="bi bi-tag"></i>
                                </span>
                                <input
                                    type="text"
                                    name="nombre"
                                    className="form-input"
                                    placeholder="Ej: Diagnóstico"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Descripción Completa</label>
                            <div className="input-wrapper">
                                <span className="input-icon">
                                    <i className="bi bi-file-text"></i>
                                </span>
                                <input
                                    type="text"
                                    name="descripcion"
                                    className="form-input"
                                    placeholder="Ej: Informe de prueba..."
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        {formData.tipodocumentoid && (
                            <button
                                className="btn-clean"
                                onClick={() => setFormData({ tipodocumentoid: undefined, nombre: '', descripcion: '', estado: 'Activo' })}
                            >
                                Cancelar Edición
                            </button>
                        )}
                        <button
                            className="btn-save"
                            onClick={handleSubmit}
                        >
                            <i className="bi bi-save"></i>
                            {formData.tipodocumentoid ? 'Actualizar Tipo' : 'Agregar Tipo'}
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th style={{ width: '100px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tipos.map(t => (
                                    <tr key={t.tipodocumentoid}>
                                        <td><strong>{t.nombre}</strong></td>
                                        <td>{t.descripcion}</td>
                                        <td>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleEditClick(t)}
                                                    className="btn-icon btn-edit"
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button
                                                    onClick={() => t.tipodocumentoid && onDelete(t.tipodocumentoid)}
                                                    className="btn-icon btn-delete"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {tipos.length === 0 && (
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: '#a0aec0' }}>No hay tipos definidos.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TipoDocumentoModal;
