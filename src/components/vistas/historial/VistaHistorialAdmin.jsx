import { useEffect, useState } from "react";
import { obtenerRegistros } from "../../util/historial";

const TIPOS = ["aviso", "tarea", "observacion"];

const etiquetaTipo = { aviso: "Aviso", tarea: "Tarea", observacion: "Observación" };

function DetalleRegistro({ registro, onVolver }) {
    return (
        <div>
            <button className="btn btn-outline-secondary mb-3" onClick={onVolver}>
                ← Volver
            </button>

            <span className={`badge bg-secondary me-2 text-uppercase`}>
                {etiquetaTipo[registro.tipo] || registro.tipo}
            </span>

            <h2 className="mt-2">{registro.titulo}</h2>

            <p className="text-muted">
                {new Date(registro.fecha).toLocaleString()}
            </p>

            <hr />

            <p>{registro.contenido}</p>

            <hr />

            <small className="text-muted">
                Registrado por: <strong>{registro.creadoPor?.nombre}</strong>
            </small>

            <br />

            <small className="text-muted">
                Estudiante: <strong>
                    {registro.estudiante.nombre} — {registro.estudiante.grado}° {registro.estudiante.seccion}
                </strong>
            </small>
        </div>
    );
}

function VistaHistorialAdmin() {

    const [registros, setRegistros] = useState([]);
    const [seleccionado, setSeleccionado] = useState(null);

    // Filtros (HU-06, HU-07)
    const [busqueda, setBusqueda] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("");
    const [filtroEstudiante, setFiltroEstudiante] = useState("");
    const [filtroSeccion, setFiltroSeccion] = useState("");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");

    useEffect(() => {
        setRegistros(obtenerRegistros());
    }, []);

    // Opciones dinámicas
    const estudiantesDisponibles = [...new Set(registros.map(r => r.estudiante.nombre))].sort();
    const seccionesDisponibles   = [...new Set(registros.map(r => r.estudiante.seccion))].sort();

    // Filtrado en tiempo real (HU-06, HU-07)
    const filtrados = registros
        .filter(r => !filtroTipo      || r.tipo === filtroTipo)
        .filter(r => !filtroEstudiante || r.estudiante.nombre === filtroEstudiante)
        .filter(r => !filtroSeccion   || r.estudiante.seccion === filtroSeccion)
        .filter(r => !fechaDesde      || new Date(r.fecha) >= new Date(fechaDesde))
        .filter(r => !fechaHasta      || new Date(r.fecha) <= new Date(fechaHasta + "T23:59:59"))
        .filter(r => {
            if (!busqueda.trim()) return true;
            const txt = busqueda.toLowerCase();
            return (
                r.titulo.toLowerCase().includes(txt) ||
                r.contenido.toLowerCase().includes(txt) ||
                r.estudiante.nombre.toLowerCase().includes(txt)
            );
        })
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // HU-08 cronológico

    const limpiarFiltros = () => {
        setBusqueda("");
        setFiltroTipo("");
        setFiltroEstudiante("");
        setFiltroSeccion("");
        setFechaDesde("");
        setFechaHasta("");
    };

    const hayFiltros = busqueda || filtroTipo || filtroEstudiante || filtroSeccion || fechaDesde || fechaHasta;

    if (seleccionado) {
        return <DetalleRegistro registro={seleccionado} onVolver={() => setSeleccionado(null)} />;
    }

    return (
        <div>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className="mb-0">Historial de Comunicaciones</h2>
                    <small className="text-muted">{filtrados.length} registros encontrados</small>
                </div>
                {hayFiltros && (
                    <button className="btn btn-outline-secondary btn-sm" onClick={limpiarFiltros}>
                        Limpiar filtros
                    </button>
                )}
            </div>

            {/* Filtros (HU-07) */}
            <div className="row g-2 mb-4">
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por título, contenido o estudiante..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                </div>

                <div className="col-md-2">
                    <select
                        className="form-select"
                        value={filtroTipo}
                        onChange={e => setFiltroTipo(e.target.value)}
                    >
                        <option value="">Todos los tipos</option>
                        {TIPOS.map(t => (
                            <option key={t} value={t}>{etiquetaTipo[t]}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-2">
                    <select
                        className="form-select"
                        value={filtroEstudiante}
                        onChange={e => setFiltroEstudiante(e.target.value)}
                    >
                        <option value="">Todos los estudiantes</option>
                        {estudiantesDisponibles.map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-2">
                    <select
                        className="form-select"
                        value={filtroSeccion}
                        onChange={e => setFiltroSeccion(e.target.value)}
                    >
                        <option value="">Todas las secciones</option>
                        {seccionesDisponibles.map(s => (
                            <option key={s} value={s}>Sección {s}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-1">
                    <input
                        type="date"
                        className="form-control"
                        title="Desde"
                        value={fechaDesde}
                        onChange={e => setFechaDesde(e.target.value)}
                    />
                </div>

                <div className="col-md-1">
                    <input
                        type="date"
                        className="form-control"
                        title="Hasta"
                        value={fechaHasta}
                        onChange={e => setFechaHasta(e.target.value)}
                    />
                </div>
            </div>

            {/* Lista cronológica (HU-08) */}
            {filtrados.length === 0 ? (
                <p className="text-muted">
                    {hayFiltros
                        ? "No se encontraron resultados con esos criterios."
                        : "No hay registros disponibles."}
                </p>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {filtrados.map(r => (
                        <div
                            key={r.id}
                            className="border rounded p-3"
                            style={{ cursor: "pointer" }}
                            onClick={() => setSeleccionado(r)}
                        >
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <span className="badge bg-secondary me-2 text-uppercase">
                                        {etiquetaTipo[r.tipo] || r.tipo}
                                    </span>
                                    <strong>{r.titulo}</strong>
                                </div>
                                <small className="text-muted">
                                    {new Date(r.fecha).toLocaleString()}
                                </small>
                            </div>

                            <p className="mb-1 mt-2 text-truncate" style={{ maxWidth: "600px" }}>
                                {r.contenido}
                            </p>

                            <small className="text-muted">
                                Estudiante: {r.estudiante.nombre} — {r.estudiante.grado}° {r.estudiante.seccion}
                                &nbsp;·&nbsp;
                                Por: {r.creadoPor?.nombre}
                            </small>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

export default VistaHistorialAdmin;
