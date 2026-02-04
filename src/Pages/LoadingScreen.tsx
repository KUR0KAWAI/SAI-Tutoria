import { useState, useEffect } from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
    const [showReload, setShowReload] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowReload(true);
        }, 30000); // 30 seconds timeout

        return () => clearTimeout(timer);
    }, []);

    const handleReload = () => {
        window.location.reload();
    };

    return (
        <div className="loading-container">
            <div className="loading-content">
                <img
                    src="https://sai.utb.edu.ec/images/Saidutb.png"
                    alt="SAUTB Logo"
                    className="loading-logo"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x200?text=SAI+UTB'; }}
                />

                <div className="loading-wave">
                    <div className="loading-wave-dot"></div>
                    <div className="loading-wave-dot"></div>
                    <div className="loading-wave-dot"></div>
                    <div className="loading-wave-dot"></div>
                    <div className="loading-wave-dot"></div>
                </div>

                {showReload && (
                    <div className="loading-timeout-container">
                        <p className="loading-timeout-text">La carga está tardando más de lo esperado.</p>
                        <button
                            className="loading-reload-button"
                            onClick={handleReload}
                        >
                            Volver a cargar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoadingScreen;
