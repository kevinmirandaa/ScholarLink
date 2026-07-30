import { useEffect, useState } from "react";
import { obtenerRegistrosPorEstudiante } from "../../util/historial";
import { obtenerEstudiantePorCedula } from "../../util/estudiantes";

const TIPOS = ["aviso", "tarea", "observacion"];

const etiquetaTipo = { aviso: "Aviso", tarea: "Tarea", observacion: "Observación" };

function DetalleRegistro({ registro, onVolver }) {
    return (
        <div>
            <button className="btn btn-outline-secondary mb-3" onClick={onVolver}>
                ← Volver
            </button>

            <span className="badge bg-secondary me-2 text-uppercase">
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
        </div>
    );
}

function VistaHistorialEstudiante({ usuarioActual }) {

    const [registros, setRegistros] = useState([]);
    const [seleccionado, setSeleccionado] = useState(null);
    const [sinVinculo, setSinVinculo] = useState(false);

    // Filtros (HU-06, HU-07)
    const [busqueda, setBusqueda] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");

    useEffect(() => {
        // Encontrar el registro del estudiante a partir de la cédula del usuario (HU-04)
        const estudiante = obtenerEstudiantePorCedula(usuarioActual.cedula);

        if (!estudiante) {
            setSinVinculo(true);
            return;
        }

        const propios = obtenerRegistrosPorEstudiante(estudiante.id);
        setRegistros(propios);
    }, [usuarioActual]);

    // Filtrado (HU-06, HU-07)
    const filtrados = registros
        .filter(r => !filtroTipo || r.tipo === filtroTipo)
        .filter(r => !fechaDesde || new Date(r.fecha) >= new Date(fechaDesde))
        .filter(r => !fechaHasta || new Date(r.fecha) <= new Date(fechaHasta + "T23:59:59"))
        .filter(r => {
            if (!busqueda.trim()) return true;
            const txt = busqueda.toLowerCase();
            return (
                r.titulo.toLowerCase().includes(txt) ||
                r.contenido.toLowerCase().includes(txt)
            );
        })
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // HU-09 cronológico

    const hayFiltros = busqueda || filtroTipo || fechaDesde || fechaHasta;

    const limpiarFiltros = () => {
        setBusqueda("");
        setFiltroTipo("");
        setFechaDesde("");
        setFechaHasta("");
    };

    // HU-10: acceso bloqueado si no hay vínculo
    if (sinVinculo) {
        return (
            <div className="text-center mt-4">
                <p className="text-muted">
                    Tu cuenta de usuario no está vinculada a un registro de estudiante.
                    Contacta al administrador.
                </p>
            </div>
        );
    }

    if (seleccionado) {
        return <DetalleRegistro registro={seleccionado} onVolver={() => setSeleccionado(null)} />;
    }

    return (
        <div>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className="mb-0">Mi Historial</h2>
                    <small className="text-muted">{filtrados.length} registros</small>
                </div>
                {hayFiltros && (
                    <button className="btn btn-outline-secondary btn-sm" onClick={limpiarFiltros}>
                        Limpiar filtros
                    </button>
                )}
            </div>

            {/* Filtros */}
            <div className="row g-2 mb-4">
                <div className="col-md-5">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por título o contenido..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                </div>

                <div className="col-md-3">
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
                    <input
                        type="date"
                        className="form-control"
                        title="Desde"
                        value={fechaDesde}
                        onChange={e => setFechaDesde(e.target.value)}
                    />
                </div>

                <div className="col-md-2">
                    <input
                        type="date"
                        className="form-control"
                        title="Hasta"
                        value={fechaHasta}
                        onChange={e => setFechaHasta(e.target.value)}
                    />
                </div>
            </div>

            {/* Lista cronológica (HU-09) */}
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

                            <p className="mb-0 mt-2 text-truncate" style={{ maxWidth: "600px" }}>
                                {r.contenido}
                            </p>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

export default VistaHistorialEstudiante;
