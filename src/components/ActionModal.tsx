import React, { useEffect } from 'react';
import './ActionModal.css';

interface ActionModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'success' | 'confirm' | 'error' | 'update' | 'delete' | 'add';
    onClose: () => void;
    onConfirm?: () => void;
}

const ActionModal: React.FC<ActionModalProps> = ({
    isOpen,
    title,
    message,
    type = 'success',
    onClose,
    onConfirm
}) => {
    // Handle Escape key to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'add': return <i className="bi bi-plus-circle-fill"></i>;
            case 'update': return <i className="bi bi-pencil-square"></i>;
            case 'delete': return <i className="bi bi-trash3-fill"></i>;
            case 'success': return <i className="bi bi-check-circle-fill"></i>;
            case 'confirm': return <i className="bi bi-question-circle-fill"></i>;
            case 'error': return <i className="bi bi-exclamation-triangle-fill"></i>;
            default: return <i className="bi bi-info-circle-fill"></i>;
        }
    };

    return (
        <div className="action-modal-overlay" onClick={onClose}>
            <div
                className={`action-modal-card modal-${type}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="action-modal-icon">
                    {getIcon()}
                </div>
                <h3 className="action-modal-title">{title}</h3>
                <p className="action-modal-message">{message}</p>
                <div className="action-modal-actions">
                    {type === 'confirm' ? (
                        <>
                            <button className="action-modal-btn btn-modal-secondary" onClick={onClose}>
                                Cancelar
                            </button>
                            <button className="action-modal-btn btn-modal-primary" onClick={onConfirm}>
                                Confirmar
                            </button>
                        </>
                    ) : (
                        <button className="action-modal-btn btn-modal-primary" onClick={onClose}>
                            Aceptar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActionModal;
