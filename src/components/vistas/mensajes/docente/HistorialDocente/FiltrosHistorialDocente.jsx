import "./FiltroHistorialDocente.css";

function FiltrosHistorialDocente({
                                     filtroEstudiante,
                                     setFiltroEstudiante,
                                     filtroTipo,
                                     setFiltroTipo,
                                     filtroGrado,
                                     setFiltroGrado,
                                     fechaDesde,
                                     setFechaDesde,
                                     fechaHasta,
                                     setFechaHasta,
                                     busqueda,
                                     setBusqueda,
                                     estudiantes,
                                     grados
                                 }) {

    return (
        <section className="filtros-historial mb-4">

            {/* 🔥 BUSCADOR */}
            <div className="filtro-buscador mb-3">
                <input
                    type="text"
                    className="form-control input-buscador"
                    placeholder="🔎 Buscar por título, contenido o estudiante..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            {/* 🔥 FILTROS */}
            <div className="row g-3 align-items-end">

                {/* TIPO */}
                <div className="col-md-3">
                    <label className="filtro-label">Tipo</label>
                    <select
                        className="form-select filtro-input"
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                    >
                        <option value="">Todos los tipos</option>
                        <option value="mensaje">Mensaje</option>
                        <option value="aviso">Aviso</option>
                        <option value="tarea">Tarea</option>
                        <option value="observacion">Observación</option>
                    </select>
                </div>

                {/* ESTUDIANTE */}
                <div className="col-md-3">
                    <label className="filtro-label">Estudiante</label>
                    <select
                        className="form-select filtro-input"
                        value={filtroEstudiante}
                        onChange={(e) => setFiltroEstudiante(e.target.value)}
                    >
                        <option value="">Todos</option>

                        {estudiantes.map(nombre => (
                            <option key={nombre} value={nombre}>
                                {nombre}
                            </option>
                        ))}
                    </select>
                </div>

                {/* GRADO */}
                <div className="col-md-2">
                    <label className="filtro-label">Grado</label>
                    <select
                        className="form-select filtro-input"
                        value={filtroGrado}
                        onChange={(e) => setFiltroGrado(e.target.value)}
                    >
                        <option value="">Todos</option>

                        {grados.map(g => (
                            <option key={g} value={g}>
                                {g}
                            </option>
                        ))}
                    </select>
                </div>

                {/* FECHA DESDE */}
                <div className="col-md-2">
                    <label className="filtro-label">Desde</label>
                    <input
                        type="date"
                        className="form-control filtro-input"
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)}
                    />
                </div>

                {/* FECHA HASTA */}
                <div className="col-md-2">
                    <label className="filtro-label">Hasta</label>
                    <input
                        type="date"
                        className="form-control filtro-input"
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)}
                    />
                </div>

                {/* BOTÓN */}
                <div className="col-md-2">
                    <button
                        className="btn boton-limpiar w-100"
                        onClick={() => {
                            setFiltroEstudiante("");
                            setFiltroTipo("");
                            setFiltroGrado("");
                            setFechaDesde("");
                            setFechaHasta("");
                            setBusqueda("");
                        }}
                    >
                        Limpiar
                    </button>
                </div>

            </div>

        </section>
    );
}

export default FiltrosHistorialDocente;