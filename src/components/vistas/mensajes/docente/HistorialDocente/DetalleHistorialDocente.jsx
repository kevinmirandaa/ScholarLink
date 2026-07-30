import { useState } from "react";

function DetalleHistorialDocente({
                                     mensaje,
                                     usuarioActual,
                                     onVolver
                                 }) {

    return (
        <div>

            <button className="btn btn-outline-secondary mb-3" onClick={onVolver}>
                ← Volver
            </button>

            <h2>{mensaje.asunto || "(Sin asunto)"}</h2>

            <p className="text-muted">
                {new Date(mensaje.fechaEnvio).toLocaleString()}
            </p>

            <hr />

            <p>{mensaje.contenido}</p>

            <hr />

            <h4>Respuestas</h4>

            {(mensaje.respuestas || []).length === 0 ? (
                <p>No hay respuestas.</p>
            ) : (
                mensaje.respuestas.map(r => (
                    <div key={r.id} className="border rounded p-2 mb-2">
                        <strong>{r.autor.nombre}</strong>
                        <div>{r.contenido}</div>
                        <small className="text-muted">
                            {new Date(r.fecha).toLocaleString()}
                        </small>
                    </div>
                ))
            )}

            <p className="text-muted mt-3">
                {mensaje.permiteRespuestas
                    ? "Conversación abierta (gestionable desde bandeja)"
                    : "Esta conversación está cerrada."}
            </p>

            <hr />

            <h4>Destinatarios</h4>

            <div className="d-flex flex-column gap-2">
                {mensaje.destinatarios.map(d => (
                    <div key={d.cedula} className="p-2 border rounded">

                        <strong>{d.nombre}</strong>

                        <div>
                            Estado:{" "}
                            <span className={
                                d.estado === "leido" ? "text-success" : "text-warning"
                            }>
                                {d.estado}
                            </span>
                        </div>

                        {d.fechaLectura && (
                            <small className="text-muted">
                                Leído el: {new Date(d.fechaLectura).toLocaleString()}
                            </small>
                        )}

                    </div>
                ))}
            </div>

        </div>
    );
}

export default DetalleHistorialDocente;