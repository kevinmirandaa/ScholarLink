import "./FormularioMensaje.css";

function FormularioMensaje({
                               asunto,
                               setAsunto,
                               contenido,
                               setContenido,
                               tipo,
                               setTipo,
                               permiteRespuestas,
                               setPermiteRespuestas,
                               onEnviar
                           }) {

    const manejarCambioTipo = (nuevoTipo) => {
        setTipo(nuevoTipo);

        // ⚔️ REGLA DE NEGOCIO
        if (nuevoTipo === "mensaje") {
            setPermiteRespuestas(true);
        } else {
            setPermiteRespuestas(false);
        }
    };

    return (
        <section className="formulario-mensaje">

            <h3 className="formulario-titulo">Redactar</h3>

            {/* ⚔️ TIPO */}
            <div className="mb-2">
                <select
                    className="form-select"
                    value={tipo}
                    onChange={(e) => manejarCambioTipo(e.target.value)}
                >
                    <option value="mensaje">Mensaje</option>
                    <option value="aviso">Aviso</option>
                    <option value="tarea">Tarea</option>
                    <option value="observacion">Observación</option>
                </select>
            </div>

            {/* ⚔️ ASUNTO */}
            <div className="mb-2">
                <input
                    className="form-control"
                    placeholder={
                        tipo === "mensaje"
                            ? "Asunto"
                            : "Título del registro"
                    }
                    value={asunto}
                    onChange={(e) => setAsunto(e.target.value)}
                />
            </div>

            {/* ⚔️ CONTENIDO */}
            <div className="mb-2">
                <textarea
                    className="form-control"
                    placeholder="Contenido"
                    rows={4}
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                />
            </div>

            {/* ⚔️ PERMITIR RESPUESTAS SOLO SI ES MENSAJE */}
            {tipo === "mensaje" && (
                <div className="form-check mb-2">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={permiteRespuestas}
                        onChange={(e) => setPermiteRespuestas(e.target.checked)}
                    />
                    <label className="form-check-label">
                        Permitir respuestas
                    </label>
                </div>
            )}

            {/* ⚔️ BOTÓN */}
            <button className="btn btn-primary" onClick={onEnviar}>
                {tipo === "mensaje" ? "Enviar mensaje" : "Crear registro"}
            </button>

        </section>
    );
}

export default FormularioMensaje;