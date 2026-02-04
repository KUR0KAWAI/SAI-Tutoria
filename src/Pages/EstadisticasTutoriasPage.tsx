import { useState } from 'react';
import { motion } from 'framer-motion';
import './EstadisticasTutoriasPage.css';

const EstadisticasTutoriasPage = () => {
    // Filters State
    const [selPeriodo, setSelPeriodo] = useState('2024-1');
    const [selSemestre, setSelSemestre] = useState(''); // Default to empty for -- Seleccione --

    const uniquePeriodos = [
        { id: '2024-1', nombre: 'Periodo 2024 - I (Actual)' },
        { id: '2023-2', nombre: 'Periodo 2023 - II' }
    ];

    const semestres = [
        { id: '1', nivel: 'Primer Semestre' },
        { id: '2', nivel: 'Segundo Semestre' }
    ];

    // MOCK DATA
    const kpis = [
        {
            title: "Tasa de Gestión Docente",
            value: "78.5%",
            subtext: "Sesiones Cerradas vs Incompletas",
            change: "-3.2%",
            isPositive: false,
            icon: "bi-activity",
            color: "primary" // Blue
        },
        {
            title: "Asistencia Efectiva",
            value: "62.1%",
            subtext: "Alumnos Presentes vs Ausentes",
            change: "+8.4%",
            isPositive: true,
            icon: "bi-check-circle",
            color: "primary"
        },
        {
            title: "Impacto Académico Global",
            value: "+1.85 pts",
            subtext: "Mejora P2 vs P1 tras tutoría",
            change: "+12.1%",
            isPositive: true,
            icon: "bi-graph-up-arrow",
            color: "primary"
        }
    ];

    const chartJornada = [
        { label: 'Mañana', rea: 45, aus: 10, inc: 5 },
        { label: 'Tarde', rea: 30, aus: 15, inc: 12 },
        { label: 'Noche', rea: 20, aus: 25, inc: 8 }
    ];

    const topAsignaturas = [
        { name: 'Cálculo Diferencial', count: 18 },
        { name: 'Física Mecánica', count: 14 },
        { name: 'Álgebra Lineal', count: 10 },
        { name: 'Programación I', count: 7 },
        { name: 'Estadística', count: 5 }
    ];

    const listaNegra = [
        { docente: 'Dr. Ricardo Mero', incompletas: 14 },
        { docente: 'Ing. Elena Santos', incompletas: 9 },
        { docente: 'Lcdo. Juan Pérez', incompletas: 7 },
        { docente: 'Dra. Ana Alcívar', incompletas: 5 }
    ];

    return (
        <div className="estadisticas-page">
            {/* Header */}
            <div className="stat-header">
                <div className="stat-title">
                    <h2>Seguimiento Estratégico de Tutorías</h2>
                    <p className="stat-subtitle">Gestión Académica - Reporte de Tutorías</p>
                </div>
            </div>

            {/* Filters & Actions Card */}
            <div className="filters-card">
                <div className="filters-left">
                    <div className="filter-group">
                        <label>Periodo Académico</label>
                        <select className="form-select" value={selPeriodo} onChange={(e) => setSelPeriodo(e.target.value)}>
                            <option value="">-- Seleccione --</option>
                            {uniquePeriodos.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Nivel</label>
                        <select className="form-select" value={selSemestre} onChange={(e) => setSelSemestre(e.target.value)}>
                            <option value="">-- Seleccione --</option>
                            {semestres.map(s => (
                                <option key={s.id} value={s.id}>{s.nivel}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="filters-right">
                    <button className="btn-generate">
                        Generar Reporte
                    </button>
                    <button className="btn-export">
                        <i className="bi bi-download"></i>
                        Exportar PDF
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                {kpis.map((kpi, idx) => (
                    <motion.div
                        key={idx}
                        className="kpi-card"
                        whileHover={{ y: -5 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <div className={`kpi-badge ${kpi.isPositive ? 'positive' : 'negative'}`}>
                            {kpi.change}
                        </div>
                        <div>
                            <div className={`kpi-icon ${kpi.color}`}>
                                <i className={`bi ${kpi.icon}`}></i>
                            </div>
                            <div className="kpi-label">{kpi.title}</div>
                            <div className="kpi-value">{kpi.value}</div>
                            <div className="kpi-subtext">{kpi.subtext}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="charts-grid">
                {/* Chart: Radiografía por Jornada */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div className="chart-title">
                            <h3>Participación y Asistencia por Jornada</h3>
                            <div className="chart-subtitle">DISTRIBUCIÓN DE ESTADOS</div>
                        </div>
                        <div className="chart-legend">
                            <div className="legend-item"><div className="legend-dot" style={{ background: '#1a73e8' }}></div> REA</div>
                            <div className="legend-item"><div className="legend-dot" style={{ background: '#cbd5e1' }}></div> INC</div>
                            <div className="legend-item"><div className="legend-dot" style={{ background: '#ef4444' }}></div> INA</div>
                        </div>
                    </div>

                    <div className="bar-chart-container">
                        {chartJornada.map((item, idx) => {
                            const total = item.rea + item.aus + item.inc;
                            // Calculate heights relative to max expected
                            const scale = 2.5;

                            return (
                                <div key={idx} className="bar-group">
                                    <div className="stacked-bar" style={{ height: `${total * scale}px` }}>
                                        <div className="bar-segment" style={{ height: `${(item.inc / total) * 100}%`, background: '#cbd5e1' }} title={`INC: ${item.inc}`}></div>
                                        <div className="bar-segment" style={{ height: `${(item.aus / total) * 100}%`, background: '#ef4444' }} title={`INA: ${item.aus}`}></div>
                                        <div className="bar-segment" style={{ height: `${(item.rea / total) * 100}%`, background: '#1a73e8' }} title={`REA: ${item.rea}`}></div>
                                    </div>
                                    <div className="bar-label">{item.label}</div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="insight-box critical">
                        <strong>Análisis Crítico:</strong> La sección <strong>Noche</strong> presenta el mayor ausentismo estudiantil (Red). Se recomienda evaluar tutorías híbridas.
                    </div>
                </div>

                {/* Chart: Top 5 Asignaturas */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div className="chart-title">
                            <h3>Top 5 Asignaturas con Mayor Ausentismo</h3>
                            <div className="chart-subtitle">Materias con mayor 'Inasistencia'</div>
                        </div>
                    </div>

                    <div className="horizontal-chart">
                        {topAsignaturas.map((item, idx) => {
                            const max = 20;
                            const widthPct = (item.count / max) * 100;
                            return (
                                <div key={idx} className="h-bar-row">
                                    <div className="h-bar-label">{item.name}</div>
                                    <div className="h-bar-track">
                                        <motion.div
                                            className="h-bar-fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${widthPct}%` }}
                                            transition={{ duration: 0.8, delay: 0.2 }}
                                        >
                                            {item.count}
                                        </motion.div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="insight-box decision">
                        <strong>Decisión:</strong> Investigar choque de horarios en <strong>Cálculo Diferencial</strong>. Los alumnos agendan pero el 40% no asiste.
                    </div>
                </div>
            </div>

            {/* Tables Row */}
            <div className="tables-grid">
                <div className="chart-card">
                    <div className="chart-header">
                        <div className="chart-title">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="bi bi-file-earmark-x" style={{ color: '#64748b' }}></i>
                                Lista Negra de Gestión
                            </h3>
                            <div className="chart-subtitle">Docentes con mayor sesiones 'Incompletas'</div>
                        </div>
                    </div>

                    <table className="list-table">
                        <thead>
                            <tr>
                                <th>Nombre del Docente</th>
                                <th style={{ textAlign: 'center' }}>Incompletas</th>
                                <th style={{ textAlign: 'right' }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listaNegra.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.docente}</td>
                                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#1e293b', fontSize: '1.1rem' }}>{item.incompletas}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <span className="status-badge">Auditoría Requerida</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="insight-box" style={{ background: '#f8fafc', color: '#475569', fontSize: '0.85rem', borderLeft: '4px solid #cbd5e1' }}>
                        <em><strong>Acción:</strong> El Coordinador Académico debe notificar a los 3 primeros docentes para cierre de actas pendientes.</em>
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <div className="chart-title">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="bi bi-mortarboard" style={{ color: '#1a73e8' }}></i>
                                Eficacia de Tutoría por Sección
                            </h3>
                            <div className="chart-subtitle">Mejora de Notas vs % Asistencia</div>
                        </div>
                    </div>

                    <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', position: 'relative' }}>
                        {['Mañana', 'Tarde', 'Noche'].map((label, idx) => {
                            const height = [80, 60, 30][idx]; // px
                            return (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                                    <div style={{ width: '40px', background: '#1a73e8', height: `${height}%`, borderRadius: '4px 4px 0 0' }}></div>
                                    <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#4b5563' }}>{label}</div>
                                </div>
                            )
                        })}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#6b7280', marginTop: '10px' }}>
                        <span style={{ color: '#1a73e8' }}>■ Mejora (Puntos)</span>
                    </div>

                    <div className="insight-box" style={{ background: '#f0f9ff', borderLeft: '4px solid #1a73e8', color: '#1e40af' }}>
                        <strong>Análisis de Calidad:</strong> En la <strong>Noche</strong>, aunque la asistencia es baja, la mejora es mínima (0.8). Posible deficiencia en la calidad del tutor nocturno.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EstadisticasTutoriasPage;
