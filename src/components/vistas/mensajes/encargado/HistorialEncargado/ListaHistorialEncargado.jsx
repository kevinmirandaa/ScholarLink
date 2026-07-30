import "../../docente/HistorialDocente/ListaHistorialDocente.css";


function ListaHistorialEncargado({ mensajes, setSeleccionado }) {

    if (mensajes.length === 0) {
        return <p>No hay registros.</p>;
    }

    return (
        <div className="d-flex flex-column gap-3">

            {mensajes.map(m => (
                <div
                    key={m.id}
                    className={`historial-card tipo-${m.tipo || "mensaje"}`}
                    onClick={() => setSeleccionado(m)} // 🔥 AQUÍ
                >

                    <div className="historial-header">

                        <span className={`badge-tipo tipo-${m.tipo}`}>
                            {(m.tipo || "mensaje").toUpperCase()}
                        </span>

                        <span className="fecha">
                            {new Date(m.fechaEnvio).toLocaleString()}
                        </span>

                    </div>

                    <h5 className="historial-titulo">
                        {m.asunto}
                    </h5>

                    <p className="historial-contenido">
                        {m.contenido}
                    </p>

                    <small className="historial-footer">
                        De: {m.remitente.nombre}
                    </small>

                </div>
            ))}

        </div>
    );
}

export default ListaHistorialEncargado;