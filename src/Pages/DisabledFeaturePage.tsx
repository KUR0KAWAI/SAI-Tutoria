import './DisabledFeaturePage.css';

const DisabledFeaturePage = () => {
    return (
        <div className="disabled-page-container">
            <div className="card disabled-card">
                <div className="disabled-icon-wrapper">
                    <i className="bi bi-cone-striped"></i>
                </div>
                <h2 className="disabled-title">Funcionalidad desactivada</h2>
                <div className="disabled-message">
                    <p>Esta sección se encuentra actualmente en construcción o ha sido desactivada temporalmente para su mantenimiento.</p>
                    <p className="hint">Por favor, regrese más tarde o contacte con el administrador del sistema si cree que esto es un error.</p>
                </div>
            </div>
        </div>
    );
};

export default DisabledFeaturePage;
