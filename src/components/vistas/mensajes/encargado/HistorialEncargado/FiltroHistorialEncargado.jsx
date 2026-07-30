import "../../docente/HistorialDocente/FiltroHistorialDocente.css";

function FiltrosHistorialEncargado({
                                       filtroTipo,
                                       setFiltroTipo,
                                       fechaDesde,
                                       setFechaDesde,
                                       fechaHasta,
                                       setFechaHasta,
                                       busqueda,
                                       setBusqueda
                                   }) {

    return (
        <div className="filtros-historial mb-4">

            <div className="row g-3 align-items-end">

                {/* Búsqueda por asunto / palabras clave (HU-11) */}
                <div className="col-md-4">
                    <label className="filtro-label">Buscar</label>
                    <input
                        type="text"
                        className="form-control filtro-input"
                        placeholder="Buscar por asunto o contenido..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <div className="col-md-3">
                    <label className="filtro-label">Tipo</label>
                    <select
                        className="form-select filtro-input"
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                    >
                        <option value="">Todos</option>
                        <option value="mensaje">Mensaje</option>
                        <option value="aviso">Aviso</option>
                        <option value="tarea">Tarea</option>
                        <option value="observacion">Observación</option>
                    </select>
                </div>

                <div className="col-md-2">
                    <label className="filtro-label">Desde</label>
                    <input
                        type="date"
                        className="form-control filtro-input"
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)}
                    />
                </div>

                <div className="col-md-2">
                    <label className="filtro-label">Hasta</label>
                    <input
                        type="date"
                        className="form-control filtro-input"
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)}
                    />
                </div>

                <div className="col-md-1">
                    <button
                        className="btn boton-limpiar w-100"
                        onClick={() => {
                            setBusqueda("");
                            setFiltroTipo("");
                            setFechaDesde("");
                            setFechaHasta("");
                        }}
                    >
                        Limpiar
                    </button>
                </div>

            </div>

        </div>
    );
}

export default FiltrosHistorialEncargado;